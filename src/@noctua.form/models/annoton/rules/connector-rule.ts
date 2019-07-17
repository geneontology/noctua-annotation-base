import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { noctuaFormConfig } from './../../../noctua-form-config';
import { Rule } from './rule';


export class ConnectorRule {
  private _rules: any = {
    annotonsConsecutive: new Rule('annotonsConsecutive', 'Activities are consecutive?'),
    effectDependency: new Rule('effectDependency', 'causal effect yes dependency?'),
    subjectMFCatalyticActivity: new Rule('subjectMFCatalyticActivity', 'Is subject MF a Catalytic Activity'),
    objectMFCatalyticActivity: new Rule('objectMFCatalyticActivity', 'Is object MF a Catalytic Activity')
  }

  rules = _.cloneDeep(this._rules);

  public _notes = [
    this._rules.annotonsConsecutive,
    this._rules.subjectMFCatalyticActivity,
    this._rules.objectMFCatalyticActivity
  ];


  public notes = [
    this.rules.annotonsConsecutive,
    this.rules.subjectMFCatalyticActivity,
    this.rules.objectMFCatalyticActivity
  ];

  public displaySection = {
    annotonsConsecutive: true,
    causalEffect: true,
    effectDependency: false,
    causalReactionProduct: false
  }

  constructor() {
  }




}