import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { CamService } from './../services/cam.service';
import { Cam } from './../models/annoton/cam';
import { EntityForm } from './../models/forms/entity-form';
import { AnnotonFormMetadata } from './../models/forms/annoton-form-metadata';
import { AnnotonNode, Annoton } from '../models';
import { NoctuaGraphService } from './graph.service';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class NoctuaAnnotonEntityService {
  public cam: Cam;
  public currentAnnoton: Annoton;
  public annoton: Annoton;
  public entity: AnnotonNode;
  private entityForm: EntityForm;
  private entityFormGroup: BehaviorSubject<FormGroup | undefined>;
  public entityFormGroup$: Observable<FormGroup>;

  constructor(private _fb: FormBuilder,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaGraphService: NoctuaGraphService,
    private camService: CamService,
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

  initializeForm(annoton: Annoton, entity: AnnotonNode) {
    this.currentAnnoton = cloneDeep(annoton);
    this.annoton = annoton;
    this.entity = entity;
    this.entityForm = this.createAnnotonEntityForm(this.entity);
    this.entityFormGroup.next(this._fb.group(this.entityForm));
    this._onAnnotonFormChanges();
  }

  createAnnotonEntityForm(entity: AnnotonNode) {
    const self = this;
    const formMetadata = new AnnotonFormMetadata(self.noctuaLookupService.lookupFunc.bind(self.noctuaLookupService));
    const entityForm = new EntityForm(formMetadata, entity);

    if (!entity.skipEvidence) {
      entityForm.createEvidenceForms(entity);
    }

    return entityForm;
  }

  annotonEntityFormToAnnoton() {
    const self = this;

    self.entityForm.populateTerm();
  }

  private _onAnnotonFormChanges(): void {
    this.entityFormGroup.getValue().valueChanges.subscribe(() => {
      // this.errors = this.getAnnotonFormErrors();
      //  this.annotonEntityFormToAnnoton();
      // this.annoton.enableSubmit();
    });
  }

  saveAnnoton() {
    const self = this;

    self.annotonEntityFormToAnnoton();
    const saveData = self.annoton.createEdit(self.currentAnnoton);

    return self.noctuaGraphService.editAnnoton(self.cam,
      saveData.srcNodes,
      saveData.destNodes,
      saveData.srcTriples,
      saveData.destTriples,
      saveData.removeIds,
      saveData.removeTriples);
  }

  saveAnnotonReplace(cam: Cam, addLoadingStatus?: boolean): Observable<any> {
    const self = this;

    if (addLoadingStatus) {
      cam.loading.status = false;
    }

    const oldEntity = cloneDeep(self.entity);
    self.annotonEntityFormToAnnoton();

    self.entity.addPendingChanges(oldEntity);

    return self.camService.bulkEdit(cam);

  }

  saveAnnotonInternal() {
    const self = this;

    self.annotonEntityFormToAnnoton();
    const saveData = self.annoton.createEdit(self.currentAnnoton);

    return self.noctuaGraphService.editAnnoton(self.cam,
      saveData.srcNodes,
      saveData.destNodes,
      saveData.srcTriples,
      saveData.destTriples,
      saveData.removeIds,
      saveData.removeTriples);
  }

  searchModels() {
    const self = this;

    self.annotonEntityFormToAnnoton();
    const saveData = self.annoton.createEdit(self.currentAnnoton);
  }

  clearForm() {
  }
}

