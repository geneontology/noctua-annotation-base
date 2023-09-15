import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { Activity, ActivityState, ActivityType } from './../models/activity/activity';
import { ActivityNode } from './../models/activity/activity-node';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';
import { BbopGraphService } from './bbop-graph.service';
import { CamService } from './cam.service';
import { Entity } from '../models/activity/entity';
import { Evidence } from '../models/activity/evidence';
import { cloneDeep, each } from 'lodash';
import { Cam } from '../models/activity/cam';
import { AnnotationForm } from '@noctua.form/models/forms/annotation-form';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotationFormService {
  public state: ActivityState;
  public mfLocation;
  public errors = [];
  public currentActivity: Activity;
  public activity: Activity;
  public onActivityCreated: BehaviorSubject<Activity>
  public onActivityChanged: BehaviorSubject<Activity>
  public annotationForm: AnnotationForm;
  public annotationFormGroup: BehaviorSubject<FormGroup | undefined>;
  public annotationFormGroup$: Observable<FormGroup>;
  public cam: Cam;

  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private bbopGraphService: BbopGraphService,
    private noctuaLookupService: NoctuaLookupService) {

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) {
        return;
      }

      this.cam = cam;
    });
    this.activity = this.noctuaFormConfigService.createActivityModel(ActivityType.default);
    this.onActivityCreated = new BehaviorSubject(null);
    this.onActivityChanged = new BehaviorSubject(null);
    this.annotationFormGroup = new BehaviorSubject(null);
    this.annotationFormGroup$ = this.annotationFormGroup.asObservable();

    this.initializeForm();
  }

  initializeForm(rootTypes?) {
    const self = this;

    self.errors = [];

    self.state = ActivityState.creation;
    self.currentActivity = null;

    self.activity.resetPresentation();
    self.annotationForm = this.createAnnotationForm();
    self.annotationFormGroup.next(this._fb.group(this.annotationForm));
    self.activity.updateShapeMenuShex(rootTypes);
    self.activity.enableSubmit();
    self._onActivityFormChanges();
  }

  initializeFormData() {
    this.fakester(this.activity);
    this.initializeForm();
  }

  createAnnotationForm() {
    const self = this;
    const formMetadata = new ActivityFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));

    const activityForm = new AnnotationForm(formMetadata);

    activityForm.createMolecularEntityForm(self.activity.presentation.gp);

    return activityForm;
  }

  activityFormToActivity() {
    this.annotationForm.populateActivity(this.activity);
  }

  private _onActivityFormChanges(): void {
    this.annotationFormGroup.getValue().valueChanges.subscribe((value) => {
      this.activityFormToActivity();
      this.activity.enableSubmit();


    });
  }

  getActivityFormErrors() {
    let errors = [];

    this.annotationForm.getErrors(errors);

    return errors;
  }

  setActivityType(activityType: ActivityType) {
    this.activity = this.noctuaFormConfigService.createActivityModel(activityType);
    this.initializeForm();
  }



  cloneForm(srcActivity, filterNodes) {
    this.activity = this.noctuaFormConfigService.createActivityModel(
      srcActivity.activityType
    );

    if (filterNodes) {
      each(filterNodes, function (srcNode) {

        let destNode = this.activity.getNode(srcNode.id);
        if (destNode) {
          destNode.copyValues(srcNode);
        }
      });
    } else {
      // this.activity.copyValues(srcActivity);
    }

    this.initializeForm();
  }

  saveActivity() {
    const self = this;
    self.activityFormToActivity();
    console.log(self.activity.edges)
    const saveData = self.activity.createSave();
    console.log(saveData)
    console.log(saveData.triples)
    console.log(saveData.triples[3])
    return forkJoin(self.bbopGraphService.addActivity(self.cam, saveData.nodes, saveData.triples, saveData.title));
  }

  clearForm() {
    this.activity = this.noctuaFormConfigService.createActivityModel(
      this.activity.activityType
    );

    this.initializeForm();
  }



  fakester(activity: Activity) {
    const self = this;

    each(activity.nodes, (node: ActivityNode) => {
      self.noctuaLookupService.termLookup('a', Object.assign({}, node.termLookup.requestParams, { rows: 100 })).subscribe(response => {
        if (response && response.length > 0) {
          const termsCount = response.length;
          node.term = Entity.createEntity(response[Math.floor(Math.random() * termsCount)]);

          each(node.predicate.evidence, (evidence: Evidence) => {
            self.noctuaLookupService.termLookup('a', Object.assign({}, node.predicate.evidenceLookup.requestParams, { rows: 100 })).subscribe(response => {
              if (response && response.length > 0) {
                const evidenceCount = response.length;
                evidence.evidence = Entity.createEntity(response[Math.floor(Math.random() * evidenceCount)]);
                evidence.reference = `PMID:${Math.floor(Math.random() * 1000000) + 1000}`;
              }
            });
          });
        }
      });
    });
  }

}
