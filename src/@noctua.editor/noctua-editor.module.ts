import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NoctuaSharedModule } from '@noctua/shared.module';
import { NoctuaInlineEditorComponent } from './components/inline-editor/inline-editor.component';
import { NoctuaEditorDropdownComponent } from './components/inline-editor/editor-dropdown/editor-dropdown.component';

@NgModule({
    declarations: [
        NoctuaInlineEditorComponent,
        NoctuaEditorDropdownComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NoctuaSharedModule
    ],
    exports: [
        NoctuaInlineEditorComponent
    ],
    entryComponents: [
        NoctuaEditorDropdownComponent
    ]
})
export class NoctuaEditorModule {
}
