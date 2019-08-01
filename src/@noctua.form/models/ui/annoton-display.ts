import * as _ from 'lodash';
declare const require: any;
const each = require('lodash/forEach');
const map = require('lodash/map');
const uuid = require('uuid/v1');
import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonError, Annoton, AnnotonNode, Triple, Predicate } from '../annoton';
import { NodeDisplay } from './node-display';
import { Graph, getNodes, findNode, addNode, getEdges, Edge } from '../annoton/noctua-form-graph';
import { SaeGraph } from '../annoton/sae-graph';


export class AnnotonDisplay extends SaeGraph<NodeDisplay>  {
  gp
  id: string;
  label: string;
  parser;
  annotonType;
  annotonModelType;
  errors;
  submitErrors;
  expanded = false;
  visible = true;
  private _presentation: any;
  private _displayableNodes = ['mf', 'bp', 'cc', 'mf-1', 'mf-2', 'bp-1', 'bp-1-1', 'cc-1', 'cc-1-1', 'c-1-1-1'];
  private _grid: any[] = [];

  constructor() {
    super();
    this.annotonType = 'simple';
    this.annotonModelType = 'default';
    this.errors = [];
    this.submitErrors = [];
  }

  setAnnotonType(type) {
    this.annotonType = type;
  }

  setAnnotonModelType(type) {
    this.annotonModelType = type;
  }

  get grid() {
    const self = this;

    if (self._grid.length === 0) {
      this.generateGrid();
    }
    return this._grid;
  }

  enableSubmit() {
    const self = this;
    let result = true;
    self.submitErrors = [];

    each(self.nodes, function (node: NodeDisplay) {
      result = node.enableSubmit(self.submitErrors) && result;
    });

    if (self.annotonType === 'simple') {
      let gp = self.getNode('gp');
      if (gp) {
        gp.required = false;
        if (!gp.getTerm().id) {
          gp.required = true;
          let meta = {
            aspect: self.label
          }
          let error = new AnnotonError('error', 1, "A '" + gp.label + "' is required", meta)
          self.submitErrors.push(error);
          result = false;
        }
      }
    }

    return result;
  }

  getAnnotonNode(nodeDisplay: NodeDisplay): AnnotonNode {
    const annotonNode = new AnnotonNode();
    annotonNode.id = nodeDisplay.id;
    annotonNode.uuid = nodeDisplay.uuid;
    annotonNode.term = nodeDisplay.term;

    return annotonNode;
  }

  createSave() {
    const self = this;
    const saveData = {
      title: 'enabled by ' + self.getNode('gp').term.label,
      triples: []
    };

    const graph = self.getTrimmedGraph('mf');
    const edges: Edge<Triple<NodeDisplay>>[] = getEdges(graph);
    const triples: Triple<NodeDisplay>[] = edges.map((edge: Edge<Triple<NodeDisplay>>) => {
      return edge.metadata;
    });

    saveData.triples = triples;

    console.log(graph);
    console.log(saveData);

    return saveData;
  }

  get presentation() {
    const self = this;

    if (this._presentation) {
      return this._presentation;
    }

    const gp = self.getNode('gp');
    const mf = self.getNode('mf');
    const result = {
      gpText: gp ? gp.getTerm().label : '',
      mfText: mf ? mf.getTerm().label : '',
      geneProduct: gp,
      mcNode: self.getNode('mc'),
      gp: {},
      fd: {},
      extra: []
    };

    each(self.nodes, function (node: NodeDisplay) {
      if (_.includes(self._displayableNodes, node.id)) {
        if (node.displaySection && node.displayGroup) {
          if (!result[node.displaySection.id][node.displayGroup.id]) {
            result[node.displaySection.id][node.displayGroup.id] = {
              shorthand: node.displayGroup.shorthand,
              label: node.displayGroup.label,
              nodes: []
            };
          }

          result[node.displaySection.id][node.displayGroup.id].nodes.push(node);
          node.nodeGroup = result[node.displaySection.id][node.displayGroup.id];

          if (node.isComplement) {
            node.nodeGroup.isComplement = true;
          }
        }
      }
    });


    this._presentation = result;

    return this._presentation
  }

  addAnnotonPresentation(displaySectionId) {
    const self = this;
    let result = {};
    result[displaySectionId] = {};

    each(self.nodes, function (node: NodeDisplay) {
      if (node.displaySection === displaySectionId && node.displayGroup) {
        if (!result[displaySectionId][node.displayGroup.id]) {
          result[displaySectionId][node.displayGroup.id] = {
            shorthand: node.displayGroup.shorthand,
            label: node.displayGroup.label,
            nodes: []
          };
        }
        result[displaySectionId][node.displayGroup.id].nodes.push(node);
        node.nodeGroup = result[displaySectionId][node.displayGroup.id];
        if (node.isComplement) {
          node.nodeGroup.isComplement = true;
        }
      }
    });

    this.presentation.extra.push(result);

    return result[displaySectionId];
  }

  generateGrid() {
    const self = this;
    self._grid = [];

    each(self.presentation.fd, function (nodeGroup) {
      each(nodeGroup.nodes, function (node: NodeDisplay) {
        let term = node.getTerm();

        if (node.id !== 'mc' && node.id !== 'gp' && term.id && _.includes(self._displayableNodes, node.id)) {
          self.generateGridRow(node);
        }
      });
    });
  }

  generateGridRow(node: NodeDisplay) {
    const self = this;

    let term = node.getTerm();

    self._grid.push({
      displayEnabledBy: self.tableCanDisplayEnabledBy(node),
      treeLevel: node.treeLevel,
      gp: self.tableDisplayGp(node),
      relationship: node.isExtension ? '' : self.tableDisplayExtension(node),
      relationshipExt: node.isExtension ? node.relationship.label : '',
      term: node.isExtension ? {} : term,
      extension: node.isExtension ? term : {},
      aspect: node.aspect,
      /*    evidence: node.evidence.length > 0 ? node.evidence[0].evidence : {},
         reference: node.evidence.length > 0 ? node.evidence[0].reference : {},
         with: node.evidence.length > 0 ? node.evidence[0].with : {},
         assignedBy: node.evidence.length > 0 ? node.evidence[0].assignedBy : {},
         node: node */
    })

    /*for (let i = 1; i < node.evidence.length; i++) {
      self._grid.push({
        treeLevel: node.treeLevel,
        evidence: node.evidence[i].evidence,
        reference: node.evidence[i].reference,
        with: node.evidence[i].with.control,
        assignedBy: node.evidence[i].assignedBy,
        node: node,
      })
    } */
  }

  tableDisplayGp(node: NodeDisplay) {
    const self = this;

    let display = false;

    switch (self.annotonModelType) {
      case noctuaFormConfig.annotonModelType.options.default.name:
      case noctuaFormConfig.annotonModelType.options.bpOnly.name:
        display = node.id === 'mf';
        break;
      case noctuaFormConfig.annotonModelType.options.ccOnly.name:
        display = node.id === 'cc';
        break;
    }
    return display ? self.gp : '';
  }

  tableCanDisplayEnabledBy(node: NodeDisplay) {
    const self = this;

    return node.relationship.id === noctuaFormConfig.edge.enabledBy.id
  }

  tableDisplayExtension(node: NodeDisplay) {
    const self = this;

    if (node.id === 'mf') {
      return '';
    } else if (node.isComplement) {
      return 'NOT ' + node.relationship.label;
    } else {
      return node.relationship.label;
    }
  }

  print() {
    let result = []
    this.nodes.forEach((node) => {
      let a = [];

      /*  node.evidence.forEach((evidence: Evidence) => {
         a.push({
           evidence: evidence.evidence,
           reference: evidence.reference,
           with: evidence.with
         });
       }); */

      result.push({
        id: node.id,
        term: node.term,
        evidence: a
      })
    });

    console.log(result, JSON.stringify(result));
    return result;
  };
}