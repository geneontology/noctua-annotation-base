import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import {
    Cam,
    Entity,
    CamsService,
    CamQueryMatch,
} from 'noctua-form-base';
import { SearchCriteria } from './../models/search-criteria';
import { saveAs } from 'file-saver';
import { each, find } from 'lodash';
import { CurieService } from '@noctua.curie/services/curie.service';
import { CamPage } from './../models/cam-page';
import { SearchHistory } from './../models/search-history';
import { NoctuaUtils } from '@noctua/utils/noctua-utils';

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

    matchedEntities: Entity[] = [];
    matchedCountCursor = 0;
    matchedCount = 0;
    currentMatchedEnity: Entity;

    filterType = {
        gps: 'gps',
        terms: 'terms',
        pmids: 'pmids',
    };

    constructor(
        private httpClient: HttpClient,
        private camsService: CamsService,
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
                // this.cams = response;
                this.onCamsChanged.next(this.cams);
                this.matchedCountCursor = 0;
                this.calculateMatched();
                this.findNext();
            });

            const element = document.querySelector('#noc-review-results');

            if (element) {
                element.scrollTop = 0;
            }
        });

        this.camsService.onCamsChanged
            .subscribe(cams => {
                if (!cams) {
                    return;
                }
                this.cams = cams;

                const ids = cams.map((cam: Cam) => {
                    cam.expanded = true;
                    return cam.modelId;
                });
                this.onCamsChanged.next(this.cams);
                // this.updateSearch();
                this.searchCriteria['ids'] = ids;

            });
    }

    scroll(id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView();
        }
    }

    search(searchCriteria) {
        this.searchCriteria = new SearchCriteria();

        searchCriteria.pmid ? this.searchCriteria.pmids.push(searchCriteria.pmid) : null;
        searchCriteria.term ? this.searchCriteria.terms.push(searchCriteria.term) : null;
        searchCriteria.id ? this.searchCriteria.ids.push(searchCriteria.id) : null;
        searchCriteria.gp ? this.searchCriteria.gps.push(searchCriteria.gp) : null;

        this.updateSearch();

    }

    findNext() {
        if (this.matchedCount === 0) {
            return;
        }
        // so it circulates
        this.matchedCountCursor = (this.matchedCountCursor + 1) % this.matchedCount;
        this.currentMatchedEnity = this.matchedEntities[this.matchedCountCursor];

        this.camsService.expandMatch(this.currentMatchedEnity.uuid);
        this.scroll(NoctuaUtils.cleanID(this.currentMatchedEnity.uuid));
        this.camsService.currentHighlightedUuid = this.currentMatchedEnity.uuid;
        return this.currentMatchedEnity;
    }

    findPrevious() {
        if (this.matchedCount === 0) {
            return;
        }
        this.matchedCountCursor = this.matchedCountCursor - 1;
        if (this.matchedCountCursor < 0) {
            this.matchedCountCursor = this.matchedCount - 1;
        }
        this.currentMatchedEnity = this.matchedEntities[this.matchedCountCursor];
        this.scroll(NoctuaUtils.cleanID(this.currentMatchedEnity.uuid));
        this.camsService.currentHighlightedUuid = this.currentMatchedEnity.uuid;
        return this.currentMatchedEnity;
    }

    replaceAll(replaceWith) {
        this.camsService.replace(this.matchedEntities, replaceWith);
    }

    replace(replaceWith) {
        this.camsService.replace([this.currentMatchedEnity], replaceWith);
    }

    bulkEdit() {
        this.camsService.bulkEdit();
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


    addCam(res) {
        const self = this;
        const result: Array<Cam> = [];

        res.models.forEach((response) => {

            const modelId = response.id;
            const cam: Cam = find(self.cams, (inCam: Cam) => {
                return inCam.modelId === modelId;
            });

            if (cam) {
                cam.queryMatch = new CamQueryMatch();
                each(response.query_match, (queryMatch, key) => {
                    cam.queryMatch.terms.push(
                        ...queryMatch.map(v1 => {
                            return new Entity(
                                self.curieUtil.getCurie(key),
                                '',
                                null,
                                self.curieUtil.getCurie(v1),
                                cam.modelId
                            );
                        }));
                });


                cam.applyFilter();
                console.log(cam.queryMatch)
            }

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

    calculateMatchedCountNumber(): number {
        const matchCount = this.cams.reduce((total, currentValue) => {
            total += currentValue.matchedCount;
            return total;
        }, 0);

        return matchCount;
    }


    calculateMatched() {
        this.matchedEntities = this.cams.reduce((total: Entity[], currentValue: Cam) => {
            if (currentValue.queryMatch && currentValue.queryMatch.terms) {
                total.push(...currentValue.queryMatch.terms);
            }

            return total;
        }, []);

        this.matchedCount = this.matchedEntities.length;
        this.matchedCountCursor = 0;
    }

}