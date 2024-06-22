import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { NoctuaSharedModule } from '@noctua/shared.module';
import { NoctuaAppsComponent } from './noctua-apps.component';


@NgModule({
    declarations: [
        NoctuaAppsComponent
    ],
    imports: [
        MatDividerModule,
        MatListModule,
        MatSlideToggleModule,

        NoctuaSharedModule,
    ],
    exports: [
        NoctuaAppsComponent
    ]
})
export class NoctuaAppsModule {
}
