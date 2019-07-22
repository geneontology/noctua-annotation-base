import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
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

  constructor(upstreamNode: AnnotonNode, downstreamNode: AnnotonNode, state?: ConnectorState) {
    super();
    this.id = uuid();

    this.upstreamNode = upstreamNode;
    this.downstreamNode = downstreamNode;
    this.state = state ? state : ConnectorState.creation

    this.rule = new ConnectorRule();
  }

  setType() {
    let effectDependency: Rule = this.rule.rules.effectDependency;
    this.type = effectDependency.condition ? ConnectorType.intermediate : ConnectorType.basic;
  }

  setIntermediateProcess() {
    this.type = ConnectorType.intermediate;
  }

  checkConnection(value: any) {
    const self = this;

    self.rule.rules.annotonsConsecutive.condition = value.annotonsConsecutive;
    self.rule.displaySection.causalEffect = true;
    self.rule.displaySection.causalReactionProduct = false;
    self.rule.displaySection.effectDependency = value.annotonsConsecutive;
    self.rule.displaySection.process = value.effectDependency;
    self.rule.rules.effectDependency.condition = value.annotonsConsecutive && value.effectDependency;

    self.setType();

    if (!self.rule.rules.effectDependency.condition) {
      if (self.rule.rules.subjectMFCatalyticActivity.condition && self.rule.rules.objectMFCatalyticActivity.condition) {
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