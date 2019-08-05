import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { noctuaFormConfig } from './../../../noctua-form-config';
import {
  DirectionRule,
  ConditionRule,
  ReactionRule,
} from '.';
import { Entity } from '../entity';

export class ConnectorRule {
  annotonsConsecutive = new ConditionRule('annotonsConsecutive', 'Activities are consecutive?');
  effectDependency = new ConditionRule('effectDependency', 'Causal effect yes dependency?');
  effectDirection = new DirectionRule('effectDirection', 'Direction of Effect?');
  effectReactionProduct = new ReactionRule('effectReactionProduct', 'Causal Reaction Product?');
  subjectMFCatalyticActivity = new ConditionRule('subjectMFCatalyticActivity', 'Is subject MF a Catalytic Activity');
  objectMFCatalyticActivity = new ConditionRule('objectMFCatalyticActivity', 'Is object MF a Catalytic Activity');
  activityRegulatingProcess = new ConditionRule('activityRegulatingProcess', 'Activity regulating process');

  r1Edge: Entity;
  r2Edge: Entity;

  notes = [
    this.subjectMFCatalyticActivity,
    this.objectMFCatalyticActivity,
    this.effectDependency,
    this.annotonsConsecutive,
    this.activityRegulatingProcess
  ];

  displaySection = {
    annotonsConsecutive: true,
    causalEffect: true,
    effectDependency: false,
    causalReactionProduct: false,
    process: false,
  }

  constructor() {
    this.annotonsConsecutive.condition = true;
    this.effectDependency.condition = false;
    this.effectDirection.direction = noctuaFormConfig.causalEffect.options.positive;
    this.effectReactionProduct.reaction = noctuaFormConfig.causalReactionProduct.options.regulate;
  }
}