import { noctuaFormConfig } from './../../../noctua-form-config';

export class ConnectorRule {
  directness = noctuaFormConfig.directness.direct;
  effectDirection = noctuaFormConfig.causalEffect.positive;
  activityRelationship = noctuaFormConfig.activityRelationship.regulation;
  activityMoleculeRelationship = noctuaFormConfig.activityMoleculeRelationship.product;
  moleculeActivityRelationship = noctuaFormConfig.moleculeActivityRelationship.regulates;

  displaySection = {
    directness: true,
    causalEffect: true,
  };

  constructor() {

  }
}
