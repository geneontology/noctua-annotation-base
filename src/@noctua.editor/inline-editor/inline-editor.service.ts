import { Injectable, Injector, ElementRef, ComponentRef } from '@angular/core';
import {
    Overlay,
    OverlayRef,
    OverlayConfig,
    PositionStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { EditorDropdownOverlayRef } from './editor-dropdown/editor-dropdown-ref';
import { editorDropdownData } from './editor-dropdown/editor-dropdown.tokens';

import { NoctuaEditorDropdownComponent } from './editor-dropdown/editor-dropdown.component';

import {
    CamService,
    NoctuaAnnotonEntityService,
    NoctuaAnnotonFormService
} from 'noctua-form-base';

export interface SearchCriiteria {
    gp: string;
    url: string;
}

export interface EditorDropdownDialogConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    positionStrategy?: PositionStrategy;
    width?: string;
    data?: any;
}

const DEFAULT_CONFIG: EditorDropdownDialogConfig = {
    hasBackdrop: true,
    backdropClass: 'dark-backdrop',
    panelClass: 'tm-file-preview-dialog-panel',
    // width: '600px',
    data: null
};

@Injectable({
    providedIn: 'root'
})
export class InlineEditorService {

    constructor(
        private injector: Injector,
        private overlay: Overlay,
        private camService: CamService,
        public noctuaAnnotonFormService: NoctuaAnnotonFormService,
        private noctuaAnnotonEntityService: NoctuaAnnotonEntityService) { }

    openEditorDropdown(event, config) {
        const data = {
            cam: config.cam,
            annoton: config.annoton,
            entity: config.entity,
            category: config.category,
            evidenceIndex: config.evidenceIndex
        };
        // this.camService.onCamChanged.next(this.cam);
        this.camService.onCamChanged.next(config.cam);
        this.camService.annoton = config.annoton;
        this.noctuaAnnotonEntityService.initializeForm(config.annoton, config.entity);
        this.open(event.target, { data });
    }

    open(elementToConnectTo: ElementRef, config: EditorDropdownDialogConfig = {}) {
        const dialogConfig = { ...DEFAULT_CONFIG, ...config };

        dialogConfig['positionStrategy'] = this._getPosition(elementToConnectTo);
        const overlayRef = this.createOverlay(dialogConfig);
        const dialogRef = new EditorDropdownOverlayRef(overlayRef);

        overlayRef.backdropClick().subscribe(_ => dialogRef.close());

        return dialogRef;
    }

    close(): void {
        //  this.overlayRef.dispose();
    }

    private createInjector(config: EditorDropdownDialogConfig, dialogRef: EditorDropdownOverlayRef): PortalInjector {
        const injectionTokens = new WeakMap();

        injectionTokens.set(EditorDropdownOverlayRef, dialogRef);
        injectionTokens.set(editorDropdownData, config.data);

        return new PortalInjector(this.injector, injectionTokens);
    }


    private createOverlay(config: EditorDropdownDialogConfig) {
        const overlayConfig = this.getOverlayConfig(config);

        return this.overlay.create(overlayConfig);
    }

    private getOverlayConfig(config: EditorDropdownDialogConfig): OverlayConfig {
        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: config.backdropClass,
            width: config.width,
            panelClass: config.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: config.positionStrategy
        });

        return overlayConfig;
    }

    private _getPosition(elementToConnectTo: ElementRef) {


        return this.overlay.position()
            .flexibleConnectedTo(elementToConnectTo)
            .withFlexibleDimensions(true)
            .withPush(true)
            .withPositions([{
                overlayX: 'end',
                overlayY: 'top',
                originX: 'end',
                originY: 'bottom'
            }]);
        //.withOffsetY(1)
        //.withDirection('ltr')
        //.withFallbackPosition(origin.bottomRight, overlay.topRight)
        //.withFallbackPosition(origin.topLeft, overlay.bottomLeft)
        //.withFallbackPosition(origin.topRight, overlay.bottomRight)
        // .withFallbackPosition(origin.topCenter, overlay.bottomCenter)
        // .withFallbackPosition(origin.bottomCenter, overlay.topCenter)
    }
}
