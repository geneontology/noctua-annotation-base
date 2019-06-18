import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { noctuaFormConfig } from './../../noctua-form-config';

import { SaeGraph } from './sae-graph';
import { AnnotonError } from "./parser/annoton-error";

import { AnnotonNode } from './annoton-node';
import { Evidence } from './evidence';

export class ConnectorAnnoton extends SaeGraph {
  id;

  upstreamNode: AnnotonNode;
  downstreamNode: AnnotonNode;
  processNode: AnnotonNode;

  private _grid: any[] = [];

  constructor() {
    super();
    this.id = uuid();
  }

  insertTermNode(annotonModel, id, value) {
    let node = null;

    node = _.find(annotonModel, {
      id: id
    });

    if (node) {
      node.term.control.value = value;
    }
  }

  addEdgeOptionById(id, edgeOption) {
    const self = this;

    let node = self.getNode(id);
    node.addEdgeOption(edgeOption)
  }

}