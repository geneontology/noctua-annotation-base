import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import {
  NoctuaUserService,
  NoctuaFormConfigService,
  NoctuaFormMenuService,
  NoctuaActivityFormService,
  CamsService,
  CamService
} from 'noctua-form-base';
import { noctuaAnimations } from '@noctua/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'noc-graph-settings-dialog',
  templateUrl: './graph-settings.component.html',
  styleUrls: ['./graph-settings.component.scss'],
  animations: noctuaAnimations,
})
export class GraphSettingsDialogComponent implements OnInit, OnDestroy {

  displayedColumns = [
    'category',
    'count'
  ];

  settingsForm: FormGroup;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _matDialogRef: MatDialogRef<GraphSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public camsService: CamsService,
    public camService: CamService,
    public noctuaUserService: NoctuaUserService,
    public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaActivityFormService: NoctuaActivityFormService,
    public noctuaFormMenuService: NoctuaFormMenuService) {

    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.settingsForm = this.createAnswerForm();
    this._onValueChanges();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();


  }


  createAnswerForm() {
    return new FormGroup({
      showEvidence: new FormControl(),
      showEvidenceCode: new FormControl(),
      showReference: new FormControl(),
      showWith: new FormControl(),
    });
  }

  private _onValueChanges() {
    const self = this;


    this.settingsForm.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400)
    ).subscribe(value => {
      console.log(value)
    });
  }

  confirm() {
    this._matDialogRef.close(true);
  }

  cancel() {
    this._matDialogRef.close();
  }
}