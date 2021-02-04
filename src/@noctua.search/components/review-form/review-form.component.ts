

import { Component, OnDestroy, OnInit, Input, NgZone } from '@angular/core';
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
  Entity
} from 'noctua-form-base';

import { takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { noctuaAnimations } from '@noctua/animations';
import { FormGroup, FormControl } from '@angular/forms';
import { NoctuaReviewSearchService } from '@noctua.search/services/noctua-review-search.service';
import { cloneDeep, groupBy } from 'lodash';
import { ArtReplaceCategory } from '@noctua.search/models/review-mode';
import { NoctuaConfirmDialogService } from '@noctua/components/confirm-dialog/confirm-dialog.service';
import { InlineReferenceService } from '@noctua.editor/inline-reference/inline-reference.service';

@Component({
  selector: 'noc-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
  animations: noctuaAnimations,
})
export class ReviewFormComponent implements OnInit, OnDestroy {
  AnnotonType = AnnotonType;
  ArtReplaceCategory = ArtReplaceCategory;
  searchForm: FormGroup;
  cams: Cam[] = [];
  displayReplaceForm = {
    replaceSection: false,
    replaceActions: false
  };
  noctuaFormConfig = noctuaFormConfig;
  categories: any;
  findNode: AnnotonNode;
  replaceNode: AnnotonNode;
  gpNode: AnnotonNode;
  termNode: AnnotonNode;
  selectedCategory;

  textboxDetail = {
    placeholder: ''
  }

  private _unsubscribeAll: Subject<any>;

  constructor(
    private zone: NgZone,
    private camsService: CamsService,
    private confirmDialogService: NoctuaConfirmDialogService,
    public noctuaReviewSearchService: NoctuaReviewSearchService,
    public noctuaUserService: NoctuaUserService,
    private noctuaLookupService: NoctuaLookupService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotonFormService: NoctuaAnnotonFormService,
    public noctuaFormMenuService: NoctuaFormMenuService,
    private inlineReferenceService: InlineReferenceService,) {

    this._unsubscribeAll = new Subject();
    this.categories = cloneDeep(this.noctuaFormConfigService.findReplaceCategories);
    this.camsService.onCamsChanged
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
    this.selectedCategory = this.categories.selected;
    this.resetForm(this.selectedCategory)
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  resetForm(selectedCategory): void {
    this.searchForm = this.createSearchForm(selectedCategory);
    this.onValueChanges();
    this.onNodeValueChange(selectedCategory)
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

  createSearchForm(selectedCategory) {
    this.selectedCategory = selectedCategory;
    return new FormGroup({
      findWhat: new FormControl(),
      replaceWith: new FormControl(),
      category: new FormControl(selectedCategory),
    });
  }

  getClosure(rootTypes: Entity[]) {
    const s = [
      EntityDefinition.GoMolecularEntity,
      EntityDefinition.GoMolecularFunction,
      EntityDefinition.GoBiologicalProcess,
      EntityDefinition.GoCellularComponent,
      EntityDefinition.GoBiologicalPhase,
      EntityDefinition.GoAnatomicalEntity,
      EntityDefinition.GoCellTypeEntity,
      EntityDefinition.GoProteinContainingComplex,
      EntityDefinition.GoChemicalEntity,
      EntityDefinition.GoOrganism,
      EntityDefinition.GoEvidence
    ];

    const closures = s.filter(x => {
      return rootTypes.find(y => y.id === x.category);
    });

    return closures;
  }

  search() {
    const value = this.searchForm.value;
    const findWhat = value.findWhat;
    let filterType: string;

    this.noctuaReviewSearchService.clear();

    if (this.selectedCategory.name === noctuaFormConfig.findReplaceCategory.options.term.name) {
      filterType = this.noctuaReviewSearchService.filterType.terms;
    } else if (this.selectedCategory.name === noctuaFormConfig.findReplaceCategory.options.gp.name) {
      filterType = this.noctuaReviewSearchService.filterType.gps;
    } else if (this.selectedCategory.name === noctuaFormConfig.findReplaceCategory.options.reference.name) {
      filterType = this.noctuaReviewSearchService.filterType.pmids;
    }

    this.noctuaReviewSearchService.searchCriteria[filterType] = [findWhat];
    this.noctuaReviewSearchService.updateSearch();
  }

  openAddReference(event, name: string) {

    const data = {
      formControl: this.searchForm.controls[name] as FormControl,
    };
    this.inlineReferenceService.open(event.target, { data });

  }

  replace() {
    const self = this;
    const value = this.searchForm.value;
    const replaceWith = value.replaceWith;

    this.noctuaReviewSearchService.replace(replaceWith)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cams) => {
        if (cams) {
          self.bulkStoredModel();
        }
      });
  }

  replaceAll() {
    const self = this;
    const value = this.searchForm.value;
    const replaceWith = value.replaceWith;
    const groupedEntities = groupBy(
      this.noctuaReviewSearchService.matchedEntities,
      'modelId') as { string: Entity[] };
    const models = Object.keys(groupedEntities).length;
    const occurrences = this.noctuaReviewSearchService.matchedCount;
    const success = (replace) => {
      if (replace) {
        this.noctuaReviewSearchService.replaceAll(replaceWith)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((cams) => {
            if (cams) {
              self.bulkStoredModel();
            }
          });
      }
    };

    this.confirmDialogService.openConfirmDialog('Confirm ReplaceAll?',
      `Replace ${occurrences} occurrences across ${models} models`,
      success);
  }

  bulkStoredModel() {
    const self = this;

    this.camsService.bulkStoredModel()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cams) => {
        self.zone.run(() => {
          self.noctuaReviewSearchService.onReplaceChanged.next(true);
          this.camsService.reviewChanges();
        });
      });
  }

  findNext() {
    this.noctuaReviewSearchService.findNext();
  }

  findPrevious() {
    this.noctuaReviewSearchService.findPrevious();
  }

  goto(step: 'first' | 'last') {
    this.noctuaReviewSearchService.goto(step);
  }

  findSelected(value) {
    const closures = this.getClosure(value.rootTypes);
    this.findNode!.termLookup.results = []

    if (closures) {
      this.replaceNode = EntityDefinition.generateBaseTerm(closures);
    }

    this.search();
  }

  termDisplayFn(term): string | undefined {
    return term && term.id ? `${term.label} (${term.id})` : undefined;
  }

  onValueChanges() {
    const self = this;

    this.searchForm.get('category').valueChanges.pipe(
      takeUntil(this._unsubscribeAll),
      distinctUntilChanged(),
    ).subscribe(data => {
      if (data) {
        self.selectedCategory = data;
        self.searchForm.patchValue({
          findWhat: null,
          replaceWith: null
        });

        self.calculateEnableReplace();
        self.resetForm(data)
      }
    });
  }

  onNodeValueChange(selectedCategory) {
    const self = this;
    const lookupFunc = self.noctuaLookupService.lookupFunc();

    if (selectedCategory.name === noctuaFormConfig.findReplaceCategory.options.term.name) {
      self.findNode = self.termNode;
      self.textboxDetail.placeholder = 'Ontology Term'
    } else if (selectedCategory.name === noctuaFormConfig.findReplaceCategory.options.gp.name) {
      self.findNode = self.gpNode;
      self.textboxDetail.placeholder = 'Gene Product'
    } else if (selectedCategory.name === noctuaFormConfig.findReplaceCategory.options.reference.name) {
      self.findNode = null;
      self.textboxDetail.placeholder = 'Reference'
    }

    if (self.findNode) {
      this.findNode.termLookup.results = []
      this.searchForm.get('findWhat').valueChanges.pipe(
        takeUntil(this._unsubscribeAll),
        distinctUntilChanged(),
        debounceTime(400)
      ).subscribe(data => {
        if (data) {
          const lookup: EntityLookup = self.findNode.termLookup;
          lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
            lookup.results = response;
          });

          self.calculateEnableReplace();
        }
      });

      this.searchForm.get('replaceWith').valueChanges.pipe(
        takeUntil(this._unsubscribeAll),
        distinctUntilChanged(),
        debounceTime(400)
      ).subscribe(data => {
        if (data && self.replaceNode) {
          const lookup: EntityLookup = self.replaceNode.termLookup;
          lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
            lookup.results = response;
          });

          self.calculateEnableReplace();
        }
      });
    } else {
      this.searchForm.get('findWhat').valueChanges.pipe(
        takeUntil(this._unsubscribeAll),
        distinctUntilChanged(),
        debounceTime(400)
      ).subscribe(data => {
        if (data && data.includes(':')) {
          self.search();
          self.calculateEnableReplace();
        }
      });

      this.searchForm.get('replaceWith').valueChanges.pipe(
        takeUntil(this._unsubscribeAll),
        distinctUntilChanged(),
        debounceTime(400)
      ).subscribe(data => {
        if (data && self.replaceNode && data.includes(':')) {
          self.calculateEnableReplace();
        }
      });
    }
  }

  calculateEnableReplace() {
    const value = this.searchForm.value;
    const findWhat = value.findWhat;
    const replaceWith = value.replaceWith;

    const matched = this.noctuaReviewSearchService.matchedCount > 0

    this.displayReplaceForm.replaceSection = matched && findWhat && findWhat.id;
    this.displayReplaceForm.replaceActions = matched && replaceWith && replaceWith.id;
  }

  compareCategory(a: any, b: any) {
    if (a && b) {
      return (a.name === b.name);
    }
    return false;
  }

}
