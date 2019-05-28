import { Cam, Contributor, Group, Organism } from 'noctua-form-base';

export class SearchCriteria {
    gps: any[] = [];
    goTerms: any[] = [];
    pmids: any[] = [];
    contributors: Contributor[] = [];
    groups: Group[] = [];
    organisms: Organism[] = [];

    constructor() {
    }
}