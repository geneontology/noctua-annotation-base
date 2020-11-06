import { AnnotonError, AnnotonNode, Entity, ErrorLevel, ErrorType } from '../../../models/annoton';

export enum ViolationType {
  cardinality = 'cardinality',
  relation = 'relations'
}

export class Violation {
  constructor(public node: Partial<AnnotonNode>, public type: ViolationType) {
  }

  getDisplayError() {

  }
}

export class CardinalityViolation extends Violation {
  subject: Partial<AnnotonNode>;
  constructor(public node: Partial<AnnotonNode>,
    public predicate: Entity,
    public nobjects: Number,
    public cardinality: string) {
    super(node, ViolationType.cardinality);
    this.subject = node;
  }

  getDisplayError() {
    const self = this;
    const meta = {
      aspect: '',
      subjectNode: {
        label: self.subject?.term?.label
      },
      edge: {
        label: self.predicate?.label
      },
    };

    const error = new AnnotonError(ErrorLevel.error, ErrorType.cardinality, 'Only one ' +
      meta.edge.label + ' is allowed', meta);

    return error;
  }
}

export class RelationViolation extends Violation {
  subject: Partial<AnnotonNode>;
  predicate: Entity;
  object: Partial<AnnotonNode>;

  constructor(public node: Partial<AnnotonNode>) {
    super(node, ViolationType.relation);
    this.subject = node;
  }

  getDisplayError() {
    const self = this;
    const meta = {
      aspect: '',
      subjectNode: {
        label: self.subject?.term?.label
      },
      edge: {
        label: self.predicate?.label
      },
      objectNode: {
        label: self.object?.term?.label
      },
    };

    const error = new AnnotonError(ErrorLevel.error, ErrorType.relation, 'Incorrect relationship between ' +
      meta.subjectNode.label + ' and ' + meta.objectNode.label, meta);

    return error;
  }
}



