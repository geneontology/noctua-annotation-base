import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { merge, Observable, Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { Annoton } from './../annoton/annoton';
import { AnnotonNode } from './../annoton/annoton-node';
import { AnnotonFormMetadata } from './../forms/annoton-form-metadata';
import { EntityGroupForm } from './entity-group-form';

import { EvidenceForm } from './evidence-form';

import { Evidence } from './../../models/annoton/evidence';
import { EntityForm } from './entity-form';
import { EntityLookup } from '../annoton/entity-lookup';
import { Predicate } from '..';

export class AnnotonConnectorForm {
  edge = new FormControl();
  annotonsConsecutive = new FormControl();
  causalEffect = new FormControl();
  effectDependency = new FormControl();
  causalReactionProduct = new FormControl();
  evidenceForms: EvidenceForm[] = []
  evidenceFormArray = new FormArray([]);
  process = new FormControl();
  hasInput = new FormControl();
  _metadata: AnnotonFormMetadata;

  private _fb = new FormBuilder();

  constructor(metadata) {
    this._metadata = metadata;
  }

  createEntityForms(predicate: Predicate, hasInput: AnnotonNode) {
    const self = this;

    this.hasInput.setValue(hasInput.getTerm());

    predicate.evidence.forEach((evidence: Evidence) => {
      const evidenceForm = new EvidenceForm(self._metadata, null, evidence);

      self.evidenceForms.push(evidenceForm);
      evidenceForm.onValueChanges(evidence.evidenceLookup);
      self.evidenceFormArray.push(self._fb.group(evidenceForm));
    });
  }

  updateEvidenceForms(predicate: Predicate) {
    const self = this;

    self.evidenceForms = [];
    self.evidenceFormArray = new FormArray([]);

    predicate.evidence.forEach((evidence: Evidence) => {
      const evidenceForm = new EvidenceForm(self._metadata, null, evidence);

      self.evidenceForms.push(evidenceForm);
      evidenceForm.onValueChanges(evidence.evidenceLookup);
      self.evidenceFormArray.push(self._fb.group(evidenceForm));
    });
  }

  populateConnectorForm(annoton: Annoton, annotonNode: AnnotonNode) {
    const self = this;

    const evidences: Evidence[] = [];

    self.evidenceForms.forEach((evidenceForm: EvidenceForm) => {
      const evidence = new Evidence();

      evidenceForm.populateEvidence(evidence);
      evidences.push(evidence);
    });
  }

  onValueChanges(lookup: EntityLookup) {
    const self = this;

    self.hasInput.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      self._metadata.lookupFunc(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });
    });
  }
}
