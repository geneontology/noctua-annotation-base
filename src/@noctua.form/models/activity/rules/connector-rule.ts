import { noctuaFormConfig } from './../../../noctua-form-config';
import { Entity } from '../entity';
import { DirectionRule } from './direction-rule';
import { DirectnessRule } from './directness-rule';
import { ChemicalRelationshipRule } from './chemical-relationship-rule';

export class ConnectorRule {
  directness = new DirectnessRule('directness',
    'Do you know the directness for how the upstream activity affects the downstream activity?');
  effectDirection = new DirectionRule('effectDirection', 'Direction of Effect?');
  chemicalRelationship = new ChemicalRelationshipRule('chemicalRelationship')

  displaySection = {
    directness: true,
    causalEffect: true,
  };

  constructor() {
    this.directness.directness = noctuaFormConfig.directness.options.known;
    this.effectDirection.direction = noctuaFormConfig.causalEffect.options.positive;
    this.chemicalRelationship.relation = noctuaFormConfig.chemicalRelationship.options.chemicalRegulates
  }
}
