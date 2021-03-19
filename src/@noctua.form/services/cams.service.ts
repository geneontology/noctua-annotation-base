import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurieService } from './../../@noctua.curie/services/curie.service';
import { NoctuaGraphService } from './../services/graph.service';
import { NoctuaFormConfigService } from './../services/config/noctua-form-config.service';
import { Annoton } from './../models/annoton/annoton';

import { Cam, CamLoadingIndicator, CamQueryMatch, CamStats } from './../models/annoton/cam';
import { each, groupBy, find, remove } from 'lodash';
import { CamService } from './cam.service';
import { Entity } from './../models/annoton/entity';
import { HttpClient } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { AnnotonNode } from '@noctua.form';

declare const require: any;

const model = require('bbop-graph-noctua');

@Injectable({
  providedIn: 'root'
})
export class CamsService {
  searchApi = environment.searchApi;
  curieUtil: any;
  cams: Cam[] = [];
  onCamsChanged: BehaviorSubject<any>;
  onCamsCheckoutChanged: BehaviorSubject<any>;
  onSelectedCamChanged: BehaviorSubject<any>;
  onSelectedNodeChanged: BehaviorSubject<any>;
  _selectedNodeUuid: string;
  _selectedCamUuid;

  loading = {
    status: false,
    message: ''
  };

  currentMatch: Entity = new Entity(null, null);

  public annoton: Annoton;
  public camFormGroup$: Observable<FormGroup>;

  constructor(
    private httpClient: HttpClient,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private _noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
    private curieService: CurieService) {
    this.onCamsChanged = new BehaviorSubject(null);
    this.onCamsCheckoutChanged = new BehaviorSubject(null);
    this.onSelectedCamChanged = new BehaviorSubject(null);
    this.onSelectedNodeChanged = new BehaviorSubject(null);
    this.curieUtil = this.curieService.getCurieUtil();

    this.onSelectedCamChanged.subscribe((uuid: string) => {
      if (uuid) {
        this.currentMatch.modelId = uuid;
      }
    });

    this.onSelectedNodeChanged.subscribe((uuid: string) => {
      if (uuid) {
        this.currentMatch.uuid = uuid;
      }
    });
  }

  setup() {
  }

  loadCams(filter?: any) {
    const self = this;
    each(this.cams, (cam: Cam) => {
      self.camService.loadCam(cam, filter);
    });

    self.onCamsChanged.next(this.cams);
  }



  addCamToReview(camId: string, metaCam?: Cam) {
    const self = this;
    const cam = new Cam();
    const found = find(this.cams, { id: camId });

    if (!found) {
      cam.id = camId;
      cam.expanded = true;
      cam.dateReviewAdded = Date.now();

      if (metaCam) {
        cam.title = metaCam.title;
      }
      self.cams.push(cam);
      self.camService.loadCam(cam);

      self.sortCams();
      self.updateDisplayNumber(self.cams);
      self.onCamsChanged.next(self.cams);
    }
  }

  getStoredModel(cam: Cam): Observable<any> {
    const url = `${this.searchApi}/stored?id=${cam.id}`;

    return this.httpClient.get(url)
  }

  updateModel(cams: Cam[], responses) {
    const self = this;

    console.log("update called ", responses, cams);
    if (responses && responses.length > 0) {
      responses.forEach(response => {
        const cam: Cam = find(this.cams, { id: response.data().id });
        if (cam) {
          self._noctuaGraphService.rebuild(cam, response);
          cam.checkStored()
        }
      })
    }


  }


  removeCamFromReview(cam: Cam) {
    remove(this.cams, { id: cam.id });
    this.updateDisplayNumber(this.cams);
    this.onCamsChanged.next(this.cams);
  }

  findInCams(filter?: any) {
    const self = this;

    each(self.cams, (cam: Cam) => {
      if (filter) {
        cam.filter = filter;
      }
    });

    self.onCamsChanged.next(this.cams);
  }

  expandMatch(nodeId: string) {
    const self = this;

    each(self.cams, (cam: Cam) => {
      cam.expanded = true;
      const annotons = cam.findAnnotonByNodeUuid(nodeId);

      each(annotons, (annoton: Annoton) => {
        annoton.expanded = true;
      });
    });
  }

  getReplaceObject(entities: Entity[], replaceWithTerm: string, category) {
    const self = this;
    const groupedEntities = groupBy(entities, 'modelId') as { string: Entity[] };
    const cams: Cam[] = []

    each(groupedEntities, (values: Entity[], key) => {
      const cam: Cam = find(this.cams, { id: key });
      if (cam) {
        cam.addPendingChanges(entities, replaceWithTerm, category);
        cams.push(cam)
      }
    });

    self.reviewChanges();
    return cams;
  }

  replace(cams: Cam[]) {
    const self = this;

    self.reviewChanges();
    return self.bulkEdit(cams);
  }


  bulkEditAnnotonNode(cam: Cam, node: AnnotonNode): Observable<any> {
    const self = this;
    const promises = [];

    promises.push(self._noctuaGraphService.bulkEditAnnotonNode(cam, node));

    return forkJoin(promises).pipe(
      map(res => self.updateModel([cam], res)),
    );
  }

  bulkEdit(cams: Cam[]): Observable<any> {
    const self = this;
    const promises = [];

    each(cams, (cam: Cam) => {
      promises.push(self._noctuaGraphService.bulkEditAnnoton(cam));
    });

    return forkJoin(promises).pipe(
      map(res => self.updateModel(cams, res)),
    );;
  }

  storeModels(cams: Cam[]): Observable<any> {
    const self = this;
    const promises = [];

    each(cams, (cam: Cam) => {
      promises.push(self._noctuaGraphService.storeModel(cam));
    });

    return forkJoin(promises);
  }

  bulkStoredModel(cams: Cam[]) {
    const self = this;
    const promises = [];

    each(cams, (cam: Cam) => {
      cam.loading = new CamLoadingIndicator(true, 'Loading ...');
      promises.push(self.getStoredModel(cam));
    });

    return forkJoin(promises);
  }

  reviewChanges() {
    const self = this;
    const stats = new CamStats();

    each(this.cams, (cam: Cam) => {
      const changes = self.camService.reviewChanges(cam, stats);
      if (changes) {
        stats.camsCount++;
      }
    });

    stats.updateTotal();

    const result = {
      stats: stats,
    };

    this.onCamsCheckoutChanged.next(result);
  }


  reviewCamChanges(cam: Cam) {
    const self = this;
    const stats = new CamStats();

    const changes = self.camService.reviewChanges(cam, stats);
    if (changes) {
      stats.camsCount++;
    }

    stats.updateTotal();

    const result = {
      stats: stats,
    };

    return result
  }

  clearCams() {
    this.cams = [];
    this.onCamsChanged.next(this.cams);
  }

  resetCam(cam: Cam) {
    return forkJoin([this._noctuaGraphService.resetModel(cam)]);
  }

  resetCams() {
    const self = this;
    const promises = [];

    each(this.cams, (cam: Cam) => {
      promises.push(self._noctuaGraphService.resetModel(cam));
    });

    return forkJoin(promises);
  }

  resetMatch() {
    each(this.cams, (cam: Cam) => {
      cam.queryMatch = new CamQueryMatch();
    });
  }

  sortCams() {
    this.cams.sort(this._compareDateReviewAdded);
  }

  updateDisplayNumber(cams: any[]) {
    each(cams, (cam: Cam, key) => {
      cam.displayNumber = (key + 1).toString();
      cam.updateAnnotonDisplayNumber();
    });

  }

  private _compareDateReviewAdded(a: Cam, b: Cam): number {
    if (a.dateReviewAdded > b.dateReviewAdded) {
      return 1;
    } else {
      return -1;
    }
  }

}
