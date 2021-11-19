import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
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

  ActivityType
} from '@geneontology/noctua-form-base';

import {
  Cam,
  Activity,
  ActivityNode,
  ShapeDefinition
} from '@geneontology/noctua-form-base';

import { EditorCategory } from '@noctua.editor/models/editor-category';
import { find } from 'lodash';
import { InlineEditorService } from '@noctua.editor/inline-editor/inline-editor.service';
import { NoctuaUtils } from '@noctua/utils/noctua-utils';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs/operators';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'noc-graph-activity-table',
  templateUrl: './activity-table.component.html',
  styleUrls: ['./activity-table.component.scss']
})
export class ActivityTableComponent implements OnInit, OnDestroy {
  EditorCategory = EditorCategory;
  ActivityType = ActivityType;
  activityTypeOptions = noctuaFormConfig.activityType.options;

  @Input('options') options: any = {};
  @Input('panelDrawer') panelDrawer: MatDrawer;
  @Input('cam') cam: Cam;

  activity: Activity

  gpNode: ActivityNode;
  nodes: ActivityNode[] = [];
  editableTerms = false;
  currentMenuEvent: any = {};

  private _unsubscribeAll: Subject<any>;

  constructor(
    private ngZone: NgZone,
    public camService: CamService,
    public noctuaFormMenuService: NoctuaFormMenuService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaActivityEntityService: NoctuaActivityEntityService,
    public noctuaActivityFormService: NoctuaActivityFormService,
    private inlineEditorService: InlineEditorService) {

    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    const self = this;

    this.camService.onSelectedActivityChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((activity: Activity) => {
        if (!activity) {
          return;
        }
        this.ngZone.run(() => {
          this.activity = activity
        });


      });

  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  close() {
    this.panelDrawer.close();
  }


}

