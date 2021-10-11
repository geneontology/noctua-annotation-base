import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { getColor } from '@noctua.common/data/noc-colors';
import { Cam, CamStatsService, NoctuaGraphService, NoctuaLookupService, TermsSummary } from '@noctua.form';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'noc-general-stats',
  templateUrl: './general-stats.component.html',
  styleUrls: ['./general-stats.component.scss']
})
export class GeneralStatsComponent implements OnInit, OnDestroy {
  @Input()
  termsSummary: TermsSummary;

  aspectOptions = {
    view: [400, 200],
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
      domain: ['#AAAAAA']
    },
    customColors: []
  }

  aspectPieOptions = {
    view: [400, 200],
    gradient: true,
    legend: false,
    showLabels: true,
    isDoughnut: false,
    maxLabelLength: 20,
    colorScheme: {
      domain: [getColor('green', 500), getColor('brown', 500), getColor('purple', 500)]
    },

  }

  gpPieOptions = {
    view: [400, 200],
    gradient: true,
    legend: false,
    showLabels: true,
    isDoughnut: false,
    maxLabelLength: 20,
    colorScheme: {
      domain: ['#5AA454', '#C7B42C', '#AAAAAA']
    }
  }

  relationsBarOptions = {
    view: [400, 400],
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    legend: false,
    showXAxisLabel: true,
    maxYAxisTickLength: 20,
    yAxisLabel: 'Relation',
    showYAxisLabel: true,
    xAxisLabel: 'Count',
  }

  contributorBarOptions = {
    view: [400, 300],
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    legend: false,
    showXAxisLabel: true,
    maxYAxisTickLength: 25,
    yAxisLabel: 'Contributor',
    showYAxisLabel: true,
    xAxisLabel: 'Number of Statements',
  }

  datesLineOptions = {
    view: [400, 400],
    legend: false,
    legendPosition: 'below',
    showLabels: true,
    animations: true,
    xAxis: true,
    yAxis: true,
    showYAxisLabel: true,
    showXAxisLabel: true,
    xAxisLabel: 'Curated Statements',
    yAxisLabel: 'Statements',
    timeline: true,
  }

  stats = {
    aspect: [],
    aspectPie: [],
    gpPie: [],
    mfPie: [],
    bpPie: [],
    ccPie: [],
    contributorBar: [],
    relationsBar: [],
    datesLine: []
  }



  private _unsubscribeAll: Subject<any>;

  constructor(
    private _camStatsService: CamStatsService,
    private _noctuaGraphService: NoctuaGraphService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {

    this.stats.aspect = this._camStatsService.buildTermsStats(this.termsSummary)
    this.stats.aspectPie = this._camStatsService.buildAspectPie([this.termsSummary.mf, this.termsSummary.bp, this.termsSummary.cc])
    this.stats.gpPie = this._camStatsService.buildTermsPie(this.termsSummary.gp.nodes)
    this.stats.mfPie = this._camStatsService.buildTermsPie(this.termsSummary.mf.nodes)
    this.stats.bpPie = this._camStatsService.buildTermsPie(this.termsSummary.bp.nodes)
    this.stats.ccPie = this._camStatsService.buildTermsPie(this.termsSummary.cc.nodes)
    this.stats.relationsBar = this._camStatsService.buildRelationsPie(this.termsSummary.relations.nodes)
    this.stats.datesLine = this._camStatsService.buildContributionsStats(this.termsSummary.dates.nodes)
    this.stats.contributorBar = this._camStatsService.buildContributorBar(this.termsSummary.contributors.nodes)

    /*  this.pies = [{
       label: 'Gene Product',
       data: this.stats.gpPie
     },
     {
       label: 'Molecular Function',
       data: this.stats.mfPie
     },
     {
       label: 'Biological Process',
       data: this.stats.bpPie
     },
     {
       label: 'Cellular Component',
       data: this.stats.ccPie
     }] */
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
