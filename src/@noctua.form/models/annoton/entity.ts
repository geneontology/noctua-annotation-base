import { NoctuaFormUtils } from './../../utils/noctua-form-utils';

export interface EntityBase {
  id: string;
  label: string;
}

export class Entity implements EntityBase {

  classExpression: any;
  highlight: boolean;
  modified: boolean;
  termHistory: Entity[] = [];
  displayId: string;
  annotonDisplayId: string;

  private _uuid: string;

  constructor(public id: string,
    public label: string,
    public url?: string,
    uuid?: string,
    public modelId?: string) {
    this.uuid = uuid;
  }

  static createEntity(value: Partial<EntityBase>) {
    const entity = new Entity(value?.id, value?.label);

    return entity;
  }

  get uuid() {
    return this._uuid;
  }

  set uuid(uuid: string) {
    this._uuid = uuid;
    this.displayId = 'noc-node-' + NoctuaFormUtils.cleanID(uuid);
  }

  hasValue() {
    const result = this.id !== null && this.id !== undefined && this.id.length > 0;

    return result;
  }
}
