import { Clause } from './clause';
import { Dictionary, Many, map, mapValues, flatMap, castArray } from 'lodash';

export class Prefix extends Clause {
    private _prefix

    constructor(prefix: any[]) {
        super();
        this._prefix = prefix;
    }

    build() {
        let prefixed = map(this._prefix, (item) => {
            return 'PREFIX' + item;
        })
        return `${[...prefixed].join('\n')}`;
    }
}
