import { Component, Input, OnDestroy, OnInit, SimpleChanges, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule, ControlValueAccessor, FormGroup } from '@angular/forms';
import { ActivityNode, AutocompleteType, GOlrResponse, GoCategory, NoctuaFormUtils, NoctuaLookupService } from '@geneontology/noctua-form-base';
import { Observable, Subject, Subscription, catchError, debounceTime, filter, of, startWith, switchMap, takeUntil } from 'rxjs';
/* import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; */
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
export class TermAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {

  AutocompleteType = AutocompleteType;
  @Input() label: string;
  @Input() category: GoCategory[] = [];
  @Input() solrField: string;
  @Input() autocompleteType: string = AutocompleteType.TERM;

  control = new FormControl();
  options: string[] = [];
  private valueChangesSubscription: Subscription;
  private _unsubscribeAll: Subject<any>;
  filteredOptions: Observable<GOlrResponse[]>;

  private onChange: (value: any) => void;
  private onTouched: () => void;

  constructor(private lookupService: NoctuaLookupService,
    private inlineReferenceService: InlineReferenceService,

  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.subscribeToValueChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && !changes['category'].firstChange) {
      const previousCategory = changes['category'].previousValue;
      const currentCategory = changes['category'].currentValue;

      if (!NoctuaFormUtils.areArraysEqualByKey(previousCategory, currentCategory, 'id')) {
        console.log(`Category changed from ${previousCategory} to ${currentCategory}`);
        this.subscribeToValueChanges();
      }
    }
  }

  subscribeToValueChanges(): void {
    console.log('Subscribing to value changes with category:', this.category);

    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }

    if (this.category && this.category.length > 0) {

      this.filteredOptions = this.control.valueChanges.pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(300),
        startWith(''),
        filter(value => {
          console.log('Filter value:', value);
          return value && value.length > 2;
        }),
        switchMap(value => {
          console.log('SwitchMap value:', value);
          return this.lookupService.search(value, this.category).pipe(
            catchError(err => {
              console.error('Error in search:', err);
              return of([]);
            })
          );
        })
      );

      this.valueChangesSubscription = this.filteredOptions.subscribe(data => {
        console.log('Filtered options:', data);
      });
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

  ngOnDestroy(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
