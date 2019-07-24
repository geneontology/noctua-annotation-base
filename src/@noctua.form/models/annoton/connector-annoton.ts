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

  actualGraphPreview = {
    nodes: [],
    edges: []
  }

  expectedGraphPreview = {
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

  setType() {
    const self = this;
    let effectDependency = this.rule.effectDependency;

    if (self.type === ConnectorType.intermediate) {
      self.rule.annotonsConsecutive.condition = true;
      self.rule.effectDependency.condition = true;
    }

    this.type = effectDependency.condition ? ConnectorType.intermediate : ConnectorType.basic;
  }

  checkConnection(value: any) {
    const self = this;

    self.rule.annotonsConsecutive.condition = value.annotonsConsecutive;
    self.rule.displaySection.causalEffect = true;
    self.rule.displaySection.causalReactionProduct = false;
    self.rule.displaySection.effectDependency = value.annotonsConsecutive;
    self.rule.displaySection.process = value.effectDependency;
    self.rule.effectDependency.condition = value.annotonsConsecutive && value.effectDependency;

    self.setType();

    if (!self.rule.effectDependency.condition) {
      if (self.rule.subjectMFCatalyticActivity.condition && self.rule.objectMFCatalyticActivity.condition) {
        self.rule.displaySection.causalReactionProduct = true;
      }
      self.rule.displaySection.causalReactionProduct = false;
    }

    if (value.process) {
      self.processNode.setTerm(new Entity(value.process.id, value.process.label))
      self.rule.suggestedEdge.r2 = value.process.edge;
    }

    self.rule.suggestedEdge.r1 = this.getCausalConnectorEdge(
      value.causalEffect,
      value.annotonsConsecutive,
      value.causalReactionProduct);

    self.setPreview();
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
    const self = this;


    if (self.type === ConnectorType.basic) {
      self.expectedGraphPreview.nodes = <Node[]>[self.upstreamNode, self.downstreamNode].map((node: AnnotonNode) => {
        return {
          id: node.id,
          label: node.term.label
        }
      })

      self.expectedGraphPreview.edges = <Edge[]>[
        {
          source: 'upstream',
          target: 'downstream',
          label: self.rule.suggestedEdge.r1.label
        }
      ]

    } else if (self.type === ConnectorType.intermediate) {
      let nodes = [self.upstreamNode, self.processNode, self.downstreamNode];
      if (this.hasInputNode.hasValue()) {
        nodes.push(this.hasInputNode)
      }
      let dim: NodeDimension = {
        height: 60,
        width: 120
      }
      self.expectedGraphPreview.nodes = <Node[]>nodes.map((node: AnnotonNode) => {
        return {
          id: node.id,
          label: node.term.label ? node.term.label : '',
          dimension: dim
        }
      });

      self.expectedGraphPreview.edges = <Edge[]>[
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
        self.expectedGraphPreview.edges.push({
          source: 'process',
          target: 'has-input',
          label: noctuaFormConfig.edge.hasInput.label
        });
      }
    }
  }

  prepareSave(value) {
    const self = this;
    this.resetGraph();

    let evidences: Evidence[] = value.evidenceFormArray.map((evidence) => {
      let result = new Evidence()

      result.individualId = evidence.individualId;
      result.setEvidence(evidence.evidence);
      result.setReference(evidence.reference);
      result.setWith(evidence.with);

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
}