import * as _ from 'lodash';
declare const require: any;
const uuid = require('uuid/v1');

import { AnnotonNode } from './annoton-node';
import { Evidence } from './evidence';

export class Triple {

  id
  _object: AnnotonNode;
  _predicate: Evidence[];
  _subject: AnnotonNode;

  private _grid: any[] = [];

  constructor(object: AnnotonNode, predicate: Evidence[], subject: AnnotonNode) {
    this.id = uuid();
    this._object = object;
    this._subject = subject;
    this._predicate = predicate;
  }

  get grid() {
    const self = this;

    if (self._grid.length === 0) {
      this.generateGrid();
    }
    return this._grid;
  }

  generateGrid() {
    const self = this;

    this._grid = [];
    this._grid.push({
      subject: this._subject.getTerm(),
      relationship: this._predicate,
      object: this._object.getTerm(),
      aspect: '',
      evidence: this._predicate.length > 0 ? this._predicate[0].getEvidence() : {},
      reference: this._predicate.length > 0 ? this._predicate[0].getReference() : '',
      with: this._predicate.length > 0 ? this._predicate[0].getWith() : '',
      assignedBy: this._predicate.length > 0 ? this._predicate[0].getAssignedBy() : '',
      subjectNode: this._subject,
      objectNode: this._object,
    });

    for (let i = 1; i < this._predicate.length; i++) {
      self._grid.push({
        evidence: this._predicate[i].getEvidence(),
        reference: this._predicate[i].getReference(),
        with: this._predicate[i].getWith(),
        assignedBy: this._predicate[i].getAssignedBy(),
        subjectNode: this._subject,
        objectNode: this._object,
      })
    }
  }

}