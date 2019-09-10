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
  private annotonEntityForm: AnnotonEntityForm;
  private annotonEntityFormGroup: BehaviorSubject<FormGroup | undefined>;
  public annotonEntityFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService) {

    this.annotonEntityFormGroup = new BehaviorSubject(null);
    this.annotonEntityFormGroup$ = this.annotonEntityFormGroup.asObservable();

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) return;

      this.cam = cam;
    });
  }

  initializeForm(annoton: Annoton, entity: AnnotonNode) {
    this.currentAnnoton = annoton;
    this.annoton = _.cloneDeep(annoton);
    this.entity = this.annoton.getNode(entity.id);
    this.annotonEntityForm = this.createAnnotonEntityForm(entity);
    this.annotonEntityFormGroup.next(this._fb.group(this.annotonEntityForm));
    this._onAnnotonFormChanges();
  }

  createAnnotonEntityForm(entity: AnnotonNode) {
    const self = this;
    const annotonFormMetadata = new AnnotonFormMetadata(self.noctuaLookupService.golrLookup.bind(self.noctuaLookupService));
    const annotonEntityForm = new AnnotonEntityForm(annotonFormMetadata);

    annotonEntityForm.createAnnotonEntityForms(entity);

    return annotonEntityForm;
  }

  annotonEntityFormToAnnoton() {
    const self = this;

    self.annotonEntityForm.populateAnnotonEntityForm(this.entity);
  }

  private _onAnnotonFormChanges(): void {
    this.annotonEntityFormGroup.getValue().valueChanges.subscribe(value => {
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

