import { NoctuaFormUtils } from './../../utils/noctua-form-utils';

export interface EntityBase {
  id: string;
  label: string;
}

export class Entity implements EntityBase {

  id: string;
  label: string;
  url: string;
  modelId: string;
  classExpression: any;
  highlight: boolean;
  modified: boolean;
  termHistory: Entity[] = [];
  displayId: string;

  private _uuid: string;

  constructor(_id: string, _label: string, _url?: string, _uuid?: string, _modelId?: string) {
    this.id = _id;
    this.label = _label;
    this.url = _url;
    this.uuid = _uuid;
    this.modelId = _modelId;
  }

  static createEntity(value: Partial<EntityBase>) {
    const entity = new Entity(value.id, value.label);

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
