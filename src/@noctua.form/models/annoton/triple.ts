import { Annoton } from '@noctua.form';
import { CardTriple } from 'scard-graph-ts';
import { v4 as uuid } from 'uuid';

import { AnnotonNode } from './annoton-node';
import { Predicate } from './predicate';

export class Triple<T extends AnnotonNode | Annoton> {

  id
  object: T;
  predicate: Predicate;
  subject: T;

  private _grid: any[] = [];

  constructor(subject: T, predicate: Predicate, object: T) {
    this.id = uuid();
    this.subject = subject;
    this.object = object;
    this.predicate = predicate;
  }


}

export class AnnotonTriple<T extends Annoton> {
  objectId: string;
  predicateId: string;
  subjectId: string;
  id: string;
  title: string;
  triples: AnnotonTriple<T>[];
  object: T;
  predicate: T;
  subject: T;

  constructor(subject: T, predicate: T, object: T) {
    // super(subject, predicate, object);

    this.id = uuid();
    this.subject = subject;
    this.object = object;
    this.predicate = predicate;
  }

  getTripleIds() {
    return {
      subjectId: this.subject.id,
      predicateId: this.predicate.id,
      objectId: this.object.id
    }
  }

}
