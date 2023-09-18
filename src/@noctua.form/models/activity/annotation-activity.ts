import { ActivityNode } from './activity-node';
import { Entity } from './entity';
import { noctuaFormConfig } from './../../noctua-form-config';
import { Activity } from './activity';
import { Triple } from './triple';
import { Predicate } from './predicate';


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

    const gpTpTermTriple = new Triple(self.gp, self.goterm,
      new Predicate(this.gpToTermEdge, self.goterm.predicate.evidence));

    saveData.triples.push(gpTpTermTriple);

    if (self.extension?.hasValue()) {
      const extensionTriple = new Triple(self.goterm, self.extension,
        new Predicate(this.extensionEdge, self.goterm.predicate.evidence));

      saveData.nodes.push(self.extension);
      saveData.triples.push(extensionTriple);
    }

    return saveData;
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
