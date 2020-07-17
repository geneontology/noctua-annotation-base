

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
  CamsService
} from 'noctua-form-base';

import { takeUntil } from 'rxjs/operators';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';
import { noctuaAnimations } from '@noctua/animations';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'noc-cams-selection',
  templateUrl: './cams-selection.component.html',
  styleUrls: ['./cams-selection.component.scss'],
  animations: noctuaAnimations,
})
export class CamsSelectionComponent implements OnInit, OnDestroy {
  AnnotonType = AnnotonType;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;

  filterForm: FormGroup;
  cams: Cam[] = [];
  terms: any[];
  searchResults = [];
  modelId = '';

  matchedCount = 0;

  tableOptions = {
    hideHeader: true,
  }

  noctuaFormConfig = noctuaFormConfig;

  private _unsubscribeAll: Subject<any>;

  constructor
    (private route: ActivatedRoute,
      private camsService: CamsService,
      private noctuaDataService: NoctuaDataService,
      public noctuaSearchService: NoctuaSearchService,
      public noctuaUserService: NoctuaUserService,
      public noctuaFormConfigService: NoctuaFormConfigService,
      public noctuaAnnotonFormService: NoctuaAnnotonFormService,
      public noctuaFormMenuService: NoctuaFormMenuService) {

    this._unsubscribeAll = new Subject();

    this.camsService.onCamsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cams => {
        if (!cams) {
          return;
        }
        this.cams = cams;
        this.matchedCount = this.camsService.calculateMatchedCount();
      });

    this.terms = this.noctuaSearchService.searchCriteria.getSearchableTerms();
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    const self = this;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  viewAsModel(cam: Cam) {
    cam.displayType = noctuaFormConfig.camDisplayType.options.model;
  }

  viewAsActivities(cam: Cam) {
    cam.displayType = noctuaFormConfig.camDisplayType.options.entity;
  }

  loadCam(modelId) {
    const self = this;

    self.noctuaDataService.onContributorsChanged.pipe(
      takeUntil(this._unsubscribeAll))
      .subscribe((contributors: Contributor[]) => {
        self.noctuaUserService.contributors = contributors;
        //   this.cam = this.camService.getCam(modelId);
      });
  }

  createFilterForm() {
    return new FormGroup({
      findWhat: new FormControl(),
    });
  }

  compareEntity(a: any, b: any) {
    return (a.id === b.id);
  }

  close() {
    this.panelDrawer.close();
  }
}


