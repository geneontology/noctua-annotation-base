import { AnnotonError, ErrorLevel, ErrorType } from "./parser/annoton-error";
import { Entity } from './entity';
import { AnnotonNode } from './annoton-node';
import { includes, isEqual } from 'lodash';

import { noctuaFormConfig } from './../../noctua-form-config';
import { CamStats } from "./cam";

export class Evidence {

  edge: Entity;
  evidence: Entity = new Entity('', '');
  reference: string;
  referenceUrl: string;
  with: string;
  assignedBy: Entity = new Entity('', '');
  classExpression;
  uuid;
  evidenceRequired = false;
  referenceRequired = false;
  ontologyClass = [];

  pendingChangeEntity: Entity;

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

    return result;
  }

  reviewEvidenceChanges(stat: CamStats, modifiedStats: CamStats): boolean {
    const self = this;
    let modified = false;

    if (self.evidence.modified) {
      modifiedStats.evidenceCount++;
      stat.evidenceCount++;
      modified = true;
    }

    modifiedStats.updateTotal();
    return modified;
  }

  checkStored(oldEvidence: Evidence) {
    const self = this;

    if (oldEvidence && self.evidence.id !== oldEvidence.evidence.id) {
      self.evidence.termHistory.unshift(new Entity(oldEvidence.evidence.id, oldEvidence.evidence.label));
      self.evidence.modified = true;
    }
  }

  addPendingChanges(oldEvidence: Evidence) {
    const self = this;

    self.pendingChangeEntity = new Entity(self.evidence.id, self.evidence.label);
    self.pendingChangeEntity.uuid = self.uuid;

    //this is temporary swap back into old
    self.evidence = oldEvidence.evidence
  }

  enableSubmit(errors, node: AnnotonNode, position) {
    const self = this;
    let result = true;
    const meta = {
      aspect: node.label
    };

    if (self.evidence.id) {
      self.evidenceRequired = false;
    } else {
      self.evidenceRequired = true;

      const error = new AnnotonError(ErrorLevel.error, ErrorType.general, `No evidence for "${node.label}": on evidence(${position})`, meta);

      errors.push(error);
      result = false;
    }

    if (self.evidence.id && !self.reference) {
      const error = new AnnotonError(ErrorLevel.error, ErrorType.general,
        `You provided an evidence for "${node.label}" but no reference: on evidence(${position})`,
        meta);
      errors.push(error);

      self.referenceRequired = true;
      result = false;
    } else {
      self.referenceRequired = false;
    }

    if (self.reference) {
      result = self._enableReferenceSubmit(errors, self.reference, node, position);
    }

    return result;
  }

  private _enableReferenceSubmit(errors, reference: string, node: AnnotonNode, position): boolean {
    const meta = {
      aspect: node.label
    };

    if (!reference.includes(':')) {
      const error = new AnnotonError(ErrorLevel.error, ErrorType.general,
        `Use DB:accession format for reference "${node.label}" on evidence(${position})`,
        meta);
      errors.push(error);
      return false;
    }

    const DBAccession = reference.split(':');
    const db = DBAccession[0].trim().toLowerCase();
    const accession = DBAccession[1].trim().toLowerCase();
    const dbs = ['pmid', 'go_ref', 'doi'];

    /*
    if (!dbs.includes(db)) {
      const error = new AnnotonError(ErrorLevel.error, ErrorType.general, 
        `Please enter either PMID, DOI or GO_REF for "${node.label}" on evidence(${position})`,
        meta);
      errors.push(error);
      return false;
    } */

    if (accession === '') {
      const error = new AnnotonError(ErrorLevel.error, ErrorType.general,
        `"${db}" accession is required "${node.label}" on evidence(${position})`,
        meta);
      errors.push(error);
      return false;
    }

    return true;
  }

}

export function compareEvidence(a: Evidence, b: Evidence) {
  return a.evidence.id === b.evidence.id
    && a.reference === b.reference
    && a.with === b.with;
}

export function compareEvidenceEvidence(a: Evidence, b: Evidence) {
  return a.evidence.id === b.evidence.id;
}

export function compareEvidenceReference(a: Evidence, b: Evidence) {
  return a.reference === b.reference;
}

export function compareEvidenceWith(a: Evidence, b: Evidence) {
  return a.with === b.with;
}
