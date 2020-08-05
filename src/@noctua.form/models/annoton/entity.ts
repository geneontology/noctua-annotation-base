
import { EntityLookup } from './entity-lookup';
declare const require: any;
const uuid = require('uuid/v1');

export interface EntityBase {
  id: string;
  label: string;
}

export class Entity implements EntityBase {
  uuid: string;
  id: string;
  label: string;
  url: string;
  modelId: string;
  classExpression: any;
  highlight: boolean;

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

  hasValue() {
    const result = this.id !== null && this.id !== undefined && this.id.length > 0;

    return result;
  }
} 
