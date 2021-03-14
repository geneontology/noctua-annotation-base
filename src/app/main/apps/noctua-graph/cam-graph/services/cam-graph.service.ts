import { Injectable } from '@angular/core';
import 'jqueryui';
import * as joint from 'jointjs';
import { each, cloneDeep } from 'lodash';
import { ScardDataService, Card, ScardCardService, CardType } from '@scard.card';
import { Triple } from '@scard.card/models/card/triple';
import { ScardShapesService, CardLink, CardCell, StencilItem } from '@scard.card/services/shapes.service';
import { ScardCardFormService } from '@scard.card/services/forms/card-form.service';
import { ScardCommonMenuService } from '@scard.common/services/menu.service';
import { Cam } from '@scard.cam';
import { ScardCamService } from '@scard.cam/services/cam.service';
import { CamCanvas } from '../models/cam-canvas';
import { CamStencil } from '../models/cam-stencil';
import { RightPanel } from '@scard.common/models/menu-panels';
import { NodeType } from 'noc-graph-ts';

@Injectable({
  providedIn: 'root'
})
export class CamGraphService {
  cam: Cam;
  stencils: {
    id: string,
    paper: joint.dia.Paper;
    graph: joint.dia.Graph;
  }[] = [];
  selectedElement: joint.shapes.scard.CardCell | joint.shapes.scard.CardLink;
  selectedStencilElement: joint.shapes.scard.CardCell;
  camCanvas: CamCanvas;
  camStencil: CamStencil;

  constructor(
    private _scardCardService: ScardCardService,
    private _scardCamService: ScardCamService,
    private scardDataService: ScardDataService,
    private scardCardFormService: ScardCardFormService,
    public scardCommonMenuService: ScardCommonMenuService,
    private scardShapesService: ScardShapesService) {

    const self = this;

    this._scardCardService.onCardSaved
      .subscribe((card: Card) => {
        if (!card || !self.selectedElement) {
          return;
        }

        if (card.operation === 'remove') {
          self.selectedElement.remove();
        }

        const type = self.selectedElement.get('type');

        if (type === CardType.ScardLink) {
          (self.selectedElement as CardLink).setText(card.title);
        } else {
          self.selectedElement.attr(' nodeType/text', card.category);
          self.selectedElement.attr('scardTitle/text', card.title);
          (self.selectedElement as CardCell).addColor(card.backgroundColor);
        }
        self.selectedElement.set({ card: card });
        self.selectedElement.set({ id: card.id });
      });
  }

  initializeGraph() {
    const self = this;

    self.camCanvas = new CamCanvas();
    self.camCanvas.elementOnClick = self.openForm.bind(self);
  }

  initializeStencils() {
    const self = this;

    self.camStencil = new CamStencil(self.camCanvas, self.scardDataService.groupCards(NodeType.node));
  }

  addToCanvas(cam: Cam) {
    this.cam = cam;
    this.camCanvas.addCanvasGraph(cam);
  }

  zoom(delta: number, e?) {
    this.camCanvas.zoom(delta, e);
  }

  reset() {
    this.camCanvas.resetZoom();
  }

  openForm(element: joint.shapes.scard.CardCell) {
    const card = element.prop('card') as Card
    this.selectedElement = element;
    card.type = element.get('type');
    this.scardCardFormService.initializeForm(card);
    this.scardCommonMenuService.openRightDrawer(RightPanel.cardForm);
  }

  save() {
    const self = this;
    const cells: joint.dia.Cell[] = this.camCanvas.canvasGraph.getCells();
    const cards = [];
    const triples = [];

    each(cells, (cell: joint.dia.Cell) => {
      const type = cell.get('type');

      if (type === CardType.ScardLink) {
        const subject = cell.get('source');
        const object = cell.get('target');

        triples.push({
          subject: {
            uuid: subject.id,
          },
          predicate: {
            id: cell.get('id'),
          },
          object: {
            uuid: object.id
          }
        });
      } else {
        cards.push({
          uuid: cell.get('id'),
          id: cell.get('id'),
          position: cell.get('position'),
          size: cell.get('size'),
        });
      }
    });

    const card = {
      cards,
      triples
    };

    this._scardCamService.updateCam(self.cam.id, card).subscribe((newCard) => {
    });

  }
}
