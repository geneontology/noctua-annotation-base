import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { merge, Observable, Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { Annoton } from './../annoton/annoton';
import { AnnotonFormMetadata } from './../forms/annoton-form-metadata';
import { EntityGroupForm } from './entity-group-form';

import { EvidenceForm } from './evidence-form';

import { EntityForm } from './entity-form';
import { termValidator } from './validators/term-validator';
import {
  Triple,
  Evidence,
  EntityLookup,
  Entity
} from '../annoton';
import { AnnotonNode } from '..';

export class TripleForm {
  subject = new FormControl();
  object = new FormControl();
  evidenceForms: EvidenceForm[] = [];
  evidenceFormArray = new FormArray([]);
  _metadata: AnnotonFormMetadata;

  private _fb = new FormBuilder();

  constructor(metadata) {
    this._metadata = metadata;
  }

  createTripleForm(triple: Triple<AnnotonNode>) {
    const self = this;

    this.subject.setValue(triple.subject.getTerm());
    this.object.setValue(triple.object.getTerm());
    this.onValueChanges(triple.subject.termLookup);
    triple.predicate.evidence.forEach((evidence: Evidence) => {
      const evidenceForm = new EvidenceForm(self._metadata, triple.subject, evidence);

      self.evidenceForms.push(evidenceForm);
      evidenceForm.onValueChanges(triple.predicate.evidenceLookup);
      self.evidenceFormArray.push(self._fb.group(evidenceForm));
    });
  }

  populateAnnotonEntityForm(annotonNode: AnnotonNode) {
    const self = this;
    const evidences: Evidence[] = [];

    annotonNode.term = new Entity(this.subject.value.id, this.subject.value.label);
    self.evidenceForms.forEach((evidenceForm: EvidenceForm) => {
      // const evidenceFound = annotonNode.getEvidenceById(evidenceForm.uuid);
      // const evidence = evidenceFound ? evidenceFound : new Evidence();

      //  evidenceForm.populateEvidence(evidence);
      //  evidences.push(evidence)
    });

    // annotonNode.setEvidence(evidences);
  }

  onValueChanges(lookup: EntityLookup) {
    const self = this;

    self.subject.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      self._metadata.lookupFunc(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });
    });
  }

}
