import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import {
  NoctuaFormConfigService,
  NoctuaActivityFormService,
  NoctuaActivityEntityService,
  CamService,
  Evidence,
  Entity,
  noctuaFormConfig,
  NoctuaUserService,
  NoctuaFormMenuService,

  ActivityType,
  ActivityTreeNode,
  ActivityNodeType,
  ActivityDisplayType,
  NoctuaGraphService
} from '@geneontology/noctua-form-base';

import {
  Cam,
  Activity,
  ActivityNode,
  ShapeDefinition
} from '@geneontology/noctua-form-base';

import { EditorCategory } from '@noctua.editor/models/editor-category';
import { cloneDeep, find } from 'lodash';
import { InlineEditorService } from '@noctua.editor/inline-editor/inline-editor.service';
import { NoctuaUtils } from '@noctua/utils/noctua-utils';
import { FlatTreeControl } from '@angular/cdk/tree';
import { NoctuaConfirmDialogService } from '@noctua/components/confirm-dialog/confirm-dialog.service';
import { takeUntil } from 'rxjs/operators';
import { NoctuaCommonMenuService } from '@noctua.common/services/noctua-common-menu.service';
import { SettingsOptions } from '@noctua.common/models/graph-settings';
import { TableOptions } from '@noctua.common/models/table-options';

@Component({
  selector: 'noc-activity-tree-group',
  templateUrl: './activity-tree-group.component.html',
  styleUrls: ['./activity-tree-group.component.scss'],
})
export class ActivityTreeGroupComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  ActivityDisplayType = ActivityDisplayType;
  EditorCategory = EditorCategory;
  ActivityType = ActivityType;
  activityTypeOptions = noctuaFormConfig.activityType.options;

  treeNodes: ActivityTreeNode[] = [];

  settings: SettingsOptions = new SettingsOptions()
  gbSettings: SettingsOptions = new SettingsOptions()

  @ViewChild('tree') tree;
  @ViewChild('tree') gpTree;
  @Input('cam') cam: Cam
  @Input('activity') activity: Activity
  @Input('options') options: TableOptions = {};

  gbOptions: TableOptions = {};

  optionsDisplay: any = {}

  gpNode: ActivityNode;
  editableTerms = false;
  currentMenuEvent: any = {};
  treeControl = new FlatTreeControl<ActivityNode>(
    node => node.treeLevel, node => node.expandable);

  treeOptions = {
    allowDrag: false,
    allowDrop: false,
    // levelPadding: 15,
    getNodeClone: (node) => ({
      ...node.data,
      //id: uuid.v4(),
      name: `Copy of ${node.data.name}`
    })
  };

  private _unsubscribeAll: Subject<any>;

  constructor(
    public camService: CamService,
    private _noctuaGraphService: NoctuaGraphService,
    private noctuaCommonMenuService: NoctuaCommonMenuService,
    public noctuaFormMenuService: NoctuaFormMenuService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaActivityEntityService: NoctuaActivityEntityService,
    public noctuaActivityFormService: NoctuaActivityFormService) {

    this._unsubscribeAll = new Subject();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // do your action

  }

  ngOnInit(): void {
    this.loadTree()
    this.gbOptions = cloneDeep(this.options)
    this.gbOptions.showMenu = this.activity.activityType === ActivityType.molecule

    this.noctuaCommonMenuService.onCamSettingsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((settings: SettingsOptions) => {
        if (!settings) {
          return;
        }
        this.settings = settings;
        this.gbSettings = cloneDeep(settings)
        this.gbSettings.showEvidence = false;
        this.gbSettings.showEvidenceSummary = false;
      });

    if (this.options?.editableTerms) {
      this.editableTerms = this.options.editableTerms
    }

    this._noctuaGraphService.onCamGraphChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cam: Cam) => {
        if (!cam || cam.id !== this.cam.id) {
          return;
        }
        this.cam = cam;
        this.activity = cam.findActivityById(this.activity.id)
        this.loadTree()
      })
  }

  ngAfterViewInit(): void {
    this.tree.treeModel.filterNodes(() => {
      return true;
    });

    this.gpTree.treeModel.filterNodes((node) => {
      return (node.data.id !== this.gpNode?.id);
    });
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  loadTree() {
    if (!this.activity) return;
    this.gpNode = this.activity.getGPNode();
    this.optionsDisplay = { ...this.options, hideHeader: true };
    this.treeNodes = this.activity.buildTrees();

  }

  onTreeLoad() {
    this.tree.treeModel.expandAll();
  }

  onGPTreeLoad() {
    this.gpTree.treeModel.expandAll();
  }

  setActivityDisplayType(displayType: ActivityDisplayType) {
    this.activity.activityDisplayType = displayType;
  }

  toggleExpand(activity: Activity) {
    activity.expanded = !activity.expanded;
  }

  toggleNodeExpand(node: ActivityNode) {
    node.expanded = !node.expanded;
  }

}

