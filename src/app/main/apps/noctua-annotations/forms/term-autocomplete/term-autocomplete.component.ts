import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule, ControlValueAccessor } from '@angular/forms';
import { GOlrResponse, NoctuaLookupService } from '@noctua.form';
import { Observable, startWith, switchMap } from 'rxjs';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'noc-term-autocomplete',
  standalone: true,
  imports: [CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,

  ],
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

  @Input() label: string;
  @Input() solrField: string;

  control = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<GOlrResponse[]>;

  private onChange: (value: any) => void;
  private onTouched: () => void;

  constructor(private lookupService: NoctuaLookupService) { }

  ngOnInit(): void {
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      switchMap(value => this.lookupService.search(value, this.solrField))
    );
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


  termDisplayFn(term): string | undefined {
    return term ? term.label : undefined;
  }

  compareFn(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}
