
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { noctuaAnimations } from './../../../../../../../../@noctua/animations';

import { CamTableService } from './../../services/cam-table.service';

import {
  NoctuaFormConfigService,
  NoctuaAnnotonEntityService,
  CamService,
  NoctuaFormMenuService,
  Predicate,
  NoctuaUserService,
  CamsService
} from 'noctua-form-base';

import {
  Cam,
  Annoton,
  AnnotonNode
} from 'noctua-form-base';
import { EditorCategory } from '@noctua.editor/models/editor-category';


@Component({
  selector: 'noc-evidence-table',
  templateUrl: './evidence-table.component.html',
  styleUrls: ['./evidence-table.component.scss'],
  animations: noctuaAnimations
})
export class EvidenceTableComponent implements OnInit, OnDestroy {
  EditorCategory = EditorCategory;
  displayedColumns = [
    'evidence',
    'reference',
    'with',
    'assignedBy'];

  @Input('options')
  options: any = {};

  @Input('cam')
  public cam: Cam;

  @Input('entity')
  public entity: AnnotonNode;

  private unsubscribeAll: Subject<any>;

  constructor(
    private camService: CamService,
    public camsService: CamsService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormMenuService: NoctuaFormMenuService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    //  public noctuaFormMenuService: NoctuaFormMenuService,
    public camTableService: CamTableService,
    public noctuaAnnotonEntityService: NoctuaAnnotonEntityService) {

    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    console.log(this.options)
  }

  selectEntity(annoton: Annoton, entity: AnnotonNode) {
    this.camService.onCamChanged.next(this.cam);

    this.noctuaAnnotonEntityService.initializeForm(annoton, entity);
    // this.noctuaFormMenuService.openRightDrawer(this.noctuaFormMenuService.panel.annotonEntityForm);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}
