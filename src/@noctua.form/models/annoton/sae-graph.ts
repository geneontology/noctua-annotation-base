import * as _ from 'lodash';

import { AnnotonNode } from './annoton-node';
import { Triple } from './triple';
import { Evidence } from './evidence';
import { Predicate } from './predicate';
declare const require: any;
const each = require('lodash/forEach');

import {
  Graph,
  Edge,
  insertNode,
  insertEdge,
  findEdge,
  nodeForKey,
  allNodes,
  allEdges,
} from './noctua-form-graph'

export class SaeGraph {
  numberOfEdges: number;
  graph: Graph<AnnotonNode, Triple>;

  constructor() {
    this.numberOfEdges = 0;

    //  this.graph = {nodes:{}, edge:{}}
  }

  get nodes(): AnnotonNode[] {
    let recordNodes = allNodes(this.graph)
    //recordNodes.mapValues(graph._nodes, (_, key) => transformKey(key)),
    return []
  }

  get edges() {
    return allEdges(this.graph);
  }

  getNode(id: string): AnnotonNode {
    return nodeForKey(this.graph, id)
  }

  addNode(node: AnnotonNode) {
    return insertNode(this.graph, node, node.id);
  };

  addNodes(...nodes: AnnotonNode[]) {
    const self = this;

    nodes.forEach((node: AnnotonNode) => {
      self.addNode(node);
    });
  };

  removeNode(node) {

  };

  addEdge(subjectNode: AnnotonNode, objectNode: AnnotonNode, predicate: Predicate) {

    let triple = new Triple(subjectNode, predicate, objectNode)
    let edge: Edge<Triple> = { src: subjectNode.id, dst: objectNode.id, metadata: triple }

    insertEdge(this.graph, edge, triple.id)
  };

  addEdgeById(sourceId: string, objectId: string, predicate: Predicate) {
    let source = this.getNode(sourceId);
    let object = this.getNode(objectId);

    this.addEdge(source, object, predicate)
  };

  editEdge(subjectId, objectId, srcEdge) {
    let destEdge = this.getEdge(subjectId, objectId);

    // destEdge.edge = srcEdge;
  }

  getEdge(subjectId, objectId) {
    //let edge = this.edges[subjectId];
    //  findEdge(this.graph)
  }

  getEdges(id) {
    const self = this;
    //let result = this.edges[id];

    //  return result;
  };

  removeEdge(source, object) {
    // var objectNodes = this.edges[source.id]['nodes']
    /*
    if (objectNodes) {
      _.remove(objectNodes, function (objectNode) {
        return objectNode.id === object.id
      });
      this.numberOfEdges--;
    }
    */
  };



  resetGraph() {
    //  this.edges = {}
    //    this.nodes = [];
  }
}