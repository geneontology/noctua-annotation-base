

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'noc-cams-selection',
  templateUrl: './cams-selection.component.html',
  styleUrls: ['./cams-selection.component.scss']
})
export class CamsSelectionComponent implements OnInit, OnDestroy {
  AnnotonType = AnnotonType;

  @ViewChild('leftDrawer', { static: true })
  leftDrawer: MatDrawer;

  @ViewChild('rightDrawer', { static: true })
  rightDrawer: MatDrawer;

  cams: Cam[] = [];
  searchResults = [];
  modelId = '';

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
      });


  }

  ngOnInit(): void {
    const self = this;



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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}


