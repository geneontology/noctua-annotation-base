
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';

import {
  AnnotonNode,
  Evidence,
  NoctuaFormConfigService,
  NoctuaLookupService
} from 'noctua-form-base';

import { noctuaAnimations } from './../../../../../../@noctua/animations';

@Component({
  selector: 'app-search-evidence',
  templateUrl: './search-evidence.component.html',
  styleUrls: ['./search-evidence.component.scss'],
  animations: noctuaAnimations
})
export class SearchEvidenceDialogComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any>;
  annotonNodes: AnnotonNode[] = [];
  searchCriteria: any;
  displayedColumns: string[] = ['select', 'evidence', 'reference', 'with', 'assignedBy'];
  dataSource;
  selection = new SelectionModel<Evidence>(true, []);

  constructor(
    private _matDialogRef: MatDialogRef<SearchEvidenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public noctuaFormConfigService: NoctuaFormConfigService,
    private noctuaLookupService: NoctuaLookupService,
  ) {
    this._unsubscribeAll = new Subject();

    this.searchCriteria = this._data.searchCriteria;
    this.initialize();

  }
  ngOnInit() {
  }
  initialize() {
    const self = this;

    self.noctuaLookupService.companionLookup(
      this.searchCriteria.gpNode.id,
      this.searchCriteria.aspect,
      this.searchCriteria.params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        console.log(response);
        this.annotonNodes = response;
      });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  save() {
    this._matDialogRef.close({
      evidences: <Evidence[]>this.selection.selected
    });
  }

  close() {
    this._matDialogRef.close();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
