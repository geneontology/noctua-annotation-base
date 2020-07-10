import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurieService } from './../../@noctua.curie/services/curie.service';
import { NoctuaGraphService } from './../services/graph.service';
import { NoctuaFormConfigService } from './../services/config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { NoctuaUserService } from './user.service';
import { Annoton } from './../models/annoton/annoton';
import { CamForm } from './../models/forms/cam-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';
import { Evidence, compareEvidence } from './../models/annoton/evidence';

import { v4 as uuid } from 'uuid';
import { Cam } from './../models/annoton/cam';
import { uniqWith, each } from 'lodash';
import { CamService } from './cam.service';

@Injectable({
  providedIn: 'root'
})
export class CamsService {
  curieUtil: any;
  loading = false;
  cams: Cam[];
  onCamsChanged: BehaviorSubject<any>;


  public annoton: Annoton;
  private camForm: CamForm;
  private camFormGroup: BehaviorSubject<FormGroup | undefined>;
  public camFormGroup$: Observable<FormGroup>;


  constructor(public noctuaFormConfigService: NoctuaFormConfigService,
    private _fb: FormBuilder,
    private noctuaUserService: NoctuaUserService,
    private noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
    private noctuaLookupService: NoctuaLookupService,
    private curieService: CurieService) {
    this.onCamsChanged = new BehaviorSubject(null);
    this.curieUtil = this.curieService.getCurieUtil();
    this.camFormGroup = new BehaviorSubject(null);
    this.camFormGroup$ = this.camFormGroup.asObservable();
  }

  initializeForm(cams?: Cam[]) {
    const self = this;

    if (cams) {
      this.cams = cams;
    }

    // self.camForm = this.createCamForm();
    // self.camFormGroup.next(this._fb.group(this.camForm));
  }

  createCamForm() {
    const self = this;

    const formMetadata = new AnnotonFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const camForm = new CamForm(formMetadata);

    // camForm.createCamForm(this.cams, this.noctuaUserService.user);

    return camForm;
  }

  loadCams() {
    const self = this;
    each(this.cams, (cam: Cam) => {
      self.camService.loadCam(cam);
    });

    self.onCamsChanged.next(this.cams);
  }
}
