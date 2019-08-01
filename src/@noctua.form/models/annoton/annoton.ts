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

export class Annoton extends SaeGraph<AnnotonNode> {
  gp;
  uuid: string;
  id: string;
  label: string;
  parser;
  annotonRows;
  annotonType;
  annotonModelType;
  complexAnnotonData;

  constructor() {
    super();
    this.annotonType = "simple";
    this.annotonModelType = 'default';
    this.complexAnnotonData = {
      mcNode: {},
      gpTemplateNode: {},
      geneProducts: []
    };
    this.id = uuid();
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

    if (self.annotonType === 'simple') {
      return self.getNode('gp');
    } else {
      return self.getNode('mc');
    }
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

  setAnnotonType(type) {
    this.annotonType = type;
  }

  setAnnotonModelType(type) {
    this.annotonModelType = type;
  }

  createSave() {
    const self = this;
    const saveData = {
      triples: []
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

  print() {
    const result = []
    this.nodes.forEach((node) => {
      const a = [];

      /*  node.evidence.forEach((evidence: Evidence) => {
         a.push({
           evidence: evidence.evidence,
           reference: evidence.reference,
           with: evidence.with
         });
       }); */

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