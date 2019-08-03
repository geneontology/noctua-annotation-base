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
import { Triple } from './triple';
import { Entity } from './entity';
import { getEdges, Edge } from './noctua-form-graph';
import { AnnotonParser } from './parser';

export class Annoton extends SaeGraph<AnnotonNode> {
  gp;
  uuid: string;
  id: string;
  label: string;
  parser: AnnotonParser;
  annotonRows;
  annotonType;
  annotonModelType;
  complexAnnotonData;
  errors;
  submitErrors;
  expanded = false;
  visible = true;
  private _presentation: any;
  private _displayableNodes = ['mf', 'bp', 'cc', 'mf-1', 'mf-2', 'bp-1', 'bp-1-1', 'cc-1', 'cc-1-1', 'c-1-1-1'];
  private _grid: any[] = [];

  constructor() {
    super();
    this.annotonModelType = 'default';
    this.id = uuid();
    this.errors = [];
    this.submitErrors = [];
  }

  get annotonConnections() {
    throw new Error('Method not implemented');
  }

  getConnection(uuid) {
    const self = this;

    const mfEdges: any = super.getEdges('mf');
    const bpEdges: any = super.getEdges('bp');
    let edge: any;
    const edges = [];

    if (mfEdges) {
      edges.push(...mfEdges.nodes);
    }

    if (bpEdges) {
      edges.push(...bpEdges.nodes);
    }

    edge = _.find(edges, (srcEdge) => {
      return srcEdge.object.uuid === uuid;
    });

    return edge;
  }

  getGPNode() {
    const self = this;

    return self.getNode('gp');
  }

  getMFNode() {
    const self = this;

    if (self.annotonModelType === 'bpOnly') {
      return null;
    } else {
      return self.getNode('mf');
    }
  }

  getBPNode() {
    const self = this;

    if (self.annotonModelType === 'ccOnly') {
      return null;
    } else {
      return self.getNode('bp');
    }
  }



  /*
  adjustAnnoton(annoton: Annoton) {
    const self = this;

    switch (annoton.annotonModelType) {
      case noctuaFormConfig.annotonModelType.options.default.name:
        {
          const mfNode = annoton.getNode('mf');
          const ccNode = annoton.getNode('cc');
          const cc1Node = annoton.getNode('cc-1');
          const cc11Node = annoton.getNode('cc-1-1');
          const cc111Node = annoton.getNode('cc-1-1-1');
          const ccRootNode = noctuaFormConfig.rootNode['cc']

          if (!ccNode.hasValue()) {
            if (cc1Node.hasValue()) {
              ccNode.term = new Entity(ccRootNode.id, ccRootNode.label);
              ccNode.evidence = cc1Node.evidence;
            } else if (cc11Node.hasValue()) {
              ccNode.term = new Entity(ccRootNode.id, ccRootNode.label);
              ccNode.evidence = cc11Node.evidence;
            } else if (cc111Node.hasValue()) {
              ccNode.term = new Entity(ccRootNode.id, ccRootNode.label);
              ccNode.evidence = cc111Node.evidence;
            }
          }
          break;
        }
      case noctuaFormConfig.annotonModelType.options.bpOnly.name:
        {
          const mfNode = annoton.getNode('mf');
          const bpNode = annoton.getNode('bp');

          mfNode.term = new Entity('GO:0003674', 'molecular_function');
          mfNode.evidence = bpNode.evidence;
          break;
        }
    }

  }*/



  copyStructure(srcAnnoton) {
    const self = this;

    self.annotonType = srcAnnoton.annotonType;
    self.annotonModelType = srcAnnoton.annotonModelType;
    self.complexAnnotonData = srcAnnoton.complexAnnotonData;
  }

  copyValues(srcAnnoton) {
    const self = this;

    each(self.nodes, function (destNode) {
      const srcNode = srcAnnoton.getNode(destNode.id);
      if (srcNode) {
        destNode.copyValues(srcNode);
      }
    });
  }

  setAnnotonType(type) {
    this.annotonType = type;
  }

  setAnnotonModelType(type) {
    this.annotonModelType = type;
  }

  get grid() {
    const self = this;

    if (self._grid.length === 0) {
      this.generateGrid();
    }
    return this._grid;
  }

  enableSubmit() {
    const self = this;
    let result = true;
    self.submitErrors = [];

    each(self.nodes, function (node: AnnotonNode) {
      result = node.enableSubmit(self.submitErrors) && result;
    });

    if (self.annotonType === 'simple') {
      let gp = self.getNode('gp');
      if (gp) {
        gp.required = false;
        if (!gp.getTerm().id) {
          gp.required = true;
          let meta = {
            aspect: self.label
          }
          let error = new AnnotonError('error', 1, "A '" + gp.label + "' is required", meta)
          self.submitErrors.push(error);
          result = false;
        }
      }
    }

    return result;
  }

  createSave() {
    const self = this;
    const saveData = {
      title: 'enabled by ' + self.getNode('gp').term.label,
      triples: []
    };

    const graph = self.getTrimmedGraph('mf');
    const edges: Edge<Triple<AnnotonNode>>[] = getEdges(graph);
    const triples: Triple<AnnotonNode>[] = edges.map((edge: Edge<Triple<AnnotonNode>>) => {
      return edge.metadata;
    });

    saveData.triples = triples;

    console.log(graph);
    console.log(saveData);

    return saveData;
  }

  get presentation() {
    const self = this;

    if (this._presentation) {
      return this._presentation;
    }

    const gp = self.getNode('gp');
    const mf = self.getNode('mf');
    const result = {
      gpText: gp ? gp.getTerm().label : '',
      mfText: mf ? mf.getTerm().label : '',
      geneProduct: gp,
      mcNode: self.getNode('mc'),
      gp: {},
      fd: {},
      extra: []
    };

    each(self.nodes, function (node: AnnotonNode) {
      if (_.includes(self._displayableNodes, node.id)) {
        if (node.displaySection && node.displayGroup) {
          if (!result[node.displaySection.id][node.displayGroup.id]) {
            result[node.displaySection.id][node.displayGroup.id] = {
              shorthand: node.displayGroup.shorthand,
              label: node.displayGroup.label,
              nodes: []
            };
          }

          result[node.displaySection.id][node.displayGroup.id].nodes.push(node);
          node.nodeGroup = result[node.displaySection.id][node.displayGroup.id];

          if (node.isComplement) {
            node.nodeGroup.isComplement = true;
          }
        }
      }
    });


    this._presentation = result;

    return this._presentation
  }

  addAnnotonPresentation(displaySectionId) {
    const self = this;
    let result = {};
    result[displaySectionId] = {};

    each(self.nodes, function (node: AnnotonNode) {
      if (node.displaySection === displaySectionId && node.displayGroup) {
        if (!result[displaySectionId][node.displayGroup.id]) {
          result[displaySectionId][node.displayGroup.id] = {
            shorthand: node.displayGroup.shorthand,
            label: node.displayGroup.label,
            nodes: []
          };
        }
        result[displaySectionId][node.displayGroup.id].nodes.push(node);
        node.nodeGroup = result[displaySectionId][node.displayGroup.id];
        if (node.isComplement) {
          node.nodeGroup.isComplement = true;
        }
      }
    });

    this.presentation.extra.push(result);

    return result[displaySectionId];
  }

  generateGrid() {
    const self = this;
    self._grid = [];

    each(self.presentation.fd, function (nodeGroup) {
      each(nodeGroup.nodes, function (node: AnnotonNode) {
        let term = node.getTerm();

        if (node.id !== 'mc' && node.id !== 'gp' && term.id && _.includes(self._displayableNodes, node.id)) {
          self.generateGridRow(node);
        }
      });
    });
  }

  generateGridRow(node: AnnotonNode) {
    const self = this;

    let term = node.getTerm();

    self._grid.push({
      displayEnabledBy: self.tableCanDisplayEnabledBy(node),
      treeLevel: node.treeLevel,
      gp: self.tableDisplayGp(node),
      relationship: node.isExtension ? '' : self.tableDisplayExtension(node),
      relationshipExt: node.isExtension ? node.relationship.label : '',
      term: node.isExtension ? {} : term,
      extension: node.isExtension ? term : {},
      aspect: node.aspect,
      evidence: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].evidence : {},
      reference: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].reference : {},
      with: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].with : {},
      assignedBy: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].assignedBy : {},
      node: node
    })

    for (let i = 1; i < node.predicate.evidence.length; i++) {
      self._grid.push({
        treeLevel: node.treeLevel,
        evidence: node.predicate.evidence[i].evidence,
        reference: node.predicate.evidence[i].reference,
        with: node.predicate.evidence[i].with,
        assignedBy: node.predicate.evidence[i].assignedBy,
        node: node,
      })
    }
  }

  tableDisplayGp(node: AnnotonNode) {
    const self = this;

    let display = false;

    switch (self.annotonModelType) {
      case noctuaFormConfig.annotonModelType.options.default.name:
      case noctuaFormConfig.annotonModelType.options.bpOnly.name:
        display = node.id === 'mf';
        break;
      case noctuaFormConfig.annotonModelType.options.ccOnly.name:
        display = node.id === 'cc';
        break;
    }
    return display ? self.gp : '';
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

  print() {
    const result = []
    this.nodes.forEach((node) => {
      const a = [];

      node.predicate.evidence.forEach((evidence: Evidence) => {
        a.push({
          evidence: evidence.evidence,
          reference: evidence.reference,
          with: evidence.with
        });
      });

      result.push({
        id: node.id,
        term: node.term,
        evidence: a
      })
    });

    console.log(result, JSON.stringify(result))
    return result;
  };
}