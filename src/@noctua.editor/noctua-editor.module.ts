import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NoctuaSharedModule } from '@noctua/shared.module';
import { NoctuaInlineEditorComponent } from './inline-editor/inline-editor.component';
import { NoctuaEditorDropdownComponent } from './inline-editor/editor-dropdown/editor-dropdown.component';
import { AnnotonEditorDialogComponent } from './dialogs/annoton-editor/annoton-editor.component';
import { NoctuaReferenceDropdownComponent } from './inline-reference/reference-dropdown/reference-dropdown.component';

@NgModule({
    declarations: [
        NoctuaInlineEditorComponent,
        NoctuaEditorDropdownComponent,
        NoctuaReferenceDropdownComponent,
        AnnotonEditorDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NoctuaSharedModule
    ],
    exports: [
        NoctuaInlineEditorComponent,
        AnnotonEditorDialogComponent,
        NoctuaReferenceDropdownComponent,
    ],
    entryComponents: [
        NoctuaEditorDropdownComponent,
        NoctuaReferenceDropdownComponent,
        AnnotonEditorDialogComponent
    ]
})
export class NoctuaEditorModule {
}
