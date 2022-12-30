
import { Rule } from './rule';

export class ConditionRule extends Rule {

  condition = false;

  constructor(id?: string, label?: string, description?: string, url?: string) {
    super(id, label, description, url);
  }

}