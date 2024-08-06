
import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { Cam, NoctuaFormConfigService, Predicate } from '@geneontology/noctua-form-base';
import { MatSidenav } from '@angular/material/sidenav';


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
  @Input('sidenav') sidenav: MatSidenav;


  constructor(
    public noctuaFormConfigService: NoctuaFormConfigService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  close() {
    this.sidenav.close();
  }
}
