import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const uuid = require('uuid/v1');

import { noctuaFormConfig } from './../../noctua-form-config';
import { Annoton } from './annoton'
import { AnnotonNode } from './annoton-node'
import { Group } from '../group';
import { Contributor } from '../contributor';
import { Evidence } from './evidence';
import { Triple } from './triple';
import { Entity } from './entity';
import { ConnectorAnnoton } from './connector-annoton';

export class Cam {

  //Details
  title: string;
  state: any;
  //User Info
  groups: Group[] = [];
  contributors: Contributor[] = [];
  group: any;

  id: string;
  expanded?: boolean;
  model: any;
  annotatedEntity?: {};
  camRow?: any;
  annotons: Annoton[] = [];
  connectorAnnotons: ConnectorAnnoton[] = [];
  triples: Triple[] = [];

  error = false;
  engine;
  onGraphChanged;
  manager;
  individualManager;
  groupManager;
  graph;
  date;
  modelId;
  summaryExpanded = false;

  ///
  filter = {
    contributor: null,
    individualIds: [],
  };

  displayType;

  grid: any = [];
  goterms: Entity[] = [];

  constructor() {
    this.displayType = noctuaFormConfig.camDisplayType.options.model;
  }

  getConnectorAnnoton(upstreamId: string, downstreamId: string): ConnectorAnnoton {
    const self = this;

    return _.find(self.connectorAnnotons, (connectorAnnoton: ConnectorAnnoton) => {
      let re = connectorAnnoton.upstreamNode.individualId === upstreamId &&
        connectorAnnoton.downstreamNode.individualId === downstreamId;

      return re
    });
  }

  configureDisplayType() {
    if (this.filter.individualIds.length > 0) {
      this.displayType = noctuaFormConfig.camDisplayType.options.entity;
    }
  }

  getActivities() {
    const self = this;
    let result = [];

    each(self.annotons, function (annotonData) {
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

  resetFilter() {
    this.filter.contributor = null;
    this.filter.individualIds = [];
  }

  findAnnotonById(id) {
    const self = this;

    return _.find(self.annotons, (annoton) => {
      return annoton.id === id;
    })
  }

  findAnnotonNode() {
    const self = this;
    let result = [];

    each(self.annotons, function (annotonData) {
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

  annotonsWithoutLocation() {
    let result = [];

    this.annotons.forEach((annoton: Annoton) => {
      if (annoton.location.x === 0 && annoton.location.y === 0) {
        result.push(annoton);
      }
    });

    return result;
  }

  applyFilter() {
    const self = this;

    if (self.filter.individualIds.length > 0) {
      self.grid = [];

      each(self.annotons, (annoton: Annoton) => {
        each(annoton.nodes, (node: AnnotonNode) => {
          each(self.filter.individualIds, (individualId) => {
            let match = false
            each(node.evidence, (evidence: Evidence) => {
              match = match || (evidence.individualId === individualId);
            })
            match = match || (node.individualId === individualId);
            if (match) {
              self.generateGridRow(annoton, node);
            }
          });
        });
      });
    }
  }

  getAnnotonByConnectionId(connectionId) {
    const self = this;
    let result = _.find(self.annotons, (annoton: Annoton) => {
      return annoton.connectionId === connectionId;
    })

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


  generateTripleGrid() {
    let grid = [...this.triples.map((triple) => {
      return triple.grid;
    })]



    console.log(grid)

    return grid;
    //return _.flattenDeep(grid);
  }



  generateGridRow(annoton: Annoton, node: AnnotonNode) {
    const self = this;

    let term = node.getTerm();

    self.grid.push({
      displayEnabledBy: self.tableCanDisplayEnabledBy(node),
      treeLevel: node.treeLevel,
      relationship: node.isExtension ? '' : self.tableDisplayExtension(node),
      relationshipExt: node.isExtension ? node.relationship.label : '',
      term: node.isExtension ? {} : term,
      extension: node.isExtension ? term : {},
      aspect: node.aspect,
      evidence: node.evidence.length > 0 ? node.evidence[0].evidence : {},
      reference: node.evidence.length > 0 ? node.evidence[0].reference : {},
      with: node.evidence.length > 0 ? node.evidence[0].with : {},
      assignedBy: node.evidence.length > 0 ? node.evidence[0].assignedBy : {},
      annoton: annoton,
      node: node
    })

    for (let i = 1; i < node.evidence.length; i++) {
      self.grid.push({
        treeLevel: node.treeLevel,
        evidence: node.evidence[i].evidence,
        reference: node.evidence[i].reference,
        with: node.evidence[i].with.control,
        assignedBy: node.evidence[i].assignedBy,
        node: node,
      })
    }
  }

  tableCanDisplayEnabledBy(node: AnnotonNode) {
    const self = this;

    return node.relationship.id === noctuaFormConfig.edge.enabledBy.id
  }

  tableDisplayExtension(node: AnnotonNode) {
    const self = this;

    if (node.id === 'mf') {
      return '';
    } else if (node.isComplement) {
      return 'NOT ' + node.relationship.label;
    } else {
      return node.relationship.label;
    }
  }
}