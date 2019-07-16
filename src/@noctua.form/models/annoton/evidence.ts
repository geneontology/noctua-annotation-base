import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { AnnotonError } from "./parser/annoton-error";
import { Entity } from './entity';
import { EntityLookup } from './entity-lookup';

export class Evidence {
  qualifier;
  evidence: Entity = new Entity();
  evidenceLookup: EntityLookup = new EntityLookup();
  reference: Entity = new Entity();
  with: Entity = new Entity();
  assignedBy: Entity = new Entity();
  classExpression
  individualId;

  evidenceRequired: boolean = false;
  referenceRequired: boolean = false
  ontologyClass = []

  constructor() {

  }

  getAssignedBy() {
    return this.assignedBy;
  }

  getEvidence() {
    return this.evidence;
  }

  getReference() {
    return this.reference;
  }

  getWith() {
    return this.with;
  }

  hasValue() {
    const self = this;

    return self.evidence.id && self.reference.label;
  }

  setAssignedBy(value: Entity) {
    this.assignedBy = value;
  }

  setEvidenceLookup(value) {
    this.evidenceLookup.requestParams = value;
  }

  setEvidenceOntologyClass(value) {
    this.ontologyClass = value;
  }

  setEvidence(value: Entity, classExpression?) {
    this.evidence = value;

    if (classExpression) {
      this.classExpression = classExpression;
    }
  }

  setReference(value: Entity) {
    this.reference = value;
  }

  setWith(value: Entity) {
    this.with = value;
  }

  clearValues() {
    const self = this;

    self.setEvidence(new Entity());
    self.setReference(new Entity());
    self.setWith(new Entity());
    self.setAssignedBy(new Entity());
  }

  copyValues(evidence, except) {
    const self = this;

    self.setEvidence(evidence.getEvidence());
    !_.includes(except, 'reference') ? self.setReference(evidence.getReference()) : null;
    !_.includes(except, 'with') ? self.setWith(evidence.getWith()) : null;
    !_.includes(except, 'assignedBy') ? self.setAssignedBy(evidence.getAssignedBy()) : null;;
  }

  isEvidenceEqual(evidence) {
    const self = this;
    let result = true;


    result = result && _.isEqual(self.getEvidence(), evidence.getEvidence());
    result = result && _.isEqual(self.getReference(), evidence.getReference());
    result = result && _.isEqual(self.getWith(), evidence.getWith());

    // console.log(result, '-', self.getEvidence(), evidence.getEvidence())
    return result;
  }

  enableSubmit(errors, node, position) {
    const self = this;
    let result = true;

    if (!self.evidence.id) {
      self.evidenceRequired = true;
      let meta = {
        aspect: node.label
      }
      let error = new AnnotonError('error', 1, "No evidence for '" + node.label + "': evidence(" + position + ")", meta)
      errors.push(error);
      result = false;
    } else {
      self.evidenceRequired = false;
    }

    if (self.evidence.id && !self.reference.label) {
      self.referenceRequired = true;
      let meta = {
        aspect: node.label
      }
      let error = new AnnotonError('error', 1, "You provided an evidence for '" + node.label + "' but no reference: evidence(" + position + ")", meta)
      errors.push(error);
      result = false;
    } else {
      self.referenceRequired = false;
    }
    return result;
  }
}