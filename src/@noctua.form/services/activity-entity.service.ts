import { Injectable, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './../services/cam.service';
import { Cam } from './../models/activity/cam';
import { EntityForm } from './../models/forms/entity-form';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';
import { ActivityNode, Activity } from '../models';
import { NoctuaGraphService } from './graph.service';
import { cloneDeep } from 'lodash';
import { CamsService } from './cams.service';

@Injectable({
  providedIn: 'root'
})
export class NoctuaActivityEntityService {
  public cam: Cam;
  public currentActivity: Activity;
  public activity: Activity;
  public entity: ActivityNode;
  private entityForm: EntityForm;
  private entityFormGroup: BehaviorSubject<FormGroup | undefined>;
  public entityFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder,
    private zone: NgZone,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
    private camsService: CamsService,
    private noctuaLookupService: NoctuaLookupService) {

    this.entityFormGroup = new BehaviorSubject(null);
    this.entityFormGroup$ = this.entityFormGroup.asObservable();
    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) {
        return;
      }

      this.cam = cam;
    });
  }

  initializeForm(activity: Activity, entity: ActivityNode) {
    this.currentActivity = cloneDeep(activity);
    this.activity = activity;
    this.entity = entity;
    this.entityForm = this.createActivityEntityForm(this.entity);
    this.entityFormGroup.next(this._fb.group(this.entityForm));
    this._onActivityFormChanges();
  }

  createActivityEntityForm(entity: ActivityNode) {
    const self = this;
    const formMetadata = new ActivityFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const entityForm = new EntityForm(formMetadata, entity);

    if (!entity.skipEvidence) {
      entityForm.createEvidenceForms(entity);
    }

    return entityForm;
  }

  activityEntityFormToActivity() {
    const self = this;

    self.entityForm.populateTerm();
  }

  private _onActivityFormChanges(): void {
    this.entityFormGroup.getValue().valueChanges.subscribe(() => {
      // this.errors = this.getActivityFormErrors();
      //  this.activityEntityFormToActivity();
      // this.activity.enableSubmit();
    });
  }

  saveActivity() {
    const self = this;

    self.activityEntityFormToActivity();
    const saveData = self.activity.createEdit(self.currentActivity);

    return self.noctuaGraphService.editActivity(self.cam,
      saveData.srcNodes,
      saveData.destNodes,
      saveData.srcTriples,
      saveData.destTriples,
      saveData.removeIds,
      saveData.removeTriples);
  }

  saveActivityReplace(cam: Cam, addLoadingStatus?: boolean): Observable<any> {
    const self = this;

    if (addLoadingStatus) {
      cam.loading.status = true;
    }

    const oldEntity = cloneDeep(self.entity);
    self.activityEntityFormToActivity();
    self.entity.addPendingChanges(oldEntity);
    return self.camsService.bulkEditActivityNode(cam, self.entity);

  }
}
