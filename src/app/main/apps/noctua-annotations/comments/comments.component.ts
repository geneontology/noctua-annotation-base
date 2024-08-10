
import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Activity, Cam, NoctuaAnnotationFormService, NoctuaFormConfigService, Predicate } from '@geneontology/noctua-form-base';
import { MatDrawer } from '@angular/material/sidenav';


@Component({
  selector: 'noc-sidenav-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsSidenavComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any>;


  @Input('cam') cam: Cam
  @Input('panelDrawer') panelDrawer: MatDrawer;

  selectedActivityId: string;
  constructor(
    public noctuaFormConfigService: NoctuaFormConfigService,
    private annotationFormService: NoctuaAnnotationFormService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.annotationFormService.onCommentIdChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((id: string) => {

        if (!id) {
          return;
        }

        this.selectedActivityId = id;

        console.log('comment id:', id);


      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  close() {
    this.panelDrawer.close();
  }
}
