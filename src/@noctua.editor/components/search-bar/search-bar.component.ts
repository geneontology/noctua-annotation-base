import { Component, EventEmitter, OnDestroy, OnInit, Output, ElementRef, ViewChild, Input } from '@angular/core';
import { Overlay, OverlayConfig, OriginConnectionPosition, OverlayConnectionPosition } from '@angular/cdk/overlay';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SearchBarService, AdvancedSearchDialogConfig } from './search-bar.service';

import { SparqlService } from '@noctua.sparql/services/sparql/sparql.service';
import {
    CamService,
    NoctuaAnnotonEntityService,
    AnnotonNode,
    Annoton,
    Cam
} from 'noctua-form-base';
import { EditorCategory } from './../../models/editor-category';

@Component({
    selector: 'noctua-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class NoctuaSearchBarComponent implements OnInit, OnDestroy {
    collapsed: boolean;
    noctuaConfig: any;

    @Input() cam: Cam;
    @Input() annoton: Annoton;
    @Input() entity: AnnotonNode;
    @Input() category: EditorCategory;

    @ViewChild('advancedSearchTrigger', { read: ElementRef, static: false })
    private advancedSearchTrigger: ElementRef;

    private _unsubscribeAll: Subject<any>;

    constructor(private searchBarService: SearchBarService,
        private camService: CamService,
        private noctuaAnnotonEntityService: NoctuaAnnotonEntityService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void { }

    openAdvancedSearch() {
        const data = {
            cam: this.cam,
            annoton: this.annoton,
            entity: this.entity,
            category: this.category
        };
        // this.camService.onCamChanged.next(this.cam);

        this.noctuaAnnotonEntityService.initializeForm(this.annoton, this.entity);
        this.searchBarService.open(this.advancedSearchTrigger, { data });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
