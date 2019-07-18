import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { noctuaFormConfig } from './../../noctua-form-config';

import { SaeGraph } from './sae-graph';
import {
  AnnotonError,
  AnnotonNode,
  Evidence,
  ConnectorRule
} from './';
import { Annoton } from './annoton';

export type ConnectorMode = 'creation' | 'editing' | null;

export class ConnectorAnnoton extends SaeGraph {
  id;

  upstreamAnnoton: Annoton;
  downstreamAnnoton: Annoton;
  upstreamNode: AnnotonNode;
  downstreamNode: AnnotonNode;
  processNode: AnnotonNode;
  mode: ConnectorMode;
  rule: ConnectorRule;

  private _grid: any[] = [];

  constructor(upstreamNode: AnnotonNode, downstreamNode: AnnotonNode) {
    super();
    this.id = uuid();

    this.upstreamNode = upstreamNode;
    this.downstreamNode = downstreamNode;
    this.rule = new ConnectorRule();
  }
}