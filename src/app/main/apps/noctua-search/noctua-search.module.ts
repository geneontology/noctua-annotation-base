import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NoctuaSharedModule } from '@noctua/shared.module';
import { ContextMenuModule } from 'ngx-contextmenu';
import { CamsTableComponent } from './cams/cams-table/cams-table.component';
import { NoctuaSearchComponent } from './noctua-search.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NoctuaSearchBaseModule } from '@noctua.search';
import { NoctuaFooterModule } from 'app/layout/components/footer/footer.module';
import { NoctuaFormModule } from '../noctua-form';
import { CamsSelectionComponent } from './cams/cams-selection/cams-selection.component';
import { CamsReplaceComponent } from './cams/cams-replace/cams-replace.component';
import { CamsReplaceDialogComponent } from './dialogs/cams-replace/cams-replace.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnotonSearchFormComponent } from './cams/annoton-search-form/annoton-search-form.component';
import { EntitySearchFormComponent } from './cams/annoton-search-form/entity-search-form/entity-search-form.component';
import { CamDetailComponent } from './cams/cam-detail/cam-detail.component';

const routes = [
  {
    path: '',
    component: NoctuaSearchComponent
  }
];

@NgModule({
  imports: [
    NoctuaSharedModule,
    ScrollingModule,
    CommonModule,
    RouterModule.forChild(routes),
    ContextMenuModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NoctuaSearchBaseModule,
    NoctuaFooterModule,
    NoctuaFormModule,
  ],
  declarations: [
    CamsReplaceDialogComponent,
    NoctuaSearchComponent,
    CamsTableComponent,
    CamsSelectionComponent,
    CamsReplaceComponent,
    AnnotonSearchFormComponent,
    EntitySearchFormComponent,
    CamDetailComponent,
  ]
})

export class NoctuaSearchModule {
}
