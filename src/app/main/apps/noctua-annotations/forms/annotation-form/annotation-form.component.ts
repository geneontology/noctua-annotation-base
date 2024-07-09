import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  Cam,
  Activity,
  NoctuaAnnotationFormService,
  NoctuaFormConfigService,
  ActivityState,
  ActivityType,
  NoctuaUserService,
  AnnotationActivity,
  noctuaFormConfig,
  Evidence,
  Entity,
  AnnotationExtension,
  AutocompleteType,
  ActivityError,
} from '@geneontology/noctua-form-base';
import { NoctuaAnnotationsDialogService } from '../../services/dialog.service';
import { NoctuaFormDialogService } from 'app/main/apps/noctua-form/services/dialog.service';

@Component({
  selector: 'noc-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.scss'],
})

export class AnnotationFormComponent implements OnInit, OnDestroy {
  ActivityState = ActivityState;
  ActivityType = ActivityType;
  AutocompleteType = AutocompleteType;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;

  @Input() public closeDialog: () => void;

  cam: Cam;
  annotationFormGroup: FormGroup;
  searchCriteria: any = {};
  extensionFormArray: FormArray;
  activity: Activity;
  errors: ActivityError[] = [];
  // currentActivity: Activity;
  // state: ActivityState;

  descriptionSectionTitle = 'Function Description';
  annotatedSectionTitle = 'Gene Product';

  private _unsubscribeAll: Subject<any>;
  annotationActivity: AnnotationActivity;

  dynamicForm: FormGroup;

  constructor(
    private noctuaAnnotationsDialogService: NoctuaAnnotationsDialogService,
    private noctuaFormDialogService: NoctuaFormDialogService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotationFormService: NoctuaAnnotationFormService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.noctuaAnnotationFormService.initializeForm();
    this.dynamicForm = this.fb.group({
      gp: [''],
      isComplement: [''],
      gpToTermEdge: [''],
      goterm: [''],
      annotationExtensions: this.fb.array([]),
      evidence: this.fb.group({
        evidenceCode: [''],
        reference: [''],
        withFrom: ['']
      })
    });

    this.dynamicForm.valueChanges
      .pipe(takeUntil(this._unsubscribeAll),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)))
      .subscribe({
        next: (value) => {
          // Process the entire form group
          this.noctuaAnnotationFormService.processAnnotationFormGroup(this.dynamicForm, value);

        },
        error: (err) => {
          console.error('Error observing dynamicForm changes:', err);
        }
      });

    this.noctuaAnnotationFormService.onFormErrorsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((error: ActivityError[]) => {
        this.errors = error;
      });

    this.noctuaAnnotationFormService.onActivityChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((activity: Activity) => {

        if (!activity) {
          return;
        }
        this.activity = activity;
        this.annotationActivity = { ...this.noctuaAnnotationFormService.annotationActivity } as AnnotationActivity;

        this.cdr.markForCheck()
      });
  }

  addMFRootTerm() {
    this._addRootTerm(noctuaFormConfig.rootNode.mf);

    console.log(this.annotationFormGroup)
  }

  private _addRootTerm(rootTerm) {

    if (rootTerm) {
      this.noctuaAnnotationFormService.annotationActivity.goterm.term = new Entity(rootTerm.id, rootTerm.label);
      const goterm = this.annotationFormGroup.get('goterm')
      // const goterm = this.annotationFormGroup.get('goterm')
      goterm.patchValue(this.noctuaAnnotationFormService.annotationActivity.goterm);
      //self.noctuaAnnotationFormService.initializeForm();

      const evidence = new Evidence();
      evidence.setEvidence(new Entity(
        noctuaFormConfig.evidenceAutoPopulate.nd.evidence.id,
        noctuaFormConfig.evidenceAutoPopulate.nd.evidence.label));
      evidence.reference = noctuaFormConfig.evidenceAutoPopulate.nd.reference;
      //self.annotationActivity.gpToTermEdge.setEvidence([evidence]);
      //self.noctuaAnnotationFormService.initializeForm();
    }
  }


  checkErrors() {
    this.noctuaFormDialogService.openActivityErrorsDialog(this.errors);
  }

  hasErrors() {
    const hasError = this.errors.length > 0;
    return hasError
  }

  save() {
    const self = this;

    self.noctuaAnnotationFormService.saveAnnotation(this.dynamicForm)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        self.noctuaAnnotationsDialogService.openInfoToast('Annotation successfully created.', 'OK');
        self.noctuaAnnotationFormService.clearForm();
        if (this.closeDialog) {
          this.closeDialog();
        }
      });
  }


  clear() {
    this.noctuaAnnotationFormService.clearForm();
  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  compareFn(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  get annotationExtensions() {
    return this.dynamicForm.get('annotationExtensions') as FormArray;
  }

  addExtension() {
    const annotationExtension = new AnnotationExtension();
    this.annotationActivity.extensions.push(annotationExtension);
    this.annotationExtensions.push(this.fb.group({
      extensionEdge: [''],
      extensionTerm: ['']
    }));

  }

  deleteExtension(index: number): void {
    this.annotationExtensions.removeAt(index);
    this.annotationActivity.extensions.splice(index, 1);
    this.dynamicForm.updateValueAndValidity();
  }

  onSubmit() {
    console.log(this.dynamicForm.value);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
