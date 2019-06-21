import * as _ from 'lodash';
declare const require: any;
const uuid = require('uuid/v1');

export class Term {

  id: string;
  label: string;

  constructor(id?: string, label?: string) {
    this.id = id;
    this.label = label;
  }

}