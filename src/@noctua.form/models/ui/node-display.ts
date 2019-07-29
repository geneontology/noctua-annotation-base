import * as _ from 'lodash';

declare const require: any;
const each = require('lodash/forEach');

import { AnnotonNode, EntityLookup, AnnotonError, Evidence, Predicate } from '../annoton';

export class NodeDisplay extends AnnotonNode {
  label: string;
  termLookup: EntityLookup = new EntityLookup();
  lookupGroup: string;
  nodeGroup: any = {};
  displaySection: any;
  displayGroup;
  predicate: Predicate;
  relationship: any;
  treeLevel: number;
  ontologyClass: any = [];
  required: boolean;
  closures: any = [];
  edgeOption;
  visible = true;
  termRequiredList = ['mf'];
  evidenceRequiredList = ['mf', 'bp', 'cc', 'mf-1', 'mf-2', 'bp-1', 'bp-1-1', 'cc-1', 'cc-1-1', 'c-1-1-1']
  evidenceNotRequiredList = [];
  errors = [];
  warnings = [];
  status = '0';

  constructor() {
    super();
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



  selectEdge(edge) {
    console.log("I am selected ", edge);
  }

  setTermLookup(value) {
    this.termLookup.requestParams = value;
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

  enableSubmit(errors) {
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

    /*if (self.term.id && self.evidenceRequiredList.includes(self.id) &&
       !self.evidenceNotRequiredList.includes(self.term.id)) {
      each(self.evidence, (evidence: Evidence, key) => {
        if (self.term.id)
          result = evidence.enableSubmit(errors, self, key + 1) && result;
      }) 
    }*/

    return result;
  }

}