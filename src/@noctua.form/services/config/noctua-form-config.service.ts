import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { noctuaFormConfig } from './../../noctua-form-config';
import * as ModelDefinition from './../../data/config/model-definition';
import * as ShapeDescription from './../../data/config/shape-definition';

declare const require: any;

const each = require('lodash/forEach');
import {
  AnnotonNode,
  Annoton,
  Evidence,
  ConnectorAnnoton,
  Entity,
  Predicate
} from './../../models';
import { AnnotonType } from './../../models/annoton/annoton';
import { find } from 'lodash';
import { HttpParams } from '@angular/common/http';
import * as EntityDefinition from './../../data/config/entity-definition';

@Injectable({
  providedIn: 'root'
})
export class NoctuaFormConfigService {

  private _baristaToken;

  constructor() {

  }

  set baristaToken(value) {
    this._baristaToken = value;
    localStorage.setItem('barista_token', value);
  }

  get baristaToken() {
    return this._baristaToken;
  }

  get edges() {
    return noctuaFormConfig.edge;
  }

  get modelState() {
    const options = [
      noctuaFormConfig.modelState.options.development,
      noctuaFormConfig.modelState.options.production,
      noctuaFormConfig.modelState.options.review,
      noctuaFormConfig.modelState.options.closed,
      noctuaFormConfig.modelState.options.delete
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  findModelState(name) {
    const self = this;

    return find(self.modelState.options, (modelState) => {
      return modelState.name === name;
    });
  }

  get evidenceDBs() {
    const options = [
      noctuaFormConfig.evidenceDB.options.pmid,
      noctuaFormConfig.evidenceDB.options.doi,
      noctuaFormConfig.evidenceDB.options.goRef,
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  get annotonType() {
    const options = [
      noctuaFormConfig.annotonType.options.default,
      noctuaFormConfig.annotonType.options.bpOnly,
      noctuaFormConfig.annotonType.options.ccOnly,
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  get bpOnlyEdges() {
    const options = [
      noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
      noctuaFormConfig.edge.causallyUpstreamOf,
      noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect,
      noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect,
      noctuaFormConfig.edge.causallyUpstreamOfOrWithinPositiveEffect,
      noctuaFormConfig.edge.causallyUpstreamOfOrWithinNegativeEffect,
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  get camDisplayType() {
    const options = [
      noctuaFormConfig.camDisplayType.options.model,
      noctuaFormConfig.camDisplayType.options.triple,
      noctuaFormConfig.camDisplayType.options.entity
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  get causalEffect() {
    const options = [
      noctuaFormConfig.causalEffect.options.positive,
      noctuaFormConfig.causalEffect.options.negative,
      noctuaFormConfig.causalEffect.options.neutral
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  get connectorProcess() {
    const options = noctuaFormConfig.connectorProcesses;

    return {
      options: options,
      selected: options[0]
    };
  }

  get causalReactionProduct() {
    const options = [
      noctuaFormConfig.causalReactionProduct.options.regulate,
      noctuaFormConfig.causalReactionProduct.options.substrate,
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  getModelUrls(modelId) {
    const self = this;
    const modelInfo: any = {};

    let params = new HttpParams();
    if (modelId) {
      params = params.append('model_id', modelId);
    }
    if (self.baristaToken) {
      params = params.append('barista_token', self.baristaToken);
    }

    const paramsString = params.toString();

    modelInfo.goUrl = 'http://www.geneontology.org/';
    modelInfo.noctuaUrl = environment.noctuaUrl + '?' + paramsString;
    modelInfo.owlUrl = environment.noctuaUrl + '/download/' + modelId + '/owl';
    modelInfo.gpadUrl = environment.noctuaUrl + '/download/' + modelId + '/gpad';
    modelInfo.graphEditorUrl = environment.noctuaUrl + '/editor/graph/' + modelId + '?' + paramsString;
    modelInfo.noctuaFormUrl = environment.workbenchUrl + 'noctua-form?' + paramsString;

    modelInfo.workbenches = environment.globalWorkbenchesModel.map(workbench => {
      return {
        label: workbench['menu-name'],
        url: environment.workbenchUrl + workbench['workbench-id'] + '?' + paramsString,
      };
    });

    return modelInfo;
  }

  getNewModelUrl(modelId) {
    const self = this;
    const baristaParams = { 'barista_token': self.baristaToken };
    const modelIdParams = { 'model_id': modelId };
    const url = environment.workbenchUrl + 'noctua-form?' + (self.baristaToken ? self._parameterize(Object.assign({}, modelIdParams, baristaParams)) : self._parameterize(Object.assign({}, modelIdParams)));

    return url;
  }

  getUniversalWorkbenchUrl(workbenchName: string, extraParamString) {
    const self = this;
    const baristaParams = { 'barista_token': self.baristaToken };
    const queryString =
      (self.baristaToken ? self._parameterize(Object.assign({}, baristaParams)) + '&' + extraParamString
        : extraParamString);
    const url = environment.workbenchUrl + workbenchName + '?' + queryString;

    return url;
  }

  createAnnotonConnectorModel(upstreamAnnoton: Annoton, downstreamAnnoton: Annoton, srcProcessNode?: AnnotonNode, srcHasInputNode?: AnnotonNode) {
    const self = this;
    const srcUpstreamNode = upstreamAnnoton.getMFNode();
    const srcDownstreamNode = downstreamAnnoton.getMFNode();
    const upstreamNode = EntityDefinition.generateBaseTerm([EntityDefinition.GoMolecularEntity], { id: 'upstream', isKey: true });
    const downstreamNode = EntityDefinition.generateBaseTerm([EntityDefinition.GoMolecularEntity], { id: 'downstream', isKey: true });
    const processNode = srcProcessNode ?
      srcProcessNode :
      EntityDefinition.generateBaseTerm([EntityDefinition.GoBiologicalProcess], { id: 'process', isKey: true });
    const hasInputNode = srcHasInputNode ?
      srcHasInputNode :
      EntityDefinition.generateBaseTerm([EntityDefinition.GoChemicalEntity], { id: 'has-input', isKey: true });


    upstreamNode.copyValues(srcUpstreamNode);
    downstreamNode.copyValues(srcDownstreamNode);

    const connectorAnnoton = new ConnectorAnnoton(upstreamNode, downstreamNode);
    connectorAnnoton.predicate = new Predicate(null);
    connectorAnnoton.predicate.setEvidence(srcUpstreamNode.predicate.evidence);
    connectorAnnoton.upstreamAnnoton = upstreamAnnoton;
    connectorAnnoton.downstreamAnnoton = downstreamAnnoton;
    connectorAnnoton.processNode = processNode;
    connectorAnnoton.hasInputNode = hasInputNode;

    return connectorAnnoton;
  }

  createAnnotonBaseModel(modelType: AnnotonType): Annoton {
    switch (modelType) {
      case AnnotonType.default:
        return ModelDefinition.createActivity(ModelDefinition.activityUnitBaseDescription);
      case AnnotonType.bpOnly:
        return ModelDefinition.createActivity(ModelDefinition.bpOnlyAnnotationBaseDescription);
      case AnnotonType.ccOnly:
        return ModelDefinition.createActivity(ModelDefinition.ccOnlyAnnotationBaseDescription);
    }
  }

  createAnnotonModel(modelType: AnnotonType): Annoton {
    switch (modelType) {
      case AnnotonType.default:
        return ModelDefinition.createActivity(ModelDefinition.activityUnitDescription);
      case AnnotonType.bpOnly:
        return ModelDefinition.createActivity(ModelDefinition.bpOnlyAnnotationDescription);
      case AnnotonType.ccOnly:
        return ModelDefinition.createActivity(ModelDefinition.ccOnlyAnnotationDescription);
    }
  }

  insertAnnotonNode(annoton: Annoton,
    subjectNode: AnnotonNode,
    nodeDescription: ShapeDescription.ShapeDescription): AnnotonNode {
    return ModelDefinition.insertNode(annoton, subjectNode, nodeDescription);
  }

  createAnnotonModelFakeData(nodes) {
    const self = this;
    const annoton = self.createAnnotonModel(AnnotonType.default);

    nodes.forEach((node) => {
      const annotonNode = annoton.getNode(node.id);
      const destEvidences: Evidence[] = [];

      annotonNode.term = new Entity(node.term.id, node.term.label);

      each(node.evidence, (evidence) => {
        const destEvidence: Evidence = new Evidence();

        destEvidence.evidence = new Entity(evidence.evidence.id, evidence.evidence.label);
        destEvidence.reference = evidence.reference;
        destEvidence.with = evidence.with;

        destEvidences.push(destEvidence);
      });

      annotonNode.predicate.setEvidence(destEvidences);
    });

    annoton.enableSubmit();
    return annoton;
  }


  findEdge(predicateId) {
    find(noctuaFormConfig.edge, {
      id: predicateId
    });
  }

  createJoyrideSteps() {

    const steps = [{
      type: 'element',
      selector: '#noc-model-section',
      title: 'Model Creation',
      content: `Define model's title and state. <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'bottom'
    }, {
      type: 'element',
      selector: '#noc-gp-section',
      title: 'Enter gene product',
      content: `Enter gene product or macromolecular complex to be annotated <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'bottom'
    }, {
      type: 'element',
      selector: '#noc-gp-toggle-button',
      title: 'Select',
      content: `Toggle between gene product or macromolecular complex <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'left'
    }, {
      type: 'element',
      selector: "#noc-fd-section",
      title: "Enter Molecular Function",
      content: `Enter the molecular function, evidence, and reference. Then enter other optional fields <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'top'
    }, {
      type: 'element',
      selector: "#noc-submit-row",
      title: "Create The Activity",
      content: 'Check if there are any errors (create button not greyed out). Add the new activity to a model. <a href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>',
      placement: 'top'
    }, {
      type: 'element',
      selector: "#noc-start-model-button",
      title: "Model Creation",
      content: `You can also start a new model <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'left'
    }, {
      type: 'element',
      selector: "#noc-molecular-activities",
      title: "Molecular Activities in the Model",
      content: 'This is where all the molecular activities in this model appear.',
      placement: 'top'
    }];

    return steps;
  }

  getAspect(id) {
    const rootNode = find(noctuaFormConfig.rootNode, { id: id });

    return rootNode ? rootNode.aspect : '';
  }

  getModelId(url: string) {
    return 'gomodel:' + url.substr(url.lastIndexOf('/') + 1);
  }

  getIndividalId(url: string) {
    return 'gomodel:' + url.substr(url.lastIndexOf('/') + 2);
  }

  private _parameterize = (params) => {
    return Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }

}
