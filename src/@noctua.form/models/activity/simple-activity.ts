declare const require: any;
import { v4 as uuid } from 'uuid';
import { SaeGraph } from './sae-graph';
import { ActivityNode } from './activity-node';

export class SimpleActivity extends SaeGraph<ActivityNode> {
  gp;
  _presentation;
  errors;
  submitErrors;
  id;
  label;
  edgeOption;
  parser;
  expanded = false;
  visible = true;


  constructor() {
    super();
    this.errors = [];
    this.submitErrors = [];
    this.id = uuid();
  }
}
