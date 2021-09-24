import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Cam, CamLoadingIndicator, CamService, CamStats, NoctuaFormConfigService, NoctuaGraphService, NoctuaUserService, TermsSummary } from 'noctua-form-base';
import { NoctuaSearchService } from './../..//services/noctua-search.service';
import { NoctuaSearchMenuService } from '../../services/search-menu.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { NoctuaReviewSearchService } from './../../services/noctua-review-search.service';
import { NoctuaConfirmDialogService } from '@noctua/components/confirm-dialog/confirm-dialog.service';
import { LeftPanel, MiddlePanel } from './../../models/menu-panels';
import { NoctuaSearchDialogService } from './../../services/dialog.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'noc-cam-terms',
  templateUrl: './cam-terms.component.html',
  styleUrls: ['./cam-terms.component.scss']
})
export class CamTermsComponent implements OnInit, OnDestroy {
  MiddlePanel = MiddlePanel;

  @Input('panelDrawer')
  panelDrawer: MatDrawer;
  cam: Cam;
  termsSummary: TermsSummary;
  stats

  loadingSpinner: any = {
    color: 'primary',
    mode: 'indeterminate'
  };

  displayedColumns = [
    'category',
    'count'
  ];

  private _unsubscribeAll: Subject<any>;

  constructor(
    private zone: NgZone,
    private _noctuaGraphService: NoctuaGraphService,
    public camService: CamService,
    private confirmDialogService: NoctuaConfirmDialogService,
    public noctuaSearchDialogService: NoctuaSearchDialogService,
    public noctuaUserService: NoctuaUserService,
    public noctuaReviewSearchService: NoctuaReviewSearchService,
    public noctuaSearchMenuService: NoctuaSearchMenuService,
    public noctuaSearchService: NoctuaSearchService,
    public noctuaFormConfigService: NoctuaFormConfigService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.camService.onCamChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cam: Cam) => {
        if (!cam) {
          return;
        }
        this.cam = cam;

        this.termsSummary = this._noctuaGraphService.getTerms(this.cam.graph)

      });

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  close() {
    this.panelDrawer.close();
  }

}
