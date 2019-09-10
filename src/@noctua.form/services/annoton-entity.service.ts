import { Injector, Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs'
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'

//Config
import { noctuaFormConfig } from './../noctua-form-config';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './../services/cam.service';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { Cam } from './../models/annoton/cam';

import { AnnotonEntityForm } from './../models/forms/annoton-entity-form';

import { EntityForm } from './../models/forms/entity-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';
import { AnnotonNode, Annoton } from '../models';
import { cloneDeep } from 'lodash';
import { NoctuaGraphService } from './graph.service';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotonEntityService {
  public cam: Cam;
  public currentAnnoton: Annoton;
  public annoton: Annoton;
  public entity: AnnotonNode;
  private entityForm: EntityForm;
  private entityFormGroup: BehaviorSubject<FormGroup | undefined>;
  public entityFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService) {

    this.entityFormGroup = new BehaviorSubject(null);
    this.entityFormGroup$ = this.entityFormGroup.asObservable();

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) return;

      this.cam = cam;
    });
  }

  initializeForm(annoton: Annoton, entity: AnnotonNode) {
    this.currentAnnoton = _.cloneDeep(annoton);
    this.annoton = annoton;
    this.entity = entity;
    this.entityForm = this.createAnnotonEntityForm(this.entity);
    this.entityFormGroup.next(this._fb.group(this.entityForm));
    this._onAnnotonFormChanges();
  }

  createAnnotonEntityForm(entity: AnnotonNode) {
    const self = this;
    const annotonFormMetadata = new AnnotonFormMetadata(self.noctuaLookupService.golrLookup.bind(self.noctuaLookupService));
    const entityForm = new EntityForm(annotonFormMetadata, entity);

    if (!entity.skipEvidence) {
      entityForm.createEvidenceForms(entity);
    }

    return entityForm;
  }

  annotonEntityFormToAnnoton() {
    const self = this;

    self.entityForm.populateTerm();
  }

  private _onAnnotonFormChanges(): void {
    this.entityFormGroup.getValue().valueChanges.subscribe(value => {
      // this.errors = this.getAnnotonFormErrors();
      //  this.annotonEntityFormToAnnoton();
      // this.annoton.enableSubmit();
    });
  }

  saveAnnoton() {
    const self = this;

    self.annotonEntityFormToAnnoton();
    const saveData = self.annoton.createEdit(self.currentAnnoton);

    return self.noctuaGraphService.editAnnoton(self.cam,
      saveData.srcNodes,
      saveData.destNodes,
      saveData.srcTriples,
      saveData.destTriples,
      saveData.removeIds,
      saveData.removeTriples);
  }

  clearForm() {
  }
}

