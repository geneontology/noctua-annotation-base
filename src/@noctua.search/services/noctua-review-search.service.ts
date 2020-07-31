import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import {
    Cam,
    NoctuaFormConfigService,
    NoctuaUserService,
    Entity,
} from 'noctua-form-base';
import { SearchCriteria } from './../models/search-criteria';
import { saveAs } from 'file-saver';
import { forOwn, each, find, groupBy } from 'lodash';
import { CurieService } from '@noctua.curie/services/curie.service';
import { CamPage } from './../models/cam-page';
import { SearchHistory } from './../models/search-history';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';

declare const require: any;

const amigo = require('amigo2');

@Injectable({
    providedIn: 'root'
})
export class NoctuaReviewSearchService {
    linker = new amigo.linker();

    searchHistory: SearchHistory[] = [];

    onSearchCriteriaChanged: BehaviorSubject<any>;
    onSearchHistoryChanged: BehaviorSubject<any>;
    curieUtil: any;
    cams: any[] = [];
    camPage: CamPage;
    searchCriteria: SearchCriteria;
    searchApi = environment.searchApi;
    separator = '@@';
    loading = false;
    onCamsChanged: BehaviorSubject<any>;
    onCamsReviewChanged: BehaviorSubject<any>;
    onCamsPageChanged: BehaviorSubject<any>;
    onCamChanged: BehaviorSubject<any>;
    searchSummary: any = {};

    filterType = {
        gps: 'gps',
        terms: 'terms',
        pmids: 'pmids',
    };

    constructor(
        private httpClient: HttpClient,
        private noctuaDataService: NoctuaDataService,
        public noctuaFormConfigService: NoctuaFormConfigService,
        public noctuaUserService: NoctuaUserService,
        private curieService: CurieService) {
        this.onCamsChanged = new BehaviorSubject([]);
        this.onCamsReviewChanged = new BehaviorSubject([]);
        this.onCamsPageChanged = new BehaviorSubject(null);
        this.onCamChanged = new BehaviorSubject([]);
        this.onSearchHistoryChanged = new BehaviorSubject(null);

        this.searchCriteria = new SearchCriteria();
        this.onSearchCriteriaChanged = new BehaviorSubject(null);
        this.curieUtil = this.curieService.getCurieUtil();

        this.onSearchCriteriaChanged.subscribe((searchCriteria: SearchCriteria) => {
            if (!searchCriteria) {
                return;
            }

            this.getCams(searchCriteria).subscribe((response: any) => {
                this.cams = response;
                this.onCamsChanged.next(this.cams);
            });

            this.getCamsCount(searchCriteria).subscribe((response: any) => {
                this.camPage = new CamPage();
                this.camPage.total = response.n;
                this.onCamsPageChanged.next(this.camPage);
            });

            const element = document.querySelector('#noc-results');

            if (element) {
                element.scrollTop = 0;
            }
        });
    }


    search(searchCriteria) {
        this.searchCriteria = new SearchCriteria();

        searchCriteria.pmid ? this.searchCriteria.pmids.push(searchCriteria.pmid) : null;
        searchCriteria.term ? this.searchCriteria.terms.push(searchCriteria.term) : null;
        searchCriteria.id ? this.searchCriteria.ids.push(searchCriteria.id) : null;
        searchCriteria.gp ? this.searchCriteria.gps.push(searchCriteria.gp) : null;

        this.updateSearch();

    }

    getPage(pageNumber: number, pageSize: number) {
        this.searchCriteria.camPage.pageNumber = pageNumber;
        this.searchCriteria.camPage.size = pageSize;
        this.updateSearch();
    }


    updateSearch(save: boolean = true) {
        this.searchCriteria.updateFiltersCount();
        this.onSearchCriteriaChanged.next(this.searchCriteria);

        if (save) {
            this.saveHistory();
        }
    }

    filter(filterType, filter) {
        this.searchCriteria[filterType].push(filter);
        this.updateSearch();
    }

    removeFilterType(filterType: string) {
        this.searchCriteria[filterType] = [];
        this.updateSearch();
    }

    removeFilter(filterType) {
        this.searchCriteria[filterType] = null;
    }

    clearSearchCriteria() {
        this.searchCriteria = new SearchCriteria();
        this.updateSearch();
    }

    saveHistory() {
        const searchHistoryItem = new SearchHistory(this.searchCriteria);
        this.searchHistory.unshift(searchHistoryItem);

        this.onSearchHistoryChanged.next(this.searchHistory);
    }

    clearHistory() {
        this.searchHistory = [];
        this.onSearchHistoryChanged.next(this.searchHistory);
    }

    downloadSearchConfig() {
        const blob = new Blob([JSON.stringify(this.searchCriteria, undefined, 2)], { type: 'application/json' });
        saveAs(blob, 'search-filter.json');
    }

    uploadSearchConfig(searchCriteria) {
        this.searchCriteria = new SearchCriteria();

        if (searchCriteria.ids) {
            this.searchCriteria.ids = searchCriteria.ids;
        }
        if (searchCriteria.pmids) {
            this.searchCriteria.pmids = searchCriteria.pmids;
        }
        if (searchCriteria.terms) {
            this.searchCriteria.terms = searchCriteria.terms;
        }
        if (searchCriteria.gps) {
            this.searchCriteria.gps = searchCriteria.gps;
        }

        this.updateSearch();
    }

    getCams(searchCriteria: SearchCriteria): Observable<any> {
        const self = this;
        const query = searchCriteria.build();
        const url = `${this.searchApi}/models?${query}`;

        self.loading = true;

        return this.httpClient
            .get(url)
            .pipe(
                map(res => this.addCam(res)),
                finalize(() => {
                    self.loading = false;
                })
            );
    }

    getCamsCount(searchCriteria: SearchCriteria): Observable<any> {
        const self = this;
        const query = searchCriteria.build();
        const url = `${this.searchApi}/models?${query}&count`;

        return this.httpClient
            .get(url)
            .pipe();
    }

    addCam(res) {
        const self = this;
        const result: Array<Cam> = [];

        res.models.forEach((response) => {
            const modelId = response.id;
            const cam = new Cam();

            cam.graph = null;
            cam.id = modelId;
            cam.state = self.noctuaFormConfigService.findModelState(response.state);
            cam.title = response.title;
            cam.date = response.date;

            cam.model = Object.assign({}, {
                modelInfo: this.noctuaFormConfigService.getModelUrls(modelId)
            });


            result.push(cam);
        });

        return result;
    }

    addCamTerms(res) {
        const self = this;
        const result: Array<Entity> = [];

        res.forEach((response) => {
            const term = new Entity(
                self.curieUtil.getCurie(response.id.value),
                response.label.value
            );

            result.push(term);
        });

        return result;
    }

}
