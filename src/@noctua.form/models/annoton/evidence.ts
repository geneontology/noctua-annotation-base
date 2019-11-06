import { AnnotonError } from "./parser/annoton-error";
import { Entity } from './entity';
import { AnnotonNode } from './annoton-node';
import { includes, isEqual } from 'lodash';

export class Evidence {
  edge: Entity;
  evidence: Entity = new Entity('', '');
  reference: string;
  with: string;
  assignedBy: Entity = new Entity('', '');
  classExpression;
  uuid;
  evidenceRequired = false;
  referenceRequired = false;
  ontologyClass = [];

  constructor() {

  }

  hasValue() {
    const self = this;

    return self.evidence.id && self.reference;
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

  clearValues() {
    const self = this;

    self.setEvidence(new Entity('', ''));
    self.reference = '';
    self.with = '';
    self.assignedBy = new Entity('', '');
  }

  copyValues(evidence: Evidence, except) {
    const self = this;

    self.setEvidence(evidence.evidence);
    !includes(except, 'reference') ? self.reference = evidence.reference : null;
    !includes(except, 'with') ? self.with = evidence.with : null;
    !includes(except, 'assignedBy') ? self.assignedBy = evidence.assignedBy : null;
  }

  isEvidenceEqual(evidence) {
    const self = this;
    let result = true;

    result = result && isEqual(self.evidence, evidence.evidence);
    result = result && isEqual(self.reference, evidence.reference);
    result = result && isEqual(self.with, evidence.with);

    // console.log(result, '-', self.evidence, evidence.evidence)
    return result;
  }

  enableSubmit(errors, node: AnnotonNode, position) {
    const self = this;
    let result = true;

    if (self.evidence.id) {
      self.evidenceRequired = false;
    } else {
      self.evidenceRequired = true;
      const meta = {
        aspect: node.label
      };
      const error = new AnnotonError('error', 1, `No evidence for "${node.label}": evidence(${position})`, meta);

      errors.push(error);
      result = false;
    }

    if (self.evidence.id && !self.reference) {

      const meta = {
        aspect: node.label
      };
      const error = new AnnotonError('error', 1,
        `You provided an evidence for "${node.label}" but no reference: evidence(${position})`,
        meta);
      errors.push(error);

      self.referenceRequired = true;
      result = false;
    } else {
      self.referenceRequired = false;
    }
    return result;
  }
}

export function compareEvidence(a: Evidence, b: Evidence) {
  return a.evidence.id === b.evidence.id
    && a.reference === b.reference
    && a.with === b.with;
}
