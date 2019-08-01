
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
  public currentConnectorAnnoton: ConnectorAnnoton;
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
      if (!cam) {
        return;
      }

      this.cam = cam;
    });
  }

  getConnections() {
    const self = this;
    let connectors = [];

    each(this.cam.annotons, (annoton: Annoton) => {
      if (self.annoton.uuid !== annoton.id) {
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
    let upstreamAnnoton = this.cam.getAnnotonByConnectionId(upstreamId);
    let downstreamAnnoton = this.cam.getAnnotonByConnectionId(downstreamId);

    this.connectorAnnoton = this.noctuaFormConfigService.createAnnotonConnectorModel(upstreamAnnoton, downstreamAnnoton);
    this.currentConnectorAnnoton = this.cam.getConnectorAnnoton(upstreamId, downstreamId);

    if (this.currentConnectorAnnoton) {
      this.currentConnectorAnnoton.setPreview();
      this.connectorAnnoton.copyValues(this.currentConnectorAnnoton);
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
  }

  updateEvidence(node: AnnotonNode) {
    this.connectorForm.updateEvidenceForms(node.predicate);
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
  }

  createConnectorForm() {
    const self = this;
    let connectorFormMetadata = new AnnotonFormMetadata(self.noctuaLookupService.golrLookup.bind(self.noctuaLookupService));
    let connectorForm = new AnnotonConnectorForm(connectorFormMetadata);

    // connectorForm.createEntityForms(self.connectorAnnoton.upstreamNode, self.connectorAnnoton.hasInputNode);
    connectorForm.onValueChanges(self.connectorAnnoton.hasInputNode.termLookup);

    return connectorForm;
  }

  save() {
    const self = this;
    const value = this.connectorFormGroup.getValue().value;

    this.connectorAnnoton.prepareSave(value);
    return self.noctuaGraphService.saveConnection(self.cam, self.connectorAnnoton);
  }

  delete() {
    const self = this;
    const uuids = this.connectorAnnoton.prepareDelete();

    return self.noctuaGraphService.deleteConnection(self.cam, uuids);
  }

  private _onAnnotonFormChanges(): void {
    this.connectorFormGroup.getValue().valueChanges.subscribe(value => {
      //  this.errors = this.getAnnotonFormErrors();
      this.connectorAnnoton.checkConnection(value);
    })
  }
}

