



import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { CamService, Gene, GeneList, GOlrResponse } from '@geneontology/noctua-form-base';
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
    private _camService: CamService,
    @Inject(MAT_DIALOG_DATA) private _data: any,
  ) {
    this._unsubscribeAll = new Subject();
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
      geneIds: new FormControl(),
    })
  }

  loadGenes() {
    const geneIds = this.geneFormGroup.value['geneIds']?.split('\n').map((gene: string) => {
      return gene.trim();
    });
    console.log('genes:', geneIds)
    this._camService.getGenesDetails(geneIds)
      .subscribe((res: GOlrResponse[]) => {
        if (!res) {
          this.genes = [];
        } else {

          this.genes = res.map((res: GOlrResponse) => {
            return {
              id: res.id,
              label: res.label
            }
          });
        }
      });
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
