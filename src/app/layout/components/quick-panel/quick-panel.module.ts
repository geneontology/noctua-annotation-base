import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

import { NoctuaSharedModule } from '@noctua/shared.module';

import { QuickPanelComponent } from 'app/layout/components/quick-panel/quick-panel.component';

@NgModule({
    declarations: [
        QuickPanelComponent
    ],
    imports: [
        MatDividerModule,
        MatListModule,
        MatSlideToggleModule,

        NoctuaSharedModule,
    ],
    exports: [
        QuickPanelComponent
    ]
})
export class QuickPanelModule {
}
