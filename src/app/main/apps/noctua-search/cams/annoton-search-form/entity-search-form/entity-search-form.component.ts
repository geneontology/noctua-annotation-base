import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';
import {
  CamService,
  NoctuaFormConfigService,
  NoctuaAnnotonFormService,
  AnnotonNode,
  Evidence,
  noctuaFormConfig,
  Entity,
  ShapeDefinition,
  AnnotonError,
  AnnotonNodeType,
  Annoton
} from 'noctua-form-base';
import { InlineReferenceService } from '@noctua.editor/inline-reference/inline-reference.service';
import { each, find, flatten } from 'lodash';
import { InlineWithService } from '@noctua.editor/inline-with/inline-with.service';
import { InlineDetailService } from '@noctua.editor/inline-detail/inline-detail.service';

@Component({
  selector: 'noc-entity-search-form',
  templateUrl: './entity-search-form.component.html',
  styleUrls: ['./entity-search-form.component.scss'],
})

export class EntitySearchFormComponent implements OnInit, OnDestroy {
  @Input('entityFormGroup')
  public entityFormGroup: FormGroup;

  @ViewChild('evidenceDBreferenceMenuTrigger', { static: true, read: MatMenuTrigger })
  evidenceDBreferenceMenuTrigger: MatMenuTrigger;

  evidenceDBForm: FormGroup;
  evidenceFormArray: FormArray;
  entity: AnnotonNode;
  insertMenuItems = [];
  selectedItemDisplay;
  friendNodes;
  friendNodesFlat;

  annotonNodeType = AnnotonNodeType;

  private unsubscribeAll: Subject<any>;

  constructor(
    private camService: CamService,
    private inlineReferenceService: InlineReferenceService,
    private inlineDetailService: InlineDetailService,
    private inlineWithService: InlineWithService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaAnnotonFormService: NoctuaAnnotonFormService) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.entity = this.noctuaAnnotonFormService.annoton.getNode(this.entityFormGroup.get('id').value);
    //   this.friendNodes = this.camService.getNodesByType(this.entity.type);
    //  this.friendNodesFlat = this.camService.getNodesByTypeFlat(this.entity.type);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  useTerm(node: AnnotonNode, annoton: Annoton) {
    const self = this;

    self.entity.term = node.term;
    switch (self.entity.type) {
      case AnnotonNodeType.GoBiologicalProcess:
      case AnnotonNodeType.GoCellularComponent:
        self.entity.linkedNode = true;
        self.entity.uuid = node.uuid;
        self.noctuaAnnotonFormService.annoton.insertSubgraph(annoton, self.entity, node);
    }

    self.noctuaAnnotonFormService.initializeForm();
  }

  insertEntity(nodeDescription: ShapeDefinition.ShapeDescription) {
    this.noctuaFormConfigService.insertAnnotonNode(this.noctuaAnnotonFormService.annoton, this.entity, nodeDescription);
    this.noctuaAnnotonFormService.initializeForm();
  }

  addRootTerm() {
    const self = this;

    const term = find(noctuaFormConfig.rootNode, (rootNode) => {
      return rootNode.aspect === self.entity.aspect;
    });

    if (term) {
      self.entity.term = new Entity(term.id, term.label);
      self.noctuaAnnotonFormService.initializeForm();

      const evidence = new Evidence();
      evidence.setEvidence(new Entity(
        noctuaFormConfig.evidenceAutoPopulate.nd.evidence.id,
        noctuaFormConfig.evidenceAutoPopulate.nd.evidence.label));
      evidence.reference = noctuaFormConfig.evidenceAutoPopulate.nd.reference;
      self.entity.predicate.setEvidence([evidence]);
      self.noctuaAnnotonFormService.initializeForm();
    }
  }

  clearValues() {
    const self = this;

    self.entity.clearValues();
    self.noctuaAnnotonFormService.initializeForm();
  }



  openAddReference(event, evidence: FormGroup, name: string) {
    const data = {
      formControl: evidence.controls[name] as FormControl,
    };
    this.inlineReferenceService.open(event.target, { data });
  }

  openAddWith(event, evidence: FormGroup, name: string) {
    const data = {
      formControl: evidence.controls[name] as FormControl,
    };
    this.inlineWithService.open(event.target, { data });
  }

  unselectItemDisplay() {
    this.selectedItemDisplay = null;
  }

  openTermDetails(event, item) {
    event.stopPropagation();

    const data = {
      termDetail: item,
      formControl: this.entityFormGroup.controls['term'] as FormControl,
    };
    this.inlineDetailService.open(event.target, { data });
  }

  termDisplayFn(term): string | undefined {
    return term && term.id ? `${term.label} (${term.id})` : undefined;
  }

  evidenceDisplayFn(evidence): string | undefined {
    return evidence && evidence.id ? `${evidence.label} (${evidence.id})` : undefined;
  }

  referenceDisplayFn(evidence: Evidence | string): string | undefined {
    if (typeof evidence === 'string') {
      return evidence;
    }

    return evidence && evidence.reference ? evidence.reference : undefined;
  }

  withDisplayFn(evidence: Evidence | string): string | undefined {
    if (typeof evidence === 'string') {
      return evidence;
    }

    return evidence && evidence.with ? evidence.with : undefined;
  }
}
