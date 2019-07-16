import * as _ from 'lodash';

declare const require: any;
const each = require('lodash/forEach');

import { Evidence } from './evidence';
import { AnnotonError } from "./parser/annoton-error";
import { Annoton } from './annoton';
import { Entity } from './entity';
import { EntityLookup } from './entity-lookup';
import { Contributor } from './../contributor';

export class AnnotonNode {
  id: string;
  individualId: string;
  label: string;
  term: Entity = new Entity();
  termLookup: EntityLookup = new EntityLookup();
  isExtension: boolean = false;
  aspect: string;
  lookupGroup: string;
  nodeGroup: any = {};
  displaySection: any
  relationship: any;
  displayGroup
  treeLevel: number;
  annoton: Annoton;
  ontologyClass: any = [];
  isComplement: boolean = false;
  required: boolean;
  closures: any = [];
  edgeOption;
  visible = true;
  evidence = [];
  assignedBy: boolean = null;
  contributor: Contributor = null;
  termRequiredList = ['mf'];
  evidenceRequiredList = ['mf', 'bp', 'cc', 'mf-1', 'mf-2', 'bp-1', 'bp-1-1', 'cc-1', 'cc-1-1', 'c-1-1-1']
  evidenceNotRequiredList = [];
  errors = [];
  warnings = [];
  status = '0';

  isCatalyticActivity = false
  saveMeta: any = {};
  //UI
  _location = {
    x: 0,
    y: 0
  }
  _evidenceMeta;

  constructor() {
    this._evidenceMeta = {
      lookupBase: "",
      ontologyClass: "eco"
    };

  }

  get location() {
    return this._location;
  }

  set location(location) {
    this._location = location
  }

  getTerm() {
    return this.term;
  }

  setTerm(term: Entity, classExpression?) {
    this.term = term;

    if (classExpression) {
      this.classExpression = classExpression;
    }
  }

  setDisplay(value) {
    if (value) {
      this.displaySection = value.displaySection;
      this.displayGroup = value.displayGroup;
    }
  }

  addEdgeOption(edgeOption) {
    const self = this;

    self.edgeOption = edgeOption;
  }


  getEvidence(): Evidence[] {
    return this.evidence;
  }

  getEvidenceById(id) {
    const self = this;

    return _.find(self.evidence, (evidence: Evidence) => {
      return evidence.individualId === id;
    })
  }

  get classExpression() {
    return this.term.classExpression;
  }

  set classExpression(classExpression) {
    this.term.classExpression = classExpression;
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
    let evidence = srcEvidence ? srcEvidence : new Evidence();

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

  setTermOntologyClass(value) {
    this.ontologyClass = value;
  }

  toggleIsComplement() {
    const self = this;

    self.isComplement = !self.isComplement;
    self.nodeGroup.isComplement = self.isComplement;
  }

  setIsComplement(complement) {
    const self = this;

    self.isComplement = complement;
  }

  hasValue() {
    const self = this;

    return self.term.hasValue();
  }

  clearValues() {
    const self = this;

    self.term.id = null;
    self.term.label = null;
    self.evidence = [];
    self.addEvidence();
  }

  deepCopyValues(node: AnnotonNode) {
    const self = this;

    self.term = node.term;
    self.evidence = node.evidence;
    self.location = node.location;
    self.individualId = node.individualId;
    self.annoton = node.annoton;
    self.ontologyClass = node.ontologyClass;
    self.assignedBy = node.assignedBy;
    self.termRequiredList = node.termRequiredList;
    self.evidenceRequiredList = node.evidenceRequiredList
    self.evidenceNotRequiredList = node.evidenceNotRequiredList;
    self.errors = node.errors;
    self.warnings = node.warnings;
    self.status = node.status;

    self.edgeOption = node.edgeOption;
    self.isComplement = node.isComplement;
  }

  copyValues(node) {
    const self = this;

    self.location = node.location;
    self.term = node.term;
    self.evidence = node.evidence;
    self.assignedBy = node.assignedBy;
    self.isComplement = node.isComplement;
  }


  selectEdge(edge) {
    console.log("I am selected ", edge);
  }

  setTermLookup(value) {
    this.termLookup.requestParams = value;
  }

  setEvidenceMeta(ontologyClass, lookupBase) {
    this._evidenceMeta.lookupBase = lookupBase;
    this._evidenceMeta.ontologyClass = ontologyClass;
    this.addEvidence();
  }

  enableRow() {
    const self = this;
    let result = true;

    if (self.nodeGroup) {
      if (self.nodeGroup.isComplement && self.treeLevel > 0) [
        result = false
      ]
    }

    return result;
  }

  enableSubmit(errors, annoton) {
    const self = this;
    let result = true;

    if (self.termRequiredList.includes(self.id) && !self.term.id) {
      self.required = true;
      let meta = {
        aspect: self.label
      }
      let error = new AnnotonError('error', 1, "A '" + self.label + "' is required", meta)
      errors.push(error);
      result = false;
    } else {
      self.required = false;
    }

    if (self.term.id && self.evidenceRequiredList.includes(self.id) &&
      !self.evidenceNotRequiredList.includes(self.term.id)) {
      each(self.evidence, function (evidence, key) {
        if (self.term.id)
          result = evidence.enableSubmit(errors, self, key + 1) && result;
      })
    }

    return result;
  }

  static isType(typeId, id) {
    let n = typeId.toLowerCase();
    if (n.includes(id)) {

    } else if (n.includes('go')) {

    }
  }

}