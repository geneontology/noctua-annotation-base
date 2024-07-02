import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin, Subject, takeUntil } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { Activity, ActivityType } from './../models/activity/activity';
import { ActivityNode } from './../models/activity/activity-node';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';
import { BbopGraphService } from './bbop-graph.service';
import { CamService } from './cam.service';
import { Entity } from '../models/activity/entity';
import { Evidence } from '../models/activity/evidence';
import { Cam } from '../models/activity/cam';
import { AnnotationForm } from '@noctua.form/models/forms/annotation-form';
import { AnnotationActivity } from '../models/standard-annotation/annotation-activity';
import * as EntityDefinition from './../data/config/entity-definition';
import { noctuaFormConfig } from './../noctua-form-config';
import { StandardAnnotationForm } from './../models/standard-annotation/form';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotationFormService {
  public errors = [];
  public currentActivity: Activity;
  public activity: Activity;
  public annotationActivity: AnnotationActivity;
  public onActivityCreated: BehaviorSubject<Activity>
  public onActivityChanged: BehaviorSubject<Activity>
  public annotationForm: AnnotationForm;
  public annotationFormGroup: BehaviorSubject<FormGroup | undefined>;
  public annotationFormGroup$: Observable<FormGroup>;
  public cam: Cam;

  private destroy$ = new Subject<void>();

  // for setting edge when goterm is changed
  private previousGotermRelation: string = null

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

    this.onActivityCreated = new BehaviorSubject(null);
    this.onActivityChanged = new BehaviorSubject(null);
    this.annotationFormGroup = new BehaviorSubject(null);
    this.annotationFormGroup$ = this.annotationFormGroup.asObservable();

    this.initializeForm();

  }

  initializeForm() {

    this.activity = this.noctuaFormConfigService.createActivityModel(ActivityType.simpleAnnoton);


    this.errors = [];

    this.currentActivity = null;

    this.activity.resetPresentation();
    this.annotationForm = this.createAnnotationForm();
    this.annotationFormGroup.next(this._fb.group(this.annotationForm));
    this.activity.enableSubmit();
    this.annotationActivity = new AnnotationActivity(this.activity);
    this.annotationActivity.enableSubmit();
    this._onActivityFormChanges();
    this.onActivityChanged.next(this.activity);

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
    this.annotationForm.populateActivity(this.annotationActivity);

    this.annotationActivity.goterm.isComplement = this.annotationForm.isComplement.value;
  }

  private _onActivityFormChanges(): void {
    this.annotationFormGroup.getValue().valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {

      this.activityFormToActivity();
      this.activity.enableSubmit();
      this.annotationActivity.updateAspect();
      this.annotationActivity.enableSubmit();

      const edges = this.noctuaFormConfigService.getTermRelations(
        this.annotationActivity.gp.rootTypes,
        this.annotationActivity.goterm.rootTypes,
        true
      );

      this.annotationActivity.gpToTermEdges = edges;

      const extensionObjects = this.noctuaFormConfigService.getObjectsRelations(
        this.annotationActivity.goterm.rootTypes,
      );

      this.annotationActivity.extensions.forEach((ext) => {

        const extensionEdges = this.noctuaFormConfigService.getTermRelations(
          this.annotationActivity.goterm.rootTypes,
          ext.extensionTerm.rootTypes
        );


        ext.extensionEdges = extensionEdges;

        if (extensionObjects.length > 0) {
          ext.extensionTerm.category = extensionObjects;
          this.noctuaFormConfigService.setTermLookup(ext.extensionTerm, extensionObjects);
        }
      });

      if (edges.length > 0 && this.annotationActivity.gp.term?.hasValue()
        && this.annotationActivity.goterm.term?.hasValue()) {
        this.destroy$.next();
        //this.annotationForm.gpToTermEdge.setValue(edges[0]);

        //console.log(this.annotationActivity.goterm, "--", this.previousGotermRelation)

        const exists = edges.some(e => e.id === this.annotationActivity.gpToTermEdge?.id);
        if (!exists) {
          this.annotationForm.gpToTermEdge.setValue(edges[0]);

          if (this.annotationActivity.goterm.hasRootType(EntityDefinition.GoProteinContainingComplex)) {
            const partOfEdge = edges.find(e => e.id === noctuaFormConfig.edge.partOf.id);
            this.annotationForm.gpToTermEdge.setValue(partOfEdge);

          }
          this.previousGotermRelation = this.annotationActivity.gpToTermEdge?.id;
        }

        this.destroy$ = new Subject<void>();
        this._onActivityFormChanges();
      }
    });
  }



  processAnnotationFormGroup(annotationData: StandardAnnotationForm): void {

    // Log or perform additional actions as needed
    console.log('Annotation form group processed:', annotationData);
    let edges

    const gpRootTypes = annotationData.gp?.rootTypes ?? [];
    const gotermRootTypes = annotationData.goterm?.rootTypes ?? [];

    edges = this.noctuaFormConfigService.getTermRelations(
      gpRootTypes,
      gotermRootTypes,
      true
    );

    this.annotationActivity.gpToTermEdges = edges;

    const extensionObjects = this.noctuaFormConfigService.getObjectsRelations(
      gotermRootTypes,
    );

    if (this.annotationActivity.extensions.length === annotationData.annotationExtensions.length) {

      annotationData.annotationExtensions.forEach((ext, index) => {

        const extRootTypes = ext.extensionTerm?.rootTypes ?? [];

        const extensionEdges = this.noctuaFormConfigService.getTermRelations(
          gotermRootTypes,
          extRootTypes
        );


        this.annotationActivity.extensions[index].extensionEdges = extensionEdges;

        if (extensionObjects.length > 0) {
          this.annotationActivity.extensions[index].extensionTerm.category = extensionObjects;
          //this.noctuaFormConfigService.setTermLookup(ext.extension, extensionObjects);
        }
      });
    }

    if (edges?.length > 0 && this.annotationActivity.gp.term?.hasValue()
      && this.annotationActivity.goterm.term?.hasValue()) {
      this.destroy$.next();
      //this.annotationForm.gpToTermEdge.setValue(edges[0]);

      //console.log(this.annotationActivity.goterm, "--", this.previousGotermRelation)

      const exists = edges.some(e => e.id === this.annotationActivity.gpToTermEdge?.id);
      if (!exists) {
        this.annotationForm.gpToTermEdge.setValue(edges[0]);

        if (this.annotationActivity.goterm.hasRootType(EntityDefinition.GoProteinContainingComplex)) {
          const partOfEdge = edges.find(e => e.id === noctuaFormConfig.edge.partOf.id);
          this.annotationForm.gpToTermEdge.setValue(partOfEdge);

        }
        this.previousGotermRelation = this.annotationActivity.gpToTermEdge?.id;
      }

      this.destroy$ = new Subject<void>();
      this._onActivityFormChanges();
    }
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
      filterNodes.forEach((srcNode) => {

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

  saveAnnotation() {
    const self = this;
    self.activityFormToActivity();

    self.annotationActivity.activityToAnnotation(self.activity);
    const saveData = self.annotationActivity.createSave();
    return forkJoin(self.bbopGraphService.addActivity(self.cam, saveData.nodes, saveData.triples, saveData.title));
  }

  clearForm() {
    this.initializeForm();
  }



  fakester(activity: Activity) {
    const self = this;

    activity.nodes.forEach((node: ActivityNode) => {
      self.noctuaLookupService.termLookup('a', Object.assign({}, node.termLookup.requestParams, { rows: 100 })).subscribe(response => {
        if (response && response.length > 0) {
          const termsCount = response.length;
          node.term = Entity.createEntity(response[Math.floor(Math.random() * termsCount)]);

          node.predicate.evidence?.forEach((evidence: Evidence) => {
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
