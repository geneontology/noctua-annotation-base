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

export enum ConnectorState {
  creation = 1,
  editing
}

export enum ConnectorType {
  basic = 1,
  intermediate
}

export class ConnectorAnnoton extends SaeGraph {
  id: string;
  upstreamAnnoton: Annoton;
  downstreamAnnoton: Annoton;
  upstreamNode: AnnotonNode;
  downstreamNode: AnnotonNode;
  processNode: AnnotonNode;
  state: ConnectorState;
  type: ConnectorType = ConnectorType.basic;
  rule: ConnectorRule;

  private _grid: any[] = [];

  constructor(upstreamNode: AnnotonNode, downstreamNode: AnnotonNode, state?: ConnectorState) {
    super();
    this.id = uuid();

    this.upstreamNode = upstreamNode;
    this.downstreamNode = downstreamNode;
    this.state = state ? state : ConnectorState.creation

    this.rule = new ConnectorRule();
  }

}