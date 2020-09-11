import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { noctuaFormConfig } from './../../noctua-form-config';
import * as ModelDefinition from './../../data/config/model-definition';
import * as ShapeDescription from './../../data/config/shape-definition';

import {
  AnnotonNode,
  Annoton,
  Evidence,
  ConnectorAnnoton,
  Entity,
  Predicate
} from './../../models';
import { AnnotonType } from './../../models/annoton/annoton';
import { find, filter, each } from 'lodash';
import { HttpParams } from '@angular/common/http';
import * as EntityDefinition from './../../data/config/entity-definition';
import { NoctuaUserService } from '../user.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoctuaFormConfigService {

  globalUrl: any = {};
  loginUrl: string;
  logoutUrl: string;
  noctuaUrl: string;
  homeUrl: string;
  onSetupReady: BehaviorSubject<any>;

  constructor(private noctuaUserService: NoctuaUserService) {
    this.onSetupReady = new BehaviorSubject(null);
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

  get findReplaceCategories() {
    const options = [
      noctuaFormConfig.findReplaceCategory.options.term,
      noctuaFormConfig.findReplaceCategory.options.gp,
      noctuaFormConfig.findReplaceCategory.options.reference,
    ];

    return {
      options: options,
      selected: options[0]
    };
  }

  get mechanism() {
    const options = [
      noctuaFormConfig.mechanism.options.direct,
      noctuaFormConfig.mechanism.options.known,
      noctuaFormConfig.mechanism.options.unknown
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

  setupUrls() {
    const self = this;
    const baristaToken = self.noctuaUserService.baristaToken;

    const url = new URL(window.location.href);
    url.searchParams.delete('barista_token');

    const returnUrl = url.href;
    const baristaParams = { 'barista_token': baristaToken };
    const returnUrlParams = { 'return': returnUrl };

    this.loginUrl = environment.globalBaristaLocation + '/login?' +
      self._parameterize(Object.assign({}, returnUrlParams));
    this.logoutUrl = environment.globalBaristaLocation + '/logout?' +
      self._parameterize(Object.assign({}, baristaParams, returnUrlParams));
    this.noctuaUrl = environment.noctuaUrl + '?' + (baristaToken ? self._parameterize(Object.assign({}, baristaParams)) : '');
    this.homeUrl = window.location.href;
  }

  setUniversalUrls() {
    const self = this;
    self.globalUrl = {};
    let params = new HttpParams();

    if (self.noctuaUserService.baristaToken) {
      params = params.append('barista_token', self.noctuaUserService.baristaToken);
    }

    const paramsString = params.toString();
    self.globalUrl.goUrl = 'http://www.geneontology.org/';
    self.globalUrl.noctuaUrl = environment.noctuaUrl + '?' + paramsString;
    self.globalUrl.universalWorkbenches = environment.globalWorkbenchesUniversal.map(workbench => {
      return {
        label: workbench['menu-name'],
        url: environment.workbenchUrl + workbench['workbench-id'] + '?' + paramsString,
      };
    });

    return self.globalUrl;
  }

  getModelUrls(modelId: string) {
    const self = this;
    const modelInfo: any = {};

    let params = new HttpParams();

    if (self.noctuaUserService.baristaToken) {
      params = params.append('barista_token', self.noctuaUserService.baristaToken);
    }

    modelInfo.graphEditorUrl = environment.noctuaUrl + '/editor/graph/' + modelId + '?' + params.toString();

    if (modelId) {
      params = params.append('model_id', modelId);
    }

    const paramsString = params.toString();

    modelInfo.owlUrl = environment.noctuaUrl + '/download/' + modelId + '/owl';
    modelInfo.gpadUrl = environment.noctuaUrl + '/download/' + modelId + '/gpad';
    modelInfo.noctuaFormUrl = environment.workbenchUrl + 'noctua-form?' + paramsString;

    modelInfo.modelWorkbenches = environment.globalWorkbenchesModel.map(workbench => {
      return {
        label: workbench['menu-name'],
        url: environment.workbenchUrl + workbench['workbench-id'] + '?' + paramsString,
      };
    });

    return modelInfo;
  }

  createAnnotonConnectorModel(upstreamAnnoton: Annoton, downstreamAnnoton: Annoton, srcProcessNode?: AnnotonNode, srcHasInputNode?: AnnotonNode) {
    const self = this;
    const srcUpstreamNode = upstreamAnnoton.getMFNode();
    const srcDownstreamNode = downstreamAnnoton ? downstreamAnnoton.getMFNode() : new AnnotonNode();
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
