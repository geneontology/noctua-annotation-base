
import { Component, OnDestroy, OnInit, ViewChild, Input, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';


import {
  Cam,
  AnnotonType,
  NoctuaUserService,
  NoctuaFormConfigService,
  NoctuaFormMenuService,
  NoctuaAnnotonFormService,
  noctuaFormConfig,
  CamsService,
  AnnotonNode,
  EntityLookup,
  NoctuaLookupService,
  EntityDefinition,
  Entity
} from 'noctua-form-base';

import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { NoctuaDataService } from '@noctua.common/services/noctua-data.service';
import { NoctuaSearchService } from '@noctua.search/services/noctua-search.service';
import { noctuaAnimations } from '@noctua/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { NoctuaReviewSearchService } from '@noctua.search/services/noctua-review-search.service';
import { groupBy } from 'lodash';

@Component({
  selector: 'noc-cams-unsaved-dialog',
  templateUrl: './cams-unsaved.component.html',
  styleUrls: ['./cams-unsaved.component.scss'],
  animations: noctuaAnimations,
})
export class CamsUnsavedDialogComponent implements OnInit, OnDestroy {
  cams: Cam[] = []
  occurrences = 0;
  models = 0;


  private _unsubscribeAll: Subject<any>;

  constructor
    (
      private _matDialogRef: MatDialogRef<CamsUnsavedDialogComponent>,
      @Inject(MAT_DIALOG_DATA) private _data: any,
      private camsService: CamsService,
      private noctuaLookupService: NoctuaLookupService,
      private noctuaDataService: NoctuaDataService,
      private noctuaReviewSearchService: NoctuaReviewSearchService,
      private noctuaSearchService: NoctuaSearchService,
      private noctuaUserService: NoctuaUserService,
      private noctuaFormConfigService: NoctuaFormConfigService,
      private noctuaAnnotonFormService: NoctuaAnnotonFormService,
      private noctuaFormMenuService: NoctuaFormMenuService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    const self = this;

    this.camsService.onCamsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cams => {
        if (!cams) {
          return;
        }
        this.cams = cams;
      });

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  save() {
    this._matDialogRef.close(true);
  }

  close() {
    this._matDialogRef.close();
  }
}


