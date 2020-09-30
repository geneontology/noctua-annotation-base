import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurieService } from './../../@noctua.curie/services/curie.service';
import { NoctuaGraphService } from './../services/graph.service';
import { NoctuaFormConfigService } from './../services/config/noctua-form-config.service';
import { Annoton } from './../models/annoton/annoton';

import { Cam } from './../models/annoton/cam';
import { each, groupBy, find, remove } from 'lodash';
import { CamService } from './cam.service';
import { Entity } from './../models/annoton/entity';

@Injectable({
  providedIn: 'root'
})
export class CamsService {

  curieUtil: any;
  loading = false;
  cams: Cam[] = [];
  onCamsChanged: BehaviorSubject<any>;
  onSelectedCamChanged: BehaviorSubject<any>;
  onSelectedNodeChanged: BehaviorSubject<any>;
  selectedNodeUuid;
  selectedCamUuid;

  public annoton: Annoton;
  public camFormGroup$: Observable<FormGroup>;

  constructor(public noctuaFormConfigService: NoctuaFormConfigService,
    private _noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
    private curieService: CurieService) {
    this.onCamsChanged = new BehaviorSubject(null);
    this.onSelectedCamChanged = new BehaviorSubject(null);
    this.onSelectedNodeChanged = new BehaviorSubject(null);
    this.curieUtil = this.curieService.getCurieUtil();

    this.onSelectedCamChanged.subscribe((uuid: string) => {
      if (uuid) {
        this.selectedCamUuid = uuid;
      }
    });

    this.onSelectedNodeChanged.subscribe((uuid: string) => {
      if (uuid) {
        this.selectedNodeUuid = uuid;
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

  addCamsToReview(cams: any[]) {
    const self = this;

    each(cams, (metaCam) => {
      const cam = new Cam();
      const found = find(this.cams, { id: metaCam.id });

      if (!found) {
        cam.id = metaCam.id;
        cam.expanded = true;
        cam.dateReviewAdded = metaCam.dateAdded;
        cam.title = metaCam.title;
        self.cams.push(cam);
        self.camService.loadCam(cam);
      }
    });

    self.sortCams();
    self.updateDisplayNumber(self.cams);
    self.onCamsChanged.next(self.cams);
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
      const annotons = cam.findAnnotonByNodeId(nodeId);

      each(annotons, (annoton: Annoton) => {
        annoton.expanded = true;
      });
    });
  }

  replace(entities: Entity[], replaceWithTerm: Entity) {

    const groupedEntities = groupBy(entities, 'modelId') as { string: Entity[] };

    each(groupedEntities, (values: Entity[], key) => {
      const cam: Cam = find(this.cams, { id: key });
      cam.replace(entities, replaceWithTerm);
      // this.camService.replaceAnnotonInternal(cam)

    });
  }

  bulkEdit() {
    const self = this;
    const promises = [];

    each(this.cams, (cam: Cam) => {
      promises.push(self._noctuaGraphService.bulkEditAnnoton(cam));
    });

    return forkJoin(promises).subscribe(results => {
      console.log(results);
    });
  }

  reviewChanges() {
    const self = this;

    const result = this.cams.map((cam: Cam) => {
      return {
        cam: cam,
        changes: self.camService.reviewChanges(cam)
      };
    });

    return result;
  }

  reset() {
    this.cams = [];
    this.onCamsChanged.next(this.cams);
  }

  sortCams() {
    this.cams.sort(this._compareDateReviewAdded);
  }

  updateDisplayNumber(cams: any[]) {
    const self = this;

    each(cams, (cam: Cam, key) => {
      cam.displayNumber = (key + 1).toString();
      cam.updateAnnotonDisplayNumber();
    });

  }

  private _compareDateReviewAdded(a: Cam, b: Cam): number {
    if (a.dateReviewAdded > b.dateReviewAdded) {
      return -1;
    } else {
      return 1;
    }
  }

}
