import { ActivityNode } from './../activity/activity-node';
import { Entity, RootTypes } from './../activity/entity';
import { noctuaFormConfig } from './../../noctua-form-config';
import { Activity } from './../activity/activity';
import { Triple } from './../activity/triple';
import { Predicate } from './../activity/predicate';
import * as ShapeUtils from './../../data/config/shape-utils';
import * as EntityDefinition from './../../data/config/entity-definition';
import { Evidence } from './../activity/evidence';
import { StandardAnnotationForm } from './form';


export interface AnnotationEdgeConfig {
  gpToTermPredicate?: string;
  gpToTermReverse?: boolean;
  mfNodeRequired: boolean;
  mfToTermPredicate?: string;
  root?: RootTypes;
  mfToTermReverse?: boolean;
}

export class AnnotationExtension {
  extensionTerm: ActivityNode;
  extensionEdge: Entity;
  extensionEdges: Entity[] = [];

  constructor(extension?: ActivityNode) {
    if (extension) {
      this.extensionTerm = extension;
    } else {
      this.extensionTerm = ShapeUtils.generateBaseTerm([]);
      this.extensionTerm.label = 'Extension Term';
    }
  }
}

export class AnnotationEvidence {
  evidenceCode: ActivityNode;
  reference: ActivityNode;
  with: ActivityNode;

  constructor(evidence?: Evidence) {

    this.evidenceCode = ShapeUtils.generateBaseTerm([]);
    this.reference = ShapeUtils.generateBaseTerm([]);
    this.with = ShapeUtils.generateBaseTerm([]);

    this.evidenceCode.category = [EntityDefinition.GoEvidence];
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

    console.log('activity', activity);


    const extensionTriples: Triple<ActivityNode>[] = activity.getEdges(this.goterm.id);
    this.extensions = extensionTriples.map(triple => {
      const extension = new AnnotationExtension();
      extension.extensionTerm = triple.object;
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
    return null;
  }

  private _populateAnnotationActivity(annotationForm: StandardAnnotationForm) {

    this.gp.term.id = annotationForm.gp.id;
    this.goterm.term.id = annotationForm.goterm.id;
    this.gpToTermEdge = annotationForm.gpToTermEdge;

    annotationForm.annotationExtensions.forEach((ext, index) => {
      this.extensions[index].extensionEdge = ext.extensionEdge;
      this.extensions[index].extensionTerm.term.id = ext.extensionTerm.id;
    });

    this.evidence.evidenceCode.term.id = annotationForm.evidence.evidenceCode.id;
    this.evidence.reference.term.id = annotationForm.evidence.reference;
    this.evidence.with.term.id = annotationForm.evidence.withFrom;
  }

  createSave(annotationForm: StandardAnnotationForm) {

    this._populateAnnotationActivity(annotationForm);
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

      const triple = this._createTriple(mfNode, this.gp, config.gpToTermPredicate, this.evidence, config.gpToTermReverse)
      saveData.triples.push(triple);

      if (config.mfToTermPredicate) {
        const mfTriple = this._createTriple(mfNode, this.goterm, config.mfToTermPredicate, this.evidence)
        saveData.triples.push(mfTriple);
      }

    } else {
      const triple = this._createTriple(this.gp, this.goterm, config.gpToTermPredicate, this.evidence, config.gpToTermReverse)
      saveData.triples.push(triple);
    }

    this.extensions.forEach(ext => {


      if (ext.extensionTerm?.hasValue()) {
        const extensionTriple = new Triple(this.goterm, ext.extensionTerm,
          new Predicate(ext.extensionEdge, this.goterm.predicate.evidence));

        saveData.nodes.push(ext.extensionTerm);
        saveData.triples.push(extensionTriple);
      }
    });

    return saveData;
  }


  private _createTriple(subjectNode: ActivityNode, objectNode: ActivityNode, predicateId: string, annotationEvidence: AnnotationEvidence, reverse = false) {
    const edgeConfig = noctuaFormConfig.allEdges.find(edge => edge.id === predicateId);

    if (!edgeConfig) {
      throw new Error(`Edge configuration not found for predicate ID: ${predicateId}`);
    }

    const evidence = new Evidence();

    evidence.evidence = new Entity(annotationEvidence.evidenceCode?.term.id, "");
    evidence.reference = annotationEvidence.reference?.term.id;
    evidence.with = annotationEvidence.with?.term.id;

    const predicateEntity = Entity.createEntity(edgeConfig);
    const predicate = new Predicate(predicateEntity, [evidence]);

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
