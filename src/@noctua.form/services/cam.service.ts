import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurieService } from './../../@noctua.curie/services/curie.service';
import { NoctuaGraphService } from './../services/graph.service';
import { NoctuaFormConfigService } from './../services/config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { NoctuaUserService } from './user.service';
import { Activity } from './../models/activity/activity';
import { CamForm } from './../models/forms/cam-form';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';
import { Evidence, compareEvidence } from './../models/activity/evidence';
import { Cam, CamStats } from './../models/activity/cam';
import { differenceWith, uniqWith } from 'lodash';
import { ActivityNodeType, ActivityNode, compareActivity } from './../models/activity';
import { compareTerm } from './../models/activity/activity-node';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

declare const require: any;

const model = require('bbop-graph-noctua');

@Injectable({
  providedIn: 'root'
})
export class CamService {
  curieUtil: any;
  loading = false;
  cam: Cam;
  onCamChanged: BehaviorSubject<any>;
  onCamUpdated: BehaviorSubject<any>;
  onCamTermsChanged: BehaviorSubject<any>;

  public activity: Activity;
  private camForm: CamForm;
  private camFormGroup: BehaviorSubject<FormGroup | undefined>;
  public camFormGroup$: Observable<FormGroup>;

  searchApi = environment.searchApi;

  constructor(public noctuaFormConfigService: NoctuaFormConfigService,
    private httpClient: HttpClient,
    private _fb: FormBuilder,
    private noctuaUserService: NoctuaUserService,
    private noctuaGraphService: NoctuaGraphService,
    private noctuaLookupService: NoctuaLookupService,
    private _noctuaGraphService: NoctuaGraphService,
    private curieService: CurieService) {
    this.onCamChanged = new BehaviorSubject(null);
    this.onCamUpdated = new BehaviorSubject(null);
    this.onCamTermsChanged = new BehaviorSubject(null);
    this.curieUtil = this.curieService.getCurieUtil();
    this.camFormGroup = new BehaviorSubject(null);
    this.camFormGroup$ = this.camFormGroup.asObservable();
  }

  initializeForm(cam?: Cam) {
    const self = this;

    if (cam) {
      this.cam = cam;
    }

    self.camForm = this.createCamForm();
    self.camFormGroup.next(this._fb.group(this.camForm));
  }

  createCamForm() {
    const self = this;

    const formMetadata = new ActivityFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const camForm = new CamForm(formMetadata);

    camForm.createCamForm(this.cam, this.noctuaUserService.user);

    return camForm;
  }

  //Gets a new cam
  getCam(modelId): Cam {
    const cam: Cam = new Cam();

    this.cam = cam;

    cam.graph = null;
    cam.id = modelId;
    cam.model = Object.assign({}, {
      id: modelId,
      title: '',
      modelInfo: this.noctuaFormConfigService.getModelUrls(modelId)
    });
    cam.expanded = true;
    this.noctuaGraphService.getGraphInfo(cam, modelId);
    cam.manager.get_model(cam.id);
    this.onCamChanged.next(cam);

    return cam;
  }

  reload(cam: Cam) {
    this._noctuaGraphService.onCamRebuildChange.next(cam);
  }

  //loads an existing cam
  loadCam(cam: Cam) {
    cam.graph = null;
    cam.modifiedStats = new CamStats();
    cam.rebuildRule.reset();
    cam.model = Object.assign({}, {
      id: cam.id,
      title: '',
      modelInfo: this.noctuaFormConfigService.getModelUrls(cam.id)
    });

    this.noctuaGraphService.getGraphInfo(cam, cam.id);
    this.cam = cam;

    cam.manager.get_model(cam.id);
  }

  loadCamMeta(cam: Cam) {
    cam.graph = null;
    cam.modifiedStats = new CamStats();
    cam.model = Object.assign({}, {
      id: cam.id,
      title: '',
      modelInfo: this.noctuaFormConfigService.getModelUrls(cam.id)
    });

    this.noctuaGraphService.getGraphInfo(cam, cam.id);
  }

  getStoredModel(cam: Cam): Observable<any> {
    const url = `${this.searchApi}/stored?id=${cam.id}`;

    return this.httpClient.get(url)
  }

  bulkEdit(cam: Cam): Observable<any> {
    const self = this;
    const promises = [];

    promises.push(self._noctuaGraphService.bulkEditActivity(cam));

    return forkJoin(promises);
  }

  deleteActivity(activity: Activity) {
    const self = this;
    const deleteData = activity.createDelete();

    return self.noctuaGraphService.deleteActivity(self.cam, deleteData.uuids, deleteData.triples);
  }

  updateTermList(formActivity: Activity, entity: ActivityNode) {
    this.noctuaLookupService.termList = this.getUniqueTerms(formActivity);
    entity.termLookup.results = this.noctuaLookupService.termPreLookup(entity.type);
  }

  updateEvidenceList(formActivity: Activity, entity: ActivityNode) {
    this.noctuaLookupService.evidenceList = this.getUniqueEvidence(formActivity);
    entity.predicate.evidenceLookup.results = this.noctuaLookupService.evidencePreLookup();
  }

  updateReferenceList(formActivity: Activity, entity: ActivityNode) {
    this.noctuaLookupService.evidenceList = this.getUniqueEvidence(formActivity);
    entity.predicate.referenceLookup.results = this.noctuaLookupService.referencePreLookup();
  }

  updateWithList(formActivity: Activity, entity: ActivityNode) {
    this.noctuaLookupService.evidenceList = this.getUniqueEvidence(formActivity);
    entity.predicate.withLookup.results = this.noctuaLookupService.withPreLookup();
  }

  getNodesByType(activityType: ActivityNodeType): any[] {
    return this.cam.getNodesByType(activityType);
  }

  getNodesByTypeFlat(activityType: ActivityNodeType): ActivityNode[] {
    return this.cam.getNodesByTypeFlat(activityType);
  }


  getUniqueTerms(formActivity?: Activity): ActivityNode[] {
    const activityNodes = this.cam.getTerms(formActivity);
    const result = uniqWith(activityNodes, compareTerm);

    return result;
  }

  getUniqueEvidence(formActivity?: Activity): Evidence[] {
    const evidences = this.cam.getEvidences(formActivity);
    const result = uniqWith(evidences, compareEvidence);

    return result;
  }

  resetModel(cam: Cam) {
    const self = this;

    return self._noctuaGraphService.resetModel(cam);
  }

  reviewChanges(cam: Cam, stats: CamStats): boolean {
    return cam.reviewCamChanges(stats);
  }

  populateStoredModel(cam: Cam, storedCam) {
    const self = this;
    const noctua_graph = model.graph;

    cam.storedGraph = new noctua_graph();
    cam.storedGraph.load_data_basic(storedCam);
    cam.storedActivities = self._noctuaGraphService.graphToActivities(cam.storedGraph)
    cam.checkStored();
    cam.reviewCamChanges();
  }

  addCamEdit(cam: Cam) {
    const self = this;
    cam.loading.status = true;
    self.getStoredModel(cam).pipe(
      finalize(() => {
        cam.loading.status = false;
      })).subscribe({
        next: (response) => {
          if (!response || !response.storedModel || !response.activeModel) return;

          self._noctuaGraphService.rebuildFromStoredApi(cam, response.activeModel);
          self.populateStoredModel(cam, response.storedModel)
          cam.loading.status = false;
        },
      })
  }
}
