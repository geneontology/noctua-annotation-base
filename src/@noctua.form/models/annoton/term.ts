import * as _ from 'lodash';
import { TermLookup } from './term-lookup';
declare const require: any;
const uuid = require('uuid/v1');

export class Term {
  uuid: string;
  id: string;
  label: string;
  url: string;
  classExpression: any;

  constructor(id?: string, label?: string, url?: string) {
    this.id = id;
    this.label = label;
    this.url = url;
  }

  hasValue() {
    return this.id !== null;
  }

}