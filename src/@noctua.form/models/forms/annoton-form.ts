import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { merge, Observable, Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');

import { Annoton } from './../annoton/annoton';
import { AnnotonNode } from './../annoton/annoton-node';
import { AnnotonFormMetadata } from './../forms/annoton-form-metadata';
import { EntityGroupForm } from './entity-group-form';
import { termValidator } from './validators/term-validator';
import { EntityLookup } from '../annoton/entity-lookup';
import { Entity } from '../annoton/entity';
import { EntityForm } from './entity-form';

export class AnnotonForm {
  entityGroupForms: EntityGroupForm[] = [];
  molecularEntityForm: EntityForm;
  molecularEntity: FormGroup;
  bpOnlyEdge = new FormControl();
  fd = new FormArray([]);

  _metadata: AnnotonFormMetadata;

  private _fb = new FormBuilder();

  constructor(metadata, gp?: AnnotonNode) {
    this._metadata = metadata;

    if (gp) {
      // this.gp.setValue(gp.getTerm());
      //  this.gp.setValidators(termValidator(gp));
    }
  }

  createMolecularEntityForm(molecularEntity: AnnotonNode) {
    const self = this;

    self.molecularEntityForm = new EntityForm(self._metadata, molecularEntity);
    // self.molecularEntityForm.onValueChanges(molecularEntity.termLookup);
    self.molecularEntity = self._fb.group(self.molecularEntityForm);
  }

  createFunctionDescriptionForm(fdData) {
    const self = this;

    each(fdData, (nodeGroup, nodeKey) => {
      const entityGroupForm = new EntityGroupForm(this._metadata);

      this.entityGroupForms.push(entityGroupForm);
      entityGroupForm.name = nodeKey;
      entityGroupForm.createEntityForms(nodeGroup.nodes);
      self.fd.push(self._fb.group(entityGroupForm));
    });
  }

  populateAnnoton(annoton: Annoton) {
    const gpNode = annoton.getGPNode();
    //  gpNode.term = new Entity(this.gp.value.id, this.gp.value.label);

    this.molecularEntityForm.populateTerm();
    this.entityGroupForms.forEach((entityGroupForm: EntityGroupForm) => {
      entityGroupForm.populateAnnotonNodes(annoton);
    });
  }


  getErrors(error) {
    this.entityGroupForms.forEach((entityGroupForm: EntityGroupForm) => {
      entityGroupForm.getErrors(error);
    });
  }
}
