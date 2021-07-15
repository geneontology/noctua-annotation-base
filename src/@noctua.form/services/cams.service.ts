import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, from, EMPTY } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurieService } from './../../@noctua.curie/services/curie.service';
import { NoctuaGraphService } from './../services/graph.service';
import { NoctuaFormConfigService } from './../services/config/noctua-form-config.service';
import { Activity } from './../models/activity/activity';

import { Cam, CamLoadingIndicator, CamQueryMatch, CamStats } from './../models/activity/cam';
import { each, groupBy, find } from 'lodash';
import { CamService } from './cam.service';
import { Entity } from './../models/activity/entity';
import { HttpClient } from '@angular/common/http';
import { finalize, map, mergeMap } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { ActivityNode } from './../models/activity/activity-node';
import { noctuaFormConfig } from './../noctua-form-config';
import { Evidence } from './../models/activity/evidence';
import { NoctuaUserService } from './user.service';
import { ReloadType } from '@noctua.search/models/review-mode';
import { NoctuaConfirmDialogService } from '@noctua/components/confirm-dialog/confirm-dialog.service';

declare const require: any;

const barista_client = require('bbop-client-barista');

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

  public activity: Activity;
  public camFormGroup$: Observable<FormGroup>;

  constructor(
    private zone: NgZone,
    private httpClient: HttpClient,
    private noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private confirmDialogService: NoctuaConfirmDialogService,
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

    const barclient = new barista_client(environment.globalBaristaLocation, this.noctuaUserService.baristaToken);
    //barclient.register('connect', resFunc);
    //barclient.register('initialization', resFunc);
    // barclient.register('message', resFunc);
    //barclient.register('broadcast', resFunc);
    //barclient.register('clairvoyance', resFunc);
    //barclient.register('telekinesis', resFunc);
    barclient.register('merge', function (a, b) {
      console.log('barista/merge response', a, b);
    });
    // _on_model_update);
    barclient.register('rebuild', function (a, b) {
      console.log('barista/rebuild response');
    });
    // _on_model_update);
    barclient.register('query', function (a, b) {
      console.log('barista/query response');
    });
    //barclient.connect("gomodel:6051581000000001");


  }

  loadCams() {
    const self = this;

    self.onCamsChanged.next(this.cams);
  }

  updateModel(cams: Cam[], responses) {
    const self = this;

    if (responses && responses.length > 0) {
      responses.forEach(response => {
        const cam: Cam = find(cams, { id: response.data().id });
        if (cam) {
          self._noctuaGraphService.rebuild(cam, response);
          cam.checkStored()
        }
      })
    }
  }

  expandMatch(nodeId: string) {
    const self = this;

    each(self.cams, (cam: Cam) => {
      cam.expanded = true;
      const activities = cam.findActivityByNodeUuid(nodeId);

      each(activities, (activity: Activity) => {
        activity.expanded = true;
      });
    });
  }

  getReplaceObject(entities: Entity[], replaceWithTerm: any, category) {
    const self = this;
    const groupedEntities = groupBy(entities, 'modelId') as { string: Entity[] };
    const cams: Cam[] = []
    let replaceWith

    if (category && category.name === noctuaFormConfig.findReplaceCategory.options.reference.name) {
      replaceWith = Evidence.formatReference(replaceWithTerm);
    } else {
      replaceWith = replaceWithTerm?.id;
    }

    each(groupedEntities, (values: Entity[], key) => {
      const cam: Cam = find(this.cams, { id: key });

      if (cam) {
        cam.addPendingChanges(entities, replaceWith, category);
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


  bulkEditActivityNode(cam: Cam, node: ActivityNode): Observable<any> {
    const self = this;
    const promises = [];

    promises.push(self._noctuaGraphService.bulkEditActivityNode(cam, node));

    return forkJoin(promises).pipe(
      map(res => self.updateModel([cam], res)),
    );
  }

  bulkEdit(cams: Cam[]): Observable<any> {
    const self = this;
    const promises = [];

    each(cams, (cam: Cam) => {
      promises.push(self._noctuaGraphService.bulkEditActivity(cam));
    });

    return forkJoin(promises).pipe(
      map(res => self.updateModel(cams, res)),
    );;
  }

  storeCams(cams: Cam[]): Observable<any> {
    const self = this;

    return from(cams).pipe(
      mergeMap((cam: Cam) => {
        return self._noctuaGraphService.storeCam(cam);
      }));

  }

  bulkStoredModel(cams: Cam[]) {
    const self = this;
    const promises = [];

    each(cams, (cam: Cam) => {
      cam.loading = new CamLoadingIndicator(true, 'Calculating Pending Changes ...');
      promises.push(self.camService.getStoredModel(cam));
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



  clearHighlight() {
    each(this.cams, (cam: Cam) => {
      return cam.clearHighlight();
    });
  }

  clearCams() {
    this.cams = [];
    this.onCamsChanged.next(this.cams);
  }

  resetCams(cams: Cam[]): Observable<any> {
    const self = this;

    return from(cams).pipe(
      mergeMap((cam: Cam) => {
        return self._noctuaGraphService.resetModel(cam);
      }))
  }

  resetMatch() {
    each(this.cams, (cam: Cam) => {
      cam.queryMatch = new CamQueryMatch();
    });
  }

  resetLoading(cams: Cam[], camLoadingIndicator = new CamLoadingIndicator) {
    each(cams, (cam: Cam) => {
      cam.loading = camLoadingIndicator;
    });
  }

  reloadCam(cam: Cam, reloadType: ReloadType) {
    const self = this;

    from([cam]).pipe(
      mergeMap((cam: Cam) => {
        if (reloadType === ReloadType.RESET) {
          cam.loading = new CamLoadingIndicator(true, 'Resetting Model ...');
          return self.resetCams([cam]);
        } else if (reloadType === ReloadType.STORE) {
          cam.loading = new CamLoadingIndicator(true, 'Saving Model ...');
          return self.storeCams([cam]);
        } else {
          return EMPTY;
        }
      }),
      finalize(() => {
        self.resetLoading([cam]);

        self.zone.run(() => {
          self.confirmDialogService.openInfoToast('Changes successfully saved.', 'OK');
        });

      })).subscribe({
        next: (response) => {
          if (!response || !response.data()) return;

          //Now stored == Active
          self.camService.populateStoredModel(cam, response.data())

          const summary = self.camService.reviewCamChanges(cam);
          self.camService.onCamCheckoutChanged.next(summary);
          cam.loading.status = false;
        }
      })
  }

  sortCams() {
    this.cams.sort(this._compareDateReviewAdded);
  }

  applyMatchWeights(cams: any[]) {
    let weight = 1;
    each(cams, (cam: Cam, key) => {
      cam.applyWeights(weight);
    });
  }

  updateDisplayNumber(cams: any[]) {
    each(cams, (cam: Cam, key) => {
      cam.displayNumber = (key + 1).toString();
      cam.updateActivityDisplayNumber();
    });

  }

  private _compareDateReviewAdded(a: Cam, b: Cam): number {
    if (a.dateReviewAdded < b.dateReviewAdded) {
      return 1;
    } else {
      return -1;
    }
  }

}
