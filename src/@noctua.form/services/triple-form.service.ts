import { Injector, Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs'
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'

//Config
import { noctuaFormConfig } from './../noctua-form-config';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './../services/cam.service';


declare const require: any;
const each = require('lodash/forEach');

import {
  Cam,
  Triple,
  ActivityNode
} from './../models/activity';
import { } from './../models/activity/activity-node';


import { TripleForm } from './../models/forms';
import { ActivityFormMetadata } from './../models/forms/activity-form-metadata';

@Injectable({
  providedIn: 'root'
})
export class NoctuaTripleFormService {
  cam: Cam;
  public triple: Triple<ActivityNode>;
  private tripleForm: TripleForm;
  private tripleFormGroup: BehaviorSubject<FormGroup | undefined>;
  public tripleFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder, public noctuaFormConfigService: NoctuaFormConfigService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService) {

    this.tripleFormGroup = new BehaviorSubject(null);
    this.tripleFormGroup$ = this.tripleFormGroup.asObservable()

    this.camService.onCamChanged.subscribe((cam) => {
      if (!cam) return;

      this.cam = cam;
    });
  }

  initializeForm(triple: Triple<ActivityNode>) {
    this.triple = triple;
    this.tripleForm = this.createTripleForm(triple);
    this.tripleFormGroup.next(this._fb.group(this.tripleForm));
    this._onActivityFormChanges();
  }

  createTripleForm(triple: Triple<ActivityNode>) {
    const self = this;
    const formMetadata = new ActivityFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));

    const tripleForm = new TripleForm(formMetadata);

    tripleForm.createTripleForm(triple);

    return tripleForm;
  }

  tripleFormToActivity() {
    const self = this;

    // self.tripleForm.populateActivityEntityForm(this.termNode);
  }

  private _onActivityFormChanges(): void {
    this.tripleFormGroup.getValue().valueChanges.subscribe(value => {
      // this.errors = this.getActivityFormErrors();
      this.tripleFormToActivity();
    });
  }

  clearForm() {
  }
}

