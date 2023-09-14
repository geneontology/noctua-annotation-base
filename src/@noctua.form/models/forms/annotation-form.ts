import { FormControl, FormBuilder, FormArray } from '@angular/forms';

import { Activity } from './../activity/activity';
import { ActivityFormMetadata } from './../forms/activity-form-metadata';
import { EntityGroupForm } from './entity-group-form';
import { Entity } from './../../models/activity/entity';
import { each } from 'lodash';
import { ActivityNode, ActivityNodeType } from '../activity/activity-node';
import { EntityForm } from './entity-form';
import { EvidenceForm } from './evidence-form';
import { Evidence } from '../activity/evidence';

export class AnnotationForm {
  entityGroupForms: EntityGroupForm[] = [];
  gp = new FormControl();
  goterm = new FormControl();
  evidenceForms: EvidenceForm[] = [];
  evidenceFormArray = new FormArray([]);

  private _metadata: ActivityFormMetadata;
  private _fb = new FormBuilder();

  constructor(metadata) {
    this._metadata = metadata;
  }

  createEntityForms(entities: ActivityNode[]) {
    const self = this;

    entities.forEach((entity: ActivityNode) => {
      const entityForm = new EntityForm(self._metadata, entity);
      if (!entity.skipEvidenceCheck) {
        entityForm.createEvidenceForms(entity);
      }

      if (entity.type === ActivityNodeType.GoMolecularEntity) {
        this.gp = this._fb.control(entityForm)
        // this.gp.setValue(entity.term.control.value)
      } else if (entity.type === ActivityNodeType.GoMolecularFunction) {
        this.goterm = this._fb.control(entityForm)
        this.createEvidenceForms(entity);
        // self.gp.setValue(entity.term.control.value)
      }

    });
  }


  createEvidenceForms(entity: ActivityNode) {
    const self = this;

    entity.predicate.evidence.forEach((evidence: Evidence) => {
      const evidenceForm = new EvidenceForm(self._metadata, entity, evidence);

      self.evidenceForms.push(evidenceForm);
      evidenceForm.onValueChanges(entity.predicate);
      //  evidenceForm.setTermValidator(termValidator(this.term, entity));
      self.evidenceFormArray.push(self._fb.group(evidenceForm));
    });
  }


  createMolecularEntityForm(gpData) {
    const self = this;

    each(gpData, (nodeGroup, nodeKey) => {
      console.log('nodeGroup', nodeGroup, nodeKey)

      this.createEntityForms(nodeGroup.nodes);
    });
  }


  populateActivity(activity: Activity) {

    this.entityGroupForms.forEach((entityGroupForm: EntityGroupForm) => {
      entityGroupForm.populateActivityNodes(activity);
    });

  }

  getErrors(error) {
    this.entityGroupForms.forEach((entityGroupForm: EntityGroupForm) => {
      entityGroupForm.getErrors(error);
    });
  }
}
