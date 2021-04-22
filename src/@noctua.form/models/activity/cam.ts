import { Edge as NgxEdge, Node as NgxNode } from '@swimlane/ngx-graph';

import { noctuaFormConfig } from './../../noctua-form-config';
import { Activity } from './activity'
import { ActivityNode, ActivityNodeType } from './activity-node';
import { Group } from '../group';
import { Contributor } from '../contributor';
import { Evidence } from './evidence';
import { Triple } from './triple';
import { Entity } from './entity';
import { ConnectorActivity, ConnectorType } from './connector-activity';
import { each, find, filter } from 'lodash';
import { NoctuaFormUtils } from './../../utils/noctua-form-utils';
import { Violation } from './error/violation-error';
import { PendingChange } from './pending-change';

export enum CamRebuildSignal {
  NONE = 'none',
  MERGE = 'merge',
  REBUILD = 'rebuild'
}

export enum CamOperation {
  NONE = 'none',
  ADD_ACTIVITY = 'add_activity',
}

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
  withsCount = 0;
  relationsCount = 0;

  constructor() { }

  updateTotal() {
    this.totalChanges =
      this.termsCount
      + this.gpsCount
      + this.evidenceCount
      + this.referencesCount
      + this.withsCount
      + this.relationsCount;
  }
}

export class CamLoadingIndicator {
  status = false;
  message = ''

  constructor(status = false, message = '') {
    this.status = status;
    this.message = message;
  }

  reset() {
    this.status = false;
    this.message = '';
  }
}

export class CamRebuildRule {
  signal = CamRebuildSignal.NONE;
  count = 0;
  autoRebuild = false;
  autoMerge = false;
  message = ''
  description = ''

  addMergeSignal() {
    this.count++;

    if (this.count === 1) {
      this.signal = CamRebuildSignal.MERGE;
      this.message = 'new changes available. Please refresh Model';
      this.description = 'Model has pending Changes. Please Reload'
    } else {
      this.signal = CamRebuildSignal.REBUILD;
      this.message = 'another new changes available. Please reload Model';
      this.description = 'Model has pending Changes. Please Reload'
    }
  }

  addRebuildSignal() {
    this.count++;
    this.signal = CamRebuildSignal.REBUILD;
    this.message = 'Model has been saved. Please reload Model';
    this.description = 'Model has pending Changes. Please Reload'
  }

  reset() {
    this.count = 0;
    this.signal = CamRebuildSignal.NONE;
    this.message = '';
    this.description = ''
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
  connectorActivities: ConnectorActivity[] = [];
  causalRelations: Triple<Activity>[] = [];
  sort;
  error = false;
  date;
  modified = false;
  modifiedStats = new CamStats();
  matchedCount = 0;
  queryMatch = new CamQueryMatch();
  dateReviewAdded = Date.now();


  operation = CamOperation.NONE;
  //rebuild
  rebuildRule = new CamRebuildRule();

  //bbop graphs
  graph;
  storedGraph;
  pendingGraph;

  // bbop managers 
  baristaClient;
  engine;
  manager;
  artManager;
  groupManager;
  replaceManager;

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

  loading = new CamLoadingIndicator(false)

  // Error Handling
  isReasoned = false;
  hasViolations = false;
  violations: Violation[];

  private _filteredActivities: Activity[] = [];
  private _activities: Activity[] = [];
  private _storedActivities: Activity[] = [];
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

  get activities() {
    switch (this.displayType) {
      case noctuaFormConfig.camDisplayType.options.entity:
        return this._filteredActivities.sort(this._compareMolecularFunction);
      default:
        return this._activities.sort(this._compareMolecularFunction);
    }
  }

  set activities(srcActivities: Activity[]) {
    each(srcActivities, (activity: Activity) => {
      const prevActivity = this.findActivityById(activity.id);

      if (prevActivity) {
        activity.expanded = prevActivity.expanded;
      }
    });

    this._activities = srcActivities;
  }

  get storedActivities() {
    return this._storedActivities.sort(this._compareMolecularFunction);
  }

  set storedActivities(srcActivities: Activity[]) {
    each(srcActivities, (activity: Activity) => {
      const prevActivity = this.findActivityById(activity.id);

      if (prevActivity) {
        activity.expanded = prevActivity.expanded;
      }
    });

    this._storedActivities = srcActivities;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  expandAllActivities(expand: boolean) {
    const self = this;

    each(self.activities, (activity: Activity) => {
      activity.expanded = expand;
    });
  }

  getConnectorActivity(upstreamId: string, downstreamId: string): ConnectorActivity {
    const self = this;

    return find(self.connectorActivities, (connectorActivity: ConnectorActivity) => {
      return connectorActivity.subjectNode.uuid === upstreamId &&
        connectorActivity.objectNode.uuid === downstreamId;
    });
  }

  clearFilter() {
    const self = this;

    each(self._activities, (activity: Activity) => {
      each(activity.nodes, (node: ActivityNode) => {
        node.term.highlight = false;
        each(node.predicate.evidence, (evidence: Evidence) => {
          evidence.evidence.highlight = false;
          evidence.referenceEntity.highlight = false;
          evidence.withEntity.highlight = false;
        });
      });
    });
  }

  findNodeById(uuid, activities: Activity[]): ActivityNode {
    const self = this;
    let found
    each(activities, (activity) => {
      found = find(activity.nodes, (node: ActivityNode) => {
        return node.uuid === uuid;
      });

      if (found) {
        return false;
      }
    })

    return found;
  }

  findActivityById(id) {
    const self = this;

    return find(self.activities, (activity) => {
      return activity.id === id;
    });
  }

  findActivityByNodeUuid(nodeId): Activity[] {
    const self = this;

    const result: Activity[] = [];

    each(self._activities, (activity: Activity) => {
      each(activity.nodes, (node: ActivityNode) => {
        if (node.uuid === nodeId) {
          result.push(activity)
        }
        each(node.predicate.evidence, (evidence: Evidence) => {
          if (evidence.uuid === nodeId) {
            result.push(activity)
          }
        });
      });
    });
    return result;
  }

  checkStored() {
    const self = this;

    each(self._activities, (activity: Activity) => {
      each(activity.nodes, (node: ActivityNode) => {
        // node.term.highlight = false;
        const oldNode: ActivityNode = self.findNodeById(node.uuid, self.storedActivities)
        node.checkStored(oldNode)
      });
    });
  }

  applyFilter() {
    const self = this;

    self.clearFilter();

    if (self.queryMatch && self.queryMatch.terms.length > 0) {
      self._filteredActivities = [];
      self.matchedCount = 0;
      //  this.displayType = noctuaFormConfig.camDisplayType.options.entity;

      each(self._activities, (activity: Activity) => {
        let match = false;
        each(activity.nodes, (node: ActivityNode) => {
          each(self.queryMatch.terms, (term) => {

            if (node.term.uuid === term.uuid) {
              node.term.highlight = true;
              node.term.activityDisplayId = term.activityDisplayId = activity.displayId;

              self.matchedCount += 1;
              match = true;
            }
          });

          each(node.predicate.evidence, (evidence: Evidence) => {
            each(self.queryMatch.terms, (term) => {

              if (evidence.uuid === term.uuid) {
                evidence.referenceEntity.highlight = true;
                evidence.referenceEntity.activityDisplayId = term.activityDisplayId = activity.displayId;

                self.matchedCount += 1;
                match = true;
              }
            });
          });
        });

        if (match) {
          self._filteredActivities.push(activity);
        }
      });
    }
  }

  applyWeights(weight = 0) {
    const self = this;

    if (self.queryMatch && self.queryMatch.terms.length > 0) {

      each(self.activities, (activity: Activity) => {
        each(activity.nodes, (node: ActivityNode) => {
          const matchNode = find(self.queryMatch.terms, { uuid: node.term.uuid }) as Entity;

          if (matchNode) {
            matchNode.weight = node.term.weight = weight;
            weight++;
          }

          each(node.predicate.evidence, (evidence: Evidence) => {
            const matchNode = find(self.queryMatch.terms, { uuid: evidence.referenceEntity.uuid }) as Entity;

            if (matchNode) {
              matchNode.weight = evidence.referenceEntity.weight = weight;
              weight++;
            }
          });
        });

      });
    }
  }

  addPendingChanges(findEntities: Entity[], replaceWith: string, category) {
    const self = this;

    each(self._activities, (activity: Activity) => {
      each(activity.nodes, (node: ActivityNode) => {
        each(findEntities, (entity: Entity) => {
          if (category.name === noctuaFormConfig.findReplaceCategory.options.reference.name) {
            each(node.predicate.evidence, (evidence: Evidence, key) => {
              if (evidence.uuid === entity.uuid) {
                const oldReference = new Entity(evidence.reference, evidence.reference);
                const newReference = new Entity(replaceWith, replaceWith);

                evidence.pendingReferenceChanges = new PendingChange(evidence.uuid, oldReference, newReference);
                evidence.pendingReferenceChanges.uuid = evidence.uuid;
              }
            });
          } else {
            if (node.term.uuid === entity.uuid) {
              const newValue = new Entity(replaceWith, replaceWith);
              node.pendingEntityChanges = new PendingChange(node.uuid, node.term, newValue);
            }
          }
        });
      });
    });
  }

  reviewCamChanges(stat: CamStats = new CamStats()): boolean {
    const self = this;
    let modified = false;

    self.modifiedStats = new CamStats();

    each(self._activities, (activity: Activity) => {
      each(activity.nodes, (node: ActivityNode) => {
        activity.modified = node.reviewTermChanges(stat, self.modifiedStats);
        modified = modified || activity.modified;
      });
    });

    self.modifiedStats.updateTotal();
    return modified;
  }

  getActivityByConnectionId(connectionId) {
    const self = this;
    let result = find(self.activities, (activity: Activity) => {
      return activity.id === connectionId;
    })

    return result;
  }

  getNodesByType(type: ActivityNodeType): any[] {
    const self = this;
    const result = [];

    each(self.activities, (activity: Activity) => {
      result.push({
        activity,
        title: activity.title,
        activityNodes: activity.getNodesByType(type)
      });
    });

    return result;
  }

  getNodesByTypeFlat(type: ActivityNodeType): ActivityNode[] {
    const self = this;
    const result = [];

    each(self.activities, (activity: Activity) => {
      result.push(...activity.getNodesByType(type));
    });

    return result;
  }

  getTerms(formActivity: Activity) {
    const self = this;
    const result = [];

    if (formActivity && formActivity.nodes) {
      each(formActivity.nodes, (node: ActivityNode) => {
        result.push(node);
      });
    }

    each(self.activities, (activity: Activity) => {
      each(activity.nodes, (node: ActivityNode) => {
        result.push(node);
      });
    });

    return result;
  }

  getEvidences(formActivity: Activity) {
    const self = this;
    const result = [];

    if (formActivity && formActivity.nodes) {
      each(formActivity.nodes, (node: ActivityNode) => {
        each(node.predicate.evidence, (evidence: Evidence) => {
          if (evidence.hasValue()) {
            result.push(evidence);
          }
        });
      });
    }

    each(self.activities, (activity: Activity) => {
      each(activity.edges, (triple: Triple<ActivityNode>) => {
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
    self.graphPreview.nodes = <NgxNode[]>self.activities.map((activity: Activity) => {
      return {
        id: activity.id,
        label: activity.presentation.mfText,
        data: {
          activity: activity
        }
      };
    });

    each(self.connectorActivities, (connectorActivity: ConnectorActivity) => {
      if (connectorActivity.type === ConnectorType.basic) {
        self.graphPreview.edges.push(
          <NgxEdge>{
            source: connectorActivity.subjectNode.uuid,
            target: connectorActivity.objectNode.uuid,
            label: connectorActivity.rule.r1Edge.label,
            data: {
              connectorActivity: connectorActivity
            }
          });
      } else if (connectorActivity.type === ConnectorType.intermediate) {
        self.graphPreview.nodes.push({
          id: connectorActivity.processNode.uuid,
          label: connectorActivity.processNode.term.label,
          data: {
            connectorActivity: connectorActivity
          }
        });
        self.graphPreview.edges.push(
          <NgxEdge>{
            source: connectorActivity.subjectNode.uuid,
            target: connectorActivity.processNode.uuid,
            label: connectorActivity.rule.r1Edge.label,
            data: {
              connectorActivity: connectorActivity
            }
          });
        self.graphPreview.edges.push(
          <NgxEdge>{
            source: connectorActivity.processNode.uuid,
            target: connectorActivity.objectNode.uuid,
            label: connectorActivity.rule.r2Edge.label,
            data: {
              connectorActivity: connectorActivity
            }
          });
      }
    });

    /*
        self.graphPreview.edges = <NgxEdge[]>triples.map((triple: Triple<ActivityNode>) => {
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
      const activities = this.findActivityByNodeUuid(violation.node.uuid);

      if (activities) {
        activities.forEach((activity: Activity) => {
          activity.hasViolations = true;
          activity.violations.push(violation);
        });
      }
    });
  }

  generateGridRow(activity: Activity, node: ActivityNode) {
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
      activity: activity,
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

  tableCanDisplayEnabledBy(node: ActivityNode) {
    return node.predicate.edge && node.predicate.edge.id === noctuaFormConfig.edge.enabledBy.id;
  }

  tableDisplayExtension(node: ActivityNode) {
    if (node.id === 'mf') {
      return '';
    } else if (node.isComplement) {
      return 'NOT ' + node.predicate.edge.label;
    } else {
      return node.predicate.edge.label;
    }
  }

  updateActivityDisplayNumber() {
    const self = this;

    each(self.activities, (activity: Activity, key) => {
      activity.displayNumber = self.displayNumber + '.' + (key + 1).toString();
    });
  }

  private _compareMolecularFunction(a: Activity, b: Activity): number {
    if (a.presentation.gpText.toLowerCase() < b.presentation.gpText.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
}

