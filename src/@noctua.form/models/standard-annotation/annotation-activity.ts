import { ActivityNode } from './../activity/activity-node';
import { Entity, RootTypes } from './../activity/entity';
import { noctuaFormConfig } from './../../noctua-form-config';
import { Activity } from './../activity/activity';
import { Triple } from './../activity/triple';
import { Predicate } from './../activity/predicate';
import * as ShapeUtils from './../../data/config/shape-utils';
import * as EntityDefinition from './../../data/config/entity-definition';
import { Evidence } from './../activity/evidence';


export interface AnnotationEdgeConfig {
  gpToTermPredicate?: string;
  gpToTermReverse?: boolean;
  mfNodeRequired: boolean;
  mfToTermPredicate?: string;
  root?: RootTypes;
  mfToTermReverse?: boolean;
}

export class AnnotationExtension {
  extension: ActivityNode;
  extensionEdge: Entity;
  extensionEdges: Entity[] = [];
}

export class AnnotationEvidence {
  evidenceCode: ActivityNode;
  reference: ActivityNode;
  with: ActivityNode;

  constructor(evidence?: Evidence) {

    this.evidenceCode = ShapeUtils.generateBaseTerm([EntityDefinition.GoEvidence]);
    this.reference = ShapeUtils.generateBaseTerm([]);
    this.with = ShapeUtils.generateBaseTerm([]);


    this.evidenceCode.label = 'Evidence'
    this.reference.label = 'Reference'
    this.with.label = 'With/From'

    if (evidence) {
    }
  }
}


export class AnnotationActivity {
  gp: ActivityNode;
  goterm: ActivityNode;
  gpToTermEdge: Entity;
  gotermAspect: string;
  evidence: AnnotationEvidence;
  extensions: AnnotationExtension[] = [];

  gpToTermEdges: Entity[] = [];
  activity: Activity;
  submitErrors = [];


  constructor(activity?: Activity) {

    if (activity) {
      this.activityToAnnotation(activity);
    }
  }


  activityToAnnotation(activity: Activity) {
    this.gp = activity.getNode('gp');
    this.goterm = activity.getNode('goterm');
    this.evidence = new AnnotationEvidence();


    const extensionTriples: Triple<ActivityNode>[] = activity.getEdges(this.goterm.id);
    this.extensions = extensionTriples.map(triple => {
      const extension = new AnnotationExtension();
      extension.extension = triple.object;
      extension.extensionEdge = triple.predicate.edge;
      return extension;
    });

  }

  findEdgeByCriteria(matchCriteria: AnnotationEdgeConfig): string {

    const config = noctuaFormConfig.simpleAnnotationEdgeConfig;

    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        let allCriteriaMatch = true;
        const entry = config[key];

        for (const criterion in matchCriteria) {
          if (entry[criterion] !== matchCriteria[criterion]) {
            allCriteriaMatch = false;
            break;
          }
        }

        if (allCriteriaMatch) {
          return key;
        }
      }
    }
    return null; // Return null if no match is found
  }

  createSave() {
    const saveData = {
      title: 'enabled by ' + this.gp?.term.label,
      triples: [],
      nodes: [this.gp, this.goterm],
      graph: null
    };

    const edgeType = this.gpToTermEdge.id
    const config = noctuaFormConfig.simpleAnnotationEdgeConfig[edgeType]

    if (!config) {
      console.warn('No configuration defined for edge:', edgeType);
      return;
    }

    if (config.mfNodeRequired) {
      const mfNode = ShapeUtils.generateBaseTerm([]);

      const rootMF = noctuaFormConfig.rootNode.mf;
      mfNode.term = new Entity(rootMF.id, rootMF.label);

      const triple = this._createTriple(mfNode, this.gp, config.gpToTermPredicate, this.goterm.predicate.evidence, config.gpToTermReverse)
      saveData.triples.push(triple);

      if (config.mfToTermPredicate) {
        const mfTriple = this._createTriple(mfNode, this.goterm, config.mfToTermPredicate, this.goterm.predicate.evidence)
        saveData.triples.push(mfTriple);
      }

    } else {
      const triple = this._createTriple(this.gp, this.goterm, config.gpToTermPredicate, this.goterm.predicate.evidence, config.gpToTermReverse)
      saveData.triples.push(triple);
    }

    this.extensions.forEach(ext => {


      if (ext.extension?.hasValue()) {
        const extensionTriple = new Triple(this.goterm, ext.extension,
          new Predicate(ext.extensionEdge, this.goterm.predicate.evidence));

        saveData.nodes.push(ext.extension);
        saveData.triples.push(extensionTriple);
      }
    });

    return saveData;
  }


  enableSubmit() {
    let result = true;

    this.submitErrors = [];

    /*     if (!this.extension?.term.id && !this.extensionEdge?.id) { return result }
    
        if (!this.extension?.term.id) {
          const meta = {
            aspect: 'Extension'
          };
          const error = new ActivityError(ErrorLevel.error, ErrorType.general, `is required`, meta);
          this.submitErrors.push(error);
        }
    
        if (!this.extensionEdge?.id) {
          const meta = {
            aspect: 'Extension Relation'
          };
          const error = new ActivityError(ErrorLevel.error, ErrorType.general, `is required`, meta);
          this.submitErrors.push(error);
        } */

    return result;
  }


  private _createTriple(subjectNode: ActivityNode, objectNode: ActivityNode, predicateId, evidence: Evidence[], reverse = false) {
    const edgeConfig = noctuaFormConfig.allEdges.find(edge => edge.id === predicateId);

    if (!edgeConfig) {
      throw new Error(`Edge configuration not found for predicate ID: ${predicateId}`);
    }

    const predicateEntity = Entity.createEntity(edgeConfig);
    const predicate = new Predicate(predicateEntity, evidence);

    return reverse
      ? new Triple(objectNode, subjectNode, predicate)
      : new Triple(subjectNode, objectNode, predicate);
  }


  updateAspect() {
    if (!this.goterm.hasValue()) return

    let aspect: string | null = null;
    const rootNode = noctuaFormConfig.rootNode
    for (const key in noctuaFormConfig.rootNode) {
      if (this.goterm.rootTypes && this.goterm.rootTypes.some(item => item.id === rootNode[key].id)) {
        this.gotermAspect = rootNode[key].aspect;
        break;
      }
    }

    return aspect;
  }

}
