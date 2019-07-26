import * as _ from 'lodash';
import { EntityLookup } from './entity-lookup';
declare const require: any;
const uuid = require('uuid/v1');

export class Entity {
  uuid: string;
  id: string;
  label: string;
  url: string;
  classExpression: any;

  constructor(id: string, label: string, url?: string) {
    this.id = id;
    this.label = label;
    this.url = url;
  }

  hasValue() {
    let result = this.id !== null && this.id !== undefined && this.id.length > 0;

    return result
  }


} 