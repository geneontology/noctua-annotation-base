
import { Rule } from './rule';

export class DirectnessRule extends Rule {
  directness: any;

  constructor(id?: string, label?: string, description?: string, url?: string) {
    super(id, label, description, url);
  }

}