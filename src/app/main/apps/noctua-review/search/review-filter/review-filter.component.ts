import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, ElementRef, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatOption, MatSort, MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { merge, Observable, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, startWith, distinctUntilChanged, map } from 'rxjs/operators';

import { noctuaAnimations } from '@noctua/animations';
import { NoctuaUtils } from '@noctua/utils/noctua-utils';

import { takeUntil } from 'rxjs/internal/operators';
import { forEach } from '@angular/router/src/utils/collection';

import { ReviewService } from '../../services/review.service';

import { NoctuaTranslationLoaderService } from '@noctua/services/translation-loader.service';
import { NoctuaFormConfigService, NoctuaUserService } from 'noctua-form-base';
import { NoctuaLookupService } from 'noctua-form-base';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';

import { SparqlService } from '@noctua.sparql/services/sparql/sparql.service';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';
import { Contributor } from '../../../../../../../dist/public-api';


@Component({
  selector: 'noc-review-filter',
  templateUrl: './review-filter.component.html',
  styleUrls: ['./review-filter.component.scss'],
})

export class ReviewFilterComponent implements OnInit, OnDestroy {
  searchCriteria: any = {};
  filterForm: FormGroup;
  selectedOrganism = {};
  searchFormData: any = []
  cams: any[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedContributors: Contributor[] = [];

  @ViewChild('contributorInput') contributorInput: ElementRef<HTMLInputElement>;
  @ViewChild('contributorAuto') matAutocomplete: MatAutocomplete;

  filteredOrganisms: Observable<any[]>;
  filteredGroups: Observable<any[]>;
  filteredContributors: Observable<any[]>;


  private unsubscribeAll: Subject<any>;

  constructor(private route: ActivatedRoute,
    public noctuaUserService: NoctuaUserService,
    private noctuaSearchService: NoctuaSearchService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaLookupService: NoctuaLookupService,
    private reviewService: ReviewService,
    private sparqlService: SparqlService,
    private noctuaDataService: NoctuaDataService,
    private noctuaTranslationLoader: NoctuaTranslationLoaderService) {
    this.filterForm = this.createAnswerForm();

    this.unsubscribeAll = new Subject();

    this.searchFormData = this.noctuaFormConfigService.createReviewSearchFormData();
    this.onValueChanges();
  }

  ngOnInit(): void {


  }


  search() {
    let searchCriteria = this.filterForm.value;

    console.dir(searchCriteria)
    this.noctuaSearchService.search(searchCriteria);
  }

  createAnswerForm() {
    return new FormGroup({
      gp: new FormControl(this.searchCriteria.gp),
      goTerm: new FormControl(this.searchCriteria.goTerm),
      pmid: new FormControl(this.searchCriteria.pmid),
      contributor: new FormControl(this.searchCriteria.contributor),
      providedBy: new FormControl(this.searchCriteria.providedBy),
      organism: new FormControl(this.searchCriteria.organism),
    });
  }


  onValueChanges() {
    const self = this;

    this.filterForm.get('goTerm').valueChanges
      .distinctUntilChanged()
      .debounceTime(400)
      .subscribe(data => {
        let searchData = self.searchFormData['goTerm'];
        this.noctuaLookupService.golrTermLookup(data, searchData.id).subscribe(response => {
          self.searchFormData['goTerm'].searchResults = response
        });
      });

    this.filterForm.get('gp').valueChanges
      .distinctUntilChanged()
      .debounceTime(400)
      .subscribe(data => {
        let searchData = self.searchFormData['gp'];
        this.noctuaLookupService.golrTermLookup(data, searchData.id).subscribe(response => {
          self.searchFormData['gp'].searchResults = response
        })
      })


    this.filteredOrganisms = this.filterForm.controls.organism.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value['short_name']),
        map(organism => organism ? this.reviewService.filterOrganisms(organism) : this.reviewService.organisms.slice())
      )

    this.filteredContributors = this.filterForm.controls.contributor.valueChanges
      .pipe(
        startWith(''),
        map(
          value => typeof value === 'string' ? value : value['name']),
        map(contributor => contributor ? this.noctuaUserService.filterContributors(contributor) : this.noctuaUserService.contributors.slice())
      )

    this.filteredGroups = this.filterForm.controls.providedBy.valueChanges
      .pipe(
        startWith(''),
        map(
          value => typeof value === 'string' ? value : value['name']),
        map(group => group ? this.noctuaUserService.filterGroups(group) : this.noctuaUserService.groups.slice())
      )
  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  evidenceDisplayFn(evidence): string | undefined {
    return evidence ? evidence.label : undefined;
  }

  contributorDisplayFn(contributor): string | undefined {
    return contributor ? contributor.name : undefined;
  }

  groupDisplayFn(group): string | undefined {
    return group ? group.name : undefined;
  }

  organismDisplayFn(organism): string | undefined {
    return organism ? organism.taxonName : undefined;
  }

  close() {
    this.reviewService.closeLeftDrawer();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }








  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if (value) {
        //  this.selectedContributors.push(value);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.filterForm.controls.contributor.setValue(null);
    }
  }

  remove(contributor: Contributor): void {
    const index = this.selectedContributors.indexOf(contributor);

    if (index >= 0) {
      this.selectedContributors.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedContributors.push(event.option.value);
    this.contributorInput.nativeElement.value = '';
    this.filterForm.controls.contributor.setValue('');
  }

}
