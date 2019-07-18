
import { Injector, Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs'
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'

//Config
import { noctuaFormConfig } from './../noctua-form-config';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './cam.service';
import { NoctuaGraphService } from './graph.service';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import {
  Cam,
  Annoton,
  AnnotonNode,
  ConnectorAnnoton,
  Entity
} from './../models/annoton';

import { AnnotonConnectorForm } from './../models/forms/annoton-connector-form';

import { EntityForm } from './../models/forms/entity-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotonConnectorService {

  cam: Cam;
  public annoton: Annoton;
  public connectors: any = [];
  private connectorForm: AnnotonConnectorForm;
  private connectorFormGroup: BehaviorSubject<FormGroup | undefined>;
  public connectorFormGroup$: Observable<FormGroup>;

  public connectorAnnoton: ConnectorAnnoton;
  public onAnnotonChanged: BehaviorSubject<any>;

  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService,
    private noctuaGraphService: NoctuaGraphService) {

    this.onAnnotonChanged = new BehaviorSubject(null);
    this.connectorFormGroup = new BehaviorSubject(null);
    this.connectorFormGroup$ = this.connectorFormGroup.asObservable()

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) return;

      this.cam = cam;
    });
  }

  getConnections() {
    const self = this;
    let connectors = [];

    each(this.cam.annotons, (annoton: Annoton) => {
      if (self.annoton.connectionId !== annoton.connectionId) {

        connectors.push(
          Object.assign({
            annoton: annoton,
          })
        );
      }
    });

    self.connectors = connectors;
  }

  initializeForm(upstreamId: string, downstreamId: string) {
    let effect = this.getCausalEffect();
    this.connectorAnnoton = this.cam.getConnector(upstreamId, downstreamId);

    if (!this.connectorAnnoton) {
      this.connectorAnnoton = this.createConnectorAnnoton(upstreamId, downstreamId);
    }

    this.connectorForm = this.createConnectorForm();

    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
    this.connectorForm.causalEffect.setValue(effect.causalEffect);
    this.connectorForm.causalReactionProduct.setValue(effect.causalReactionProduct);
    this.connectorForm.annotonsConsecutive.setValue(effect.annotonsConsecutive);
    this._onAnnotonFormChanges();
    //just to trigger the on Changes event 
    this.connectorForm.causalEffect.setValue(effect.causalEffect);
    //  this.checkConnection(this.connectorFormGroup.getValue().value, this.rules, this.displaySection, this.subjectBPNode);
  }

  createConnectorAnnoton(upstreamId: string, downstreamId: string): ConnectorAnnoton {
    let upstreamAnnoton = this.cam.getAnnotonByConnectionId(upstreamId);
    let downstreamAnnoton = this.cam.getAnnotonByConnectionId(downstreamId);
    let connectorAnnoton = this.noctuaFormConfigService.createAnnotonConnectorModel(upstreamAnnoton, downstreamAnnoton);

    connectorAnnoton.rule.suggestedEdge.r1 = noctuaFormConfig.edge.causallyUpstreamOf;
    return connectorAnnoton;
  }

  createConnectorForm() {
    const self = this;
    let connectorFormMetadata = new AnnotonFormMetadata(self.noctuaLookupService.golrLookup.bind(self.noctuaLookupService));
    let connectorForm = new AnnotonConnectorForm(connectorFormMetadata);

    connectorForm.createEntityForms(self.connectorAnnoton.upstreamNode);

    return connectorForm;
  }

  getCausalEffect() {
    let result = {
      annotonsConsecutive: true,
      causalEffect: this.noctuaFormConfigService.causalEffect.selected,
      edge: this.noctuaFormConfigService.edges.placeholder,
      causalReactionProduct: this.noctuaFormConfigService.causalReactionProduct.selected
    };

    return result;
  }

  connectorFormToAnnoton() {
    const self = this;
    let annotonsConsecutive = self.connectorForm.annotonsConsecutive.value;
    let causalEffect = self.connectorForm.causalEffect.value;
    let edge = self.noctuaFormConfigService.getCausalAnnotonConnectorEdge(causalEffect, annotonsConsecutive);
  }

  save() {
    const self = this;

    //console.log(self.connectorAnnoton.getEdges('subject'), subjectNode.getTerm())

    // return self.noctuaGraphService.saveConnection(self.cam, self.connectorAnnoton, subjectNode, objectNode);
  }


  checkConnection(value: any, connectorAnnoton: ConnectorAnnoton) {
    connectorAnnoton.rule.rules.annotonsConsecutive.condition = value.annotonsConsecutive;
    connectorAnnoton.rule.displaySection.causalEffect = true;
    connectorAnnoton.rule.displaySection.causalReactionProduct = false;

    connectorAnnoton.rule.displaySection.effectDependency = value.annotonsConsecutive;
    connectorAnnoton.rule.displaySection.process = value.effectDependency;

    if (value.effectDependency) {
      connectorAnnoton.setIntermediateProcess()
    } else {
      if (connectorAnnoton.rule.rules.subjectMFCatalyticActivity.condition && connectorAnnoton.rule.rules.objectMFCatalyticActivity.condition) {
        connectorAnnoton.rule.displaySection.causalReactionProduct = true;
      }
      connectorAnnoton.rule.displaySection.causalReactionProduct = false;
    }

    if (value.process) {
      connectorAnnoton.processNode.setTerm(new Entity(value.process.id, value.process.label))
    }

    connectorAnnoton.rule.suggestedEdge.r1 = this.getCausalConnectorEdge(
      value.causalEffect,
      value.annotonsConsecutive,
      value.causalReactionProduct);
  }

  getCausalConnectorEdge(causalEffect, annotonsConsecutive, causalReactionProduct) {
    let result;

    if (!annotonsConsecutive) {
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
    } else if (annotonsConsecutive) {
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

  private _onAnnotonFormChanges(): void {
    this.connectorFormGroup.getValue().valueChanges.subscribe(value => {
      //  this.errors = this.getAnnotonFormErrors();
      this.connectorFormToAnnoton();
      this.checkConnection(value, this.connectorAnnoton);


    })
  }
}

