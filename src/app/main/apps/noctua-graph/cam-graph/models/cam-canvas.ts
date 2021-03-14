import * as joint from 'jointjs';
import { CardLink, CardCell, StencilItem } from '@scard.card/services/shapes.service';
import { Cam } from '@scard.cam';
import { CardType, Card, Triple, scardData } from '@scard.card';
import { each, cloneDeep } from 'lodash';

export class CamCanvas {

    canvasPaper: joint.dia.Paper;
    canvasGraph: joint.dia.Graph;
    selectedStencilElement;
    elementOnClick: (element: joint.shapes.scard.CardCell) => void;
    cam: Cam;

    constructor() {
        this._initializeCanvas()
    }

    private _initializeCanvas() {
        const self = this;
        self.canvasGraph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        self.canvasPaper = new joint.dia.Paper({
            cellViewNamespace: joint.shapes,
            el: document.getElementById('noc-paper'),
            height: '100%',
            width: '100%',
            model: this.canvasGraph,
            restrictTranslate: true,
            multiLinks: false,
            markAvailable: true,
            // defaultConnectionPoint: { name: 'boundary', args: { extrapolate: true } },
            // defaultConnector: { name: 'rounded' },
            // defaultRouter: { name: 'orthogonal' },
            /*     defaultLink: new joint.dia.Link({
                  attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                }), */
            validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                // Prevent linking from input ports.
                // if (magnetS && magnetS.getAttribute('port-group') === 'in') return false;
                // Prevent linking from output ports to input ports within one element.
                if (cellViewS === cellViewT) return false;
                // Prevent linking to input ports.
                /// return magnetT && magnetT.getAttribute('port-group') === 'in';

                return true; // (magnetS !== magnetT);
            },
            validateMagnet: function (cellView, magnet) {
                // Note that this is the default behaviour. Just showing it here for reference.
                // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
                // return magnet.getAttribute('magnet') !== 'passive';
                return true;
            },

            // connectionStrategy: joint.connectionStrategies.pinAbsolute,
            // defaultConnectionPoint: { name: 'boundary', args: { selector: 'border' } },
            async: true,
            interactive: { labelMove: false },
            linkPinning: false,
            // frozen: true,
            gridSize: 10,
            drawGrid: {
                name: 'doubleMesh',
                args: [
                    { color: '#DDDDDD', thickness: 1 }, // settings for the primary mesh
                    { color: '#DDDDDD', scaleFactor: 5, thickness: 4 } //settings for the secondary mesh
                ]
            },
            sorting: joint.dia.Paper.sorting.APPROX,
            // markAvailable: true,
            defaultLink: function () {
                return self.addLink();
            },
            perpendicularLinks: true,
            // defaultRouter: {
            //   name: 'manhattan',
            //   args: {
            //  perpendicular: false,
            //    step: 20
            //    }
            //   },

        });

        this.canvasPaper.on({
            'element:pointerdblclick': function (cellView) {
                const element = cellView.model;
                self.elementOnClick(element);
            },
            'element:mouseover': function (cellView) {
                const element = cellView.model;
                if (element.get('type') === CardType.ScardCell) {
                    (element as CardCell).hover(true);
                }
            },

            'element:mouseleave': function (cellView) {
                cellView.removeTools();
                const element = cellView.model;
                if (element.get('type') === CardType.ScardCell) {
                    (element as CardCell).hover(false);
                }
            },
            /* 'element:pointerup': function (elementView, evt, x, y) {
                const coordinates = new joint.g.Point(x, y);
                const elementAbove = elementView.model;
                const elementBelow = this.model.findModelsFromPoint(coordinates).find(function (el) {
                    return (el.id !== elementAbove.id);
                });

                // If the two elements are connected already, don't
                if (elementBelow && self.canvasGraph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {

                    // Move the element to the position before dragging.
                    elementAbove.position(evt.data.x, evt.data.y);
                    self.createLinkFromElements(elementAbove, elementBelow)

                }
            },
            'element:gate:click': function (elementView) {
                const element = elementView.model;
                const gateType = element.gate();
                const gateTypes = Object.keys(element.gateTypes);
                const index = gateTypes.indexOf(gateType);
                const newIndex = (index + 1) % gateTypes.length;
                element.gate(gateTypes[newIndex]);
            } */
        });


        this.canvasPaper.on('link:pointerclick', function (linkView) {
            const link = linkView.model;

            self.elementOnClick(link);
            link.attr('line/stroke', 'orange');
            link.label(0, {
                attrs: {
                    body: {
                        stroke: 'orange'
                    }
                }
            });
        });

        this.canvasPaper.on('element:expand:pointerdown', function (elementView: joint.dia.ElementView, evt) {
            evt.stopPropagation(); // stop any further actions with the element view (e.g. dragging)

            const model = elementView.model;
            const card = model.prop('card') as Card;
            self.toggleCardVisibility(model, card);
        });

        this.canvasGraph.on('change:source change:target', function (link) {
            const sourcePort = link.get('source').port;
            const sourceId = link.get('source').id;
            const targetPort = link.get('target').port;
            const targetId = link.get('target').id;

            if (targetId && sourceId) {
                self.canvasGraph.getCell(targetId);
                self.canvasGraph.getCell(targetId);
            }

        });
    }

    addElement(element: joint.shapes.scard.CardCell): CardCell {
        const self = this;

        const card: Card = element.get('card');
        const el = new CardCell()
            .position(0, 0)
            .size(120, 100)
            .addColor(card.backgroundColor);

        el.attr({ nodeType: { text: card.category } });
        el.attr({ scardTitle: { text: card.title } });

        el.set({ card: new Card(card) });

        self.canvasGraph.addCell(el);

        return el;
    }

    addLink(): CardLink {
        const self = this;
        const link = CardLink.create();
        const predicate: Card = new Card(scardData.defaultPredicate);

        link.set({
            card: new Card(predicate),
            id: predicate.id
        });

        link.setText(predicate.title);

        // Add remove button to the link.
        const tools = new joint.dia.ToolsView({
            tools: [new joint.linkTools.Remove()]
        });
        // link.findView(this).addTools(tools);

        return link;
    }

    createLinkFromElements(source: joint.shapes.scard.CardCell, target: joint.shapes.scard.CardCell) {
        const self = this;

        const subject = source.get('card') as Card;
        const object = target.get('card') as Card;

        self.createLink(subject, new Card(scardData.defaultPredicate), object)
    }

    createLink(subject: Card, predicate: Card, object: Card) {
        const self = this;
        const triple = new Triple(subject, predicate, object);

        self.cam.addNode(predicate);
        self.cam.addTriple(triple);
        self.createLinkFromTriple(triple, true);
    }

    createLinkFromTriple(triple: Triple<Card>, autoLayout?: boolean) {
        const self = this;

        const link = CardLink.create();
        link.setText(triple.predicate.title);
        link.set({
            card: triple.predicate,
            id: triple.predicate.id,
            source: {
                id: triple.subject.id,
                port: 'right'
            },
            target: {
                id: triple.object.id,
                port: 'left'
            }
        });

        link.addTo(self.canvasGraph);
        if (autoLayout) {
            self._layoutGraph(self.canvasGraph);
            // self.addCanvasGraph(self.cam);
        }
    }

    paperScale(delta: number, e) {
        const el = this.canvasPaper.$el;
        const newScale = this.canvasPaper.scale().sx + delta;

        if (newScale > 0.1 && delta < 10) {
            const offsetX = (e.offsetX || e.clientX - el.offset().left);
            const offsetY = (e.offsetY || e.clientY - el.offset().top);
            const localPoint = this._offsetToLocalPoint(offsetX, offsetY);

            this.canvasPaper.translate(0, 0);
            this.canvasPaper.scale(newScale, newScale, localPoint.x, localPoint.y);
        }
    };

    zoom(delta: number, e?) {
        if (e) {
            this.paperScale(delta, e);
        } else {
            this.canvasPaper.translate(0, 0);
            this.canvasPaper.scale(delta, delta)
        }
    }

    resetZoom() {
        this.zoom(1);
    };

    toggleCardVisibility(cell: joint.dia.Element, card: Card) {
        const self = this;

        console.log(cell.position())

        //self.cam.subgraphVisibility(card, !card.expanded);
        const elements = self.canvasGraph.getSuccessors(cell).concat(cell);
        // find all the links between successors and the element
        const subgraph = self.canvasGraph.getSubgraph(elements);

        if (card.expanded) {
            subgraph.forEach((element) => {
                element.attr('./visibility', 'hidden');
            });
        } else {
            subgraph.forEach((element) => {
                element.attr('./visibility', 'visible');
            });
        }

        cell.attr('./visibility', 'visible');
        card.expanded = !card.expanded;

        self._layoutGraph(self.canvasGraph);

        self.canvasPaper.translate(0, 0);

        //  self.canvasPaper.
    }

    addCanvasGraph(cam: Cam) {
        const self = this;
        const nodes = [];

        self.cam = cam;
        self.canvasGraph.resetCells(nodes);

        each(cam.nodes, (card: Card) => {
            if (card.visible) {

                const el = new CardCell()
                    .addCardPorts()
                    .addColor(card.backgroundColor)
                    .setSuccessorCount(card.successorCount)

                el.attr({ nodeType: { text: card.id ? card.displayCategory : 'Skill' } });
                el.attr({ scardTitle: { text: card.id ? card.title : 'New Card' } });
                el.attr({
                    expand: {
                        event: 'element:expand:pointerdown',
                        stroke: 'black',
                        strokeWidth: 2
                    },
                    expandLabel: {
                        fontSize: 8,
                        fontWeight: 'bold'
                    }
                })
                el.set({
                    card: card,
                    id: card.id,
                    position: card.position,
                    size: card.size,
                });

                nodes.push(el);
            }
        });

        each(cam.triples, (triple: Triple<Card>) => {
            if (triple.predicate.visible) {
                const link = CardLink.create();
                link.setText(triple.predicate.title);
                link.set({
                    card: triple.predicate,
                    id: triple.predicate.id,
                    source: {
                        id: triple.subject.id,
                        port: 'right'
                    },
                    target: {
                        id: triple.object.id,
                        port: 'left'
                    }
                });

                nodes.push(link);
            }
        });

        self.canvasPaper.scaleContentToFit({ minScaleX: 0.3, minScaleY: 0.3, maxScaleX: 1, maxScaleY: 1 });
        self.canvasPaper.setDimensions('10000px', '10000px')
        self.canvasGraph.resetCells(nodes);
        self._layoutGraph(self.canvasGraph);
        self.canvasPaper.unfreeze();
        self.canvasPaper.render();
    }

    addStencilGraph(graph: joint.dia.Graph, cards: Card[]) {
        const self = this;
        const nodes = [];

        each(cards, (card: Card) => {
            const el = new StencilItem()
                // .size(120, 80)
                // .setColor(card.backgroundColor)
                .setIcon(card.iconUrl);
            el.attr('label/text', card.title);
            el.set({ card: cloneDeep(card) });

            nodes.push(el);
        });

        graph.resetCells(nodes);
        self._layout(graph);
    }


    private generateStencilPaper(stencil: Triple<Card>, stencilGraph: joint.dia.Graph): joint.dia.Paper {
        const stencilPaper = new joint.dia.Paper({
            el: document.getElementById(stencil.id),
            height: stencil.triples.length * 52,
            width: '100%',
            model: stencilGraph,
            interactive: false
        });

        return stencilPaper;
    }

    private _layout(graph: joint.dia.Graph) {
        let currentY = 10;
        graph.getElements().forEach((el) => {
            //Sel.getBBox().bottomRight();
            el.position(10, currentY);
            currentY += el.size().height + 10;
        });
    }

    private _layoutGraph(graph) {
        const autoLayoutElements = [];
        const manualLayoutElements = [];
        graph.getElements().forEach((el) => {
            if (el.attr('./visibility') !== 'hidden') {
                autoLayoutElements.push(el);
            }
        });
        // Automatic Layout
        joint.layout.DirectedGraph.layout(graph.getSubgraph(autoLayoutElements), {
            align: 'UR',
            setVertices: true,
            setLabels: true,
            marginX: 50,
            marginY: 50,
            rankSep: 200,
            // nodeSep: 2000,
            //edgeSep: 2000,
            rankDir: "LR"
        });
        // Manual Layout
        manualLayoutElements.forEach(function (el) {
            const neighbor = graph.getNeighbors(el, { inbound: true })[0];
            if (!neighbor) return;
            const neighborPosition = neighbor.getBBox().bottomRight();
            el.position(neighborPosition.x + 20, neighborPosition.y - el.size().height / 2 - 20);
        });
    }

    private _offsetToLocalPoint(x, y) {
        const self = this;

        const svgPoint = joint.Vectorizer.createSVGPoint(x, y);
        // Transform point into the viewport coordinate system.
        const pointTransformed = svgPoint.matrixTransform(self.canvasPaper.viewport.getCTM().inverse());
        return pointTransformed;
    }
}