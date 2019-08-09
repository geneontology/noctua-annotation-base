import { Injector, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { noctuaFormConfig } from './../noctua-form-config';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { Annoton, AnnotonState } from './../models/annoton/annoton';
import { AnnotonNode } from './../models/annoton/annoton-node';
import { AnnotonForm } from './../models/forms/annoton-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';
import { NoctuaGraphService } from './graph.service';
import { CamService } from './cam.service';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotonFormService {
  public state: AnnotonState;
  public mfLocation;
  public errors = [];
  public currentAnnoton: Annoton;
  public annoton: Annoton;
  public annotonForm: AnnotonForm;
  public annotonFormGroup: BehaviorSubject<FormGroup | undefined>;
  public annotonFormGroup$: Observable<FormGroup>;
  public cam: any;

  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private noctuaGraphService: NoctuaGraphService,
    private noctuaLookupService: NoctuaLookupService) {

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) {
        return;
      }

      this.cam = cam;
    });
    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      noctuaFormConfig.annotonModelType.options.default.name
    );

    this.annotonFormGroup = new BehaviorSubject(null);
    this.annotonFormGroup$ = this.annotonFormGroup.asObservable();

    this.initializeForm();
  }

  initializeForm(annoton?: Annoton, annotonModelType?) {
    const self = this;

    self.errors = [];

    if (annoton) {
      self.state = AnnotonState.editing;
      self.currentAnnoton = annoton;
      self.annoton = _.cloneDeep(annoton);
    } else {
      self.state = AnnotonState.creation;
      self.currentAnnoton = null;
    }

    self.annotonForm = this.createAnnotonForm();
    self.annotonFormGroup.next(this._fb.group(this.annotonForm));
    self.annoton.enableSubmit();
    self._onAnnotonFormChanges();

    if (annotonModelType) {
      self.setAnnotonModelType(self.annoton, annotonModelType);
    }
  }

  initializeFormData(nodes) {
    this.annoton = this.noctuaFormConfigService.createAnnotonModelFakeData(nodes);
    this.initializeForm();
  }

  createAnnotonForm() {
    const self = this;
    const annotonFormMetadata = new AnnotonFormMetadata(self.noctuaLookupService.golrLookup.bind(self.noctuaLookupService));
    const annotonForm = new AnnotonForm(annotonFormMetadata, self.annoton.presentation.geneProduct);

    annotonForm.createFunctionDescriptionForm(self.annoton.presentation.fd);
    annotonForm.onValueChanges(self.annoton.presentation.geneProduct.termLookup);

    return annotonForm;
  }

  annotonFormToAnnoton() {
    this.annotonForm.populateAnnoton(this.annoton);
  }

  private _onAnnotonFormChanges(): void {
    this.annotonFormGroup.getValue().valueChanges.subscribe(value => {
      this.annotonFormToAnnoton();
      this.annoton.enableSubmit();
    });
  }

  getAnnotonFormErrors() {
    let errors = [];

    this.annotonForm.getErrors(errors);

    return errors;
  }

  setAnnotonModelType(annoton, annotonModelType) {
    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      annotonModelType,
      annoton)
    this.initializeForm();
  }



  linkFormNode(entity, srcNode) {
    entity.uuid = srcNode.uuid;
    entity.term = srcNode.getTerm();
  }

  cloneForm(srcAnnoton, filterNodes) {
    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      srcAnnoton.annotonModelType
    );

    if (filterNodes) {
      each(filterNodes, function (srcNode) {

        //this.complexAnnotonData.geneProducts = srcAnnoton.complexAnnotonData.geneProducts;
        // this.complexAnnotonData.mcNode.copyValues(srcAnnoton.complexAnnotonData.mcNode);

        let destNode = this.annoton.getNode(srcNode.id);
        if (destNode) {
          destNode.copyValues(srcNode);
        }
      })
    } else {
      // this.annoton.copyValues(srcAnnoton);
    }

    this.initializeForm();
  }

  saveAnnoton() {
    const self = this;
    self.annotonFormToAnnoton();

    if (self.state === AnnotonState.editing) {
      const saveData = self.annoton.createEdit(self.currentAnnoton);

      return self.noctuaGraphService.editAnnoton(self.cam,
        saveData.srcNodes,
        saveData.destNodes,
        saveData.srcTriples,
        saveData.destTriples,
        saveData.removeIds,
        saveData.removeTriples);
    } else { // creation
      const saveData = self.annoton.createSave();
      return self.noctuaGraphService.saveAnnoton(self.cam, saveData.triples, saveData.title);
    }
  }

  clearForm() {
    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      this.annoton.annotonModelType
    );

    this.initializeForm();
  }
}

