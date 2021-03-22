
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './cam.service';
import { NoctuaGraphService } from './graph.service';

import {
  Cam,
  Activity,
  ActivityNode,
  ConnectorActivity,
  ConnectorState,
  ActivityType
} from './../models/activity';

import { ActivityConnectorForm } from './../models/forms/activity-connector-form';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';
import { each } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class NoctuaActivityConnectorService {

  cam: Cam;
  public activity: Activity;
  public connectors: any = [];
  private connectorForm: ActivityConnectorForm;
  private connectorFormGroup: BehaviorSubject<FormGroup | undefined>;
  public connectorFormGroup$: Observable<FormGroup>;
  public currentConnectorActivity: ConnectorActivity;
  public connectorActivity: ConnectorActivity;
  public onActivityChanged: BehaviorSubject<any>;

  panel = {
    selectConnector: {
      id: 1
    }, activityConnectorForm: {
      id: 2
    },
  };

  selectedPanel: any;
  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService,
    private noctuaGraphService: NoctuaGraphService) {

    this.onActivityChanged = new BehaviorSubject(null);
    this.connectorFormGroup = new BehaviorSubject(null);
    this.connectorFormGroup$ = this.connectorFormGroup.asObservable();

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) {
        return;
      }

      this.cam = cam;
      if (this.activity) {
        this.getConnections();
      }
    });
  }

  selectPanel(panel) {
    this.selectedPanel = panel;
  }

  getConnections() {
    const self = this;
    const connectors = [];

    each(this.cam.activities, (activity: Activity) => {
      if (self.activity.id !== activity.id && activity.activityType !== ActivityType.ccOnly) {
        connectors.push(
          Object.assign({
            activity: activity,
            connectorActivity: this.cam.getConnectorActivity(self.activity.id, activity.id)
          })
        );
      }
    });

    self.connectors = connectors;
  }

  initializeForm(upstreamId: string, downstreamId: string) {
    const upstreamActivity = this.cam.getActivityByConnectionId(upstreamId);
    const downstreamActivity = this.cam.getActivityByConnectionId(downstreamId);

    this.connectorActivity = this.noctuaFormConfigService.createActivityConnectorModel(upstreamActivity, downstreamActivity);
    this.currentConnectorActivity = this.cam.getConnectorActivity(upstreamId, downstreamId);

    if (this.currentConnectorActivity) {
      this.currentConnectorActivity.setPreview();
      this.connectorActivity.copyValues(this.currentConnectorActivity);
    }

    this.connectorForm = this.createConnectorForm();
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
    this.connectorForm.causalEffect.setValue(this.connectorActivity.rule.effectDirection.direction);
    this.connectorForm.mechanism.setValue(this.connectorActivity.rule.mechanism.mechanism);
    this._onActivityFormChanges();

    // just to trigger the on Changes event
    this.connectorForm.causalEffect.setValue(this.connectorActivity.rule.effectDirection.direction);
    this.selectPanel(this.panel.activityConnectorForm);
  }

  updateEvidence(node: ActivityNode) {
    this.connectorForm.updateEvidenceForms(node.predicate);
    this.connectorFormGroup.next(this._fb.group(this.connectorForm));
  }

  createConnectorForm() {
    const self = this;
    const formMetadata = new ActivityFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const connectorForm = new ActivityConnectorForm(formMetadata);

    connectorForm.createEntityForms(self.connectorActivity.predicate, self.connectorActivity.hasInputNode);
    connectorForm.onValueChanges(self.connectorActivity.hasInputNode.termLookup);

    return connectorForm;
  }

  saveActivity() {
    const self = this;
    const value = this.connectorFormGroup.getValue().value;
    this.connectorActivity.prepareSave(value);

    if (self.connectorActivity.state === ConnectorState.editing) {
      const saveData = self.connectorActivity.createEdit(self.currentConnectorActivity);

      return self.noctuaGraphService.editActivity(self.cam,
        saveData.srcNodes,
        saveData.destNodes,
        saveData.srcTriples,
        saveData.destTriples,
        saveData.removeIds,
        saveData.removeTriples);
    } else { // creation
      const saveData = self.connectorActivity.createSave();
      return self.noctuaGraphService.saveActivity(self.cam, saveData.triples, saveData.title);
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
