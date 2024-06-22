import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@ali-hm/angular-tree-component';
import { NoctuaSharedModule } from './../../../../@noctua/shared.module';
import { NoctuaAnnotationsDialogService } from './services/dialog.service';
import { NoctuaConfirmDialogModule } from '@noctua/components';
import { NoctuaEditorModule } from '@noctua.editor/noctua-editor.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoctuaAnnotationsComponent } from './noctua-annotations.component';
import { NoctuaSearchBaseModule } from '@noctua.search';
import { NoctuaFormModule } from '../noctua-form/noctua-form.module';
import { AnnotationFormComponent } from './forms/annotation-form/annotation-form.component';
import { AnnotationEntityFormComponent } from './forms/annotation-form/entity-form/entity-form.component';
import { AnnotationEvidenceFormComponent } from './forms/annotation-form/evidence-form/evidence-form.component';
import { AnnotationTableComponent } from './table/annotation-table.component';
import { AnnotationNodeComponent } from './table/annotation-node/annotation-node.component';

const routes = [
  {
    path: '',
    component: NoctuaAnnotationsComponent
  }
];

@NgModule({
  imports: [
    NoctuaSharedModule,
    TreeModule,
    CommonModule,
    // NoctuaModule.forRoot(noctuaConfig),
    RouterModule.forChild(routes),
    NoctuaConfirmDialogModule,
    NoctuaEditorModule,
    NoctuaSearchBaseModule,
    NgxChartsModule,

    //Material
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    NoctuaFormModule,
  ],
  exports: [
    NoctuaAnnotationsComponent
  ],
  providers: [
    NoctuaAnnotationsDialogService,
  ],
  declarations: [
    NoctuaAnnotationsComponent,
    AnnotationEntityFormComponent,
    AnnotationEvidenceFormComponent,
    AnnotationFormComponent,
    AnnotationTableComponent,
    AnnotationNodeComponent
  ],
})

export class NoctuaAnnotationsModule {
}
