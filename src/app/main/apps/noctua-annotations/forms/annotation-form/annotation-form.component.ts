import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Cam,
  Activity,
  NoctuaAnnotationFormService,
  NoctuaFormConfigService,
  ActivityState,
  ActivityType,
  NoctuaUserService,
} from '@geneontology/noctua-form-base';
import { NoctuaAnnotationsDialogService } from '../../services/dialog.service';

@Component({
  selector: 'noc-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.scss'],
})

export class AnnotationFormComponent implements OnInit, OnDestroy {
  ActivityState = ActivityState;
  ActivityType = ActivityType;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;

  @Input() public closeDialog: () => void;

  resizeStyle = {};

  cam: Cam;
  annotationFormGroup: FormGroup;
  annotationFormSub: Subscription;
  molecularEntity: FormGroup;
  searchCriteria: any = {};
  annotationFormPresentation: any;
  evidenceFormArray: FormArray;
  annotationFormData: any = [];
  activity: Activity;
  currentActivity: Activity;
  state: ActivityState;

  descriptionSectionTitle = 'Function Description';
  annotatedSectionTitle = 'Gene Product';

  private _unsubscribeAll: Subject<any>;

  constructor(
    private noctuaAnnotationsDialogService: NoctuaAnnotationsDialogService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotationFormService: NoctuaAnnotationFormService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.annotationFormSub = this.noctuaAnnotationFormService.annotationFormGroup$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(annotationFormGroup => {
        if (!annotationFormGroup) {
          return;
        }

        this.annotationFormGroup = annotationFormGroup;
        this.currentActivity = this.noctuaAnnotationFormService.currentActivity;
        this.activity = this.noctuaAnnotationFormService.activity;
        this.state = this.noctuaAnnotationFormService.state;
        this.molecularEntity = <FormGroup>this.annotationFormGroup.get('molecularEntity');

        console.log('this.annotationFormGroup', this.annotationFormGroup);
      });
  }


  checkErrors() {
    const errors = this.noctuaAnnotationFormService.activity.submitErrors;
    // this.noctuaAnnotationsDialogService.openActivityErrorsDialog(errors);
  }

  save() {
    const self = this;

    self.noctuaAnnotationFormService.saveActivity().subscribe(() => {
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

  createExample() {
    const self = this;

    self.noctuaAnnotationFormService.initializeFormData();
  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  close() {

    if (this.panelDrawer) {
      this.panelDrawer.close();
    }
    if (this.closeDialog) {
      this.closeDialog();
    }

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
