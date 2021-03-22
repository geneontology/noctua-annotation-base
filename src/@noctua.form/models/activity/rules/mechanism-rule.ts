
import { Rule } from './rule';

export class MechanismRule extends Rule {
  mechanism: any;

  constructor(name?: string, label?: string, description?: string, url?: string) {
    super(name, label, description, url);
  }

}