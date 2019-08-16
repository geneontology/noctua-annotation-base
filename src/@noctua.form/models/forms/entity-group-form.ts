import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Annoton } from './../annoton/annoton';
import { AnnotonFormMetadata } from './../forms/annoton-form-metadata';
import { EntityForm } from './entity-form';


declare const require: any;
const each = require('lodash/forEach');

export class EntityGroupForm {
    name = '';
    entityForms: EntityForm[] = [];
    entityGroup = new FormArray([]);

    _metadata: AnnotonFormMetadata;
    private _fb = new FormBuilder();

    constructor(metadata) {
        this._metadata = metadata;
    }

    createEntityForms(entities) {
        const self = this;

        this.entityForms = [];
        entities.forEach((entity) => {
            const entityForm = new EntityForm(self._metadata, entity);

            self.entityForms.push(entityForm);
            self.entityGroup.push(self._fb.group(entityForm));
        });
    }

    populateAnnotonNodes(annoton: Annoton) {
        const self = this;

        self.entityForms.forEach((entityForm: EntityForm) => {
            entityForm.populateTerm();
        });
    }

    getErrors(error) {
        const self = this;

        self.entityForms.forEach((entityForm: EntityForm) => {
            entityForm.getErrors(error);
        });
    }
}

