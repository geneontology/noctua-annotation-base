import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cam, CamService } from 'noctua-form-base';

@Component({
    selector: 'noc-noctua-apps',
    templateUrl: './noctua-apps.component.html',
    styleUrls: ['./noctua-apps.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoctuaAppsComponent implements OnInit, OnDestroy {
    public cam: Cam;
    date: Date;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private camService: CamService,
    ) {
        this.date = new Date();
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.camService.onCamChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cam) => {
                if (!cam) {
                    return;
                }

                this.cam = cam;
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
