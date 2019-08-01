import { Injector, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { noctuaFormConfig } from './../noctua-form-config';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { Annoton } from './../models/annoton/annoton';
import { AnnotonNode } from './../models/annoton/annoton-node';
import { AnnotonForm } from './../models/forms/annoton-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotonFormService {
  public mfLocation;
  public errors = [];
  public annoton: Annoton;
  public annotonForm: AnnotonForm;
  public annotonFormGroup: BehaviorSubject<FormGroup | undefined>;
  public annotonFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaLookupService: NoctuaLookupService) {
    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      noctuaFormConfig.annotonModelType.options.default.name
    );

    this.annotonFormGroup = new BehaviorSubject(null);
    this.annotonFormGroup$ = this.annotonFormGroup.asObservable();

    this.initializeForm();
  }

  initializeForm(annoton?: Annoton) {
    const self = this;

    self.errors = [];

    if (annoton) {
      self.annoton = annoton;
    }

    self.annotonForm = this.createAnnotonForm();
    self.annotonFormGroup.next(this._fb.group(this.annotonForm));
    self.annoton.enableSubmit();
    self._onAnnotonFormChanges();
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

  setAnnotonType(annoton, annotonType) {
    annoton.setAnnotonType(annotonType.name);

    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      annoton.annotonModelType,
      annoton
    )
    this.initializeForm();
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


  clearForm() {
    this.annoton = this.noctuaFormConfigService.createAnnotonModel(
      this.annoton.annotonModelType
    )
    this.initializeForm();
  }
}

