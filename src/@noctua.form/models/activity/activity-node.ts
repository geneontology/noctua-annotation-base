import { Evidence } from './evidence';
import { ActivityError, ErrorLevel, ErrorType } from './parser/activity-error';
import { Activity } from './activity';
import { Entity } from './entity';
import { EntityLookup } from './entity-lookup';
import { Contributor } from './../contributor';
import { each, find, some } from 'lodash';
import { NoctuaFormUtils } from './../../utils/noctua-form-utils';
import * as EntityDefinition from './../../data/config/entity-definition';
import { Predicate } from './predicate';
import { PendingChange } from './pending-change';
import { CamStats } from './cam';

export interface GoCategory {
  id: ActivityNodeType;
  category: string;
  categoryType: string;
}

export enum ActivityNodeType {
  GoProteinContainingComplex = 'GoProteinContainingComplex',
  GoCellularComponent = 'GoCellularComponent',
  GoBiologicalProcess = 'GoBiologicalProcess',
  GoMolecularFunction = 'GoMolecularFunction',
  GoMolecularEntity = 'GoMolecularEntity',
  GoChemicalEntity = 'GoChemicalEntity',
  GoEvidence = 'GoEvidence',
  GoCellTypeEntity = 'GoCellTypeEntity',
  GoAnatomicalEntity = 'GoAnatomicalEntity',
  GoOrganism = 'GoOrganism',
  GoBiologicalPhase = 'GoBiologicalPhase',
  // extra internal use
  GoCatalyticActivity = 'GoCatalyticActivity',
  GoChemicalEntityHasInput = 'GoChemicalEntityHasInput',
  GoChemicalEntityHasOutput = 'GoChemicalEntityHasOutput',
}

export interface ActivityNodeDisplay {
  id: string;
  rootTypes: Entity[];
  type: ActivityNodeType;
  label: string;
  uuid: string;
  isExtension: boolean;
  aspect: string;
  category: GoCategory[];
  displaySection: any;
  displayGroup: any;
  treeLevel: number;
  required: boolean;
  termRequired: boolean;
  visible: boolean;
  skipEvidence: boolean;
  isKey: boolean;
  weight: number;
  relationEditable: boolean;
  showInMenu: boolean;
}

export class ActivityNode implements ActivityNodeDisplay {

  type: ActivityNodeType;
  label: string;
  uuid: string;
  category: GoCategory[];
  rootTypes: Entity[] = [];
  term: Entity = new Entity('', '');
  termLookup: EntityLookup = new EntityLookup();
  isExtension = false;
  aspect: string;
  nodeGroup: any = {};
  activity: Activity;
  ontologyClass: any = [];
  isComplement = false;
  closures: any = [];
  assignedBy: boolean = null;
  contributor: Contributor = null;
  isCatalyticActivity = false;
  isKey = false;
  displaySection: any;
  displayGroup: any;
  predicate: Predicate;
  treeLevel = 1;
  required = false;
  termRequired = false;
  visible = true;
  canInsertNodes;
  skipEvidence = false;
  errors = [];
  warnings = [];
  status = '0';
  weight: 0;
  relationEditable = false;
  showInMenu = false;
  insertMenuNodes = [];
  linkedNode = false;
  familyNodes = [];
  displayId: string;

  private _id: string;

  //For Save 
  pendingEntityChanges: PendingChange;

  constructor(activityNode?: Partial<ActivityNodeDisplay>) {
    if (activityNode) {
      this.overrideValues(activityNode);
    }
  }

  getTerm() {
    return this.term;
  }

  get id() {
    return this._id;
  }

  set id(id: string) {
    this._id = id;
    this.displayId = NoctuaFormUtils.cleanID(id);
  }

  get classExpression() {
    return this.term.classExpression;
  }

  set classExpression(classExpression) {
    this.term.classExpression = classExpression;
  }

  setTermOntologyClass(value) {
    this.ontologyClass = value;
  }

  toggleIsComplement() {
    const self = this;
    self.isComplement = !self.isComplement;
    self.nodeGroup.isComplement = self.isComplement;
  }

  setIsComplement(complement) {
    const self = this;
    self.isComplement = complement;
  }

  hasValue() {
    const self = this;
    return self.term.hasValue();
  }

  hasRootType(inRootType: GoCategory) {
    return find(this.rootTypes, (rootType: Entity) => {
      return rootType.id === inRootType.category;
    });
  }

  hasRootTypes(inRootTypes: GoCategory[]) {
    let found = false;
    for (let i = 0; i < this.rootTypes.length; i++) {
      for (let j = 0; j < inRootTypes.length; j++) {
        if (this.rootTypes[i].id === inRootTypes[j].category) {
          found = true;
          break;
        }
      }
    }

    return found;
  }

  clearValues() {
    const self = this;
    self.term.id = null;
    self.term.label = null;
    self.predicate.resetEvidence();
  }

  copyValues(node: ActivityNode) {
    const self = this;
    self.uuid = node.uuid;
    self.term = node.term;
    self.assignedBy = node.assignedBy;
    self.isComplement = node.isComplement;
    self.isCatalyticActivity = node.isCatalyticActivity;
  }

  setTermLookup(value) {
    this.termLookup.requestParams = value;
  }

  setDisplay(value) {
    if (value) {
      this.displaySection = value.displaySection;
      this.displayGroup = value.displayGroup;
    }
  }

  enableRow() {
    const self = this;
    let result = true;
    if (self.nodeGroup) {
      if (self.nodeGroup.isComplement && self.treeLevel > 0) {
        result = false;
      }
    }

    return result;
  }

  reviewTermChanges(stat: CamStats, modifiedStats: CamStats): boolean {
    const self = this;
    let modified = false;

    if (self.term.modified) {
      if (self.id === EntityDefinition.GoMolecularEntity.id) {
        modifiedStats.gpsCount++;
        stat.gpsCount++;
      } else {
        modifiedStats.termsCount++;
        stat.termsCount++;
      }

      modified = true;
    }

    each(self.predicate.evidence, (evidence: Evidence, key) => {
      const evidenceModified = evidence.reviewEvidenceChanges(stat, modifiedStats);
      modified = modified || evidenceModified;
    });

    modifiedStats.updateTotal();
    return modified;
  }

  checkStored(oldNode: ActivityNode) {
    const self = this;

    if (oldNode && self.term.id !== oldNode.term.id) {
      self.term.termHistory.unshift(new Entity(oldNode.term.id, oldNode.term.label));
      self.term.modified = true;
    }

    each(self.predicate.evidence, (evidence: Evidence, key) => {
      const oldEvidence = oldNode.predicate.getEvidenceById(evidence.uuid)
      evidence.checkStored(oldEvidence)
    });
  }

  addPendingChanges(oldNode: ActivityNode) {
    const self = this;

    if (self.term.id !== oldNode.term.id) {
      self.pendingEntityChanges = new PendingChange(self.uuid, oldNode.term, self.term);
    }

    each(self.predicate.evidence, (evidence: Evidence, key) => {
      const oldEvidence = oldNode.predicate.getEvidenceById(evidence.uuid)
      evidence.addPendingChanges(oldEvidence);
    });

    //this is temporary swap back into old
    //self.term = oldNode.term
  }

  enableSubmit(errors) {
    const self = this;
    let result = true;

    if (self.termRequired && !self.term.id) {
      self.required = true;
      const meta = {
        aspect: self.label
      };
      const error = new ActivityError(ErrorLevel.error, ErrorType.general, `"${self.label}" is required`, meta);
      errors.push(error);
      result = false;
    } else {
      self.required = false;
    }

    if (!self.skipEvidence && self.hasValue()) {
      each(self.predicate.evidence, (evidence: Evidence, key) => {
        result = evidence.enableSubmit(errors, self, key + 1) && result;
      });
    }

    return result;
  }

  overrideValues(override: Partial<ActivityNodeDisplay> = {}) {
    Object.assign(this, override);
  }
}

export function categoryToClosure(categories) {
  return categories.map((category) => {
    return `${category.categoryType}:"${category.category}"`;
  }).join(' OR ');
}

export function compareTerm(a: ActivityNode, b: ActivityNode) {
  return a.term.id === b.term.id;
}
