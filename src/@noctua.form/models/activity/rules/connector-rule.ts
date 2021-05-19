import { noctuaFormConfig } from './../../../noctua-form-config';
import { Entity } from '../entity';
import { DirectionRule } from './direction-rule';
import { MechanismRule } from './mechanism-rule';

export class ConnectorRule {
  mechanism = new MechanismRule('mechanism',
    'Do you know the mechanism for how the upstream activity affects the downstream activity?');
  effectDirection = new DirectionRule('effectDirection', 'Direction of Effect?');

  rEdge: Entity;

  notes = [
    this.mechanism,
    this.effectDirection
  ];

  displaySection = {
    mechanism: true,
    causalEffect: true,
  };

  constructor() {
    this.mechanism.mechanism = noctuaFormConfig.mechanism.options.known;
    this.effectDirection.direction = noctuaFormConfig.causalEffect.options.positive;
  }
}
