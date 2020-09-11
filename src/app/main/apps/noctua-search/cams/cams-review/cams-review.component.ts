

import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';


import {
  Cam,
  AnnotonType,
  NoctuaUserService,
  NoctuaFormConfigService,
  NoctuaFormMenuService,
  NoctuaAnnotonFormService,
  noctuaFormConfig,
  CamsService,
  AnnotonNode,
  EntityLookup,
  NoctuaLookupService,
  EntityDefinition,
  CamService,
  Entity
} from 'noctua-form-base';

import { takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';
import { noctuaAnimations } from '@noctua/animations';
import { FormGroup, FormControl } from '@angular/forms';
import { NoctuaReviewSearchService } from '@noctua.search/services/noctua-review-search.service';
import { NoctuaSearchDialogService } from '../../services/dialog.service';
import { cloneDeep } from 'lodash';
import { ArtReplaceCategory } from '@noctua.search/models/review-mode';

@Component({
  selector: 'noc-cams-review',
  templateUrl: './cams-review.component.html',
  styleUrls: ['./cams-review.component.scss'],
  animations: noctuaAnimations,
})
export class CamsReviewComponent implements OnInit, OnDestroy {
  AnnotonType = AnnotonType;
  ArtReplaceCategory = ArtReplaceCategory;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;

  searchForm: FormGroup;
  cams: Cam[] = [];
  terms: any[];
  searchResults = [];

  enableReplace = false;

  tableOptions = {
    reviewMode: true,
  };

  noctuaFormConfig = noctuaFormConfig;

  searchCriteria: any = {};
  categories: any;

  gpNode: AnnotonNode;
  termNode: AnnotonNode;
  termReplaceNode: AnnotonNode;
  selectedCategoryName;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private camService: CamService,
    private camsService: CamsService,
    public noctuaReviewSearchService: NoctuaReviewSearchService,
    public noctuaUserService: NoctuaUserService,
    private noctuaSearchDialogService: NoctuaSearchDialogService,
    private noctuaLookupService: NoctuaLookupService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotonFormService: NoctuaAnnotonFormService,
    public noctuaFormMenuService: NoctuaFormMenuService) {

    this._unsubscribeAll = new Subject();

    this.categories = cloneDeep(this.noctuaFormConfigService.findReplaceCategories);

    this.noctuaReviewSearchService.onCamsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cams => {
        if (!cams) {
          return;
        }
        this.cams = cams;
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
    this.searchForm = this.createSearchForm(this.categories.selected);
    this.onValueChanges();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  resetTermNode() {
    this.termNode = EntityDefinition.generateBaseTerm([
      EntityDefinition.GoMolecularFunction,
      EntityDefinition.GoBiologicalProcess,
      EntityDefinition.GoCellularComponent,
      EntityDefinition.GoBiologicalPhase,
      EntityDefinition.GoAnatomicalEntity,
      EntityDefinition.GoCellTypeEntity
    ]);
  }

  viewAsModel(cam: Cam) {
    cam.displayType = noctuaFormConfig.camDisplayType.options.model;
  }

  viewAsActivities(cam: Cam) {
    cam.displayType = noctuaFormConfig.camDisplayType.options.entity;
  }

  createSearchForm(selectedCategory) {
    this.selectedCategoryName = selectedCategory.name;
    return new FormGroup({
      findWhat: new FormControl(),
      replaceWith: new FormControl(),
      category: new FormControl(selectedCategory),
    });
  }

  getClosure(rootTypes: Entity[]) {
    const s = [
      EntityDefinition.GoMolecularFunction,
      EntityDefinition.GoBiologicalProcess,
      EntityDefinition.GoCellularComponent,
      EntityDefinition.GoBiologicalPhase,
      EntityDefinition.GoAnatomicalEntity,
      EntityDefinition.GoCellTypeEntity
    ];

    const closures = s.filter(x => {
      return rootTypes.find(y => y.id === x.category)
    })

    console.log(closures);

    return closures;
  }

  search() {
    const value = this.searchForm.value;
    const findWhat = value.findWhat;
    const filterType = 'terms';

    this.noctuaReviewSearchService.searchCriteria[filterType] = [findWhat];
    this.noctuaReviewSearchService.updateSearch();

    // this.camsService.findInCams(filter);
  }

  replace() {
    const value = this.searchForm.value;
    const replaceWith = value.replaceWith;

    //  this.noctuaReviewSearchService.replace(replaceWith);
  }

  replaceAll() {
    const value = this.searchForm.value;
    const replaceWith = value.replaceWith;

    const success = (replace) => {
      if (replace) {
        this.noctuaReviewSearchService.replaceAll(replaceWith);
      }
    };

    this.noctuaSearchDialogService.openCamReplaceConfirmDialog(success);
  }

  findNext() {
    this.noctuaReviewSearchService.findNext();
  }

  findPrevious() {
    this.noctuaReviewSearchService.findPrevious();
  }

  resetCam(cam: Cam) {
    this.camService.loadCam(cam);
  }

  resetAll() {
    this.camsService.loadCams();
  }

  reviewChanges() {
    const success = (replace) => {
      if (replace) {
        this.noctuaReviewSearchService.bulkEdit();
        this.noctuaFormMenuService.closeRightDrawer();
      }
    };

    this.noctuaSearchDialogService.openCamReviewChangesDialog(success);
  }

  findSelected(value) {
    const closures = this.getClosure(value.rootTypes);

    if (closures) {
      this.termReplaceNode = EntityDefinition.generateBaseTerm(closures);
    }

    this.search();
  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  onValueChanges() {
    const self = this;
    const lookupFunc = self.noctuaLookupService.lookupFunc()

    this.searchForm.get('category').valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe(data => {
      if (data) {
        self.selectedCategoryName = data.name;
        self.searchForm.get('findWhat').value(null);
        self.searchForm.get('replaceWith').value(null)
      }
    });

    this.searchForm.get('findWhat').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      const lookup: EntityLookup = self.termNode.termLookup;
      lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });

      self.enableReplace = data && data.id;
    });

    this.searchForm.get('replaceWith').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      const lookup: EntityLookup = self.termReplaceNode.termLookup;
      lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });
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
