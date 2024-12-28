
import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Gene, GeneList } from '@geneontology/noctua-form-base';
import { Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-add-genes',
  templateUrl: './add-genes.component.html',
  styleUrls: ['./add-genes.component.scss']
})
export class AddGenesDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  private _unsubscribeAll: Subject<any>;
  geneFormGroup: FormGroup;


  genes: Gene[] = [];
  nonMatchingGenes: Gene[] = [];
  identifiersNotMatched: string[] = [];
  activeTab: string = 'matched';

  constructor(
    private _matDialogRef: MatDialogRef<AddGenesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
  ) {
    this._unsubscribeAll = new Subject();

    this.genes = _data.genes
    this.nonMatchingGenes = _data.nonMatchingGenes
    this.identifiersNotMatched = _data.identifiersNotMatched
  }

  ngOnInit() {
    this.geneFormGroup = this.createGeneForm();
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  createGeneForm() {
    return new FormGroup({
      description: new FormControl(this._data.description),
    })
  }

  save() {

    const id = uuid()
    const description = this.geneFormGroup.value['description'] ?? 'My Genes';

    const genes = this.genes
    const count = genes.length
    const value: GeneList = {
      id, description, count,
      genes: this.genes,
      nonMatchingGenes: this.nonMatchingGenes,
      identifiersNotMatched: this.identifiersNotMatched,
    }
    this._matDialogRef.close(value);
  }

  close() {
    this._matDialogRef.close();
  }
}
