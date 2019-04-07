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
import { Annoton } from './../models/annoton/annoton';
import { AnnotonNode } from './../models/annoton/annoton-node';

import { AnnotonConnectorForm } from './../models/forms/annoton-connector-form';

import { EntityForm } from './../models/forms/entity-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotonConnectorService {
  rules: any = {
    triple: {
      subject: 'mf',
      edge: null,
      object: 'mf',
    },
    bpHasInputNode: null,
    hasInput: {
      id: 1,
      condition: false,
      description: 'Has Input on Biological Process was found'
    },
    annotonsConsecutive: {
      id: 2,
      condition: false,
      description: 'Activities are consecutive?'
    },
    subjectMFCatalyticActivity: {
      id: 3,
      condition: false,
      description: 'Subject MF is a catalytic Activity'
    },
    objectMFCatalyticActivity: {
      id: 4,
      condition: false,
      description: 'Object MF is a catalytic Activity'
    }
  }

  public notes = [
    this.rules.hasInput,
    this.rules.annotonsConsecutive,
    this.rules.subjectMFCatalyticActivity,
    this.rules.objectMFCatalyticActivity
  ];

  public displaySection = {
    causalEffect: true,
    causalReactionProduct: false
  }
  cam: Cam;
  public annoton: Annoton;
  public subjectMFNode: AnnotonNode;
  public subjectBPNode: AnnotonNode;
  public objectMFNode: AnnotonNode;
  public subjectAnnoton: Annoton;
  public objectAnnoton: Annoton;
  private connectorForm: AnnotonConnectorForm;
  private connectorFormGroup: BehaviorSubject<FormGroup | undefined>;
  public connectorFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService) {

    // this.annoton = this.noctuaFormConfigService.createAnnotonConnectorModel();
    this.connectorFormGroup = new BehaviorSubject(null);
    this.connectorFormGroup$ = this.connectorFormGroup.asObservable()

    this.camService.onCamChanged.subscribe((cam) => {
      this.cam = cam;
    });

    // this.initializeForm();
  }

  initializeForm(annoton?: Annoton, edge?) {
    if (annoton) {
      this.annoton = annoton;
    }
    let effect = this.getCausalEffect(edge);

    this.connectorForm = this.createConnectorForm();
    this.connectorForm.causalEffect.setValue(effect.causalEffect);
    this.connectorForm.annotonsConsecutive.setValue(effect.annotonsConsecutive);
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
    this._onAnnotonFormChanges();
  }

  createConnectorForm() {
    const self = this;
    let connectorFormMetadata = new AnnotonFormMetadata(self.noctuaLookupService.golrLookup.bind(self.noctuaLookupService));
    let connectorForm = new AnnotonConnectorForm(connectorFormMetadata);

    connectorForm.createEntityForms(self.annoton.getNode('mf'));

    return connectorForm;
  }

  createConnection(subjectId, objectId) {
    this.subjectAnnoton = this.cam.getAnnotonByConnectionId(subjectId);
    this.objectAnnoton = this.cam.getAnnotonByConnectionId(objectId);
    this.subjectMFNode = <AnnotonNode>_.cloneDeep(this.subjectAnnoton.getMFNode());
    this.objectMFNode = <AnnotonNode>_.cloneDeep(this.objectAnnoton.getMFNode());

    this.rules.bpHasInput = this.subjectAnnoton.bpHasInput;

    if (this.rules.bpHasInput) {
      this.rules.hasInput.condition = true;
      this.subjectBPNode = <AnnotonNode>_.cloneDeep(this.subjectAnnoton.getBPNode());
    } else {
      this.rules.hasInput.condition = false;
      this.subjectBPNode = null;
    }

    this.rules.subjectMFCatalyticActivity.condition = this.subjectMFNode.isCatalyticActivity;
    this.rules.objectMFCatalyticActivity.condition = this.objectMFNode.isCatalyticActivity;

    let edge = this.subjectAnnoton.getConnection(this.objectMFNode.individualId);
    let annoton = this.noctuaFormConfigService.createAnnotonConnectorModel(this.subjectMFNode, this.objectMFNode, edge);

    this.initializeForm(annoton, edge);
  }

  getCausalEffect(edge) {
    let result = {
      causalEffect: this.noctuaFormConfigService.causalEffect.selected,
      edge: this.noctuaFormConfigService.edges.causallyUpstreamOfPositiveEffect,
      annotonsConsecutive: true
    };

    if (edge) {
      result = Object.assign({
        edge: edge.edge
      }, this.noctuaFormConfigService.getCausalEffectByEdge(edge.edge))
    }

    return result;
  }

  connectorFormToAnnoton() {
    const self = this;
    let annotonsConsecutive = self.connectorForm.annotonsConsecutive.value;
    let causalEffect = self.connectorForm.causalEffect.value;
    let edge = self.noctuaFormConfigService.getCausalAnnotonConnectorEdge(causalEffect, annotonsConsecutive);

    self.annoton.editEdge('mf', 'mf-1', edge);
    self.connectorForm.populateConnectorForm(self.annoton, self.subjectMFNode);
  }

  private _onAnnotonFormChanges(): void {
    this.connectorFormGroup.getValue().valueChanges.subscribe(value => {
      // this.errors = this.getAnnotonFormErrors();
      this.connectorFormToAnnoton();
      this.annoton.enableSubmit();
      this.checkConnection(value);
    })
  }

  checkConnection(value: any) {
    // if (value.)
    this.rules.annotonsConsecutive.condition = value.annotonsConsecutive;
    this.displaySection.causalEffect = true;
    this.displaySection.causalReactionProduct = false;
    this.rules.triple.subject = 'mf'
    this.rules.triple.edge = null

    if (!value.annotonsConsecutive) {
      if (this.rules.hasInput.condition) {
        this.rules.triple.subject = 'bp'
      }
    } else {
      if (this.rules.subjectMFCatalyticActivity.condition && this.rules.objectMFCatalyticActivity.condition) {
        this.displaySection.causalReactionProduct = true;
      }
    }

    this.rules.triple.edge = this.getCausalConnectorEdge(
      value.causalEffect,
      value.annotonsConsecutive,
      this.rules.hasInput.condition,
      value.causalReactionProduct)



    console.log(this.rules);
  }

  getCausalConnectorEdge(causalEffect, annotonsConsecutive, hasInput, causalReactionProduct) {
    let result;

    if (annotonsConsecutive || (hasInput && !annotonsConsecutive)) {
      switch (causalEffect.name) {
        case noctuaFormConfig.causalEffect.options.positive.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect;
          break;
        case noctuaFormConfig.causalEffect.options.negative.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect;
          break;
        case noctuaFormConfig.causalEffect.options.neutral.name:
          result = noctuaFormConfig.edge.causallyUpstreamOf;
          break;
      }
    } else if (!annotonsConsecutive) {
      if (causalReactionProduct.name === noctuaFormConfig.causalReactionProduct.options.substrate.name) {
        result = noctuaFormConfig.edge.directlyProvidesInput;
      } else {
        switch (causalEffect.name) {
          case noctuaFormConfig.causalEffect.options.positive.name:
            result = noctuaFormConfig.edge.directlyPositivelyRegulates;
            break;
          case noctuaFormConfig.causalEffect.options.negative.name:
            result = noctuaFormConfig.edge.directlyNegativelyRegulates;
            break;
          case noctuaFormConfig.causalEffect.options.neutral.name:
            result = noctuaFormConfig.edge.directlyRegulates;
            break;
        }
      }
    }

    return result;
  }

  clearForm() {
  }
}

