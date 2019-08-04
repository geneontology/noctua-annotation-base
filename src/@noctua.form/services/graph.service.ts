import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';



import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Cam,
  Annoton,
  Triple,
  AnnotonNode,
  AnnotonParser,
  AnnotonError,
  Evidence,
  SimpleAnnoton,
  Entity,
  ConnectorAnnoton,
  ConnectorType,
  ConnectorState,
  Predicate
} from './../models/annoton/';
//Config
import { noctuaFormConfig } from './../noctua-form-config';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { NoctuaLookupService } from './lookup.service';
import { NoctuaAnnotonFormService } from './../services/annoton-form.service';
//User
import { NoctuaUserService } from './../services/user.service';

import 'rxjs/add/observable/forkJoin';
import * as _ from 'lodash';


declare const require: any;



const each = require('lodash/forEach');
const forOwn = require('lodash/forOwn');
const model = require('bbop-graph-noctua');
const amigo = require('amigo2');
const bbopx = require('bbopx');
const golr_response = require('bbop-response-golr');
const golr_manager = require('bbop-manager-golr');
const golr_conf = require("golr-conf");
const node_engine = require('bbop-rest-manager').node;
const barista_response = require('bbop-response-barista');
const minerva_requests = require('minerva-requests');
const jquery_engine = require('bbop-rest-manager').jquery;
const class_expression = require('class-expression');
const minerva_manager = require('bbop-manager-minerva');

@Injectable({
  providedIn: 'root'
})
export class NoctuaGraphService {
  title;
  golrServer = environment.globalGolrServer;
  baristaLocation = environment.globalBaristaLocation;
  minervaDefinitionName = environment.globalMinervaDefinitionName;
  locationStore = new bbopx.noctua.location_store();
  baristaToken;
  linker;
  loggedIn;
  userInfo;
  modelInfo;
  localClosures;

  constructor(
    private noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private annotonFormService: NoctuaAnnotonFormService,
    private httpClient: HttpClient,
    private noctuaLookupService: NoctuaLookupService) {
    this.linker = new amigo.linker();
    this.userInfo = {
      groups: [],
      selectedGroup: {}
    }
    this.modelInfo = {
      graphEditorUrl: ""
    }
    this.localClosures = [];

  }

  registerManager() {
    const engine = new jquery_engine(barista_response);
    engine.method('POST');

    const manager = new minerva_manager(
      this.baristaLocation,
      this.minervaDefinitionName,
      this.noctuaUserService.baristaToken,
      engine, 'async');


    const managerError = (resp) => {
      console.log('There was a manager error (' +
        resp.message_type() + '): ' + resp.message());
    }

    const warning = (resp) => {
      alert('Warning: ' + resp.message() + '; ' +
        'your operation was likely not performed');
    }

    const error = (resp) => {
      const perm_flag = 'InsufficientPermissionsException';
      const token_flag = 'token';
      if (resp.message() && resp.message().indexOf(perm_flag) !== -1) {
        alert('Error: it seems like you do not have permission to ' +
          'perform that operation. Did you remember to login?');
      } else if (resp.message() && resp.message().indexOf(token_flag) !== -1) {
        alert('Error: it seems like you have a bad token...');
      } else {
        console.log('error:', resp, resp.message_type(), resp.message());

        if (resp.message().includes('UnknownIdentifierException')) {
          //  cam.error = true
        }
      }
    }

    const shieldsUp = () => { }
    const shieldsDown = () => { }

    manager.register('prerun', shieldsUp);
    manager.register('postrun', shieldsDown, 9);
    manager.register('manager_error', managerError, 10);
    manager.register('warning', warning, 10);
    manager.register('error', error, 10);

    return manager;
  }

  getGraphInfo(cam: Cam, modelId) {
    const self = this;

    cam.onGraphChanged = new BehaviorSubject(null);
    cam.modelId = modelId;
    cam.manager = this.registerManager();
    cam.individualManager = this.registerManager();
    cam.groupManager = this.registerManager();

    const rebuild = (resp) => {
      const noctua_graph = model.graph;

      cam.graph = new noctua_graph();
      cam.modelId = resp.data().id;
      cam.graph.load_data_basic(resp.data());
      const titleAnnotations = cam.graph.get_annotations_by_key('title');
      const stateAnnotations = cam.graph.get_annotations_by_key('state');

      if (titleAnnotations.length > 0) {
        cam.title = titleAnnotations[0].value();
      }

      if (stateAnnotations.length > 0) {
        cam.state = self.noctuaFormConfigService.findModelState(stateAnnotations[0].value());
      }

      self.graphPreParse(cam.graph).subscribe((data) => {
        cam.annotons = self.graphToAnnotons(cam);
        cam.connectorAnnotons = self.getConnectorAnnotons(cam);
        self.saveMFLocation(cam);
        self.graphPostParse(cam, cam.graph).subscribe((data) => {
          cam.onGraphChanged.next(cam.annotons);
        });
      });
    };

    cam.manager.register('rebuild', function (resp) {
      rebuild(resp);
    }, 10);

    cam.manager.get_model(modelId);
  }


  addModel(manager) {
    manager.add_model();
  }

  getNodeInfo(node) {
    const result: any = {};

    each(node.types(), function (srcType) {
      const type = srcType.type() === 'complement' ? srcType.complement_class_expression() : srcType;

      result.id = type.class_id();
      result.label = type.class_label();
      result.classExpression = type;
    });

    return result;
  }

  getNodeLocation(node) {
    const result = {
      x: 0,
      y: 0
    };

    const x_annotations = node.get_annotations_by_key('hint-layout-x');
    const y_annotations = node.get_annotations_by_key('hint-layout-y');

    if (x_annotations.length === 1) {
      result.x = parseInt(x_annotations[0].value());
    }

    if (y_annotations.length === 1) {
      result.y = parseInt(y_annotations[0].value());
    }

    return result;
  }

  getNodeIsComplement(node) {
    let result = true;

    if (node) {
      each(node.types(), function (in_type) {
        const t = in_type.type();
        result = result && (t === 'complement');
      });
    }

    return result;
  }

  nodeToAnnotonNode(graph, objectId) {
    const self = this;

    const node = graph.get_node(objectId);
    const nodeInfo = self.getNodeInfo(node);
    const result = {
      uuid: objectId,
      term: new Entity(nodeInfo.id, nodeInfo.label),
      classExpression: nodeInfo.classExpression,
      location: self.getNodeLocation(node),
      isComplement: self.getNodeIsComplement(node)
    };

    return result;
  }

  edgeToEvidence(graph, edge) {
    const self = this;
    const evidenceAnnotations = edge.get_annotations_by_key('evidence');
    const result = [];

    each(evidenceAnnotations, function (evidenceAnnotation) {
      const annotationId = evidenceAnnotation.value();
      const annotationNode = graph.get_node(annotationId);
      const evidence = new Evidence();

      evidence.edge = new Entity(edge.predicate_id(), '');
      evidence.uuid = annotationNode.id();
      if (annotationNode) {

        const nodeInfo = self.getNodeInfo(annotationNode);
        evidence.setEvidence(new Entity(nodeInfo.id, nodeInfo.label), nodeInfo.classExpression);

        const sources = annotationNode.get_annotations_by_key('source');
        const withs = annotationNode.get_annotations_by_key('with');
        const assignedBys = annotationNode.get_annotations_by_key('providedBy');
        if (sources.length > 0) {
          evidence.reference = sources[0].value();
        }
        if (withs.length > 0) {
          if (withs[0].value().startsWith('gomodel')) {
            evidence.with = withs[0].value();
          } else {
            evidence.with = withs[0].value();
          }
        }
        if (assignedBys.length > 0) {
          evidence.assignedBy = new Entity(null, assignedBys[0].value(), assignedBys[0].value());
        }
        result.push(evidence);
      }
    });

    return result;
  }

  graphPreParse(graph) {
    const self = this;
    const promises = [];

    each(graph.get_nodes(), function (node) {
      const termNodeInfo = self.getNodeInfo(node);

      each(graph.get_edges_by_subject(node.id()), function (e) {
        const predicateId = e.predicate_id();
        const objectNode = graph.get_node(e.object_id());
        const objectTermNodeInfo = self.getNodeInfo(objectNode);

        each(noctuaFormConfig.closures, (closure) => {
          promises.push(self.isaClosurePreParse(objectTermNodeInfo.id, closure.id, node));
        });

      });
    });

    return forkJoin(promises);
  }

  graphPostParse(cam: Cam, graph) {
    const self = this;
    const promises = [];

    each(cam.annotons, function (annoton: Annoton) {
      const mfNode = annoton.getMFNode();

      if (mfNode && mfNode.hasValue()) {
        promises.push(self.isaClosurePostParse(mfNode.getTerm().id, self.noctuaFormConfigService.closures.catalyticActivity.id, mfNode));
      }

    });

    return forkJoin(promises);
  }

  isaClosurePreParse(a, b, node) {
    const self = this;

    return self.noctuaLookupService.isaClosure(a, b)
      .pipe(
        map((response) => {
          self.noctuaLookupService.addLocalClosure(a, b, response);
        })
      )
  }

  isaClosurePostParse(a, b, node: AnnotonNode) {
    const self = this;

    return self.noctuaLookupService.isaClosure(a, b).pipe(
      map(result => {
        node.isCatalyticActivity = result;
        return result;
      }))

    /*
    .subscribe(function (data) {
      self.noctuaLookupService.addLocalClosure(a, b, data);
    });
    */
  }

  /*
  isaNodeClosure(a, b, node, annoton) {
    const self = this;
    const deferred = self.$q.defer();
   
    self.noctuaLookupService.isaClosure(a, b).then(function (data) {
      if (data) {
        node.closures.push(a);
        //annoton.parser.parseNodeOntology(node, data);
      }
      // console.log("node closure", data, node);
      deferred.resolve({
        annoton: annoton,
        node: node,
        result: data
      });
    });
   
    return deferred.promise;
  }
  */

  determineAnnotonType(gpObjectNode) {
    const self = this;

    if (self.noctuaLookupService.getLocalClosure(gpObjectNode.term.id, noctuaFormConfig.closures.gp.id)) {
      return noctuaFormConfig.annotonType.options.simple.name;
    } else if (self.noctuaLookupService.getLocalClosure(gpObjectNode.term.id, noctuaFormConfig.closures.mc.id)) {
      return noctuaFormConfig.annotonType.options.complex.name;
    }

    return null;
  }

  determineAnnotonModelType(mfNode, mfEdgesIn) {
    const self = this;
    let result = noctuaFormConfig.annotonModelType.options.default.name;

    if (mfNode.term.id === noctuaFormConfig.rootNode.mf.id) {
      each(mfEdgesIn, function (toMFEdge) {
        const predicateId = toMFEdge.predicate_id();

        if (_.find(noctuaFormConfig.causalEdges, {
          id: predicateId
        })) {
          result = noctuaFormConfig.annotonModelType.options.bpOnly.name;
        }
      });
    }

    return result;
  }

  graphToAnnotons(cam: Cam): Annoton[] {
    const self = this;
    const annotons: Annoton[] = [];

    each(cam.graph.all_edges(), function (e) {
      if (e.predicate_id() === noctuaFormConfig.edge.enabledBy.id) {
        const bbopSubjectId = e.subject_id();
        const bbopObjectId = e.object_id();
        const subjectNode = self.nodeToAnnotonNode(cam.graph, bbopSubjectId);
        const objectNode = self.nodeToAnnotonNode(cam.graph, bbopObjectId);
        const evidence = self.edgeToEvidence(cam.graph, e);
        const subjectEdges = cam.graph.get_edges_by_subject(bbopSubjectId);
        const annotonModelType = self.determineAnnotonModelType(subjectNode, subjectEdges);
        const annoton = self.noctuaFormConfigService.createAnnotonModel(
          annotonModelType
        );
        const annotonNode = annoton.getNode('mf');
        const triple = annoton.getEdge('mf', 'gp');

        annotonNode.term = subjectNode.term;
        annotonNode.classExpression = subjectNode.classExpression;
        annotonNode.setIsComplement(subjectNode.isComplement);
        annotonNode.uuid = bbopSubjectId;
        triple.predicate.evidence = evidence;
        self._graphToAnnatonDFS(cam, annoton, subjectEdges, annotonNode);

        annoton.id = bbopSubjectId;
        annotons.push(annoton);
      }
    });

    // self.parseNodeClosure(annotons);

    return annotons;
  }

  private _graphToAnnatonDFS(cam: Cam, annoton: Annoton, bbopEdges, annotonNode: AnnotonNode) {
    const self = this;
    const triples: Triple<AnnotonNode>[] = annoton.getEdges(annotonNode.id);

    each(bbopEdges, (bbopEdge) => {
      const bbopPredicateId = bbopEdge.predicate_id();
      const bbopObjectId = bbopEdge.object_id();
      const evidence = self.edgeToEvidence(cam.graph, bbopEdge);

      if (annoton.annotonModelType === noctuaFormConfig.annotonModelType.options.bpOnly.name) {
        const causalEdge = _.find(noctuaFormConfig.causalEdges, {
          id: bbopPredicateId
        });

        if (causalEdge) {
          //   self.adjustBPOnly(annoton, causalEdge);
        }
      }

      each(triples, (triple: Triple<AnnotonNode>) => {
        if (bbopPredicateId === triple.predicate.edge.id) {
          const objectNode = self.nodeToAnnotonNode(cam.graph, bbopObjectId);

          triple.object.uuid = objectNode.uuid;
          triple.object.term = objectNode.term;
          triple.object.classExpression = objectNode.classExpression;
          triple.object.setIsComplement(objectNode.isComplement);

          triple.predicate.evidence = evidence;
          self._graphToAnnatonDFS(cam, annoton, cam.graph.get_edges_by_subject(bbopObjectId), triple.object);
        }
      });
    });

    return annoton;
  }

  getConnectorAnnotons(cam: Cam) {
    const self = this;
    const connectorAnnotons: ConnectorAnnoton[] = [];

    each(cam.annotons, (subjectAnnoton: Annoton) => {
      each(cam.graph.get_edges_by_subject(subjectAnnoton.id), (e) => {
        const predicateId = e.predicate_id();
        const objectId = e.object_id();
        const objectInfo = self.nodeToAnnotonNode(cam.graph, objectId);

        const causalEdge = <Entity>_.find(noctuaFormConfig.causalEdges, {
          id: predicateId
        })

        if (causalEdge) {
          if (self.noctuaLookupService.getLocalClosure(objectInfo.term.id, noctuaFormConfig.closures.mf.id)) {
            const downstreamAnnoton = cam.getAnnotonByConnectionId(objectId);
            const connectorAnnoton = this.noctuaFormConfigService.createAnnotonConnectorModel(subjectAnnoton, downstreamAnnoton);

            connectorAnnoton.state = ConnectorState.editing;
            connectorAnnoton.type = ConnectorType.basic;
            connectorAnnoton.rule.r1Edge = causalEdge;
            connectorAnnoton.setRule();
            connectorAnnotons.push(connectorAnnoton);
          } else if (self.noctuaLookupService.getLocalClosure(objectInfo.term.id, noctuaFormConfig.closures.bp.id)) {
            const processNodeInfo = self.nodeToAnnotonNode(cam.graph, objectId);
            const processNode = self.noctuaFormConfigService.generateAnnotonNode('bp', { id: 'process' });
            const connectorAnnotonDTO = this._getConnectAnnotonIntermediate(cam, objectId);

            if (connectorAnnotonDTO.downstreamAnnoton) {
              processNode.uuid = objectId;
              processNode.term = processNodeInfo.term;
              // processNode.setEvidence(self.edgeToEvidence(cam.graph, e));

              const connectorAnnoton = this.noctuaFormConfigService.createAnnotonConnectorModel(subjectAnnoton, connectorAnnotonDTO.downstreamAnnoton, processNode, connectorAnnotonDTO.hasInputNode);

              connectorAnnoton.state = ConnectorState.editing;
              connectorAnnoton.type = ConnectorType.intermediate;
              connectorAnnoton.rule.r1Edge = new Entity(causalEdge.id, causalEdge.label);;
              connectorAnnoton.rule.r2Edge = connectorAnnotonDTO.rule.r2Edge;
              connectorAnnoton.setRule();
              connectorAnnotons.push(connectorAnnoton);
            }
          }
        }
      });
    });

    console.log(connectorAnnotons);
    return connectorAnnotons;
  }

  private _getConnectAnnotonIntermediate(cam: Cam, bpSubjectId: string): ConnectorAnnoton {
    const self = this;
    const connectorAnnoton = new ConnectorAnnoton()

    each(cam.graph.get_edges_by_subject(bpSubjectId), (e) => {
      const predicateId = e.predicate_id();
      const objectId = e.object_id();
      const objectInfo = self.nodeToAnnotonNode(cam.graph, objectId);

      const causalEdge = <Entity>_.find(noctuaFormConfig.causalEdges, {
        id: predicateId
      })

      if (causalEdge) {
        if (self.noctuaLookupService.getLocalClosure(objectInfo.term.id, noctuaFormConfig.closures.mf.id)) {
          const downstreamAnnoton = cam.getAnnotonByConnectionId(objectId);

          connectorAnnoton.rule.r2Edge = new Entity(causalEdge.id, causalEdge.label);;
          connectorAnnoton.downstreamAnnoton = downstreamAnnoton;
        }
      }

      if (e.predicate_id() === noctuaFormConfig.edge.hasInput.id) {
        if (self.noctuaLookupService.getLocalClosure(objectInfo.term.id, noctuaFormConfig.closures.gpHasInput.id)) {
          const hasInputNodeInfo = self.nodeToAnnotonNode(cam.graph, objectId);
          const hasInputNode = self.noctuaFormConfigService.generateAnnotonNode('mf-1', { id: 'has-input' });

          hasInputNode.uuid = objectId;
          hasInputNode.term = hasInputNodeInfo.term;
          hasInputNode.predicate.setEvidence(self.edgeToEvidence(cam.graph, e));
          connectorAnnoton.hasInputNode = hasInputNode;
        }
      }
    });

    return connectorAnnoton;
  }

  /*
  parseNodeClosure(annotons) {
    const self = this;
    const promises = [];
   
    each(annotons, function (annoton) {
      each(annoton.nodes, function (node) {
        const term = node.getTerm();
        if (term) {
          promises.push(self.isaNodeClosure(node.noctuaLookupServiceGroup, term.id, node, annoton));
   
          forOwn(annoton.edges, function (srcEdge, key) {
            each(srcEdge.nodes, function (srcNode) {
              //  const nodeExist = destAnnoton.getNode(key);
              //  if (nodeExist && srcNode.object.hasValue()) {
              //   destAnnoton.addEdgeById(key, srcNode.object.id, srcNode.edge);
              //   }
            });
          });
        }
      });
    });
   
    self.$q.all(promises).then(function (data) {
      console.log('done node clodure', data)
   
      each(data, function (entity) {
        //entity.annoton.parser.parseNodeOntology(entity.node);
      });
    });
  }
  */

  graphToAnnatonDFSError(annoton, annotonNode) {
    const self = this;
    const edge = annoton.getEdges(annotonNode.id);

    each(edge.nodes, function (node) {
      node.object.status = 2;
      self.graphToAnnatonDFSError(annoton, node.object);
    });
  }


  ccComponentsToTable(graph, annotons) {
    const self = this;
    const result = [];

    each(annotons, function (annoton) {
      //   const annotonRows = self.ccComponentsToTableRows(graph, annoton);

      //  result = result.concat(annotonRows);
    });

    return result;
  }

  /*
   
  ccComponentsToTableRows(graph, annoton) {
    const self = this;
    const result = [];
   
    const gpNode = annoton.getGPNode();
    const ccNode = annoton.getNode('cc');
   
    const row = {
      gp: gpNode.term.control.value.label,
      cc: ccNode.term.control.value.label,
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
      annotonPresentation: self.annotonForm.getAnnotonPresentation(annoton),
    }
   
    row.evidence = gpNode.evidence
   
    return row;
  }
  */

  addIndividual(reqs: any, node: AnnotonNode): string | null {
    if (node.uuid) return node.uuid;
    if (node.hasValue()) {
      if (node.isComplement) {
        const ce = new class_expression();
        ce.as_complement(node.term.id);
        node.uuid = reqs.add_individual(ce);
      } else {
        node.uuid = reqs.add_individual(node.term.id);
      }
      return node.uuid;
    }

    return null;
  }

  saveMFLocation(cam) {
    const self = this;

    const reqs = new minerva_requests.request_set(this.noctuaUserService.baristaToken, cam.modelId);


    // Update all of the nodes with their current local (should be
    // most recent) positions before saving.
    each(cam.graph.all_nodes(), function (node) {
      const nid = node.id();

      // Extract the current local coord.
      //   const pos = self.locationStore.get(nid);
      // const new_x = pos['x'];
      //  const new_y = pos['y'];

      // console.log('node pos', pos)

      //  reqs.update_annotations(node, 'hint-layout-x', new_x);
      //  reqs.update_annotations(node, 'hint-layout-y', new_y);

    });

    // And add the actual storage.
    reqs.store_model();
    // cam.manager.user_token(this.noctuaUserService.baristaToken);
    //  cam.manager.request_with(reqs);
  }

  edit(cam: Cam, annotonNode: AnnotonNode) {
    const self = this;

    const reqs = new minerva_requests.request_set(cam.manager.user_token(), cam.modelId);
    reqs.store_model(cam.modelId);

    if (annotonNode.hasValue()) {
      self.editIndividual(reqs,
        cam.modelId,
        annotonNode.uuid,
        annotonNode.classExpression,
        annotonNode.getTerm().id);
    }

    /*    each(annotonNode.evidence, (evidence: Evidence, key) => {
         if (evidence.hasValue()) {
           self.editIndividual(reqs,
             cam.modelId,
             evidence.uuid,
             evidence.classExpression,
             evidence.evidence.id);
         }
       }); */

    const rebuild = (resp) => {
      const noctua_graph = model.graph;

      cam.graph = new noctua_graph();
      cam.modelId = resp.data().id;
      cam.graph.load_data_basic(resp.data());

      self.graphPreParse(cam.graph).subscribe((data) => {
        cam.annotons = self.graphToAnnotons(cam);
        self.saveMFLocation(cam)
        cam.onGraphChanged.next(cam.annotons);
      });
    }

    cam.manager.register('rebuild', (resp) => {
      rebuild(resp);
    }, 10);

    cam.manager.user_token(this.noctuaUserService.baristaToken);

    return cam.manager.request_with(reqs);
  }

  editIndividual(reqs, modelId, uuid, classExpression, classId) {
    reqs.remove_type_from_individual(
      // class_expression.cls(oldClassId),
      classExpression,
      uuid,
      modelId,
    );

    reqs.add_type_to_individual(
      class_expression.cls(classId),
      uuid,
      modelId,
    );
  }

  editIndividual2(reqs, cam, srcNode, destNode) {
    if (srcNode.hasValue() && destNode.hasValue()) {
      reqs.remove_type_from_individual(
        //  class_expression.cls(srcNode.getTerm().id),
        srcNode.getNodeType(),
        srcNode.uuid,
        cam.modelId,
      );

      reqs.add_type_to_individual(
        class_expression.cls(destNode.getTerm().id),
        srcNode.uuid,
        cam.modelId,
      );
    }
  }

  deleteIndividual(reqs, node) {
    if (node.uuid) {
      reqs.remove_individual(node.uuid);
    }
  }

  addEvidence(cam, srcNode, destNode) {
    const reqs = new minerva_requests.request_set(this.noctuaUserService.baristaToken, cam.modelId);

    if (srcNode.hasValue() && destNode.hasValue()) {
      // const ce = new class_expression(destNode.term.control.value.id);
      reqs.remove_type_from_individual(
        class_expression.cls(srcNode.getTerm().id),
        srcNode.uuid,
        cam.modelId,
      );

      reqs.add_type_to_individual(
        class_expression.cls(destNode.getTerm().id),
        srcNode.uuid,
        cam.modelId,
      );

      cam.manager.user_token(cam.baristaToken);
      cam.manager.request_with(reqs);
    }
  }

  addFact(reqs, triples: Triple<AnnotonNode>[]) {
    const self = this;

    each(triples, function (triple: Triple<AnnotonNode>) {
      const subject = self.addIndividual(reqs, triple.subject);
      const object = self.addIndividual(reqs, triple.object);

      if (subject && object) {
        triple.predicate.uuid = reqs.add_fact([
          subject,
          object,
          triple.predicate.edge.id
        ]);

        each(triple.predicate.evidence, function (evidence: Evidence) {
          const evidenceReference = evidence.reference;
          const evidenceWith = evidence.with;

          reqs.add_evidence(evidence.evidence.id, evidenceReference, evidenceWith, triple.predicate.uuid);
        });
      }
    });
  }

  deleteFact(reqs, triples: Triple<AnnotonNode>[]) {
    const self = this;

    each(triples, function (triple: Triple<AnnotonNode>) {
      const subject = self.addIndividual(reqs, triple.subject);
      const object = self.addIndividual(reqs, triple.object);
      each(triple.predicate.evidence, function (evidence: Evidence) {
        reqs.remove_individual(evidence.uuid);
      });
      reqs.remove_individual(triple.subject.uuid);
    });
  }

  evidenceUseGroups(reqs, evidence: Evidence) {
    const self = this;
    const assignedBy = evidence.assignedBy;

    if (assignedBy) {
      reqs.use_groups(['http://purl.obolibrary.org/go/groups/' + assignedBy]);
    } else if (self.userInfo.groups.length > 0) {
      reqs.use_groups([self.userInfo.selectedGroup.id]);
    } else {
      reqs.use_groups([]);
    }
  }

  adjustBPOnly(annoton, srcEdge) {
    const self = this;
    const mfNode = annoton.getNode('mf');
    const bpNode = annoton.getNode('bp');



    if (mfNode && bpNode && annoton.annotonModelType === noctuaFormConfig.annotonModelType.options.bpOnly.name) {
      mfNode.displaySection = noctuaFormConfig.displaySection.fd;
      mfNode.displayGroup = noctuaFormConfig.displayGroup.mf;
      annoton.editEdge('mf', 'bp', srcEdge);
      bpNode.relationship = annoton.getEdge('mf', 'bp').edge;
    }
  }



  saveModelGroup(cam: Cam, groupId) {
    const self = this

    cam.manager.use_groups([groupId]);
  }

  saveCamAnnotations(cam: Cam, annotations) {
    const self = this;

    const titleAnnotations = cam.graph.get_annotations_by_key('title');
    const stateAnnotations = cam.graph.get_annotations_by_key('state');
    const reqs = new minerva_requests.request_set(cam.manager.user_token(), cam.modelId);

    each(titleAnnotations, function (annotation) {
      reqs.remove_annotation_from_model('title', annotation.value())
    });

    each(stateAnnotations, function (annotation) {
      reqs.remove_annotation_from_model('state', annotation.value())
    });

    reqs.add_annotation_to_model('title', annotations.title);
    reqs.add_annotation_to_model('state', annotations.state);

    cam.manager.request_with(reqs);
  }

  /*
  checkIfNodeExist(srcAnnoton) {
    const self = this;
    const infos = [];
   
    each(srcAnnoton.nodes, function (srcNode) {
      const srcTerm = srcNode.getTerm();
   
      if (srcTerm.id && !srcNode.uuid) {
        const meta = {
          aspect: srcNode.label,
          subjectNode: {
            node: srcNode,
            label: srcNode.term.control.value.label
          },
          linkedNodes: []
        }
   
        each(self.gridData.annotons, function (annotonData) {
          each(annotonData.annoton.nodes, function (node) {
   
            if (srcTerm.id === node.getTerm().id) {
              if (!_.find(meta.linkedNodes, {
                modelId: node.uuid
              })) {
                meta.linkedNodes.push(node);
              }
            }
          });
        });
   
        if (meta.linkedNodes.length > 0) {
          const info = new AnnotonError('error', 5, "Instance exists " + srcNode.term.control.value.label, meta);
   
          infos.push(info);
        }
      }
   
    });
   
    return infos;
  }
  */
  annotonAdjustments(annoton: Annoton) {
    const self = this;
    const infos = []; //self.checkIfNodeExist(annoton);

    switch (annoton.annotonModelType) {
      case noctuaFormConfig.annotonModelType.options.default.name:
        {
          const mfNode = annoton.getNode('mf');
          const ccNode = annoton.getNode('cc');
          const cc1Node = annoton.getNode('cc-1');
          const cc11Node = annoton.getNode('cc-1-1');
          const cc111Node = annoton.getNode('cc-1-1-1');

          if (!ccNode.hasValue()) {
            if (cc1Node.hasValue()) {
              const meta = {
                aspect: cc1Node.label,
                subjectNode: {
                  label: mfNode.term.label
                },
                edge: {
                  label: noctuaFormConfig.edge.occursIn
                },
                objectNode: {
                  label: cc1Node.term.label
                },
              }
              const info = new AnnotonError('error', 2, "No CC found, added  ", meta);

              infos.push(info);
            } else if (cc11Node.hasValue()) { }
          }
          break;
        }
      case noctuaFormConfig.annotonModelType.options.bpOnly.name:
        {
          const mfNode = annoton.getNode('mf');
          const bpNode = annoton.getNode('bp');

          break;
        }
    }
    return infos;
  }

  createSave(srcAnnoton: Annoton) {
    const self = this;
    const destAnnoton = new Annoton();
    destAnnoton.copyStructure(srcAnnoton);

    const skipNodeDFS = function (sourceId, objectId) {
      const self = this;
      const srcEdge = srcAnnoton.edges[objectId];

      if (srcEdge) {
        each(srcEdge, function (srcNode) {
          const nodeExist = destAnnoton.getNode(sourceId) && destAnnoton.getNode(srcNode.object.id);
          if (nodeExist && srcNode.object.hasValue()) {
            destAnnoton.addEdgeById(sourceId, srcNode.object.id, srcNode.edge);
          } else {
            skipNodeDFS(sourceId, srcNode.object.id);
          }
        });
      }
    }

    each(srcAnnoton.nodes, function (srcNode) {
      if (srcNode.hasValue()) {
        const destNode = srcNode;

        if (destAnnoton.annotonType === noctuaFormConfig.annotonType.options.simple.name) {
          if (srcNode.displayGroup.id !== noctuaFormConfig.displayGroup.mc.id) {
            destAnnoton.addNode(destNode);
          }
        } else {
          if (srcNode.id !== 'gp') {
            destAnnoton.addNode(destNode);
          }
        }
      }
    });

    forOwn(srcAnnoton.edges, function (srcEdge, key) {
      each(srcEdge.nodes, function (srcNode) {
        const nodeExist = destAnnoton.getNode(key);
        if (nodeExist && srcNode.object.hasValue()) {
          destAnnoton.addEdgeById(key, srcNode.object.id, srcNode.edge);
        } else {
          skipNodeDFS(key, srcNode.object.id);
        }
      });
    });

    console.log('create save', destAnnoton);

    return destAnnoton;
  }

  saveMF(cam, individual, success) {
    const self = this;

    const merge = (resp) => {
      const individuals = resp.individuals();
      if (individuals.length > 0) {
        const mfResponse = individuals[0];

        individual.uuid = mfResponse.id;
        success(mfResponse);
      }
    }

    cam.individualManager.register('merge', merge, 10);

    const reqs = new minerva_requests.request_set(cam.individualManager.user_token(), cam.model.id);
    reqs.add_individual(individual.getTerm().id);
    return cam.individualManager.request_with(reqs);
  }

  saveAnnoton(cam, triples: Triple<AnnotonNode>[], title) {
    const self = this;

    const save = () => {
      const reqs = new minerva_requests.request_set(cam.manager.user_token(), cam.model.id);

      if (!cam.title) {
        reqs.add_annotation_to_model('title', title);
      }

      self.addFact(reqs, triples);

      reqs.store_model(cam.modelId);

      if (self.userInfo.groups.length > 0) {
        reqs.use_groups([self.userInfo.selectedGroup.id]);
      }

      return cam.manager.request_with(reqs);
    };

    return save();
  }

  deleteAnnoton(cam: Cam, uuids: string[]) {
    const self = this;

    const success = () => {
      const reqs = new minerva_requests.request_set(cam.manager.user_token(), cam.model.id);

      each(uuids, function (uuid: string) {
        reqs.remove_individual(uuid);
      });

      reqs.store_model(cam.modelId);

      if (self.userInfo.groups.length > 0) {
        reqs.use_groups([self.userInfo.selectedGroup.id]);
      }

      return cam.manager.request_with(reqs);
    };

    return success();
  }

}