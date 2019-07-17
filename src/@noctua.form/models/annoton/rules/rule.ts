import * as _ from 'lodash';
declare const require: any;

export class Rule {
  name: string;
  label: string;
  description: string
  url: string;
  condition: false;
  classExpression: any;

  constructor(name?: string, label?: string, description?: string, url?: string) {
    this.name = name;
    this.label = label;
    this.description = description;
    this.url = url;
  }

}