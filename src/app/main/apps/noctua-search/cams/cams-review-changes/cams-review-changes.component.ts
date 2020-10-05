

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
import { cloneDeep, groupBy } from 'lodash';
import { ArtReplaceCategory } from '@noctua.search/models/review-mode';
import { NoctuaConfirmDialogService } from '@noctua/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'noc-cams-review-changes',
  templateUrl: './cams-review-changes.component.html',
  styleUrls: ['./cams-review-changes.component.scss'],
  animations: noctuaAnimations,
})
export class CamsReviewChangesComponent implements OnInit, OnDestroy {

  ArtReplaceCategory = ArtReplaceCategory;
  stats: any[] = [];

  summary;

  displayedColumns = [
    'category',
    'count'
  ];

  private _unsubscribeAll: Subject<any>;

  constructor(
    private camService: CamService,
    public camsService: CamsService,
    private confirmDialogService: NoctuaConfirmDialogService,
    public noctuaReviewSearchService: NoctuaReviewSearchService,
    public noctuaUserService: NoctuaUserService,
    private noctuaLookupService: NoctuaLookupService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotonFormService: NoctuaAnnotonFormService,
    public noctuaFormMenuService: NoctuaFormMenuService) {

    this._unsubscribeAll = new Subject();

    this.camsService.onCamsCheckoutChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(summary => {
        if (!summary) {
          return;
        }

        this.summary = summary;

        this.stats = this.generateStats(summary.stats);

        console.log(this.summary);
      });
  }

  ngOnInit(): void {
  }

  generateStats(stats) {
    const self = this;
    const result = [
      {
        category: 'CAMs',
        count: stats.camsCount
      }, {
        category: 'Genes',
        count: stats.gpsCount
      }, {
        category: 'Terms',
        count: stats.termsCount
      }, {
        category: 'Evidence',
        count: stats.evidenceCount
      }, {
        category: 'Reference',
        count: stats.referencesCount
      }, {
        category: 'Relations',
        count: stats.relationsCount
      }
    ];

    return result;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


}
