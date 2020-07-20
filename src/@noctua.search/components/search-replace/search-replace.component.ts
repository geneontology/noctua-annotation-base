import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  NoctuaFormConfigService,
  NoctuaUserService, NoctuaLookupService,
  AnnotonNode, EntityDefinition,
  EntityLookup,
  CamService,
  CamsService
} from 'noctua-form-base';
import { NoctuaSearchService } from './../../services/noctua-search.service';
import { startWith, map, distinctUntilChanged, debounceTime, takeUntil } from 'rxjs/operators';
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

  gpNode: AnnotonNode;
  termNode: AnnotonNode;


  private unsubscribeAll: Subject<any>;

  constructor(public noctuaUserService: NoctuaUserService,
    private camService: CamService,
    private camsService: CamsService,
    public noctuaSearchMenuService: NoctuaSearchMenuService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaLookupService: NoctuaLookupService,
    private noctuaSearchService: NoctuaSearchService) {


    this.unsubscribeAll = new Subject();

    this.categories = this.noctuaFormConfigService.findReplaceCategories;

    this.gpNode = EntityDefinition.generateBaseTerm([EntityDefinition.GoMolecularEntity]);
    this.termNode = EntityDefinition.generateBaseTerm([
      EntityDefinition.GoMolecularFunction,
      EntityDefinition.GoBiologicalProcess,
      EntityDefinition.GoCellularComponent,
      EntityDefinition.GoBiologicalPhase,
      EntityDefinition.GoAnatomicalEntity,
      EntityDefinition.GoCellTypeEntity
    ]);

    this.searchForm = this.createAnswerForm(this.categories.selected);

    this.onValueChanges();

    this.noctuaSearchService.onCamsChanged
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(cams => {
        this.cams = cams;
      });
  }

  ngOnInit(): void { }


  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  findWhat() {
    const value = this.searchForm.get('findWhat').value;

    const filter = {
      terms: [value]
    };
    this.camsService.initializeForm(this.cams);
    this.camsService.loadCams(filter);

  }

  createAnswerForm(selectedCategory) {
    return new FormGroup({
      findWhat: new FormControl(),
      replaceWith: new FormControl(),
      category: new FormControl(selectedCategory),
    });
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
    if (a && b) {
      return (a.name === b.name);
    }
    return false;
  }
}
