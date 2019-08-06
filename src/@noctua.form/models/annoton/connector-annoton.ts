import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { Edge as NgxEdge, Node, NodeDimension, ClusterNode, Layout } from '@swimlane/ngx-graph';
import { noctuaFormConfig } from './../../noctua-form-config';
import { SaeGraph } from './sae-graph';
import { getEdges, Edge } from './noctua-form-graph';

import { Annoton } from './annoton';
import { AnnotonNode } from './annoton-node';
import { ConnectorRule } from './rules';
import { Entity } from './entity';
import { Triple } from './triple';
import { Evidence } from './evidence';
import { Predicate } from './predicate';

export enum ConnectorState {
  creation = 1,
  editing
}

export enum ConnectorType {
  basic = 1,
  intermediate
}

export class ConnectorAnnoton extends SaeGraph<AnnotonNode> {
  id: string;
  upstreamAnnoton: Annoton;
  downstreamAnnoton: Annoton;
  upstreamNode: AnnotonNode;
  downstreamNode: AnnotonNode;
  processNode: AnnotonNode;
  hasInputNode: AnnotonNode;
  predicate: Predicate;
  state: ConnectorState;
  type: ConnectorType = ConnectorType.basic;
  rule: ConnectorRule;

  graphPreview = {
    nodes: [],
    edges: []
  }

  constructor(upstreamNode?: AnnotonNode, downstreamNode?: AnnotonNode, state?: ConnectorState) {
    super();
    this.id = uuid();

    this.upstreamNode = upstreamNode;
    this.downstreamNode = downstreamNode;
    this.state = state ? state : ConnectorState.creation;

    this.rule = new ConnectorRule();
  }

  setRule() {
    const self = this;

    self.rule.annotonsConsecutive.condition = self.getIsConsecutiveByEdge(self.rule.r1Edge);
    self.rule.effectDirection.direction = self.getEffectDirectionByEdge(self.rule.r1Edge);

    if (self.type === ConnectorType.basic) {
      self.rule.effectDependency.condition = false;
      self.rule.displaySection.causalReactionProduct = false;
      self.rule.displaySection.effectDependency = false;
      self.rule.displaySection.process = false;
    } else if (self.type === ConnectorType.intermediate) {
      self.rule.effectDependency.condition = true;
      self.rule.displaySection.effectDependency = true;
      self.rule.displaySection.process = true;
    }
  }

  checkConnection(value: any) {
    const self = this;

    self.rule.annotonsConsecutive.condition = value.annotonsConsecutive;
    self.rule.displaySection.causalEffect = true;
    self.rule.displaySection.causalReactionProduct = false;
    self.rule.displaySection.effectDependency = value.annotonsConsecutive;
    self.rule.displaySection.process = value.effectDependency;
    self.rule.effectDependency.condition = value.annotonsConsecutive && value.effectDependency;
    self.type = self.rule.effectDependency.condition ? ConnectorType.intermediate : ConnectorType.basic;

    if (!self.rule.effectDependency.condition) {
      if (self.rule.subjectMFCatalyticActivity.condition && self.rule.objectMFCatalyticActivity.condition) {
        self.rule.displaySection.causalReactionProduct = true;
      }
      self.rule.displaySection.causalReactionProduct = false;
    }

    if (value.process) {
      self.processNode.term = new Entity(value.process.id, value.process.label);
      self.rule.r2Edge = value.process.edge;
    }

    self.rule.r1Edge = this.getCausalConnectorEdge(
      value.causalEffect,
      value.annotonsConsecutive,
      value.causalReactionProduct);

    self.setPreview();
  }

  getIsConsecutiveByEdge(edge) {
    let result = edge.id === noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect.id ||
      edge.id === noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect.id ||
      edge.id === noctuaFormConfig.edge.causallyUpstreamOf.id;

    return !result;
  }

  getEffectDirectionByEdge(edge) {
    let effectDirection = noctuaFormConfig.causalEffect.options.positive;

    switch (edge.id) {
      case noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect.id:
      case noctuaFormConfig.edge.directlyNegativelyRegulates.id:
        effectDirection = noctuaFormConfig.causalEffect.options.negative;
        break;
      case noctuaFormConfig.edge.causallyUpstreamOf.id:
      case noctuaFormConfig.edge.directlyRegulates.id:
        effectDirection = noctuaFormConfig.causalEffect.options.neutral;
        break;
    }

    return effectDirection;
  }

  getCausalConnectorEdge(causalEffect, annotonsConsecutive, causalReactionProduct) {
    let result;

    if (!annotonsConsecutive) {
      switch (causalEffect.name) {
        case noctuaFormConfig.causalEffect.options.positive.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect;
          break;
        case noctuaFormConfig.causalEffect.options.negative.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect;
          break;
        case noctuaFormConfig.causalEffect.options.neutral.name:
          result = noctuaFormConfig.edge.causallyUpstreamOf;
          break;
      }
    } else if (annotonsConsecutive) {
      if (causalReactionProduct.name === noctuaFormConfig.causalReactionProduct.options.substrate.name) {
        result = noctuaFormConfig.edge.directlyProvidesInput;
      } else {
        switch (causalEffect.name) {
          case noctuaFormConfig.causalEffect.options.positive.name:
            result = noctuaFormConfig.edge.directlyPositivelyRegulates;
            break;
          case noctuaFormConfig.causalEffect.options.negative.name:
            result = noctuaFormConfig.edge.directlyNegativelyRegulates;
            break;
          case noctuaFormConfig.causalEffect.options.neutral.name:
            result = noctuaFormConfig.edge.directlyRegulates;
            break;
        }
      }
    }

    return result;
  }

  setPreview() {
    this.graphPreview.nodes = [...this._getPreviewNodes()]
    this.graphPreview.edges = [...this._getPreviewEdges()]
  }

  private _getPreviewNodes(): Node[] {
    const self = this;
    let nodes: Node[] = [];

    let annotonNodes = [self.upstreamNode, self.downstreamNode];

    if (self.type === ConnectorType.intermediate) {
      annotonNodes.push(self.processNode);

      if (self.hasInputNode.hasValue()) {
        annotonNodes.push(self.hasInputNode)
      }
    }

    nodes = <Node[]>annotonNodes.map((node: AnnotonNode) => {
      return {
        id: node.id,
        label: node.term.label ? node.term.label : '',
      }
    });

    return nodes;
  }

  copyValues(currentConnectorAnnoton: ConnectorAnnoton) {
    const self = this;

    self.processNode.term = _.cloneDeep(currentConnectorAnnoton.processNode.term);
    self.hasInputNode.term = _.cloneDeep(currentConnectorAnnoton.hasInputNode.term);
    self.rule = _.cloneDeep(currentConnectorAnnoton.rule);
    self.type = currentConnectorAnnoton.type;

  }

  createSave(value) {
    const self = this;
    const saveData = {
      title: '',
      triples: []
    };

    self._prepareSave(value);

    const graph = self.getTrimmedGraph('upstream');
    const edges: Edge<Triple<AnnotonNode>>[] = getEdges(graph);
    const triples: Triple<AnnotonNode>[] = edges.map((edge: Edge<Triple<AnnotonNode>>) => {
      return edge.metadata;
    });

    saveData.triples = triples;

    console.log(graph);
    console.log(saveData);

    return saveData;
  }

  createDelete() {
    const self = this;
    const uuids: string[] = [];

    const deleteData = {
      uuids: [],
      triples: []
    };

    if (this.type === ConnectorType.basic) {
      deleteData.triples.push(new Triple(self.upstreamNode, self.predicate, self.downstreamNode));
    } else if (this.type === ConnectorType.intermediate) {
      uuids.push(self.processNode.uuid);
      if (self.hasInputNode.hasValue()) {
        uuids.push(self.hasInputNode.uuid);
      }
    }

    deleteData.uuids = uuids;

    return deleteData;
  }

  private _prepareSave(value) {
    const self = this;

    const evidences: Evidence[] = value.evidenceFormArray.map((evidence: Evidence) => {
      const result = new Evidence();

      result.uuid = evidence.uuid;
      result.evidence = new Entity(evidence.evidence.id, evidence.evidence.label);
      result.reference = evidence.reference;
      result.with = evidence.with;

      return result;
    });

    // this.downstreamNode.evidence = evidences;

    if (this.type === ConnectorType.basic) {
      this.addNodes(self.upstreamNode, self.downstreamNode);
      self.addEdge(self.upstreamNode, self.downstreamNode, new Predicate(this.rule.r1Edge, evidences));
    }

    if (this.type === ConnectorType.intermediate) {
      self.processNode.term = new Entity(value.process.id, value.process.label);
      self.hasInputNode.term = new Entity(value.hasInput.id, value.hasInput.label);

      self.addNodes(self.upstreamNode, self.downstreamNode, self.processNode, self.hasInputNode);

      self.addEdge(self.upstreamNode, self.processNode, new Predicate(this.rule.r1Edge, evidences));
      self.addEdge(self.processNode, self.downstreamNode, new Predicate(this.rule.r2Edge, evidences));
      self.addEdge(self.processNode, self.hasInputNode, new Predicate(new Entity(noctuaFormConfig.edge.hasInput.id, noctuaFormConfig.edge.hasInput.label), evidences));

      // self.processNode.evidence = evidences;
      //  self.hasInputNode.evidence = evidences;
    }
  }

  private _getPreviewEdges(): NgxEdge[] {
    const self = this;

    let edges: NgxEdge[] = [];

    if (self.type === ConnectorType.basic) {
      edges = <NgxEdge[]>[
        {
          source: 'upstream',
          target: 'downstream',
          label: self.rule.r1Edge.label
        }
      ]
    } else if (self.type === ConnectorType.intermediate) {
      edges = <NgxEdge[]>[
        {
          source: 'upstream',
          target: 'process',
          label: self.rule.r1Edge.label
        }, {
          source: 'process',
          target: 'downstream',
          label: self.rule.r2Edge ? self.rule.r2Edge.label : ''
        },
      ]
      if (this.hasInputNode.hasValue()) {
        edges.push({
          source: 'process',
          target: 'has-input',
          label: noctuaFormConfig.edge.hasInput.label
        });
      }
    }

    return edges;
  }
}