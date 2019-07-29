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
} from './noctua-form-graph';

export class SaeGraph<T extends AnnotonNode> {
  numberOfEdges: number;
  graph: Graph<T, Triple>;

  constructor() {
    this.graph = <Graph<T, Triple>>{ _nodes: {}, _edges: {} };
  }

  get nodes(): T[] {
    const keyNodes = getNodes(this.graph);

    return Object.values(keyNodes);
  }

  get edges(): Triple[] {
    return this.getEdges(null);
  }

  getNode(id: string): T {
    return findNode(this.graph, id)
  }

  addNode(node: T) {
    return addNode(this.graph, node, node.id);
  }

  addNodes(...nodes: T[]) {
    const self = this;

    nodes.forEach((node: T) => {
      self.addNode(node);
    });
  }

  removeNode(node: T) {
    removeNode(this.graph, node.id);
  }

  addEdge(subjectNode: T, objectNode: T, predicate: Predicate) {

    const triple = new Triple(subjectNode, predicate, objectNode)
    const edge: Edge<Triple> = { subjectId: subjectNode.id, objectId: objectNode.id, metadata: triple }

    addEdge(this.graph, edge);
  }

  addEdgeById(sourceId: string, objectId: string, predicate: Predicate) {
    const source = this.getNode(sourceId);
    const object = this.getNode(objectId);

    this.addEdge(source, object, predicate)
  }

  editEdge(subjectId, objectId, srcEdge) {
    const destEdge = this.getEdge(subjectId, objectId);

    // destEdge.edge = srcEdge;
  }

  getEdge(subjectId, objectId) {
    const edge: Edge<Triple> = { subjectId: subjectId, objectId: objectId, metadata: null }

    return findEdge(this.graph, edge);
  }

  getEdges(id: string): Triple[] {
    const edges: Edge<Triple>[] = getEdges(this.graph, id);

    return edges.map((edge: Edge<Triple>) => {
      return edge.metadata;
    });
  }

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
  }



  resetGraph() {
    //  this.edges = {}
    //    this.nodes = [];
  }
}
