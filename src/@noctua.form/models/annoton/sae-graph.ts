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
  addNode,
  removeNode,
  removeEdge,
  addEdge,
  findEdge,
  findNode,
  getNodes,
  getEdges,
} from './noctua-form-graph'

export class SaeGraph {
  numberOfEdges: number;
  graph: Graph<AnnotonNode, Triple>;

  constructor() {
    this.numberOfEdges = 0;

    this.graph = <Graph<AnnotonNode, Triple>>{ _nodes: {}, _edges: {} }
  }

  get nodes(): AnnotonNode[] {
    let keyNodes = getNodes(this.graph);

    return Object.values(keyNodes);
  }

  get edges(): Triple[] {
    return this.getEdges(null);
  }

  getNode(id: string): AnnotonNode {
    return findNode(this.graph, id)
  }

  addNode(node: AnnotonNode) {
    return addNode(this.graph, node, node.id);
  };

  addNodes(...nodes: AnnotonNode[]) {
    const self = this;

    nodes.forEach((node: AnnotonNode) => {
      self.addNode(node);
    });
  };

  removeNode(node: AnnotonNode) {
    removeNode(this.graph, node.id);
  };

  addEdge(subjectNode: AnnotonNode, objectNode: AnnotonNode, predicate: Predicate) {

    let triple = new Triple(subjectNode, predicate, objectNode)
    let edge: Edge<Triple> = { subjectId: subjectNode.id, objectId: objectNode.id, metadata: triple }

    addEdge(this.graph, edge);
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
    let edge: Edge<Triple> = { subjectId: subjectId, objectId: objectId, metadata: null }

    return findEdge(this.graph, edge);
  }

  getEdges(id: string): Triple[] {
    let edges: Edge<Triple>[] = getEdges(this.graph, id);

    return edges.map((edge: Edge<Triple>) => {
      return edge.metadata
    })
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