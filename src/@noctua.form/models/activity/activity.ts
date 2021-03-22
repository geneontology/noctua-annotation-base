import { v4 as uuid } from 'uuid';
import { Edge as NgxEdge, Node as NgxNode } from '@swimlane/ngx-graph';
import { noctuaFormConfig } from './../../noctua-form-config';
import { SaeGraph } from './sae-graph';
import { ActivityError, ErrorLevel, ErrorType } from './parser/activity-error';
import { ActivityNode, ActivityNodeType } from './activity-node';
import { Evidence } from './evidence';
import { Triple } from './triple';
import { Entity } from './entity';
import { Predicate } from './predicate';
import { getEdges, Edge, getNodes, subtractNodes } from './noctua-form-graph';
import * as ShapeDescription from './../../data/config/shape-definition';

import { each, filter } from 'lodash';
import { NoctuaFormUtils } from './../../utils/noctua-form-utils';
import { Violation } from './error/violation-error';

export enum ActivityState {
  creation = 1,
  editing
}

export enum ActivityType {
  default = 'default',
  bpOnly = 'bpOnly',
  ccOnly = 'ccOnly'
}

export class ActivitySize {
  width: number = 150;
  height: number = 100;

  constructor() {

  }
}

export class ActivityPosition {
  width: number = 0;
  height: number = 0;

  constructor() {

  }
}

export class Activity extends SaeGraph<ActivityNode> {
  gp;
  label: string;
  activityRows;
  activityType;
  errors;
  submitErrors;
  modified = false;
  expanded = false;
  visible = true;
  graphPreview = {
    nodes: [],
    edges: []
  };

  molecularEntityNode: ActivityNode;
  molecularFunctionNode: ActivityNode;

  /**
   * Used for HTML id attribute
   */
  displayId: string;
  displayNumber = '0';

  hasViolations = false;
  violations: Violation[] = [];


  bpOnlyEdge: Entity;

  //Graph
  position: ActivityPosition = new ActivityPosition();
  size: ActivitySize = new ActivitySize();

  private _presentation: any;
  private _grid: any[] = [];
  private _id: string;

  constructor() {
    super();
    this.activityType = 'default';
    this.id = uuid();
    this.errors = [];
    this.submitErrors = [];
  }

  get id() {
    return this._id;
  }

  set id(id: string) {
    this._id = id;
    this.displayId = NoctuaFormUtils.cleanID(id) + 'activity';
  }

  get activityConnections() {
    throw new Error('Method not implemented');
  }

  get rootNodeType(): ActivityNodeType {
    return this.activityType === ActivityType.ccOnly ?
      ActivityNodeType.GoMolecularEntity :
      ActivityNodeType.GoMolecularFunction;
  }

  postRunUpdate() {
    const self = this;

    if (this.activityType !== ActivityType.ccOnly) {
      const mfNode = self.getMFNode();
      const edge = self.getEdge(ActivityNodeType.GoMolecularFunction, ActivityNodeType.GoMolecularEntity);

      if (mfNode && edge) {
        mfNode.predicate = edge.predicate;
        if (edge.predicate.edge) {
          edge.predicate.edge.label = ''
        }
      }
    }
  }

  get rootNode(): ActivityNode {
    return this.getNode(this.rootNodeType);
  }

  updateEntityInsertMenu() {
    const self = this;

    each(self.nodes, (node: ActivityNode) => {
      const canInsertNodes = ShapeDescription.canInsertEntity[node.type] || [];
      const insertNodes: ShapeDescription.ShapeDescription[] = [];

      each(canInsertNodes, (nodeDescription: ShapeDescription.ShapeDescription) => {
        if (nodeDescription.cardinality === ShapeDescription.CardinalityType.oneToOne) {
          const edgeTypeExist = self.edgeTypeExist(node.id, nodeDescription.predicate.id, node.type, nodeDescription.node.type);

          if (!edgeTypeExist) {
            insertNodes.push(nodeDescription);
          }
        } else {
          insertNodes.push(nodeDescription);
        }
      });

      node.canInsertNodes = insertNodes;
      node.insertMenuNodes = filter(insertNodes, (insertNode: ShapeDescription.ShapeDescription) => {
        return insertNode.node.showInMenu;
      });
    });

    // remove the subject menu
    each(self.edges, function (triple: Triple<ActivityNode>) {
      if (triple.subject.type === triple.object.type) {
        triple.subject.canInsertNodes = [];
        triple.subject.insertMenuNodes = [];
      }
    });
  }

  updateEdges(subjectNode: ActivityNode, insertNode: ActivityNode, predicate: Predicate) {
    const self = this;
    const canInsertSubjectNodes = ShapeDescription.canInsertEntity[subjectNode.type] || [];
    let updated = false;

    each(canInsertSubjectNodes, (nodeDescription: ShapeDescription.ShapeDescription) => {

      if (predicate.edge.id === nodeDescription.predicate.id) {
        if (nodeDescription.cardinality === ShapeDescription.CardinalityType.oneToOne) {
          const edgeTypeExist = self.edgeTypeExist(subjectNode.id, nodeDescription.predicate.id, subjectNode.type, nodeDescription.node.type);

          if (edgeTypeExist) {
            edgeTypeExist.object.treeLevel++;
            self.removeEdge(edgeTypeExist.subject, edgeTypeExist.object, edgeTypeExist.predicate);
            self.addEdge(edgeTypeExist.subject, insertNode, edgeTypeExist.predicate);
            self.addEdge(insertNode, edgeTypeExist.object, predicate);
            updated = true;

            return false;
          }
        }
      }
    });

    if (!updated) {
      self.addEdgeById(subjectNode.id, insertNode.id, predicate);
    }

  }

  getNodesByType(type: ActivityNodeType): ActivityNode[] {
    const self = this;
    const result = filter(self.nodes, (activityNode: ActivityNode) => {
      return activityNode.type === type;
    });

    return result;
  }

  getGPNode() {
    const self = this;

    return self.getNode(ActivityNodeType.GoMolecularEntity);
  }

  getMFNode() {
    const self = this;

    return self.getNode(ActivityNodeType.GoMolecularFunction);
  }

  adjustCC() {
    const self = this;
    const ccNode = self.getNode(ActivityNodeType.GoCellularComponent);

    if (ccNode && !ccNode.hasValue()) {
      const ccEdges: Triple<ActivityNode>[] = this.getEdges(ccNode.id);

      if (ccEdges.length > 0) {
        const firstEdge = ccEdges[0];
        const rootCC = noctuaFormConfig.rootNode.cc;
        ccNode.term = new Entity(rootCC.id, rootCC.label);
        ccNode.predicate.evidence = firstEdge.predicate.evidence;

      }
    }
  }

  getViolationDisplayErrors() {
    const self = this;
    const result = [];

    result.push(...self.violations.map((violation: Violation) => {
      return violation.getDisplayError();
    }));

    return result;
  }

  adjustActivity() {
    const self = this;

    switch (self.activityType) {
      case noctuaFormConfig.activityType.options.bpOnly.name:
        const rootMF = noctuaFormConfig.rootNode.mf;
        const mfNode = self.getMFNode();
        const bpNode = self.getNode(ActivityNodeType.GoBiologicalProcess);
        const bpEdge = this.getEdge(mfNode.id, bpNode.id);

        mfNode.term = new Entity(rootMF.id, rootMF.label);
        mfNode.predicate.evidence = bpNode.predicate.evidence;

        if (this.bpOnlyEdge) {
          bpEdge.predicate.edge.id = bpNode.predicate.edge.id = this.bpOnlyEdge.id;
          bpEdge.predicate.edge.label = bpNode.predicate.edge.label = this.bpOnlyEdge.label;
        }

        break;
    }
  }


  copyValues(srcActivity) {
    const self = this;

    each(self.nodes, function (destNode: ActivityNode) {
      const srcNode = srcActivity.getNode(destNode.id);
      if (srcNode) {
        destNode.copyValues(srcNode);
      }
    });
  }

  setActivityType(type) {
    this.activityType = type;
  }

  get grid() {
    const self = this;

    if (self._grid.length === 0) {
      this.generateGrid();
    }
    return this._grid;
  }

  enableSubmit() {
    const self = this;
    let result = true;

    self.submitErrors = [];

    each(self.nodes, (node: ActivityNode) => {
      result = node.enableSubmit(self.submitErrors) && result;
    });

    if (self.activityType === ActivityType.bpOnly) {
      if (!self.bpOnlyEdge) {
        const meta = {
          aspect: 'Molecular Function'
        };
        const error = new ActivityError(ErrorLevel.error, ErrorType.general, `Causal relation is required`, meta);
        self.submitErrors.push(error);
        result = false;
      }
    }

    return result;
  }

  createSave() {
    const self = this;
    const saveData = {
      title: 'enabled by ' + self.getNode(ActivityNodeType.GoMolecularEntity).term.label,
      triples: [],
      nodes: [],
      graph: null
    };

    self.adjustCC();
    self.adjustActivity();

    const graph = self.getTrimmedGraph(this.rootNodeType);
    const keyNodes = getNodes(graph);
    const edges: Edge<Triple<ActivityNode>>[] = getEdges(graph);

    saveData.nodes = Object.values(keyNodes);

    saveData.triples = edges.map((edge: Edge<Triple<ActivityNode>>) => {
      return edge.metadata;
    });

    saveData.graph = graph;

    return saveData;
  }

  createEdit(srcActivity: Activity) {
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
      removeTriples: []
    };

    return saveData;
  }

  createDelete() {
    const self = this;
    const deleteData = {
      uuids: [],
      triples: []
    };
    const uuids: string[] = [];

    each(self.nodes, (node: ActivityNode) => {
      if (node.hasValue()) {
        uuids.push(node.uuid);
      }
    });

    deleteData.uuids = uuids;

    return deleteData;
  }

  setPreview() {
    const self = this;
    const saveData = self.createSave();

    self.graphPreview.nodes = <NgxNode[]>saveData.nodes.map((node: ActivityNode) => {
      return {
        id: node.id,
        label: node.term.label ? node.term.label : '',
      };
    });

    self.graphPreview.edges = <NgxEdge[]>saveData.triples.map((triple: Triple<ActivityNode>) => {
      return {
        source: triple.subject.id,
        target: triple.object.id,
        label: triple.predicate.edge.label
      };
    });
  }

  insertSubgraph(activity: Activity, toNode: ActivityNode, fromNode: ActivityNode) {
    const self = this;

    const graph = activity.getTrimmedGraph(fromNode.id);

    // self.addSubGraph(graph, toNode.id, fromNode.id);
  }

  insertSubgraph2(activity: Activity, startNodeId: string) {
    const self = this;

    const graph = activity.getTrimmedGraph(startNodeId);

    // self.addSubGraph(graph);
  }


  get title() {
    const self = this;
    const gp = self.getNode(ActivityNodeType.GoMolecularEntity);
    const gpText = gp ? gp.getTerm().label : '';
    let title = '';

    if (self.activityType === ActivityType.ccOnly) {
      title = gpText;
    } else {
      title = `enabled by ${gpText}`;
    }

    return title;
  }

  get presentation() {
    const self = this;

    if (this._presentation) {
      return this._presentation;
    }

    const gp = self.getNode(ActivityNodeType.GoMolecularEntity);
    const mf = self.getNode(ActivityNodeType.GoMolecularFunction);
    const gpText = gp ? gp.getTerm().label : '';
    const mfText = mf ? mf.getTerm().label : '';
    let qualifier = '';
    let title = '';

    if (self.activityType === ActivityType.ccOnly) {
      title = gpText;
    } else {
      qualifier = mf.isComplement ? 'NOT' : '';
      title = `enabled by ${gpText}`;
    }

    const result = {
      qualifier: qualifier,
      title: title,
      gpText: gpText,
      mfText: mfText,
      gp: {},
      fd: {},
      extra: []
    };

    const sortedNodes = self.nodes.sort(self._compareNodeWeight);

    each(sortedNodes, function (node: ActivityNode) {
      if (node.displaySection && node.displayGroup) {
        if (!result[node.displaySection.id][node.displayGroup.id]) {
          result[node.displaySection.id][node.displayGroup.id] = {
            shorthand: node.displayGroup.shorthand,
            label: node.displayGroup.label,
            nodes: []
          };
        }

        result[node.displaySection.id][node.displayGroup.id].nodes.push(node);
        node.nodeGroup = result[node.displaySection.id][node.displayGroup.id];

        if (node.isComplement) {
          node.nodeGroup.isComplement = true;
        }
      }
    });


    this._presentation = result;

    return this._presentation;
  }

  resetPresentation() {
    this._presentation = null;
  }

  resetGrid() {
    this._grid = [];
  }

  generateGrid() {
    const self = this;
    self._grid = [];

    each(self.presentation.fd, function (nodeGroup) {
      each(nodeGroup.nodes, function (node: ActivityNode) {
        const term = node.getTerm();

        if (node.id !== ActivityNodeType.GoMolecularEntity && term.id) {
          self.generateGridRow(node);
        }
      });
    });
  }

  generateGridRow(node: ActivityNode) {
    const self = this;
    const term = node.getTerm();

    self._grid.push({
      treeLevel: node.treeLevel,
      gp: self.tableDisplayGp(node),
      qualifier: node.isExtension ? '' : self.tableDisplayQualifier(node),
      relationship: node.isExtension ? '' : self.tableDisplayRelationship(node),
      relationshipExt: node.isExtension ? node.predicate.edge.label : '',
      term: node.isExtension ? null : term,
      extension: node.isExtension ? term : null,
      aspect: node.aspect,
      evidence: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].evidence : {},
      reference: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].reference : '',
      referenceEntity: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].referenceEntity : {},
      with: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].with : '',
      withEntity: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].withEntity : {},
      groups: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].groups : [],
      contributors: node.predicate.evidence.length > 0 ? node.predicate.evidence[0].contributors : [],
      evidenceIndex: 0,
      relationEditable: node.relationEditable,
      node: node
    });

    for (let i = 1; i < node.predicate.evidence.length; i++) {
      self._grid.push({
        treeLevel: node.treeLevel,
        evidence: node.predicate.evidence[i].evidence,
        reference: node.predicate.evidence[i].reference,
        referenceEntity: node.predicate.evidence[i].referenceEntity,
        referenceUrl: node.predicate.evidence[i].referenceUrl,
        with: node.predicate.evidence[i].with,
        withEntity: node.predicate.evidence[i].withEntity,
        groups: node.predicate.evidence[i].groups,
        contributors: node.predicate.evidence[i].contributors,
        evidenceIndex: i,
        node: node,
      });
    }
  }

  tableDisplayGp(node: ActivityNode) {
    const self = this;

    let display = false;

    switch (self.activityType) {
      case noctuaFormConfig.activityType.options.default.name:
      case noctuaFormConfig.activityType.options.bpOnly.name:
        display = node.id === ActivityNodeType.GoMolecularFunction;
        break;
      case noctuaFormConfig.activityType.options.ccOnly.name:
        display = node.id === 'cc';
        break;
    }
    return display ? self.gp : '';
  }

  tableCanDisplayEnabledBy(node: ActivityNode) {

    return node.predicate.edge && node.predicate.edge.id === noctuaFormConfig.edge.enabledBy.id;
  }

  tableDisplayQualifier(node: ActivityNode) {

    if (node.id === ActivityNodeType.GoMolecularFunction) {
      return '';
    } else if (node.isComplement) {
      return 'NOT';
    } else {
      return '';
    }
  }

  tableDisplayRelationship(node: ActivityNode) {
    if (node.id === ActivityNodeType.GoMolecularFunction) {
      return '';
    } else {
      return node.predicate.edge.label;
    }
  }

  private _compareNodeWeight(a: ActivityNode, b: ActivityNode): number {
    if (a.weight < b.weight) {
      return -1;
    } else {
      return 1;
    }
  }

  print() {
    const result = []
    this.nodes.forEach((node) => {
      const a = [];

      node.predicate.evidence.forEach((evidence: Evidence) => {
        a.push({
          evidence: evidence.evidence,
          reference: evidence.reference,
          with: evidence.with
        });
      });

      result.push({
        id: node.id,
        term: node.term,
        evidence: a
      });
    });

    return result;
  }
}
