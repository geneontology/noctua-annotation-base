import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { NoctuaFormConfigService, NoctuaUserService, NoctuaLookupService } from 'noctua-form-base';
import { NoctuaSearchService } from './../..//services/noctua-search.service';
import { startWith, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { NoctuaSearchMenuService } from '../../services/search-menu.service';

@Component({
  selector: 'noc-search-replace',
  templateUrl: './search-replace.component.html',
  styleUrls: ['./search-replace.component.scss']
})
export class SearchReplaceComponent implements OnInit, OnDestroy {
  searchCriteria: any = {};
  searchForm: FormGroup;
  selectedOrganism = {};
  searchFormData: any = [];
  cams: any[] = [];
  categories: any;


  private unsubscribeAll: Subject<any>;

  constructor(public noctuaUserService: NoctuaUserService,
    public noctuaSearchMenuService: NoctuaSearchMenuService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaSearchService: NoctuaSearchService) {
    this.searchForm = this.createAnswerForm();

    this.unsubscribeAll = new Subject();

    this.categories = this.noctuaFormConfigService.findReplaceCategories;

    this.onValueChanges();
  }

  ngOnInit(): void { }


  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
  createAnswerForm() {
    return new FormGroup({
      findWhat: new FormControl(),
      replaceWith: new FormControl(),
      category: new FormControl(),
    });
  }

  onValueChanges() {
    const self = this;

    this.searchForm.get('findWhat').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {

    });

    this.searchForm.get('replaceWith').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {

    });

  }

  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  search() {
    const searchCriteria = this.searchForm.value;

    this.noctuaSearchService.search(searchCriteria);
  }

  clear() {
    this.searchForm.controls.findWhat.setValue('');
    this.searchForm.controls.replaceWith.setValue('');
    this.searchForm.controls.object.setValue('');
  }

  close() {
    this.noctuaSearchMenuService.closeLeftDrawer();
  }



  compareCategory(a: any, b: any) {
    return (a.name === b.name);
  }
}
