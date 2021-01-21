import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import {
  NoctuaUserService,
  NoctuaFormConfigService,
  NoctuaFormMenuService,
  NoctuaAnnotonFormService,
  CamsService,
  CamStats
} from 'noctua-form-base';
import { takeUntil } from 'rxjs/operators';
import { noctuaAnimations } from '@noctua/animations';
import { NoctuaReviewSearchService } from './../../../services/noctua-review-search.service';
import { ReviewMode } from './../../../models/review-mode';
import { NoctuaSearchMenuService } from './../../../services/search-menu.service';
import { MiddlePanel, LeftPanel, RightPanel } from './../../../models/menu-panels';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'noc-cams-review-changes-dialog',
  templateUrl: './cams-review-changes.component.html',
  styleUrls: ['./cams-review-changes.component.scss'],
  animations: noctuaAnimations,
})
export class CamsReviewChangesDialogComponent implements OnInit, OnDestroy {

  ReviewMode = ReviewMode;
  LeftPanel = LeftPanel;
  MiddlePanel = MiddlePanel;
  RightPanel = RightPanel;
  stats: any[] = [];

  summary;

  displayedColumns = [
    'category',
    'count'
  ];

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _matDialogRef: MatDialogRef<CamsReviewChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public camsService: CamsService,
    public noctuaReviewSearchService: NoctuaReviewSearchService,
    public noctuaSearchMenuService: NoctuaSearchMenuService,
    public noctuaUserService: NoctuaUserService,
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  generateStats(stats: CamStats): any[] {
    stats.updateTotal();
    const result = [{
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
    }];

    return result;
  }

  selectMiddlePanel(panel) {
    this.noctuaSearchMenuService.selectMiddlePanel(panel);

    switch (panel) {
      case MiddlePanel.cams:
        this.noctuaSearchMenuService.selectLeftPanel(LeftPanel.filter);
        break;
      case MiddlePanel.camsReview:
        this.noctuaSearchMenuService.selectLeftPanel(LeftPanel.artBasket);
        break;
      case MiddlePanel.reviewChanges:
        this.noctuaSearchMenuService.selectLeftPanel(LeftPanel.artBasket);
        break;
    }
  }

  save() {
    this._matDialogRef.close(true);
  }

  close() {
    this._matDialogRef.close();
  }


}