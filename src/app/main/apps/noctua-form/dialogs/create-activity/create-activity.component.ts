import { Component, OnInit, OnDestroy, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { ErrorLevel, ErrorType, NoctuaActivityFormService, NoctuaFormConfigService } from 'noctua-form-base';

@Component({
  selector: 'app-create-activity-dialog',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.scss']
})
export class CreateActivityDialogComponent implements OnInit, OnDestroy {
  ErrorType = ErrorType;
  ErrorLevel = ErrorLevel;

  closeDialog: () => void;
  private _unsubscribeAll: Subject<any>;

  options = {
    hideHeader: false,
    hideFooter: false
  }

  constructor(
    private _matDialogRef: MatDialogRef<CreateActivityDialogComponent>,
    private activityFormService: NoctuaActivityFormService,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public noctuaFormConfigService: NoctuaFormConfigService) {
    this.closeDialog = this.close.bind(this);
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.activityFormService.initializeForm();
  }

  close() {
    this._matDialogRef.close();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
