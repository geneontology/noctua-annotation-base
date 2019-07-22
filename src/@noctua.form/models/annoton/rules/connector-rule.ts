import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { noctuaFormConfig } from './../../../noctua-form-config';
import {
  Rule,
  DirectionRule,
  ConditionRule,
  ReactionRule,
} from '.';

export class ConnectorRule {
  annotonsConsecutive = new ConditionRule('annotonsConsecutive', 'Activities are consecutive?');
  effectDependency = new ConditionRule('effectDependency', 'Causal effect yes dependency?');
  effectDirection = new DirectionRule('effectDirection', 'Direction of Effect?');
  effectReactionProduct = new ReactionRule('effectReactionProduct', 'Causal Reaction Product?');
  subjectMFCatalyticActivity = new ConditionRule('subjectMFCatalyticActivity', 'Is subject MF a Catalytic Activity');
  objectMFCatalyticActivity = new ConditionRule('objectMFCatalyticActivity', 'Is object MF a Catalytic Activity');
  activityRegulatingProcess = new ConditionRule('activityRegulatingProcess', 'Activity regulating process');

  notes = [
    this.subjectMFCatalyticActivity,
    this.objectMFCatalyticActivity,
    this.effectDependency,
    this.annotonsConsecutive,
    this.activityRegulatingProcess
  ];

  public displaySection = {
    annotonsConsecutive: true,
    causalEffect: true,
    effectDependency: false,
    causalReactionProduct: false,
    process: false,
  }

  suggestedEdge = {
    r1: null,
    r2: null
  }

  constructor() {
    this.annotonsConsecutive.condition = true;
    this.effectDependency.condition = false;
    this.effectDirection.direction = noctuaFormConfig.causalEffect.options.positive;
    this.effectReactionProduct.reaction = noctuaFormConfig.causalReactionProduct.options.regulate;
  }

}