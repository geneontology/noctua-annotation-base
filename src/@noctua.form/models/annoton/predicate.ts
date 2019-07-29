import * as _ from 'lodash';
import { Entity } from './entity';
import { Evidence } from './evidence';
import { each } from 'lodash';
declare const require: any;
const uuid = require('uuid/v1');

export class Predicate {
  uuid: string;
  edge: Entity;
  evidence: Evidence[];

  _evidenceMeta = {
    lookupBase: '',
    ontologyClass: 'eco'
  };

  constructor(edge?: Entity, evidence?: Evidence[]) {
    this.edge = edge;
    this.evidence = evidence ? evidence : [];
  }

  setEvidenceMeta(ontologyClass, lookupBase) {
    this._evidenceMeta.lookupBase = lookupBase;
    this._evidenceMeta.ontologyClass = ontologyClass;
    this.addEvidence();
  }

  setEvidence(evidences: Evidence[], except?) {
    const self = this;
    self.evidence = [];

    each(evidences, function (srcEvidence, i) {
      self.addEvidence(srcEvidence);
      //  destEvidence.copyValues(srcEvidence, except);
    });
  }

  addEvidence(srcEvidence?: Evidence) {
    const self = this;
    const evidence = srcEvidence ? srcEvidence : new Evidence();

    evidence.setEvidenceLookup(JSON.parse(JSON.stringify(self._evidenceMeta.lookupBase)));
    evidence.setEvidenceOntologyClass(self._evidenceMeta.ontologyClass);
    self.evidence.push(evidence);
    return evidence;
  }

  removeEvidence(index) {
    const self = this;

    if (index === 0 && self.evidence.length === 1) {
      self.evidence[0].clearValues();
    } else {
      self.evidence.splice(index, 1);
    }
  }

  resetEvidence() {
    const self = this;

    self.evidence = [self.evidence[0]];
  }

  getEvidenceById(id) {
    const self = this;

    return _.find(self.evidence, (evidence: Evidence) => {
      return evidence.uuid === id;
    })
  }
} 