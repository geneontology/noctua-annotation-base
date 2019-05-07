import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as _ from 'lodash';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { map, filter, reduce, catchError, retry, tap } from 'rxjs/operators';

import { NoctuaUtils } from '@noctua/utils/noctua-utils';
import { SparqlService } from '@noctua.sparql/services/sparql/sparql.service';
import { Cam, Curator } from 'noctua-form-base';

export interface Cam202 {
    model?: {};
    annotatedEntity?: {};
    relationship?: string;
    aspect?: string;
    term?: {};
    relationshipExt?: string;
    extension?: string;
    evidence?: string;
    reference?: string;
    with?: string;
    assignedBy?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NoctuaSearchService {
    baseUrl = environment.spaqrlApiUrl;
    curieUtil: any;
    cams: any[] = [];
    onCamsChanged: BehaviorSubject<any>;

    constructor(private httpClient: HttpClient, private sparqlService: SparqlService) {
        this.onCamsChanged = new BehaviorSubject({});

    }

    search(searchCriteria) {

        if (searchCriteria.goTerm) {
            this.sparqlService.getCamsByGoTerm(searchCriteria.goTerm).subscribe((response: any) => {
                if (searchCriteria.curator) {
                    this.cams = this.filterByCurator(response, searchCriteria.curator)
                } else {
                    this.cams = response;
                }
                this.sparqlService.cams = this.cams
                this.sparqlService.onCamsChanged.next(this.cams);
            });
        }

        if (searchCriteria.gp) {
            this.sparqlService.getCamsByGP(searchCriteria.gp).subscribe((response: any) => {
                if (searchCriteria.curator) {
                    this.cams = this.filterByCurator(response, searchCriteria.curator)
                } else {
                    this.cams = response;
                }
                this.cams = this.sparqlService.cams = response;
                this.sparqlService.onCamsChanged.next(this.cams);
            });
        }

        if (searchCriteria.pmid) {
            this.sparqlService.getCamsByPMID(searchCriteria.pmid).subscribe((response: any) => {
                if (searchCriteria.curator) {
                    this.cams = this.filterByCurator(response, searchCriteria.curator)
                } else {
                    this.cams = response;
                }
                this.cams = this.sparqlService.cams = response;
                this.sparqlService.onCamsChanged.next(this.cams);
            });
        }

        if (searchCriteria.organism) {
            this.sparqlService.getCamsBySpecies(searchCriteria.organism).subscribe((response: any) => {
                this.cams = this.sparqlService.cams = response;
                this.sparqlService.onCamsChanged.next(this.cams);
            });
        }
    }

    filterByCurator(cams, orcid) {
        return _.filter(cams, (cam: Cam) => {
            let found = _.find(cam.contributors, (contributor: Curator) => {
                return contributor.orcid === orcid;
            });

            return found ? true : false
        });
    }

    searchByCurator(searchCriteria) {
        if (searchCriteria.curator) {
            this.sparqlService.getCamsByCurator(searchCriteria.curator).subscribe((response: any) => {
                this.cams = this.sparqlService.cams = response;
                this.sparqlService.onCamsChanged.next(this.cams);
            });
        }
    }
}
