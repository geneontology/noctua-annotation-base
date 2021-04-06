import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { noctuaFormConfig } from './../../noctua-form-config';
import * as ModelDefinition from './../../data/config/model-definition';
import * as ShapeDescription from './../../data/config/shape-definition';

import { Activity, ActivityType } from './../../models/activity/activity';
import { find, filter, each } from 'lodash';
import { HttpParams } from '@angular/common/http';
import * as EntityDefinition from './../../data/config/entity-definition';
import { NoctuaUserService } from '../user.service';
import { BehaviorSubject } from 'rxjs';
import { ActivityNode } from './../../models/activity/activity-node';
import { ConnectorActivity } from './../../models/activity/connector-activity';
import { Entity } from './../../models/activity/entity';
import { Evidence } from './../../models/activity/evidence';
import { Predicate } from './../../models/activity/predicate';

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

  get activityType() {
    const options = [
      noctuaFormConfig.activityType.options.default,
      noctuaFormConfig.activityType.options.bpOnly,
      noctuaFormConfig.activityType.options.ccOnly,
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

    self.globalUrl.universalBetaTestWorkbenches = environment.globalWorkbenchesUniversalBetaTest.map(workbench => {
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

    modelInfo.modelBetaTestWorkbenches = environment.globalWorkbenchesModelBetaTest.map(workbench => {
      return {
        label: workbench['menu-name'],
        url: environment.workbenchUrl + workbench['workbench-id'] + '?' + paramsString,
      };
    });

    return modelInfo;
  }

  createActivityConnectorModel(upstreamActivity: Activity, downstreamActivity: Activity, srcProcessNode?: ActivityNode, srcHasInputNode?: ActivityNode) {
    const self = this;
    const srcUpstreamNode = upstreamActivity.getMFNode();
    const srcDownstreamNode = downstreamActivity ? downstreamActivity.getMFNode() : new ActivityNode();
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

    const connectorActivity = new ConnectorActivity(upstreamNode, downstreamNode);
    connectorActivity.predicate = new Predicate(null);
    connectorActivity.predicate.setEvidence(srcUpstreamNode.predicate.evidence);
    connectorActivity.upstreamActivity = upstreamActivity;
    connectorActivity.downstreamActivity = downstreamActivity;
    connectorActivity.processNode = processNode;
    connectorActivity.hasInputNode = hasInputNode;

    return connectorActivity;
  }

  createActivityBaseModel(modelType: ActivityType): Activity {
    switch (modelType) {
      case ActivityType.default:
        return ModelDefinition.createActivity(ModelDefinition.activityUnitBaseDescription);
      case ActivityType.bpOnly:
        return ModelDefinition.createActivity(ModelDefinition.bpOnlyAnnotationBaseDescription);
      case ActivityType.ccOnly:
        return ModelDefinition.createActivity(ModelDefinition.ccOnlyAnnotationBaseDescription);
    }
  }

  createActivityModel(activityType: ActivityType): Activity {
    switch (activityType) {
      case ActivityType.default:
        return ModelDefinition.createActivity(ModelDefinition.activityUnitDescription);
      case ActivityType.bpOnly:
        return ModelDefinition.createActivity(ModelDefinition.bpOnlyAnnotationDescription);
      case ActivityType.ccOnly:
        return ModelDefinition.createActivity(ModelDefinition.ccOnlyAnnotationDescription);
    }
  }

  insertActivityNode(activity: Activity,
    subjectNode: ActivityNode,
    nodeDescription: ShapeDescription.ShapeDescription): ActivityNode {
    return ModelDefinition.insertNode(activity, subjectNode, nodeDescription);
  }

  createActivityModelFakeData(nodes) {
    const self = this;
    const activity = self.createActivityModel(ActivityType.default);

    nodes.forEach((node) => {
      const activityNode = activity.getNode(node.id);
      const destEvidences: Evidence[] = [];

      activityNode.term = new Entity(node.term.id, node.term.label);

      each(node.evidence, (evidence) => {
        const destEvidence: Evidence = new Evidence();

        destEvidence.evidence = new Entity(evidence.evidence.id, evidence.evidence.label);
        destEvidence.reference = evidence.reference;
        destEvidence.with = evidence.with;

        destEvidences.push(destEvidence);
      });

      activityNode.predicate.setEvidence(destEvidences);
    });

    activity.enableSubmit();
    return activity;
  }

  findEdge(predicateId) {

    const edge = find(noctuaFormConfig.allEdges, {
      id: predicateId
    });

    return edge ? Entity.createEntity(edge) : Entity.createEntity({ id: predicateId, label: predicateId });
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
