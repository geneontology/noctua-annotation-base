import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Cam,
  Activity,
  NoctuaActivityFormService,
  NoctuaFormConfigService,
  ActivityState,
  ActivityType,
  NoctuaUserService,
} from '@geneontology/noctua-form-base';
import { ResizeEvent } from 'angular-resizable-element';
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
  activityFormGroup: FormGroup;
  activityFormSub: Subscription;
  molecularEntity: FormGroup;
  searchCriteria: any = {};
  activityFormPresentation: any;
  evidenceFormArray: FormArray;
  activityFormData: any = [];
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
    public noctuaActivityFormService: NoctuaActivityFormService
  ) {
    this._unsubscribeAll = new Subject();

    // this.activity = self.noctuaActivityFormService.activity;
    // this.activityFormPresentation = this.noctuaActivityFormService.activityPresentation;
  }

  ngOnInit(): void {
    console.log('save')
    this.activityFormSub = this.noctuaActivityFormService.activityFormGroup$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(activityFormGroup => {
        if (!activityFormGroup) {
          return;
        }

        this.activityFormGroup = activityFormGroup;
        this.currentActivity = this.noctuaActivityFormService.currentActivity;
        this.activity = this.noctuaActivityFormService.activity;
        this.state = this.noctuaActivityFormService.state;
        this.molecularEntity = <FormGroup>this.activityFormGroup.get('molecularEntity');

        if (this.activity.activityType === ActivityType.ccOnly) {
          this.descriptionSectionTitle = 'Localization Description';
        } else if (this.activity.activityType === ActivityType.molecule) {
          this.annotatedSectionTitle = 'Small Molecule';
          this.descriptionSectionTitle = 'Location (optional)';
        } else {
          this.descriptionSectionTitle = 'Function Description';
        }
      });
  }



  checkErrors() {
    const errors = this.noctuaActivityFormService.activity.submitErrors;
    // this.noctuaAnnotationsDialogService.openActivityErrorsDialog(errors);
  }

  save() {
    const self = this;

    self.noctuaActivityFormService.saveActivity().subscribe(() => {
      self.noctuaAnnotationsDialogService.openInfoToast('Annotation successfully created.', 'OK');
      self.noctuaActivityFormService.clearForm();
      if (this.closeDialog) {
        this.closeDialog();
      }
    });
  }


  clear() {
    this.noctuaActivityFormService.clearForm();
  }

  createExample() {
    const self = this;

    self.noctuaActivityFormService.initializeFormData();
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
