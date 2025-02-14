
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Subject } from 'rxjs';

import { NoctuaFormConfigService } from '@geneontology/noctua-form-base';


@Component({
  selector: 'app-before-save',
  templateUrl: './before-save.component.html',
  styleUrls: ['./before-save.component.scss']
})
export class BeforeSaveDialogComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any>;
  searchForm: FormGroup;
  searchFormData: any = {};
  cam: any = {};

  constructor(
    private _matDialogRef: MatDialogRef<BeforeSaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public noctuaFormConfigService: NoctuaFormConfigService) {
    this._unsubscribeAll = new Subject();

    this.cam = this._data.cam
    this.searchForm = this.createAnswerForm();
  }

  ngOnInit() {
  }

  close() {
    this._matDialogRef.close();
  }

  createAnswerForm() {
    return new FormGroup({
      annotatedEntity: new FormControl(this.cam.annotatedEntity.id),
      term: new FormControl(this.cam.term.id),
      evidence: new FormControl(this.cam.evidence.id),
      reference: new FormControl(this.cam.reference.label),
      with: new FormControl(this.cam.with),
    });
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}
