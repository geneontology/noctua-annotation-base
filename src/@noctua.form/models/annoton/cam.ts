
declare const require: any;
const uuid = require('uuid/v1');
import { Edge as NgxEdge, Node as NgxNode, NodeDimension, ClusterNode, Layout } from '@swimlane/ngx-graph';

import { noctuaFormConfig } from './../../noctua-form-config';
import { Annoton } from './annoton'
import { AnnotonNode, AnnotonNodeType } from './annoton-node';
import { Group } from '../group';
import { Contributor } from '../contributor';
import { Evidence } from './evidence';
import { Triple } from './triple';
import { Entity } from './entity';
import { ConnectorAnnoton, ConnectorType } from './connector-annoton';
import { each, find, filter } from 'lodash';
import { NoctuaFormUtils } from './../../utils/noctua-form-utils';
import { Violation } from './error/violation-error';

export class CamQueryMatch {
  modelId?: string;
  terms?: Entity[] = [];
  reference?: Entity[] = [];
}

export class CamStats {
  totalChanges = 0;
  camsCount = 0;
  termsCount = 0;
  gpsCount = 0;
  evidenceCount = 0;
  referencesCount = 0;
  relationsCount = 0;

  constructor() { }

  updateTotal() {
    this.totalChanges =
      this.termsCount
      + this.gpsCount
      + this.evidenceCount
      + this.referencesCount
      + this.relationsCount;
  }
}

export class Cam {
  title: string;
  state: any;
  groups: Group[] = [];
  contributors: Contributor[] = [];
  groupId: any;
  expanded = false;
  model: any;
  annotatedEntity?: {};
  camRow?: any;
  connectorAnnotons: ConnectorAnnoton[] = [];
  triples: Triple<AnnotonNode>[] = [];
  sort;
  error = false;
  engine;
  onGraphChanged;
  manager;
  artManager;
  individualManager;
  groupManager;
  graph;
  storedGraph;
  date;
  modified = false;
  modifiedP = false;
  modifiedStats = new CamStats();
  matchedCount = 0;
  filter = {
    contributor: null,
    uuids: [],
    terms: []
  };

  goterms: Entity[] = [];
  queryMatch: CamQueryMatch = new CamQueryMatch();

  dateReviewAdded = Date.now();

  // Display 

  /**
   * Used for HTML id attribute
   */
  displayId: string;
  moreDetail = false;
  displayNumber = '0';

  displayType;
  grid: any = [];
  graphPreview = {
    nodes: [],
    edges: []
  };

  loading = {
    status: false,
    message: ''
  };

  // Error Handling
  isReasoned = false;
  hasViolations = false;
  violations: Violation[];

  private _filteredAnnotons: Annoton[] = [];
  private _annotons: Annoton[] = [];
  private _storedAnnotons: Annoton[] = [];
  private _id: string;

  constructor() {
    this.displayType = noctuaFormConfig.camDisplayType.options.model;
  }

  get id() {
    return this._id;
  }

  set id(id: string) {
    this._id = id;
    this.displayId = NoctuaFormUtils.cleanID(id);
  }

  get annotons() {
    switch (this.displayType) {
      case noctuaFormConfig.camDisplayType.options.entity:
        return this._filteredAnnotons.sort(this._compareMolecularFunction);
      default:
        return this._annotons.sort(this._compareMolecularFunction);
    }
  }

  set annotons(srcAnnotons: Annoton[]) {
    each(srcAnnotons, (annoton: Annoton) => {
      const prevAnnoton = this.findAnnotonById(annoton.id);

      if (prevAnnoton) {
        annoton.expanded = prevAnnoton.expanded;
      }
    });

    this._annotons = srcAnnotons;
  }

  get storedAnnotons() {
    return this._storedAnnotons.sort(this._compareMolecularFunction);
  }

  set storedAnnotons(srcAnnotons: Annoton[]) {
    each(srcAnnotons, (annoton: Annoton) => {
      const prevAnnoton = this.findAnnotonById(annoton.id);

      if (prevAnnoton) {
        annoton.expanded = prevAnnoton.expanded;
      }
    });

    this._storedAnnotons = srcAnnotons;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  expandAllAnnotons(expand: boolean) {
    const self = this;

    each(self.annotons, (annoton: Annoton) => {
      annoton.expanded = expand;
    });
  }

  getConnectorAnnoton(upstreamId: string, downstreamId: string): ConnectorAnnoton {
    const self = this;

    return find(self.connectorAnnotons, (connectorAnnoton: ConnectorAnnoton) => {
      return connectorAnnoton.upstreamNode.uuid === upstreamId &&
        connectorAnnoton.downstreamNode.uuid === downstreamId;
    });
  }

  configureDisplayType() {
    if (this.filter.uuids.length > 0) {
      this.displayType = noctuaFormConfig.camDisplayType.options.entity;
    }
  }

  clearFilter() {
    const self = this;

    each(self._annotons, (annoton: Annoton) => {
      each(annoton.nodes, (node: AnnotonNode) => {
        node.term.highlight = false;
      });
    });
  }

  findNodeById(uuid, annotons: Annoton[]): AnnotonNode {
    const self = this;
    let found
    each(annotons, (annoton) => {
      found = find(annoton.nodes, (node: AnnotonNode) => {
        return node.uuid === uuid;
      });

      if (found) {
        return false;
      }
    })

    return found;
  }

  findAnnotonById(id) {
    const self = this;

    return find(self.annotons, (annoton) => {
      return annoton.id === id;
    });
  }

  findAnnotonByNodeId(nodeId): Annoton[] {
    const self = this;

    const result = filter(self.annotons, (annoton: Annoton) => {
      return find(annoton.nodes, (annotonNode: AnnotonNode) => {
        return annotonNode.uuid === nodeId;
      });
    }) as Annoton[];

    return result;
  }

  checkStored() {
    const self = this;

    each(self._annotons, (annoton: Annoton) => {
      each(annoton.nodes, (node: AnnotonNode) => {
        // node.term.highlight = false;
        const found: AnnotonNode = self.findNodeById(node.uuid, self.storedAnnotons)
        if (found && node.term.id !== found.term.id) {
          node.term.termHistory.unshift(new Entity(found.term.id, found.term.label));
          node.term.modified = true;
        }
      });
    });
  }

  applyFilter() {
    const self = this;

    self.clearFilter();

    if (self.queryMatch && self.queryMatch.terms.length > 0) {
      self._filteredAnnotons = [];
      self.matchedCount = 0;
      //  this.displayType = noctuaFormConfig.camDisplayType.options.entity;

      each(self._annotons, (annoton: Annoton) => {
        let match = false;
        each(annoton.nodes, (node: AnnotonNode) => {
          node.term.highlight = false;
          each(self.queryMatch.terms, (term) => {

            if (node.term.uuid === term.uuid) {
              node.term.highlight = true;
              node.term.annotonDisplayId = term.annotonDisplayId = annoton.displayId;

              self.matchedCount += 1;
              match = true;
            }
          });
        });

        if (match) {
          self._filteredAnnotons.push(annoton);
        }
      });
    }
  }

  replace(findEntities: Entity[], replaceWith: Entity) {
    const self = this;

    each(self._annotons, (annoton: Annoton) => {
      each(annoton.nodes, (node: AnnotonNode) => {
        // node.term.highlight = false;
        each(findEntities, (entity: Entity) => {
          if (node.term.uuid === entity.uuid) {
            node.term.termHistory.push(new Entity(node.term.id, node.term.label));
            node.term.modified = true;
            node.term.id = replaceWith.id;
            node.term.label = replaceWith.label;
          }
        });
      });
    });
  }

  reviewTermChanges(stat: CamStats): Entity[] {
    const self = this;
    const result = [];

    self.modifiedStats = new CamStats();

    each(self._annotons, (annoton: Annoton) => {
      each(annoton.nodes, (node: AnnotonNode) => {
        if (node.term.modified) {
          result.push(node.term);
          self.modifiedStats.termsCount++;
          stat.termsCount++;
          annoton.modified = true;
          self.modified = true;
        }
      });
    });

    self.modifiedStats.updateTotal();
    return result;
  }

  getAnnotonByConnectionId(connectionId) {
    const self = this;
    let result = find(self.annotons, (annoton: Annoton) => {
      return annoton.id === connectionId;
    })

    return result;
  }

  getNodesByType(type: AnnotonNodeType): any[] {
    const self = this;
    const result = [];

    each(self.annotons, (annoton: Annoton) => {
      result.push({
        annoton,
        title: annoton.title,
        annotonNodes: annoton.getNodesByType(type)
      });
    });

    return result;
  }

  getNodesByTypeFlat(type: AnnotonNodeType): AnnotonNode[] {
    const self = this;
    const result = [];

    each(self.annotons, (annoton: Annoton) => {
      result.push(...annoton.getNodesByType(type));
    });

    return result;
  }

  getTerms(formAnnoton: Annoton) {
    const self = this;
    const result = [];

    if (formAnnoton && formAnnoton.nodes) {
      each(formAnnoton.nodes, (node: AnnotonNode) => {
        result.push(node);
      });
    }

    each(self.annotons, (annoton: Annoton) => {
      each(annoton.nodes, (node: AnnotonNode) => {
        result.push(node);
      });
    });

    return result;
  }

  getEvidences(formAnnoton: Annoton) {
    const self = this;
    const result = [];

    if (formAnnoton && formAnnoton.nodes) {
      each(formAnnoton.nodes, (node: AnnotonNode) => {
        each(node.predicate.evidence, (evidence: Evidence) => {
          if (evidence.hasValue()) {
            result.push(evidence);
          }
        });
      });
    }

    each(self.annotons, (annoton: Annoton) => {
      each(annoton.edges, (triple: Triple<AnnotonNode>) => {
        each(triple.predicate.evidence, (evidence: Evidence) => {
          if (evidence.hasValue()) {
            result.push(evidence);
          }
        });
      });
    });

    return result;
  }

  setPreview() {
    const self = this;
    self.graphPreview.edges = [];
    self.graphPreview.nodes = <NgxNode[]>self.annotons.map((annoton: Annoton) => {
      return {
        id: annoton.id,
        label: annoton.presentation.mfText,
        data: {
          annoton: annoton
        }
      };
    });

    each(self.connectorAnnotons, (connectorAnnoton: ConnectorAnnoton) => {
      if (connectorAnnoton.type === ConnectorType.basic) {
        self.graphPreview.edges.push(
          <NgxEdge>{
            source: connectorAnnoton.upstreamNode.uuid,
            target: connectorAnnoton.downstreamNode.uuid,
            label: connectorAnnoton.rule.r1Edge.label,
            data: {
              connectorAnnoton: connectorAnnoton
            }
          });
      } else if (connectorAnnoton.type === ConnectorType.intermediate) {
        self.graphPreview.nodes.push({
          id: connectorAnnoton.processNode.uuid,
          label: connectorAnnoton.processNode.term.label,
          data: {
            connectorAnnoton: connectorAnnoton
          }
        });
        self.graphPreview.edges.push(
          <NgxEdge>{
            source: connectorAnnoton.upstreamNode.uuid,
            target: connectorAnnoton.processNode.uuid,
            label: connectorAnnoton.rule.r1Edge.label,
            data: {
              connectorAnnoton: connectorAnnoton
            }
          });
        self.graphPreview.edges.push(
          <NgxEdge>{
            source: connectorAnnoton.processNode.uuid,
            target: connectorAnnoton.downstreamNode.uuid,
            label: connectorAnnoton.rule.r2Edge.label,
            data: {
              connectorAnnoton: connectorAnnoton
            }
          });
      }
    });

    /*
        self.graphPreview.edges = <NgxEdge[]>triples.map((triple: Triple<AnnotonNode>) => {
          return {
            source: triple.subject.id,
            target: triple.object.id,
            label: triple.predicate.edge.label
          };
        });*/
  }

  setViolations() {
    const self = this;
    self.violations?.forEach((violation: Violation) => {
      const annotons = this.findAnnotonByNodeId(violation.node.uuid);

      if (annotons) {
        annotons.forEach((annoton: Annoton) => {
          annoton.hasViolations = true;
          annoton.violations.push(violation);
        });
      }
    });
  }

  generateTripleGrid() {
    const grid = [...this.triples.map((triple) => {
      return triple.grid;
    })];

    return grid;
  }

  generateGridRow(annoton: Annoton, node: AnnotonNode) {
    const self = this;
    const term = node.getTerm();

    self.grid.push({
      displayEnabledBy: self.tableCanDisplayEnabledBy(node),
      treeLevel: node.treeLevel,
      relationship: node.isExtension ? '' : self.tableDisplayExtension(node),
      relationshipExt: node.isExtension ? node.predicate.edge.label : '',
      term: node.isExtension ? {} : term,
      extension: node.isExtension ? term : {},
      aspect: node.aspect,
      annoton: annoton,
      node: node
    });
  }

  getViolationDisplayErrors() {
    const self = this;
    const result = [];

    result.push(...self.violations.map((violation: Violation) => {
      return violation.getDisplayError();
    }));

    return result;
  }

  tableCanDisplayEnabledBy(node: AnnotonNode) {
    return node.predicate.edge && node.predicate.edge.id === noctuaFormConfig.edge.enabledBy.id;
  }

  tableDisplayExtension(node: AnnotonNode) {
    if (node.id === 'mf') {
      return '';
    } else if (node.isComplement) {
      return 'NOT ' + node.predicate.edge.label;
    } else {
      return node.predicate.edge.label;
    }
  }

  updateAnnotonDisplayNumber() {
    const self = this;

    each(self.annotons, (annoton: Annoton, key) => {
      annoton.displayNumber = self.displayNumber + '.' + (key + 1).toString();
    });
  }

  private _compareMolecularFunction(a: Annoton, b: Annoton): number {
    if (a.presentation.gpText.toLowerCase() < b.presentation.gpText.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
}

