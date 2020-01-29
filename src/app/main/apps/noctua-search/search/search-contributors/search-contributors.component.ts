import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { SearchService } from '../../services/search.service';

import {
  NoctuaFormConfigService,
  NoctuaUserService
} from 'noctua-form-base';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';

@Component({
  selector: 'noc-search-contributors',
  templateUrl: './search-contributors.component.html',
  styleUrls: ['./search-contributors.component.scss'],
})

export class SearchContributorsComponent implements OnInit, OnDestroy {
  searchCriteria: any = {};
  searchForm: FormGroup;
  groupsForm: FormGroup;
  searchFormData: any = []
  // groups: any[] = [];
  // contributors: any[] = [];

  private unsubscribeAll: Subject<any>;

  constructor(public noctuaUserService: NoctuaUserService,
    private noctuaSearchService: NoctuaSearchService,
    private formBuilder: FormBuilder,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private searchService: SearchService) {
    // this.contributors = this.searchService.contributors;
    this.searchFormData = this.noctuaFormConfigService.createSearchFormData();
    this.unsubscribeAll = new Subject();

    this.groupsForm = this.formBuilder.group({
      groups: []
    })
  }

  ngOnInit(): void {


    //this.searchForm = this.createSearchForm();
  }

  selectContributor(contributor) {
    this.searchCriteria.contributor = contributor;
    this.noctuaSearchService.search(this.searchCriteria)
  }


  search() {
    let searchCriteria = this.searchForm.value;

    console.dir(searchCriteria)
    this.noctuaSearchService.search(searchCriteria);
  }

  close() {
    this.searchService.closeLeftDrawer();
  }

  createSearchForm() {
    return new FormGroup({
      term: new FormControl(),
      groups: this.groupsForm,
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}
