import { Cam, Contributor, Group, Organism } from 'noctua-form-base';
import { each } from 'lodash';

export class SearchCriteria {
    gps: any[] = [];
    goterms: any[] = [];
    pmids: any[] = [];
    contributors: Contributor[] = [];
    groups: Group[] = [];
    organisms: Organism[] = [];
    states: any[] = [];

    constructor() {
    }

    build() {
        const self = this;
        let query = 'offset=0&limit=50';

        each(self.gps, (gp) => {
            query += `&gp=${gp.id}`;
        });

        return query;
    }
}