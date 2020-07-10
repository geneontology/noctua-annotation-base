
import { Component, OnDestroy, OnInit, ViewChild, Input, Inject } from '@angular/core';
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
  EntityDefinition
} from 'noctua-form-base';

import { takeUntil, distinctUntilChanged, debounceTime, startWith, map } from 'rxjs/operators';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';
import { noctuaAnimations } from '@noctua/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'noc-cams-replace-dialog',
  templateUrl: './cams-replace.component.html',
  styleUrls: ['./cams-replace.component.scss'],
  animations: noctuaAnimations,
})
export class CamsReplaceDialogComponent implements OnInit, OnDestroy {
  AnnotonType = AnnotonType;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;

  cams: Cam[] = [];
  terms: any[];
  searchResults = [];

  filterForm: FormGroup;
  gpNode: AnnotonNode;
  termNode: AnnotonNode;

  tableOptions = {
    hideHeader: true,

  }

  noctuaFormConfig = noctuaFormConfig;

  private _unsubscribeAll: Subject<any>;

  constructor
    (
      private _matDialogRef: MatDialogRef<CamsReplaceDialogComponent>,
      @Inject(MAT_DIALOG_DATA) private _data: any,
      private camsService: CamsService,
      private noctuaLookupService: NoctuaLookupService,
      private noctuaDataService: NoctuaDataService,
      public noctuaSearchService: NoctuaSearchService,
      public noctuaUserService: NoctuaUserService,
      public noctuaFormConfigService: NoctuaFormConfigService,
      public noctuaAnnotonFormService: NoctuaAnnotonFormService,
      public noctuaFormMenuService: NoctuaFormMenuService) {
    this._unsubscribeAll = new Subject();
    this.terms = this.noctuaSearchService.searchCriteria.terms;
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

    this.filterForm = this.createFilterForm();
    this._onValueChanges();
  }

  ngOnInit(): void {
    const self = this;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  createFilterForm() {
    return new FormGroup({
      findWhat: new FormControl(),
      gps: new FormControl(),
      terms: new FormControl(),
      pmids: new FormControl(),
      titles: new FormControl(),
      states: new FormControl(),
    });
  }

  private _onValueChanges() {
    const self = this;
    const lookupFunc = self.noctuaLookupService.lookupFunc()

    this.filterForm.get('terms').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      const lookup: EntityLookup = self.termNode.termLookup;

      lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });
    });

    this.filterForm.get('gps').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(data => {
      const lookup: EntityLookup = self.gpNode.termLookup;

      lookupFunc.termLookup(data, lookup.requestParams).subscribe(response => {
        lookup.results = response;
      });
    });

  }



  close() {
    this.panelDrawer.close();
  }
}


