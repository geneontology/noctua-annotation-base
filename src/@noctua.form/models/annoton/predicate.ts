import * as _ from 'lodash';
import { Entity } from './entity';
import { Evidence } from './evidence';
declare const require: any;
const uuid = require('uuid/v1');

export class Predicate {
  uuid: string;
  edge: Entity;
  evidence: Evidence[];

  constructor(edge: Entity, evidence: Evidence[]) {
    this.edge = edge;
    this.evidence = evidence;
  }
} 