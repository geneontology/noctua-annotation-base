import { noctuaFormConfig } from './../../../noctua-form-config';
import { Entity } from '../entity';
import { ConditionRule } from './condition-rule';
import { DirectionRule } from './direction-rule';
import { MechanismRule } from './mechanism-rule';

export class ConnectorRule {
  mechanism = new MechanismRule('mechanism',
    'Do you know the mechanism for how the upstream activity affects the downstream activity?');
  effectDirection = new DirectionRule('effectDirection', 'Direction of Effect?');
  activityRegulatingProcess = new ConditionRule('activityRegulatingProcess', 'Activity regulating process');

  r1Edge: Entity;

  notes = [
    this.mechanism,
    this.activityRegulatingProcess
  ];

  displaySection = {
    mechanism: true,
    causalEffect: true,
  };

  constructor() {
    this.mechanism.mechanism = noctuaFormConfig.mechanism.options.direct;
    this.effectDirection.direction = noctuaFormConfig.causalEffect.options.positive;
  }
}
