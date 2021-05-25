
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './cam.service';
import { NoctuaGraphService } from './graph.service';
import { ActivityConnectorForm } from './../models/forms/activity-connector-form';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';
import { Activity, ActivityType } from './../models/activity/activity';
import { ActivityNode } from './../models/activity/activity-node';
import { Cam, CamOperation } from './../models/activity/cam';
import { ConnectorActivity, ConnectorPanel, ConnectorState } from './../models/activity/connector-activity';
import { Entity } from '../models/activity/entity';
import { noctuaFormConfig } from '../noctua-form-config';
import { Triple } from '../models/activity/triple';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class NoctuaActivityConnectorService {

  cam: Cam;
  public subjectActivity: Activity;
  public objectActivity: Activity;

  public causalConnection: Triple<Activity>;
  public connectors: any = [];
  private connectorForm: ActivityConnectorForm;
  private connectorFormGroup: BehaviorSubject<FormGroup | undefined>;
  public connectorFormGroup$: Observable<FormGroup>;
  // public currentConnectorActivity: ConnectorActivity;
  public connectorActivity: ConnectorActivity;
  public onActivityChanged: BehaviorSubject<any>;
  public onLinkChanged: BehaviorSubject<any>;

  selectedPanel: ConnectorPanel;
  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService,
    private noctuaGraphService: NoctuaGraphService) {

    this.onActivityChanged = new BehaviorSubject(null);
    this.onLinkChanged = new BehaviorSubject(null);
    this.connectorFormGroup = new BehaviorSubject(null);
    this.connectorFormGroup$ = this.connectorFormGroup.asObservable();

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) {
        return;
      }

      this.cam = cam;

    });
  }

  selectPanel(panel) {
    this.selectedPanel = panel;
  }

  initializeForm(subjectId: string, objectId: string) {
    const self = this;

    self.subjectActivity = this.cam.findActivityById(subjectId);
    self.objectActivity = this.cam.findActivityById(objectId);
    self.causalConnection = self.cam.getCausalRelation(subjectId, objectId);

    if (this.causalConnection) {
      const predicate = cloneDeep(this.causalConnection.predicate)
      self.connectorActivity = new ConnectorActivity(self.subjectActivity, self.objectActivity, predicate);
    } else {
      const predicate = self.noctuaFormConfigService.createPredicate(Entity.createEntity(noctuaFormConfig.edge.positivelyRegulates))
      self.connectorActivity = new ConnectorActivity(self.subjectActivity, self.objectActivity, predicate);
    }

    this.connectorForm = this.createConnectorForm();
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));

    this.connectorForm.causalEffect.setValue(this.connectorActivity.rule.effectDirection.direction);
    this.connectorForm.mechanism.setValue(this.connectorActivity.rule.mechanism.mechanism);
    this._onActivityFormChanges();

    // just to trigger the on Changes event
    this.connectorForm.causalEffect.setValue(this.connectorActivity.rule.effectDirection.direction);
    this.selectPanel(ConnectorPanel.FORM);
  }

  updateEvidence(node: ActivityNode) {
    this.connectorForm.updateEvidenceForms(node.predicate);
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
  }

  createConnectorForm() {
    const self = this;
    const formMetadata = new ActivityFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const connectorForm = new ActivityConnectorForm(formMetadata);

    connectorForm.createEntityForms(self.connectorActivity.predicate);

    return connectorForm;
  }

  saveActivity() {
    const self = this;
    const value = this.connectorFormGroup.getValue().value;
    // this.connectorActivity.prepareSave(value);

    if (self.connectorActivity.state === ConnectorState.editing) {

    } else { // creation
      const saveData = self.connectorActivity.createSave();
      return self.noctuaGraphService.addActivity(self.cam, saveData.triples, '', CamOperation.ADD_CAUSAL_RELATION);
    }
  }

  deleteActivity(connectorActivity: ConnectorActivity) {
    const self = this;
    const deleteData = connectorActivity.createDelete();

    return self.noctuaGraphService.deleteActivity(self.cam, deleteData.uuids, deleteData.triples);
  }

  private _onActivityFormChanges(): void {
    this.connectorFormGroup.getValue().valueChanges.subscribe(value => {
      //  this.errors = this.getActivityFormErrors();
      this.connectorActivity.checkConnection(value);
    });
  }
}

