
import { Rule } from './rule';

export class ChemicalRelationshipRule extends Rule {
  relation: any;

  constructor(id?: string, label?: string, description?: string, url?: string) {
    super(id, label, description, url);
  }

}