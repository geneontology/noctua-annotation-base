import { AnnotonError, ErrorLevel, ErrorType } from "./parser/annoton-error";
import { Entity } from './entity';
import { AnnotonNode } from './annoton-node';
import { includes, isEqual } from 'lodash';

import { noctuaFormConfig } from './../../noctua-form-config';
import { CamStats } from "./cam";
import { Contributor } from "../contributor";
import { Group } from "../group";

export class Evidence {

  edge: Entity;
  evidence: Entity = new Entity('', '');
  referenceEntity: Entity = new Entity('', '');
  withEntity: Entity = new Entity('', '');
  reference: string;
  referenceUrl: string;
  with: string;
  groups: Group[] = [];
  contributors: Contributor[] = [];
  classExpression;
  uuid;
  evidenceRequired = false;
  referenceRequired = false;
  ontologyClass = [];
  pendingEvidenceChanges: Entity;
  pendingReferenceChanges: Entity;
  pendingWithChanges: Entity;

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

    if (self.referenceEntity.modified) {
      modifiedStats.referencesCount++;
      stat.referencesCount++;
      modified = true;
    }

    if (self.withEntity.modified) {
      modifiedStats.withsCount++;
      stat.withsCount++;
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

    if (oldEvidence && self.reference !== oldEvidence.reference) {
      self.referenceEntity.termHistory.unshift(new Entity(oldEvidence.referenceEntity.id, oldEvidence.referenceEntity.label));
      self.referenceEntity.modified = true;
    }

    if (oldEvidence && self.with !== oldEvidence.with) {
      self.withEntity.termHistory.unshift(new Entity(oldEvidence.withEntity.id, oldEvidence.withEntity.label));
      self.withEntity.modified = true;
    }

  }

  addPendingChanges(oldEvidence: Evidence) {
    const self = this;

    if (self.evidence.id !== oldEvidence.evidence.id) {
      self.pendingEvidenceChanges = new Entity(self.evidence.id, self.evidence.label);
      self.pendingEvidenceChanges.uuid = self.uuid;
    }

    if (self.reference !== oldEvidence.reference) {
      self.pendingReferenceChanges = new Entity(self.reference, self.reference);
      self.pendingReferenceChanges.uuid = self.uuid;
    }

    if (self.with !== oldEvidence.with) {
      self.pendingWithChanges = new Entity(self.with, self.with);
      self.pendingWithChanges.uuid = self.uuid;
    }

    //this is temporary swap back into old
    self.evidence = oldEvidence.evidence;
    self.reference = oldEvidence.reference;
    self.with = oldEvidence.with;
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
