import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule, ControlValueAccessor, FormGroup } from '@angular/forms';
import { ActivityNode, GOlrResponse, NoctuaLookupService } from '@noctua.form';
import { Observable, filter, startWith, switchMap } from 'rxjs';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InlineReferenceService } from '@noctua.editor/inline-reference/inline-reference.service';

@Component({
  selector: 'noc-term-autocomplete',
  //standalone: true,
  /*   imports: [CommonModule,
      MatAutocompleteModule,
      MatInputModule,
      MatButtonModule,
      FormsModule,
      MatIconModule,
      ReactiveFormsModule,
  
    ], */
  templateUrl: './term-autocomplete.component.html',
  styleUrl: './term-autocomplete.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TermAutocompleteComponent),
      multi: true
    }
  ]
})
export class TermAutocompleteComponent implements OnInit, ControlValueAccessor {

  @Input() metadata: ActivityNode;
  @Input() solrField: string;

  control = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<GOlrResponse[]>;

  private onChange: (value: any) => void;
  private onTouched: () => void;

  constructor(private lookupService: NoctuaLookupService,
    private inlineReferenceService: InlineReferenceService,

  ) { }

  ngOnInit(): void {
    console.log('metadata', this.metadata)
    if (this.metadata?.category) {
      this.filteredOptions = this.control.valueChanges.pipe(
        startWith(''),
        filter(value => value.length > 2),
        switchMap(value => this.lookupService.search(value, this.metadata.category))
      );
    }
  }

  writeValue(value: any): void {
    this.control.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  selectTerm(term: any) {
    console.log('term', term);
  }

  updateReferenceList() {
  }

  openAddReference(event) {
    event.stopPropagation();
    const data = {
      formControl: this.control as FormControl,
    };
    this.inlineReferenceService.open(event.target, { data });
  }


  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  compareFn(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}
