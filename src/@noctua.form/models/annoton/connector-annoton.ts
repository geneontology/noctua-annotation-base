import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { Edge, Node, NodeDimension, ClusterNode, Layout } from '@swimlane/ngx-graph';
import { noctuaFormConfig } from './../../noctua-form-config';

import { SaeGraph } from './sae-graph';
import {
  AnnotonError,
  AnnotonNode,
  Evidence,
  ConnectorRule,
  Rule,
  Entity
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
  hasInputNode: AnnotonNode;
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
    this.state = state ? state : ConnectorState.creation

    this.rule = new ConnectorRule();
  }

  setRule() {
    const self = this;

    self.rule.annotonsConsecutive.condition = self.getIsConsecutiveByEdge(self.rule.suggestedEdge.r1);
    self.rule.effectDirection.direction = self.getEffectDirectionByEdge(self.rule.suggestedEdge.r1);

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
      self.processNode.term.setValues(value.process);
      self.rule.suggestedEdge.r2 = value.process.edge;
    }

    self.rule.suggestedEdge.r1 = this.getCausalConnectorEdge(
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
    self.type = currentConnectorAnnoton.type;;

  }

  prepareSave(value) {
    const self = this;
    this.resetGraph();

    let evidences: Evidence[] = value.evidenceFormArray.map((evidence) => {
      let result = new Evidence()

      result.individualId = evidence.individualId;
      result.setEvidence(evidence.evidence);
      result.reference = evidence.reference;
      result.with = evidence.with;

      return result;
    });

    this.downstreamNode.evidence = evidences;

    if (this.type === ConnectorType.basic) {
      this.addNodes(self.upstreamNode, self.downstreamNode);
      self.addEdge(self.upstreamNode, self.downstreamNode, this.rule.suggestedEdge.r1);
    }

    if (this.type === ConnectorType.intermediate) {
      self.processNode.term = new Entity(value.process.id, value.process.label);
      self.hasInputNode.term = new Entity(value.hasInput.id, value.hasInput.label);

      self.addNodes(self.upstreamNode, self.downstreamNode, self.processNode, self.hasInputNode);

      self.addEdge(self.upstreamNode, self.processNode, this.rule.suggestedEdge.r1);
      self.addEdge(self.processNode, self.downstreamNode, this.rule.suggestedEdge.r2);
      self.addEdge(self.processNode, self.hasInputNode, noctuaFormConfig.edge.hasInput);

      self.processNode.evidence = evidences;
      self.hasInputNode.evidence = evidences;
    }

    console.log(self)
  }

  private _getPreviewEdges(): Edge[] {
    const self = this;

    let edges: Edge[] = [];

    if (self.type === ConnectorType.basic) {
      edges = <Edge[]>[
        {
          source: 'upstream',
          target: 'downstream',
          label: self.rule.suggestedEdge.r1.label
        }
      ]
    } else if (self.type === ConnectorType.intermediate) {
      edges = <Edge[]>[
        {
          source: 'upstream',
          target: 'process',
          label: self.rule.suggestedEdge.r1.label
        }, {
          source: 'process',
          target: 'downstream',
          label: self.rule.suggestedEdge.r2 ? self.rule.suggestedEdge.r2.label : ''
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