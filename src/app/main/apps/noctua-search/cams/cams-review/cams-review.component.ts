

import { Component, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';


import {
  Cam,
  AnnotonType,
  Contributor,
  NoctuaUserService,
  NoctuaFormConfigService,
  NoctuaFormMenuService,
  NoctuaAnnotonFormService,
  CamService,
  noctuaFormConfig,
  CamsService,
  AnnotonNode,
  EntityLookup,
  NoctuaLookupService,
  EntityDefinition
} from 'noctua-form-base';

import { takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';
import { noctuaAnimations } from '@noctua/animations';
import { FormGroup, FormControl } from '@angular/forms';
import { NoctuaReviewSearchService } from '@noctua.search/services/noctua-review-search.service';

@Component({
  selector: 'noc-cams-review',
  templateUrl: './cams-review.component.html',
  styleUrls: ['./cams-review.component.scss'],
  animations: noctuaAnimations,
})
export class CamsReviewComponent implements OnInit, OnDestroy {
  AnnotonType = AnnotonType;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;

  searchForm: FormGroup;
  cams: Cam[] = [];
  terms: any[];
  searchResults = [];
  modelId = '';

  searchFormType = 'replace';
  matchedCount = 0;

  tableOptions = {
    hideHeader: true,
  };

  noctuaFormConfig = noctuaFormConfig;

  searchCriteria: any = {};
  categories: any;

  gpNode: AnnotonNode;
  termNode: AnnotonNode;

  private _unsubscribeAll: Subject<any>;

  constructor
    (private route: ActivatedRoute,
      private camsService: CamsService,
      private noctuaDataService: NoctuaDataService,
      public noctuaReviewSearchService: NoctuaReviewSearchService,
      public noctuaUserService: NoctuaUserService,
      private noctuaLookupService: NoctuaLookupService,
      public noctuaFormConfigService: NoctuaFormConfigService,
      public noctuaAnnotonFormService: NoctuaAnnotonFormService,
      public noctuaFormMenuService: NoctuaFormMenuService) {

    this._unsubscribeAll = new Subject();

    this.categories = this.noctuaFormConfigService.findReplaceCategories;


    this.camsService.onCamsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cams => {
        if (!cams) {
          return;
        }
        this.cams = cams;
        const ids = cams.map((cam: Cam) => {
          return cam.modelId;
        });

        console.log(ids)
        this.noctuaReviewSearchService.searchCriteria['ids'] = ids;
        this.matchedCount = this.camsService.calculateMatchedCount();
      });


    this.gpNode = EntityDefinition.generateBaseTerm([EntityDefinition.GoMolecularEntity]);
    this.termNode = EntityDefinition.generateBaseTerm([
      EntityDefinition.GoMolecularFunction,
      EntityDefinition.GoBiologicalProcess,
      EntityDefinition.GoCellularComponent,
      EntityDefinition.GoBiologicalPhase,
      EntityDefinition.GoAnatomicalEntity,
      EntityDefinition.GoCellTypeEntity
    ]);

  }

  ngOnInit(): void {
    const self = this;

    this.searchForm = this.createSearchForm(this.categories.selected);
    this.onValueChanges();

    this.noctuaReviewSearchService.onCamsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cams => {
        if (!cams) {
          return;
        }
        // this.cams = cams;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  selectSearchFormType(searchFormType) {
    this.searchFormType = searchFormType;
  }

  viewAsModel(cam: Cam) {
    cam.displayType = noctuaFormConfig.camDisplayType.options.model;
  }

  viewAsActivities(cam: Cam) {
    cam.displayType = noctuaFormConfig.camDisplayType.options.entity;
  }


  createSearchForm(selectedCategory) {
    return new FormGroup({
      findWhat: new FormControl(),
      replaceWith: new FormControl(),
      category: new FormControl(selectedCategory),
    });
  }

  search() {
    const value = this.searchForm.value;
    const findWhat = value.findWhat;
    const filterType = 'terms';

    this.noctuaReviewSearchService.searchCriteria[filterType] = [findWhat];
    this.noctuaReviewSearchService.updateSearch();

    const filter = {
      terms: [findWhat]
    };
    this.camsService.findInCams(filter);
  }

  replace() {

  }
  replaceAll() {

  }
  findNext() {

  }

  findPrevious() {

  }

  selected(e) {
    console.log(e)
  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  onValueChanges() {
    const self = this;
    const lookupFunc = self.noctuaLookupService.lookupFunc()

    this.searchForm.get('findWhat').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      const lookup: EntityLookup = self.termNode.termLookup;
      lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });
    });

    this.searchForm.get('replaceWith').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {

    });
  }

  compareCategory(a: any, b: any) {
    if (a && b) {
      return (a.name === b.name);
    }
    return false;
  }

  close() {
    this.panelDrawer.close();
  }
}
