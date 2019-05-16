import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NoctuaReviewComponent } from './noctua-review.component';
import { NoctuaSharedModule } from '@noctua/shared.module';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NoctuaFormModule } from './../noctua-form/noctua-form.module'

import { CamService } from 'noctua-form-base';
import { CamsTableComponent } from './cams/cams-table/cams-table.component';

//Search and Browse
import { ReviewSearchComponent } from './search/review-search/review-search.component';
import { ReviewContributorsComponent } from './search/review-contributors/review-contributors.component';
import { ReviewGroupsComponent } from './search/review-groups/review-groups.component';
import { ReviewSpeciesComponent } from './search/review-species/review-species.component';

const routes = [
  {
    path: 'r',
    component: NoctuaReviewComponent
  }
];

@NgModule({
  imports: [
    NoctuaSharedModule,
    CommonModule,
    RouterModule.forChild(routes),
    ContextMenuModule.forRoot(),
    NoctuaFormModule
  ],
  providers: [
    //NoctuaFormGridService,
    //CamService,
    //NodeService,
    //CamDiagramService,
    //CamTableService,
    //NoctuaAnnotonConnectorService
  ],
  declarations: [
    NoctuaReviewComponent,
    CamsTableComponent,
    ReviewSearchComponent,
    ReviewContributorsComponent,
    ReviewGroupsComponent,
    ReviewSpeciesComponent
  ]
  /*
  entryComponents: [
    NoctuaFormComponent,
    CamRowEditDialogComponent,
    AddEvidenceDialogComponent,
    AnnotonErrorsDialogComponent,
    BeforeSaveDialogComponent,
    CreateFromExistingDialogComponent,
    LinkToExistingDialogComponent,
    SelectEvidenceDialogComponent,
    SearchDatabaseDialogComponent,
    NodeComponent,
    NodesContainerComponent
  ]*/
})

export class NoctuaReviewModule {
}
