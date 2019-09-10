import { Component, EventEmitter, OnDestroy, OnInit, Output, ElementRef, ViewChild, Input } from '@angular/core';
import { Overlay, OverlayConfig, OriginConnectionPosition, OverlayConnectionPosition } from '@angular/cdk/overlay';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';

import { InlineEditorService, EditorDropdownDialogConfig } from './inline-editor.service';

import { SparqlService } from '@noctua.sparql/services/sparql/sparql.service';
import {
    CamService,
    NoctuaAnnotonEntityService,
    AnnotonNode,
    Annoton,
    Cam,
    NoctuaAnnotonFormService
} from 'noctua-form-base';
import { EditorCategory } from './../../models/editor-category';

@Component({
    selector: 'noctua-inline-editor',
    templateUrl: './inline-editor.component.html',
    styleUrls: ['./inline-editor.component.scss']
})
export class NoctuaInlineEditorComponent implements OnInit, OnDestroy {
    collapsed: boolean;
    noctuaConfig: any;

    @Input() cam: Cam;
    @Input() annoton: Annoton;
    @Input() entity: AnnotonNode;
    @Input() category: EditorCategory;

    @ViewChild('editorDropdownTrigger', { read: ElementRef, static: false })
    private editorDropdownTrigger: ElementRef;

    private _unsubscribeAll: Subject<any>;

    constructor(private inlineEditorService: InlineEditorService,
        private camService: CamService,
        public noctuaAnnotonFormService: NoctuaAnnotonFormService,
        private noctuaAnnotonEntityService: NoctuaAnnotonEntityService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void { }

    openEditorDropdown() {
        const data = {
            cam: this.cam,
            annoton: this.annoton,
            entity: this.entity,
            category: this.category
        };
        // this.camService.onCamChanged.next(this.cam);
        this.camService.onCamChanged.next(this.cam);
        this.camService.annoton = this.annoton;
        this.noctuaAnnotonEntityService.initializeForm(this.annoton, this.entity);
        this.inlineEditorService.open(this.editorDropdownTrigger, { data });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
