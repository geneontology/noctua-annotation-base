import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import {
  Cam,
  Annoton,
  CamService,
  NoctuaAnnotonFormService,
  NoctuaFormConfigService,
  AnnotonState,
  AnnotonType,
  NoctuaUserService,
  NoctuaFormMenuService,
} from 'noctua-form-base';

@Component({
  selector: 'noc-annoton-search-form',
  templateUrl: './annoton-search-form.component.html',
  styleUrls: ['./annoton-search-form.component.scss'],
})

export class AnnotonSearchFormComponent implements OnInit, OnDestroy {
  AnnotonState = AnnotonState;
  AnnotonType = AnnotonType;

  cam: Cam;
  annotonFormGroup: FormGroup;
  annotonFormSub: Subscription;
  molecularEntity: FormGroup;
  searchCriteria: any = {};
  annotonFormPresentation: any;
  evidenceFormArray: FormArray;
  annotonFormData: any = [];
  annoton: Annoton;
  currentAnnoton: Annoton;
  state: AnnotonState;

  private _unsubscribeAll: Subject<any>;

  constructor(private camService: CamService,
    //public camTableService: CamTableService,
    // private noctuaFormDialogService: NoctuaFormDialogService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotonFormService: NoctuaAnnotonFormService,
    public noctuaFormMenuService: NoctuaFormMenuService) {
    this._unsubscribeAll = new Subject();

    // this.annoton = self.noctuaAnnotonFormService.annoton;
    // this.annotonFormPresentation = this.noctuaAnnotonFormService.annotonPresentation;
  }

  ngOnInit(): void {
    this.annotonFormSub = this.noctuaAnnotonFormService.annotonFormGroup$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(annotonFormGroup => {
        if (!annotonFormGroup) {
          return;
        }

        this.annotonFormGroup = annotonFormGroup;
        this.currentAnnoton = this.noctuaAnnotonFormService.currentAnnoton;
        this.annoton = this.noctuaAnnotonFormService.annoton;
        this.state = this.noctuaAnnotonFormService.state;
        this.molecularEntity = <FormGroup>this.annotonFormGroup.get('molecularEntity');
      });

    this.camService.onCamChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cam) => {
        if (!cam) {
          return;
        }

        this.cam = cam;
        this.cam.onGraphChanged
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
          });
      });
  }



  clear() {
    this.noctuaAnnotonFormService.clearForm();
  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
