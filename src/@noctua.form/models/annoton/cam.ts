import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const uuid = require('uuid/v1');

import { Annoton } from './annoton'
import { AnnotonNode } from './annoton-node'

export class Cam {
  //Details
  title: string;
  state: any;
  //User Info
  group: any;

  id: string;
  expanded?: boolean;
  model: any;
  annotatedEntity?: {};
  camRow?: any;
  _annotons: Annoton[] = [];

  error = false;
  engine;
  onGraphChanged;
  manager;
  individualManager;
  groupManager;
  graph;
  modelId;
  summaryExpanded = false;

  constructor() {
  }

  get annotons() {
    return this._annotons;
  }

  set annotons(annoton) {
    this._annotons = annoton;
  }

  findAnnotonById(id) {
    const self = this;

    return _.find(self.annotons, (annoton) => {
      return annoton.id === id;
    })
  }

  annotonsWithoutLocation() {
    let result = [];

    this.annotons.forEach((annoton: Annoton) => {
      if (annoton.location.x === 0 && annoton.location.y === 0) {
        result.push(annoton);
      }
    });

    return result;
  }

  getAnnotonByConnectionId(connectionId) {
    const self = this;
    let result = _.find(self._annotons, (annoton: Annoton) => {
      return annoton.connectionId === connectionId;
    })

    return result;
  }

  getMFNodes() {
    const self = this;
    let result = [];

    each(self._annotons, function (annotonData) {
      each(annotonData.annoton.nodes, function (node) {
        if (node.id === 'mf') {
          result.push({
            node: node,
            annoton: annotonData.annoton
          })
        }
      });
    });

    return result;
  }

  getUniqueEvidences(result?) {
    const self = this;

    if (!result) {
      result = [];
    }

    each(self.annotons, function (annoton: Annoton) {
      each(annoton.nodes, function (node: AnnotonNode) {
        each(node.evidence, function (evidence) {
          if (evidence.hasValue()) {
            if (!self.evidenceExists(result, evidence)) {
              result.push(evidence);
            }
          }
        });
      });
    });

    return result;
  }

  evidenceExists(data, evidence) {
    const self = this;

    return _.find(data, function (x) {
      return x.isEvidenceEqual(evidence)
    })
  }

  addUniqueEvidences(existingEvidence, data) {
    const self = this;
    let result = [];

    each(data, function (annotation) {
      each(annotation.annotations, function (node) {
        each(node.evidence, function (evidence) {
          if (evidence.hasValue()) {
            if (!self.evidenceExists(result, evidence)) {
              result.push(evidence);
            }
          }
        });
      });
    });

    return result;
  }

  addUniqueEvidencesFromAnnoton(annoton) {
    const self = this;
    let result = [];

    each(annoton.nodes, function (node) {
      each(node.evidence, function (evidence) {
        if (evidence.hasValue()) {
          if (!self.evidenceExists(result, evidence)) {
            result.push(evidence);
          }
        }
      });
    });

    return result;
  }
}