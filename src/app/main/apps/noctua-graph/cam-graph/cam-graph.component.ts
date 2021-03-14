import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import * as _ from 'lodash';
import * as joint from 'jointjs';
import { Card, CardDisplayOptions, ScardCardService, ScardDataService } from '@scard.card';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { each, find } from 'lodash';
import { ScardShapesService, CardLink } from '@scard.card/services/shapes.service';
import { CamGraphService } from './services/cam-graph.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { generate } from 'geopattern';
import { ActivatedRoute, Router } from '@angular/router';
import { ScardCommonMenuService } from '@scard.common/services/menu.service';
import { Cam, ScardCamFormService, ScardCamEditorService } from '@scard.cam';
import { NodeType } from 'noc-graph-ts';

@Component({
  selector: 'noc-cam-graph',
  templateUrl: './cam-graph.component.html',
  styleUrls: ['./cam-graph.component.scss']
})
export class CamGraphComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('stencils') stencilContainers: QueryList<any>;
  @ViewChild(ContextMenuComponent, { static: true }) public basicMenu: ContextMenuComponent;

  camId: string;
  cam: Cam;

  private _unsubscribeAll: Subject<any>;
  stencils = [];

  constructor(
    private cardService: ScardCardService,
    public scardDataService: ScardDataService,
    // public scardCamEditorService: ScardCamEditorService,
    private _scardCamEditorService: ScardCamEditorService,
    private _route: ActivatedRoute,
    public scardCommonMenuService: ScardCommonMenuService,
    private _scardCamFormService: ScardCamFormService,
    public scardCamGraphService: CamGraphService,
    private scardCardShapesService: ScardShapesService) {

    this._unsubscribeAll = new Subject();
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.camId = params['camId'] || null;
        this.loadCam(this.camId);
      });
    this.stencils = this.scardDataService.groupCards(NodeType.node);

    console.log(this.stencils)
  }

  ngAfterViewInit() {
    const self = this;

    self.scardCamGraphService.initializeGraph();
    this.scardCamGraphService.initializeStencils();
    this._scardCamEditorService.onCamChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cam: Cam) => {
        if (!cam) {
          return;
        }
        self.cam = cam;
        // const pattern = generate(card.title);
        // this.cam = card as Card;
        // this.cam.backgroundStyle = pattern.toDataUrl(); 
        self.scardCamGraphService.addToCanvas(self.cam);

      });
  }

  loadCam(camId: string): void {
    this._scardCamEditorService.getCam(camId);
  }

  ngOnInit() {
    const self = this;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  canMove(e: any): boolean {
    return e.indexOf('Disabled') === -1;
  }

  save() {
    this.scardCamGraphService.save();
  }

  zoomIn() {
    const delta = 0.1;
    this.scardCamGraphService.zoom(delta);
  }

  zoomOut() {
    const delta = -0.1;
    this.scardCamGraphService.zoom(delta);
  }

  onCtrlScroll($event) {
    const self = this;
    const delta = Math.max(-1, Math.min(1, ($event.wheelDelta || $event.detail))) / 10;
    console.log(delta)

    if ($event.ctrlKey) {
      self.scardCamGraphService.zoom(delta, $event);
      $event.returnValue = false;
      // for Chrome and Firefox
      if ($event.preventDefault) {
        $event.preventDefault();
      }
    }
  }

}
