import { v4 as uuid } from 'uuid';
import { Edge as NgxEdge, Node as NgxNode } from '@swimlane/ngx-graph';
import { noctuaFormConfig } from './../../noctua-form-config';
import { SaeGraph } from './sae-graph';
import { getEdges, Edge, getNodes, subtractNodes, subtractEdges } from './noctua-form-graph';

import { Activity } from './activity';
import { ActivityNode } from './activity-node';
import { ConnectorRule } from './rules';
import { Entity } from './entity';
import { Triple } from './triple';
import { Evidence } from './evidence';
import { Predicate } from './predicate';
import { cloneDeep, findIndex, find } from 'lodash';

export enum ConnectorState {
  creation = 1,
  editing
}

export enum ConnectorPanel {
  SELECT = 'select',
  FORM = 'form',
};

export class ConnectorActivity extends SaeGraph<ActivityNode> {
  id: string;
  subjectActivity: Activity;
  objectActivity: Activity;
  subjectNode: ActivityNode;
  objectNode: ActivityNode;
  predicate: Predicate;
  state: ConnectorState;
  rule: ConnectorRule;

  graphPreview = {
    nodes: [],
    edges: []
  };

  constructor(subjectNode?: ActivityNode, objectNode?: ActivityNode, state?: ConnectorState) {
    super();
    this.id = uuid();

    this.subjectNode = subjectNode;
    this.objectNode = objectNode;
    this.state = state ? state : ConnectorState.creation;
    this.rule = new ConnectorRule();
  }

  setRule() {
    const self = this;

    const question = self.edgeToConnectorQuestion(self.rule.rEdge);

    self.rule.effectDirection.direction = question.causalEffect;
    self.rule.mechanism.mechanism = question.mechanism;
  }

  checkConnection(value: any) {
    const self = this;

    self.rule.mechanism.mechanism = value.mechanism;
    self.rule.displaySection.causalEffect = true;

    self.rule.rEdge = this.getCausalConnectorEdge(
      value.causalEffect,
      value.mechanism);

    self.setPreview();
  }


  getCausalConnectorEdge(causalEffect, mechanism): Entity {

    let edge = noctuaFormConfig.edge.directlyProvidesInput
    if (causalEffect.name === noctuaFormConfig.causalEffect.options.positive.name) {
      if (mechanism.name === noctuaFormConfig.mechanism.options.known.name) {
        edge = noctuaFormConfig.edge.positivelyRegulates;
      } else {
        edge = noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect;
      }

    } else if (causalEffect.name === noctuaFormConfig.causalEffect.options.negative.name) {
      if (mechanism.name === noctuaFormConfig.mechanism.options.known.name) {
        edge = noctuaFormConfig.edge.negativelyRegulates;
      } else {
        edge = noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect;
      }

    } else if (causalEffect.name === noctuaFormConfig.causalEffect.options.neutral.name) {
      if (mechanism.name === noctuaFormConfig.mechanism.options.known.name) {
        edge = noctuaFormConfig.edge.regulates;
      } else {
        edge = noctuaFormConfig.edge.causallyUpstreamOf;
      }
    }

    if (mechanism.name === noctuaFormConfig.mechanism.options.inputFor.name) {
      edge = noctuaFormConfig.edge.directlyProvidesInput;
    }

    return Entity.createEntity(edge);
  }

  edgeToConnectorQuestion(edge: Entity) {
    let mechanism = noctuaFormConfig.mechanism.options.known;
    let causalEffect = noctuaFormConfig.causalEffect.options.positive;

    switch (edge.id) {
      case noctuaFormConfig.edge.causallyUpstreamOf.id:
      case noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect.id:
      case noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect.id:
        mechanism = noctuaFormConfig.mechanism.options.unknown
      case noctuaFormConfig.edge.regulates.id:
      case noctuaFormConfig.edge.causallyUpstreamOf.id:
        causalEffect = noctuaFormConfig.causalEffect.options.neutral;
      case noctuaFormConfig.edge.negativelyRegulates.id:
      case noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect.id:
        causalEffect = noctuaFormConfig.causalEffect.options.negative;
      case noctuaFormConfig.edge.directlyProvidesInput.id:
        mechanism = noctuaFormConfig.mechanism.options.inputFor;
    }

    return {
      mechanism,
      causalEffect
    }
  }

  setPreview() {
    this.graphPreview.nodes = [...this._getPreviewNodes()];
    this.graphPreview.edges = [...this._getPreviewEdges()];
  }

  private _getPreviewNodes(): NgxNode[] {
    const self = this;
    let nodes: NgxNode[] = [];

    let activityNodes = [self.subjectNode, self.objectNode];


    nodes = <NgxNode[]>activityNodes.map((node: ActivityNode) => {
      return {
        id: node.id,
        label: node.term.label ? node.term.label : '',
      };
    });

    return nodes;
  }

  copyValues(currentConnectorActivity: ConnectorActivity) {
    const self = this;

    self.rule = cloneDeep(currentConnectorActivity.rule);
    self.state = currentConnectorActivity.state;
  }

  createSave() {
    const self = this;
    const saveData = {
      title: '',
      nodes: [],
      triples: [],
      graph: null
    };

    const graph = self.getTrimmedGraph('upstream');
    const keyNodes = getNodes(graph);
    const edges: Edge<Triple<ActivityNode>>[] = getEdges(graph);
    const triples: Triple<ActivityNode>[] = edges.map((edge: Edge<Triple<ActivityNode>>) => {
      return edge.metadata;
    });

    saveData.nodes = Object.values(keyNodes);
    saveData.triples = triples;
    saveData.graph = graph;

    return saveData;
  }

  createEdit(srcActivity: ConnectorActivity) {
    const self = this;
    const srcSaveData = srcActivity.createSave();
    const destSaveData = self.createSave();
    const saveData = {
      srcNodes: srcSaveData.nodes,
      destNodes: destSaveData.nodes,
      srcTriples: srcSaveData.triples,
      destTriples: destSaveData.triples,
      removeIds: subtractNodes(srcSaveData.graph, destSaveData.graph).map((node: ActivityNode) => {
        return node.uuid;
      }),
      removeTriples: <Triple<ActivityNode>[]>subtractEdges(srcSaveData.graph, destSaveData.graph)
    };

    return saveData;
  }

  createDelete() {
    const self = this;
    const uuids: string[] = [];

    const deleteData = {
      uuids: [],
      triples: [],
      nodes: []
    };

    deleteData.triples.push(new Triple(self.subjectNode, self.objectNode, self.predicate));

    deleteData.uuids = uuids;

    return deleteData;
  }

  createGraph(srcEvidence?: Evidence[]) {
    const self = this;
    const evidence = srcEvidence ? srcEvidence : self.predicate.evidence;

    this.addNodes(self.subjectNode, self.objectNode);
    self.addEdge(self.subjectNode, self.objectNode, new Predicate(this.rule.rEdge, evidence));
  }

  prepareSave(value) {
    const self = this;

    const evidence: Evidence[] = value.evidenceFormArray.map((evidence: Evidence) => {
      const result = new Evidence();

      result.uuid = evidence.uuid;
      result.evidence = new Entity(evidence.evidence.id, evidence.evidence.label);
      result.reference = evidence.reference;
      result.with = evidence.with;

      return result;
    });

    this.createGraph(evidence);
  }




  private _getPreviewEdges(): NgxEdge[] {
    const self = this;

    let edges: NgxEdge[] = [];

    edges = <NgxEdge[]>[
      {
        source: 'upstream',
        target: 'downstream',
        label: self.rule.rEdge ? self.rule.rEdge.label : ''
      }];

    return edges;
  }
}
