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

export enum ConnectorType {
  basic = 1,
  intermediate
}

export class ConnectorActivity extends SaeGraph<ActivityNode> {
  id: string;
  upstreamActivity: Activity;
  downstreamActivity: Activity;
  upstreamNode: ActivityNode;
  downstreamNode: ActivityNode;
  processNode: ActivityNode;
  hasInputNode: ActivityNode;
  predicate: Predicate;
  state: ConnectorState;
  type: ConnectorType = ConnectorType.basic;
  rule: ConnectorRule;

  graphPreview = {
    nodes: [],
    edges: []
  };

  constructor(upstreamNode?: ActivityNode, downstreamNode?: ActivityNode, state?: ConnectorState) {
    super();
    this.id = uuid();

    this.upstreamNode = upstreamNode;
    this.downstreamNode = downstreamNode;
    this.state = state ? state : ConnectorState.creation;
    this.rule = new ConnectorRule();

    if (upstreamNode) {
      this.rule.subjectMFCatalyticActivity.condition = upstreamNode.isCatalyticActivity;
      this.rule.objectMFCatalyticActivity.condition = downstreamNode.isCatalyticActivity;
    }
  }

  setRule() {
    const self = this;

    const question = self.getEffectDirectionByEdge(self.rule.r1Edge);

    self.rule.effectDirection.direction = question.effectDirection;
    self.rule.mechanism.mechanism = question.mechanism;

    if (self.type === ConnectorType.basic) {
      self.rule.displaySection.process = false;
    } else if (self.type === ConnectorType.intermediate) {
      self.rule.displaySection.process = true;
    }
  }

  checkConnection(value: any) {
    const self = this;

    self.rule.mechanism.mechanism = value.mechanism;
    self.rule.displaySection.causalEffect = true;

    if (value.mechanism === noctuaFormConfig.mechanism.options.known) {
      self.rule.displaySection.process = true;
      self.type = ConnectorType.intermediate;
    } else {
      self.rule.displaySection.process = false;
      self.type = ConnectorType.basic;
    }

    if (value.process) {
      self.processNode.term = new Entity(value.process.id, value.process.label);
      self.rule.r2Edge = value.process.edge;
    }

    self.rule.r1Edge = this.getCausalConnectorEdge(
      value.causalEffect,
      value.mechanism);

    self.setPreview();
  }

  getEffectDirectionByEdge(edge) {
    let effectDirection = null;
    let mechanism = null;

    const index = findIndex(noctuaFormConfig.causalEdges, { id: edge.id }) + 1;

    if (index < 10 && index > 0) {
      const x = (index % 3) - 3;
      const y = (index - x) / 3;
      effectDirection = find(noctuaFormConfig.causalEffect.options, { scalar: x });
      mechanism = find(noctuaFormConfig.mechanism.options, { scalar: y });
    }

    return { effectDirection, mechanism };
  }

  getCausalConnectorEdge(causalEffect, mechanism) {
    const self = this;
    let result;

    const index = causalEffect.scalar + (mechanism.scalar * 3) - 1;

    result = noctuaFormConfig.causalEdges[index];
    return result;
  }

  setPreview() {
    this.graphPreview.nodes = [...this._getPreviewNodes()];
    this.graphPreview.edges = [...this._getPreviewEdges()];
  }

  private _getPreviewNodes(): NgxNode[] {
    const self = this;
    let nodes: NgxNode[] = [];

    let activityNodes = [self.upstreamNode, self.downstreamNode];

    if (self.type === ConnectorType.intermediate) {
      activityNodes.push(self.processNode);

      if (self.hasInputNode.hasValue()) {
        activityNodes.push(self.hasInputNode)
      }
    }

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

    self.processNode.term = cloneDeep(currentConnectorActivity.processNode.term);
    self.hasInputNode.term = cloneDeep(currentConnectorActivity.hasInputNode.term);
    self.rule = cloneDeep(currentConnectorActivity.rule);
    self.type = currentConnectorActivity.type;
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

  createGraph(srcEvidence?: Evidence[]) {
    const self = this;
    const evidence = srcEvidence ? srcEvidence : self.predicate.evidence;

    if (this.type === ConnectorType.basic) {
      this.addNodes(self.upstreamNode, self.downstreamNode);
      self.addEdge(self.upstreamNode, self.downstreamNode, new Predicate(this.rule.r1Edge, evidence));
    } else if (this.type === ConnectorType.intermediate) {
      self.addNodes(self.upstreamNode, self.downstreamNode, self.processNode);
      self.addEdge(self.upstreamNode, self.processNode, new Predicate(this.rule.r1Edge, evidence));
      self.addEdge(self.processNode, self.downstreamNode, new Predicate(this.rule.r2Edge, evidence));
      if (this.hasInputNode.hasValue()) {
        self.addNodes(self.hasInputNode);
        self.addEdge(self.processNode, self.hasInputNode, new Predicate(new Entity(noctuaFormConfig.edge.hasInput.id, noctuaFormConfig.edge.hasInput.label), evidence));
      }
    }
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

    if (this.type === ConnectorType.intermediate) {
      self.processNode.term = new Entity(value.process.id, value.process.label);
      self.hasInputNode.term = new Entity(value.hasInput.id, value.hasInput.label);
    }

    this.createGraph(evidence);
  }

  private _getPreviewEdges(): NgxEdge[] {
    const self = this;

    let edges: NgxEdge[] = [];

    if (self.type === ConnectorType.basic) {
      edges = <NgxEdge[]>[
        {
          source: 'upstream',
          target: 'downstream',
          label: self.rule.r1Edge ? self.rule.r1Edge.label : ''
        }];
    } else if (self.type === ConnectorType.intermediate) {
      edges = <NgxEdge[]>[
        {
          source: 'upstream',
          target: 'process',
          label: self.rule.r1Edge ? self.rule.r1Edge.label : ''
        }, {
          source: 'process',
          target: 'downstream',
          label: self.rule.r2Edge ? self.rule.r2Edge.label : ''
        }];
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
