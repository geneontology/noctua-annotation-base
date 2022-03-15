import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, Injectable } from '@angular/core';
import * as jQuery from 'jquery';
import 'jqueryui';
import * as _ from 'lodash';
import * as joint from 'jointjs';
import * as Backbone from 'backbone';

declare module 'jointjs' {
  namespace shapes {
    namespace noctua {
      class NodeCellList extends joint.dia.Element { }
    }
  }
}

import { dia, shapes, g, linkTools, util } from 'jointjs';

const GRID_SIZE = 8;
const PADDING_S = GRID_SIZE;
const PADDING_L = GRID_SIZE * 2;
const FONT_FAMILY = 'sans-serif';
const LIGHT_COLOR = '#FFF';
const DARK_COLOR = 'transparent';
const SECONDARY_DARK_COLOR = '#999';
const LINE_WIDTH = 2;

const HEADER_ICON_SIZE = 50;
const HEADER_HEIGHT = 80;

const LIST_GROUP_NAME = 'list';
const LIST_ITEM_HEIGHT = 28;
const LIST_ITEM_WIDTH = GRID_SIZE * 40;
const LIST_ITEM_GAP = 1;
const LIST_BUTTON_RADIUS = 16;
const LIST_ADD_BUTTON_SIZE = 20;
const LIST_REMOVE_BUTTON_SIZE = 16;
const LIST_IMAGE_SIZE = 20;

const itemPosition = (portsArgs: dia.Element.Port[], elBBox: dia.BBox): g.Point[] => {
  return portsArgs.map((_port: dia.Element.Port, index: number, { length }) => {
    const bottom = elBBox.height - (LIST_ITEM_HEIGHT + LIST_ADD_BUTTON_SIZE) / 2 - PADDING_S;
    const y = (length - 1 - index) * (LIST_ITEM_HEIGHT + LIST_ITEM_GAP);
    return new g.Point(0, bottom - y);
  });
};

const itemAttributes = {
  attrs: {
    portBody: {
      width: 'calc(w)',
      height: 'calc(h)',
      x: '0',
      y: 'calc(-0.5*h)',
      fill: DARK_COLOR
    },
    relationship: {
      pointerEvents: 'none',
      fontFamily: FONT_FAMILY,
      fontWeight: 400,
      fontSize: 9,
      fill: 'black',
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
      textWrap: {
        width: - LIST_REMOVE_BUTTON_SIZE - PADDING_L - 2 * PADDING_S - LIST_IMAGE_SIZE,
        maxLineCount: 1,
        ellipsis: true
      },
      x: 8
    },
    portLabel: {
      pointerEvents: 'none',
      fontFamily: FONT_FAMILY,
      fontWeight: 400,
      fontSize: 13,
      fill: 'black',
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
      textWrap: {
        width: - LIST_REMOVE_BUTTON_SIZE - PADDING_L - 2 * PADDING_S - LIST_IMAGE_SIZE,
        maxLineCount: 1,
        ellipsis: true
      },
      x: 100
    },

  },
  size: {
    width: LIST_ITEM_WIDTH,
    height: LIST_ITEM_HEIGHT
  },
  markup: [{
    tagName: 'rect',
    selector: 'portBody'
  }, {
    tagName: 'text',
    selector: 'relationship'
  }, {
    tagName: 'text',
    selector: 'portLabel',
  }]
};

const headerAttributes = {
  attrs: {
    root: {
      magnet: true,
    },
    '.wrapper': {
      magnet: true,
      refWidth: '100%',
      refHeight: '100%',
      fill: 'transparent',
      stroke: 'rgba(0,0,255,0.3)',
    },
    '.highlighter': {
      refWidth: '100%',
      refHeight: '100%',
      fill: 'none',
      stroke: 'transparent',
      'stroke-width': 10,
    },
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      fill: LIGHT_COLOR,
      strokeWidth: LINE_WIDTH / 2,
      stroke: SECONDARY_DARK_COLOR,
      rx: 3,
      ry: 3,
    },
    icon: {
      width: HEADER_ICON_SIZE,
      height: HEADER_ICON_SIZE,
      x: PADDING_L,
      y: (HEADER_HEIGHT - HEADER_ICON_SIZE) / 2,
    },
    label: {
      transform: `translate(${PADDING_L + HEADER_ICON_SIZE + PADDING_L},${PADDING_L})`,
      fontFamily: FONT_FAMILY,
      fontWeight: 600,
      fontSize: 16,
      fill: DARK_COLOR,
      text: 'Label',
      textWrap: {
        width: - PADDING_L - HEADER_ICON_SIZE - PADDING_L - PADDING_L,
        maxLineCount: 1,
        ellipsis: true
      },
      textVerticalAnchor: 'top',
    },
    description: {
      transform: `translate(${PADDING_L + HEADER_ICON_SIZE + PADDING_L},${PADDING_L + 20})`,
      fontFamily: FONT_FAMILY,
      fontWeight: 400,
      fontSize: 13,
      lineHeight: 13,
      fill: SECONDARY_DARK_COLOR,
      textVerticalAnchor: 'top',
      text: 'Description',
      textWrap: {
        width: - PADDING_L - HEADER_ICON_SIZE - PADDING_L - PADDING_L,
        maxLineCount: 2,
        ellipsis: true
      }
    },
    '.edit': {
      event: 'element:.edit:pointerdown',
      'xlink:href': './assets/icons/edit.svg',
      ref: '.wrapper',
      refX: '100%',
      refX2: 5,
      y: 0,
      height: 20,
      cursor: 'pointer',
      visibility: 'hidden'
    },
    '.delete': {
      event: 'element:.delete:pointerdown',
      'xlink:href': './assets/icons/delete.svg',
      ref: '.wrapper',
      refX: '100%',
      refX2: 5,
      y: 30,
      height: 20,
      cursor: 'pointer',
      visibility: 'hidden',
    },
    portAddButton: {
      title: 'Add List Item',
      cursor: 'pointer',
      event: 'element:port:add',
      transform: `translate(calc(w-${3 * PADDING_S}),calc(h))`
    },
    portAddButtonBody: {
      width: LIST_ADD_BUTTON_SIZE,
      height: LIST_ADD_BUTTON_SIZE,
      rx: LIST_BUTTON_RADIUS,
      ry: LIST_BUTTON_RADIUS,
      x: -LIST_ADD_BUTTON_SIZE / 2,
      y: -LIST_ADD_BUTTON_SIZE / 2,
    },
    portAddButtonIcon: {
      d: 'M -4 0 4 0 M 0 -4 0 4',
      stroke: LIGHT_COLOR,
      strokeWidth: LINE_WIDTH
    }
  },
  markup: [{
    tagName: 'rect',
    selector: '.wrapper',
  }, {
    tagName: 'rect',
    selector: '.highlighter',
  }, {
    tagName: 'rect',
    selector: 'body',
  }, {
    tagName: 'text',
    selector: 'label',
  }, {
    tagName: 'text',
    selector: 'description',
  }, {
    tagName: 'image',
    selector: 'icon',
  }, {
    tagName: 'image',
    selector: '.edit',
  }, {
    tagName: 'image',
    selector: '.delete',
  }, {
    tagName: 'g',
    selector: 'portAddButton',
    children: [{
      tagName: 'rect',
      selector: 'portAddButtonBody'
    }, {
      tagName: 'path',
      selector: 'portAddButtonIcon'
    }]
  }]
};

export class NodeCellList extends dia.Element {

  defaults() {
    return {
      ...super.defaults,
      ...headerAttributes,
      type: 'ListElement',
      size: { width: LIST_ITEM_WIDTH, height: 0 },
      ports: {
        groups: {
          [LIST_GROUP_NAME]: {
            position: itemPosition,
            ...itemAttributes
          }
        },
        items: []
      }
    }
  }

  initialize(...args: any[]) {
    this.on('change:ports', () => this.resizeToFitPorts());
    this.resizeToFitPorts();
    super.initialize.call(this, ...args);
  }

  addEntity(relationship: string, term: string) {
    this.addPort({
      group: LIST_GROUP_NAME,
      attrs: {
        relationship: { text: relationship },
        portLabel: { text: term }
      }
    });
    this.resizeToFitPorts()
  }

  resizeToFitPorts() {
    const { length } = this.getPorts();
    this.prop(['size', 'height'], HEADER_HEIGHT + (LIST_ITEM_HEIGHT + LIST_ITEM_GAP) * length + PADDING_L);
  }

}

class ListLink extends shapes.standard.DoubleLink {

  defaults() {
    return util.defaultsDeep({
      type: 'ListLink',
      z: -1,
      attrs: {
        line: {
          stroke: LIGHT_COLOR,
          targetMarker: {
            stroke: SECONDARY_DARK_COLOR
          }
        },
        outline: {
          stroke: SECONDARY_DARK_COLOR
        }
      }
    }, super.defaults);
  }
}



// Events



function onPaperElementPortRemove(elementView: dia.ElementView, evt: dia.Event): void {
  evt.stopPropagation();
  const portId = elementView.findAttribute('port', evt.target);
  const message = elementView.model as NodeCellList
  message.removePort(portId);
}

function onPaperLinkMouseEnter(linkView: dia.LinkView) {
  const toolsView = new dia.ToolsView({
    tools: [new linkTools.Remove()]
  });
  linkView.addTools(toolsView);
}

function onPaperLinkMouseLeave(linkView: dia.LinkView) {
  linkView.removeTools();
}

// Example Diagram

const list1 = new NodeCellList({
  attrs: {
    label: {
      text: 'List of Items 1'
    },
    description: {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus quis gravida sem, vitae mollis lectus. Vivamus in justo sit amet turpis auctor facilisis eget vitae magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut varius tortor. Donec volutpat pharetra augue, sed tincidunt nibh tempus eu. Nulla facilisi. Quisque pharetra, elit porta laoreet faucibus, justo dui ullamcorper massa, vitae sollicitudin metus nunc vel leo. Curabitur sit amet mattis tortor. Morbi eleifend viverra suscipit. Maecenas fringilla, nibh vitae elementum rutrum, ipsum ipsum volutpat nisi, eu euismod arcu justo sit amet dolor. Nam pulvinar ligula varius purus vestibulum tincidunt.'
    }
  }
});

