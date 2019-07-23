
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
      if (self.annoton.connectionId !== annoton.id) {
        connectors.push(
          Object.assign({
            annoton: annoton,
            connectorAnnoton: this.cam.getConnectorAnnoton(self.annoton.id, annoton.id)
          })
        );
      }
    });

    self.connectors = connectors;
  }

  initializeForm(upstreamId: string, downstreamId: string) {
    this.connectorAnnoton = this.cam.getConnectorAnnoton(upstreamId, downstreamId);

    if (this.connectorAnnoton) {
      this.connectorAnnoton.setType();
    } else {
      this.connectorAnnoton = this.createConnectorAnnoton(upstreamId, downstreamId);
    }

    this.connectorForm = this.createConnectorForm();
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
    this.connectorForm.causalEffect.setValue(this.connectorAnnoton.rule.effectDirection.direction);
    this.connectorForm.causalReactionProduct.setValue(this.connectorAnnoton.rule.effectReactionProduct.reaction);
    this.connectorForm.annotonsConsecutive.setValue(this.connectorAnnoton.rule.annotonsConsecutive.condition);
    this.connectorForm.effectDependency.setValue(this.connectorAnnoton.rule.effectDependency.condition);
    this._onAnnotonFormChanges();
    //just to trigger the on Changes event 
    this.connectorForm.causalEffect.setValue(this.connectorAnnoton.rule.effectDirection.direction);
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

    connectorForm.createEntityForms(self.connectorAnnoton.upstreamNode, self.connectorAnnoton.hasInputNode);
    connectorForm.onValueChanges(self.connectorAnnoton.hasInputNode.termLookup)

    return connectorForm;
  }


  save() {
    const self = this;

    const value = this.connectorFormGroup.getValue().value;
    this.connectorAnnoton.prepareSave(value);

    //console.log(self.connectorAnnoton.getEdges('subject'), subjectNode.getTerm())

    return self.noctuaGraphService.saveConnection(self.cam, self.connectorAnnoton);
  }

  private _onAnnotonFormChanges(): void {
    this.connectorFormGroup.getValue().valueChanges.subscribe(value => {
      //  this.errors = this.getAnnotonFormErrors();
      this.connectorAnnoton.checkConnection(value);
    })
  }
}

