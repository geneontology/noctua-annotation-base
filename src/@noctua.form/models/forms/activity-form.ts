import { FormControl, FormBuilder, FormArray } from '@angular/forms';

import { Activity } from './../activity/activity';
import { ActivityFormMetadata } from './../forms/activity-form-metadata';
import { EntityGroupForm } from './entity-group-form';
import { Entity } from './../../models/activity/entity';
import { each } from 'lodash';
import { ActivityNode } from '../activity';
import { EntityForm } from './entity-form';

export class ActivityForm {
  entityForms: EntityForm[] = [];
  bpOnlyEdge = new FormControl();
  ccOnlyEdge = new FormControl();
  entityFormArray = new FormArray([]);

  private _metadata: ActivityFormMetadata;
  private _fb = new FormBuilder();

  constructor(metadata) {
    this._metadata = metadata;
  }

  createEntityForms(entities: ActivityNode[]) {
    const self = this;

    this.entityForms = [];
    entities.forEach((entity: ActivityNode) => {
      if (entity.visible) {
        const entityForm = new EntityForm(self._metadata, entity);
        if (!entity.skipEvidence) {
          entityForm.createEvidenceForms(entity);
        }
        self.entityForms.push(entityForm);
        self.entityFormArray.push(self._fb.group(entityForm))
      }
    });
  }

  populateActivityNodes(activity: Activity) {
    const self = this;

    self.entityForms.forEach((entityForm: EntityForm) => {
      entityForm.populateTerm();
    });

    if (this.bpOnlyEdge.value) {
      activity.bpOnlyEdge = new Entity(this.bpOnlyEdge.value.id, this.bpOnlyEdge.value.label);
    }
  }

  getErrors(error) {
    const self = this;

    self.entityForms.forEach((entityForm: EntityForm) => {
      entityForm.getErrors(error);
    });
  }

}
