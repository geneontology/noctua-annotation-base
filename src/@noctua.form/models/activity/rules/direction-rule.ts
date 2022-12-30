
import { Rule } from './rule';

export class DirectionRule extends Rule {
  direction: any;

  constructor(id?: string, label?: string, description?: string, url?: string) {
    super(id, label, description, url);
  }

}