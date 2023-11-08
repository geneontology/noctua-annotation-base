import { ActivityNode } from './activity-node';
import { Entity } from './entity';
import { noctuaFormConfig } from './../../noctua-form-config';
import { Activity } from './activity';
import { Triple } from './triple';
import { Predicate } from './predicate';
import * as ShapeUtils from './../../data/config/shape-utils';


export class AnnotationActivity {
  gp: ActivityNode;
  goterm: ActivityNode;
  extension: ActivityNode;
  gpToTermEdge: Entity;
  extensionEdge: Entity;
  extensionType;
  gotermAspect: string;

  gpToTermEdges: Entity[] = [];
  extensionEdges: Entity[] = [];


  constructor(activity: Activity) {
    this.activityToAnnotation(activity)
  }


  activityToAnnotation(activity: Activity) {
    this.gp = activity.getNode('gp');
    this.goterm = activity.getNode('goterm');
    this.extension = activity.getNode('extension');

  }

  createSave() {
    const self = this;
    const saveData = {
      title: 'enabled by ' + self.gp?.term.label,
      triples: [],
      nodes: [self.gp, self.goterm],
      graph: null
    };

    if (this.gpToTermEdge.id === noctuaFormConfig.inverseEdge.enables.id) {
      const gpToTermTriple = new Triple(self.goterm, self.gp,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge.enabledBy), self.goterm.predicate.evidence));

      saveData.triples.push(gpToTermTriple);

    } else if (this.gpToTermEdge.id === noctuaFormConfig.inverseEdge.involvedIn.id) {
      const mfNode = ShapeUtils.generateBaseTerm([]);
      const rootMF = noctuaFormConfig.rootNode.mf;

      mfNode.term = new Entity(rootMF.id, rootMF.label);

      const mfToGpTriple = new Triple(mfNode, self.gp,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge.enabledBy), self.goterm.predicate.evidence));

      const mfToTermTriple = new Triple(mfNode, self.goterm,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge.partOf), self.goterm.predicate.evidence));

      saveData.triples.push(mfToGpTriple);
      saveData.triples.push(mfToTermTriple);

    } else if (this.gpToTermEdge.id === noctuaFormConfig.inverseEdge.isActiveIn.id) {
      const mfNode = ShapeUtils.generateBaseTerm([]);
      const rootMF = noctuaFormConfig.rootNode.mf;

      mfNode.term = new Entity(rootMF.id, rootMF.label);

      const mfToGpTriple = new Triple(mfNode, self.gp,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge.enabledBy), self.goterm.predicate.evidence));

      const mfToTermTriple = new Triple(mfNode, self.goterm,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge.occursIn), self.goterm.predicate.evidence));

      saveData.triples.push(mfToGpTriple);
      saveData.triples.push(mfToTermTriple);

    }

    if (self.extension?.hasValue()) {
      const extensionTriple = new Triple(self.goterm, self.extension,
        new Predicate(this.extensionEdge, self.goterm.predicate.evidence));

      saveData.nodes.push(self.extension);
      saveData.triples.push(extensionTriple);
    }

    return saveData;
  }

  createSave2(edgeConfigurations) {
    const saveData = {
      title: 'enabled by ' + this.gp?.term.label,
      triples: [],
      nodes: [this.gp, this.goterm],
      graph: null
    };

    const edgeType = this.gpToTermEdge.label; // Assuming 'label' holds the edge type as a string
    const config = edgeConfigurations[edgeType];

    if (!config) {
      console.warn('No configuration defined for edge:', edgeType);
      return;
    }

    if (config.mfNodeRequired) {
      const mfNode = ShapeUtils.generateBaseTerm([]);
      const rootMF = noctuaFormConfig.rootNode.mf;
      mfNode.term = new Entity(rootMF.id, rootMF.label);

      const mfToGpTriple = new Triple(mfNode, this.gp,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge[config.gpToTermPredicate]), this.goterm.predicate.evidence));

      saveData.triples.push(mfToGpTriple);

      if (config.mfToTermPredicate) {
        const mfToTermTriple = new Triple(mfNode, this.goterm,
          new Predicate(Entity.createEntity(noctuaFormConfig.edge[config.mfToTermPredicate]), this.goterm.predicate.evidence));

        saveData.triples.push(mfToTermTriple);
      }
    } else {
      const gpToTermTriple = new Triple(this.goterm, this.gp,
        new Predicate(Entity.createEntity(noctuaFormConfig.edge[config.gpToTermPredicate]), this.goterm.predicate.evidence));

      saveData.triples.push(gpToTermTriple);
    }
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
