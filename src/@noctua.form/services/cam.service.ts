import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurieService } from './../../@noctua.curie/services/curie.service';
import { NoctuaGraphService } from './../services/graph.service';
import { NoctuaFormConfigService } from './../services/config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { NoctuaUserService } from './user.service';
import { Annoton } from './../models/annoton/annoton';
import { CamForm } from './../models/forms/cam-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';
import { Evidence, compareEvidence } from './../models/annoton/evidence';

import { v4 as uuid } from 'uuid';
import { Cam } from './../models/annoton/cam';
import { uniqWith } from 'lodash';
import { AnnotonNodeType, AnnotonNode, Entity } from './../models/annoton';
import { compareTerm } from '@noctua.form/models/annoton/annoton-node';

@Injectable({
  providedIn: 'root'
})
export class CamService {
  baseUrl = environment.spaqrlApiUrl;
  curieUtil: any;
  loading = false;
  cam: Cam;
  onCamChanged: BehaviorSubject<any>;
  onCamTermsChanged: BehaviorSubject<any>;


  public annoton: Annoton;
  private camForm: CamForm;
  private camFormGroup: BehaviorSubject<FormGroup | undefined>;
  public camFormGroup$: Observable<FormGroup>;


  constructor(public noctuaFormConfigService: NoctuaFormConfigService,
    private _fb: FormBuilder,
    private noctuaUserService: NoctuaUserService,
    private noctuaGraphService: NoctuaGraphService,
    private noctuaLookupService: NoctuaLookupService,
    private curieService: CurieService) {
    this.onCamChanged = new BehaviorSubject(null);
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

    const formMetadata = new AnnotonFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const camForm = new CamForm(formMetadata);

    camForm.createCamForm(this.cam, this.noctuaUserService.user);

    return camForm;
  }

  getCam(modelId): Cam {
    const cam: Cam = new Cam();

    cam.loading.status = true;
    cam.loading.message = 'Sending Request...';

    cam.id = uuid();
    cam.graph = null;
    cam.model = Object.assign({}, {
      id: modelId,
      title: '',
      modelInfo: this.noctuaFormConfigService.getModelUrls(modelId)
    });
    cam.expanded = true;
    this.noctuaGraphService.getGraphInfo(cam, modelId);
    this.cam = cam;
    this.onCamChanged.next(cam);

    return cam;
  }

  loadCam(cam: Cam, filter?: any) {

    cam.loading.status = true;
    cam.loading.message = 'Sending Request...';

    cam.graph = null;
    cam.model = Object.assign({}, {
      id: cam.id,
      title: '',
      modelInfo: this.noctuaFormConfigService.getModelUrls(cam.id)
    });

    if (filter) {
      cam.filter = filter;
    }
    cam.expanded = true;
    this.noctuaGraphService.getGraphInfo(cam, cam.id);
    this.cam = cam;
    //  this.onCamChanged.next(cam);

  }

  deleteAnnoton(annoton: Annoton) {
    const self = this;
    const deleteData = annoton.createDelete();

    return self.noctuaGraphService.deleteAnnoton(self.cam, deleteData.uuids, deleteData.triples);
  }

  updateTermList(formAnnoton: Annoton, entity: AnnotonNode) {
    this.noctuaLookupService.termList = this.getUniqueTerms(formAnnoton);
    entity.termLookup.results = this.noctuaLookupService.termPreLookup(entity.type);
  }

  updateEvidenceList(formAnnoton: Annoton, entity: AnnotonNode) {
    this.noctuaLookupService.evidenceList = this.getUniqueEvidence(formAnnoton);
    entity.predicate.evidenceLookup.results = this.noctuaLookupService.evidencePreLookup();
  }

  updateReferenceList(formAnnoton: Annoton, entity: AnnotonNode) {
    this.noctuaLookupService.evidenceList = this.getUniqueEvidence(formAnnoton);
    entity.predicate.referenceLookup.results = this.noctuaLookupService.referencePreLookup();
  }

  updateWithList(formAnnoton: Annoton, entity: AnnotonNode) {
    this.noctuaLookupService.evidenceList = this.getUniqueEvidence(formAnnoton);
    entity.predicate.withLookup.results = this.noctuaLookupService.withPreLookup();
  }

  getNodesByType(annotonType: AnnotonNodeType): any[] {
    return this.cam.getNodesByType(annotonType);
  }

  getNodesByTypeFlat(annotonType: AnnotonNodeType): AnnotonNode[] {
    return this.cam.getNodesByTypeFlat(annotonType);
  }

  getUniqueTerms(formAnnoton?: Annoton): AnnotonNode[] {
    const annotonNodes = this.cam.getTerms(formAnnoton);
    const result = uniqWith(annotonNodes, compareTerm);

    return result;
  }

  getUniqueEvidence(formAnnoton?: Annoton): Evidence[] {
    const evidences = this.cam.getEvidences(formAnnoton);
    const result = uniqWith(evidences, compareEvidence);

    return result;
  }
}
