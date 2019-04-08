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
  _rules: any = {
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
      description: 'Is subject MF a Catalytic Activity '
    },
    objectMFCatalyticActivity: {
      id: 4,
      condition: false,
      description: 'Is object MF a Catalytic Activity '
    }
  }
  public _notes = [
    this._rules.hasInput,
    this._rules.annotonsConsecutive,
    this._rules.subjectMFCatalyticActivity,
    this._rules.objectMFCatalyticActivity
  ];

  rules = _.cloneDeep(this._rules);
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
  public connectors: any = [];
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
    this.connectorForm.causalReactionProduct.setValue(effect.causalReactionProduct);
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


  foo() {
    const self = this;
    self.connectors = [];

    each(this.cam.annotons, (annoton: Annoton) => {
      if (self.annoton.connectionId !== annoton.connectionId) {
        let f = self.getCreateConnectionSummary(this.annoton.connectionId, annoton.connectionId)

        self.connectors.push(
          Object.assign({
            annoton: annoton,
          }, f)
        );
      }
    });
  }

  getCreateConnectionSummary(subjectId, objectId) {
    let rules = _.cloneDeep(this._rules);
    let notes = [
      rules.hasInput,
      rules.annotonsConsecutive,
      rules.subjectMFCatalyticActivity,
      rules.objectMFCatalyticActivity
    ];
    let subjectAnnoton = this.cam.getAnnotonByConnectionId(subjectId);
    let objectAnnoton = this.cam.getAnnotonByConnectionId(objectId);
    let subjectMFNode = <AnnotonNode>_.cloneDeep(subjectAnnoton.getMFNode());
    let objectMFNode = <AnnotonNode>_.cloneDeep(objectAnnoton.getMFNode());
    let subjectBPNode: AnnotonNode;
    let edge = subjectAnnoton.getConnection(objectMFNode.individualId);
    let effect = this.getCausalEffect(edge);

    rules.triple.subject = subjectMFNode;
    rules.triple.object = objectMFNode;
    rules.bpHasInput = subjectAnnoton.bpHasInput;
    rules.subjectMFCatalyticActivity.condition = subjectMFNode.isCatalyticActivity;
    rules.objectMFCatalyticActivity.condition = objectMFNode.isCatalyticActivity;

    if (rules.bpHasInput) {
      rules.hasInput.condition = true;
      subjectBPNode = <AnnotonNode>_.cloneDeep(subjectAnnoton.getBPNode());
      rules.hasInput.descriptionSuffix = rules.bpHasInput.label;
    }

    rules.subjectMFCatalyticActivity.descriptionSuffix = subjectMFNode.getTerm().label;
    rules.objectMFCatalyticActivity.descriptionSuffix = objectMFNode.getTerm().label;

    this.checkConnection(effect, rules, this.displaySection, subjectBPNode);

    if (edge) {
      rules.triple.edge = edge.edge;
    }

    return {
      rules: rules,
      notes: notes,
      effect: effect
    }
  }

  createConnection(subjectId, objectId) {
    this.subjectAnnoton = this.cam.getAnnotonByConnectionId(subjectId);
    this.objectAnnoton = this.cam.getAnnotonByConnectionId(objectId);
    this.subjectMFNode = <AnnotonNode>_.cloneDeep(this.subjectAnnoton.getMFNode());
    this.objectMFNode = <AnnotonNode>_.cloneDeep(this.objectAnnoton.getMFNode());

    this.rules.triple.subject = this.subjectMFNode;
    this.rules.triple.object = this.objectMFNode;
    this.rules.bpHasInput = this.subjectAnnoton.bpHasInput;
    this.rules.subjectMFCatalyticActivity.condition = this.subjectMFNode.isCatalyticActivity;
    this.rules.objectMFCatalyticActivity.condition = this.objectMFNode.isCatalyticActivity;

    if (this.rules.bpHasInput) {
      this.rules.hasInput.condition = true;
      this.subjectBPNode = <AnnotonNode>_.cloneDeep(this.subjectAnnoton.getBPNode());
      this.rules.hasInput.descriptionSuffix = this.rules.bpHasInput.label;
    } else {
      this.rules.hasInput.condition = false;
      this.subjectBPNode = null;
    }

    this.rules.subjectMFCatalyticActivity.descriptionSuffix = this.subjectMFNode.getTerm().label;
    this.rules.objectMFCatalyticActivity.descriptionSuffix = this.objectMFNode.getTerm().label;


    let edge = this.subjectAnnoton.getConnection(this.objectMFNode.individualId);
    let annoton = this.noctuaFormConfigService.createAnnotonConnectorModel(this.subjectMFNode, this.objectMFNode, edge);

    this.initializeForm(annoton, edge);
  }

  getCausalEffect(edge) {
    let result = {
      annotonsConsecutive: true,
      causalEffect: this.noctuaFormConfigService.causalEffect.selected,
      edge: this.noctuaFormConfigService.edges.placeholder,
      causalReactionProduct: this.noctuaFormConfigService.causalReactionProduct.selected
    };

    if (edge) {
      result = Object.assign({
        edge: edge.edge,
        causalReactionProduct: this.noctuaFormConfigService.causalReactionProduct.selected
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
      this.checkConnection(value, this.rules, this.displaySection, this.subjectBPNode);

      this.rules.triple.edge = this.getCausalConnectorEdge(
        value.causalEffect,
        value.annotonsConsecutive,
        this.rules.hasInput.condition,
        value.causalReactionProduct);
    })
  }

  checkConnection(value: any, rules, displaySection, subjectBPNode) {
    rules.annotonsConsecutive.condition = value.annotonsConsecutive;
    displaySection.causalEffect = true;
    displaySection.causalReactionProduct = false;
    rules.triple.subject = this.subjectMFNode
    rules.triple.edge = null

    if (!value.annotonsConsecutive) {
      if (rules.hasInput.condition) {
        rules.triple.subject = subjectBPNode
      }
    } else {
      if (rules.subjectMFCatalyticActivity.condition && rules.objectMFCatalyticActivity.condition) {
        displaySection.causalReactionProduct = true;
      }
    }
  }

  getCausalConnectorEdge(causalEffect, annotonsConsecutive, hasInput, causalReactionProduct) {
    let result;

    if (annotonsConsecutive || (hasInput && !annotonsConsecutive)) {
      if (causalReactionProduct.name === noctuaFormConfig.causalReactionProduct.options.substrate.name) {
        result = noctuaFormConfig.edge.directlyProvidesInput;
      } else {
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
      }
    } else if (!annotonsConsecutive) {
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

    return result;
  }

  clearForm() {
  }
}

