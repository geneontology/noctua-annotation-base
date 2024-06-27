import { Entity } from "../activity";
import { GoCategory } from "../activity/activity-node";

export class StandardNode {
  id: string;
  rootTypes: Entity[] = [];
  label: string;
  uuid: string;
  category: GoCategory[] = [];
  term: Entity;

  constructor(node?: StandardNode) {
    if (node) {
      this.id = node.id;
      this.rootTypes = node.rootTypes;
      this.label = node.label;
      this.uuid = node.uuid;
      this.category = node.category;
      this.term = node.term;
    } else {
      this.id = '';
      this.rootTypes = [];
      this.label = '';
      this.uuid = '';
      this.category = [];
      this.term = new Entity("", "");
    }
  }

  hasValue() {
    const self = this;
    return self.term.hasValue();
  }

  hasRootType(inRootType: GoCategory) {
    const found = this.rootTypes.find((rootType: Entity) => {
      return rootType.id === inRootType.category;
    });

    return found ? true : false
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
}