
import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { Cam, NoctuaFormConfigService, Predicate } from '@geneontology/noctua-form-base';
import { MatDrawer } from '@angular/material/sidenav';


@Component({
  selector: 'noc-sidenav-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsSidenavComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any>;
  commentsFormGroup: FormGroup;
  commentsFormArray: FormArray
  comments: string[] = [];

  @Input('cam') cam: Cam
  @Input('panelDrawer') panelDrawer: MatDrawer;


  constructor(
    public noctuaFormConfigService: NoctuaFormConfigService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    console.log(this.cam)
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  close() {
    this.panelDrawer.close();
  }
}
