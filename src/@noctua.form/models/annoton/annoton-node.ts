import * as _ from 'lodash';

declare const require: any;
const each = require('lodash/forEach');

import { Evidence } from './evidence';
import { AnnotonError } from './parser/annoton-error';
import { Annoton } from './annoton';
import { Entity } from './entity';
import { EntityLookup } from './entity-lookup';
import { Contributor } from './../contributor';

export class AnnotonNode {
  id: string;
  uuid: string;
  term: Entity = new Entity('', '');
  termLookup: EntityLookup = new EntityLookup();
  isExtension = false;
  aspect: string;
  lookupGroup: string;
  nodeGroup: any = {};
  annoton: Annoton;
  ontologyClass: any = [];
  isComplement = false;
  closures: any = [];
  assignedBy: boolean = null;
  contributor: Contributor = null;
  isCatalyticActivity = false;

  constructor() {

  }

  getTerm() {
    return this.term;
  }

  get classExpression() {
    return this.term.classExpression;
  }

  set classExpression(classExpression) {
    this.term.classExpression = classExpression;
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
  }

  copyValues(node: AnnotonNode) {
    const self = this;

    self.uuid = node.uuid;
    self.term = node.term;
    self.assignedBy = node.assignedBy;
    self.isComplement = node.isComplement;
  }

  setTermLookup(value) {
    this.termLookup.requestParams = value;
  }

}