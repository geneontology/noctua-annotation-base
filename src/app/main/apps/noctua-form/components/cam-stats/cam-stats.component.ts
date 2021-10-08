import { Component, OnInit, OnDestroy, NgZone, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivityNode, Cam, CamService, CamSummary, EntityType, LeftPanel, NoctuaFormConfigService, NoctuaFormMenuService, NoctuaGraphService, NoctuaLookupService, NoctuaUserService, RightPanel, TermsSummary } from 'noctua-form-base';
import { takeUntil } from 'rxjs/operators';
import { MatDrawer } from '@angular/material/sidenav';
import { SearchCriteria } from '@noctua.search/models/search-criteria';
import { environment } from 'environments/environment';
import { NoctuaReviewSearchService } from '@noctua.search/services/noctua-review-search.service';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';

@Component({
  selector: 'noc-cam-stats',
  templateUrl: './cam-stats.component.html',
  styleUrls: ['./cam-stats.component.scss']
})
export class CamStatsComponent implements OnInit, OnDestroy {
  EntityType = EntityType;

  @ViewChild('tree') tree;
  @Input('panelDrawer')
  panelDrawer: MatDrawer;
  cam: Cam;
  termsSummary: TermsSummary;

  loadingSpinner: any = {
    color: 'primary',
    mode: 'indeterminate'
  };



  // options

  aspectOptions = {
    view: [500, 200],
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    legend: false,
    showXAxisLabel: true,
    xAxisLabel: 'Aspect',
    showYAxisLabel: true,
    yAxisLabel: 'Annotations',
    animations: true,
    legendPosition: 'below',
    colorScheme: {
      domain: ['#5AA454', '#C7B42C', '#AAAAAA']
    }
  }

  gpPieOptions = {
    view: [500, 200],
    gradient: true,
    legend: false,
    showLabels: true,
    isDoughnut: false,
    colorScheme: {
      domain: ['#5AA454', '#C7B42C', '#AAAAAA']
    }
  }


  private _unsubscribeAll: Subject<any>;
  stats = {
    aspect: [],
    gpPie: [],
    mfPie: [],
    bpPie: [],
    ccPie: []
  }

  pies = []

  constructor(
    private zone: NgZone,
    private noctuaLookupService: NoctuaLookupService,
    private _noctuaGraphService: NoctuaGraphService,
    public noctuaFormMenuService: NoctuaFormMenuService,
    public camService: CamService,
    public noctuaUserService: NoctuaUserService,
    public noctuaReviewSearchService: NoctuaReviewSearchService,
    public noctuaSearchService: NoctuaSearchService,
    public noctuaFormConfigService: NoctuaFormConfigService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._noctuaGraphService.onCamGraphChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cam: Cam) => {
        if (!cam) {
          return;
        }
        this.cam = cam;
        this.termsSummary = this._noctuaGraphService.getTerms(this.cam.graph)
        this.stats.aspect = this.buildTermsStats(this.termsSummary)
        this.stats.gpPie = this.buildTermsPie(this.termsSummary.gp.nodes)
        this.stats.mfPie = this.buildTermsPie(this.termsSummary.mf.nodes)
        this.stats.bpPie = this.buildTermsPie(this.termsSummary.bp.nodes)
        this.stats.ccPie = this.buildTermsPie(this.termsSummary.cc.nodes)

        this.pies = [this.stats.gpPie, this.stats.mfPie, this.stats.bpPie, this.stats.ccPie]
      });

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  buildTermsStats(termsSummary: TermsSummary) {
    const allTerms = [
      termsSummary.mf,
      termsSummary.bp,
      termsSummary.cc,
      termsSummary.gp,
      termsSummary.other,
    ]

    const stats = allTerms.map((camSummary: CamSummary<ActivityNode>) => {

      return {
        name: camSummary.shorthand ? camSummary.shorthand : camSummary.label,
        series: camSummary.getSortedNodes().map((node: ActivityNode) => {
          return {
            name: node.term.label,
            value: node.frequency
          }
        })

      }
    })

    return stats
  }

  buildTermsPie(nodes) {

    const stats = nodes.map((node: ActivityNode) => {
      return {
        name: node.term.label,
        value: node.frequency
      }
    })

    return stats
  }

  openSearch(node) {
    this.noctuaLookupService.getTermDetail(node.term.id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((term) => {
        if (!term) return;
        this.noctuaReviewSearchService.onCamTermSearch.next(term)
        this.noctuaFormMenuService.openLeftDrawer(LeftPanel.findReplace);
      })
  }

  search(node: ActivityNode) {
    this.noctuaReviewSearchService.searchCriteria['terms'] = [node.term];
    this.noctuaReviewSearchService.updateSearch();
  }

  searchModels(node: ActivityNode) {
    const searchCriteria = new SearchCriteria()
    searchCriteria.terms = [node.term]
    const url = `${environment.noctuaTempUrl}?${searchCriteria.build()}`
    window.open(url, '_blank');
  }

  searchModelsByContributor(node: ActivityNode) {
    const searchCriteria = new SearchCriteria()
    searchCriteria.terms = [node.term]
    searchCriteria.contributors = [this.noctuaUserService.user]
    const url = `${environment.noctuaTempUrl}?${searchCriteria.build()}`
    window.open(url, '_blank')
  }

  openTermDetail(term) {
    this.noctuaSearchService.onDetailTermChanged.next(term)
    this.noctuaFormMenuService.openRightDrawer(RightPanel.termDetail);
  }


  close() {
    this.panelDrawer.close();
  }

}
