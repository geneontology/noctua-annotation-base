
import { Rule } from './rule';

export class ActivityRelationshipRule extends Rule {
  relation: any;

  constructor(id?: string, label?: string, description?: string, url?: string) {
    super(id, label, description, url);
  }

}