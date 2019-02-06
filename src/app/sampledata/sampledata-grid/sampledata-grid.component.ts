import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ITdDataTableColumn,
  TdDataTableComponent,
  TdDialogService,
  IPageChangeEvent,
  ITdDataTableSortChangeEvent,
  TdPagingBarComponent,
} from '@covalent/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SampleDataService } from '../services/sampledata.service';
import { AuthService } from '../../core/security/auth.service';
import { SampleDataDialogComponent } from '../../sampledata/sampledata-dialog/sampledata-dialog.component';
import { Pageable } from '../../core/interfaces/pageable';
import {Observable, of} from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import {
  AddData,
  EditData,
  DeleteData,
  LoadDataSuccess,
} from '../store/actions/sampledata.actions';
import { Sampledata } from '../models/sampledata.model';
import {map, switchMap, tap} from "rxjs/operators";

@Component({
  selector: 'public-app-sampledata-grid-display',
  templateUrl: './sampledata-grid.component.html',
  styleUrls: ['./sampledata-grid.component.scss'],
})
export class SampleDataGridComponent implements OnInit {
  private pageable: Pageable = {
    pageSize: 8,
    pageNumber: 0,
    sort: [
      {
        property: 'name',
        direction: 'ASC',
      },
    ],
  };
  // private sorting: any[] = [];
  // user: Sampledata = new Sampledata();
  // @ViewChild('dataTable') dataTable: TdDataTableComponent;

  private sorting: any[] = [];
  @ViewChild('pagingBar') pagingBar: TdPagingBarComponent;
  @ViewChild('dataTable') dataTable: TdDataTableComponent;
  data: any = [];

  columns$: Observable<ITdDataTableColumn[]> = of([
    {
      name: 'name',
      label: 'sampledatamanagement.SampleData.columns.name',
    },
    {
      name: 'surname',
      label: 'sampledatamanagement.SampleData.columns.surname',
    },
    {
      name: 'age',
      label: 'sampledatamanagement.SampleData.columns.age',
    },
    {
      name: 'mail',
      label: 'sampledatamanagement.SampleData.columns.mail',
    },
  ]).pipe(
    switchMap(columns => this.translate.stream(columns.map(c => c.label))
        .pipe(map(translations => columns.map(column => (
          {...column,
            label: translations[column.label]
          }))),
    )));
  pageSize: number = 8;
  pageSizes: number[] = [8, 16, 24];
  selectedRow: any;
  dialogRef: MatDialogRef<SampleDataDialogComponent>;
  totalItems: number;
  searchTerms: any = {
    id: undefined,
    name: undefined,
    surname: undefined,
    age: undefined,
    mail: undefined,
    modificationCounter: undefined,
    pageSize: undefined,
    pagination: undefined,
    searchTerms: undefined,
  };
  contacts$: Observable<Sampledata[]>;
  constructor(
    private store: Store<AppState>,
    private translate: TranslateService,
    public dialog: MatDialog,
    public authService: AuthService,
    public router: Router,
    public dataGridService: SampleDataService,
    private _dialogService: TdDialogService,
  ) {
    this.dataGridService.componentMethodCalled$.subscribe(() => {
      this.getSampleData();
    });
  }
  ngOnInit(): void {
    this.store.dispatch(new LoadDataSuccess());
  }
  getSampleData(): void {
    this.dataGridService
      .getSampleData(
        this.pageable.pageSize,
        this.pageable.pageNumber,
        this.searchTerms,
        (this.pageable.sort = this.sorting),
      )
      .subscribe(
        (res: any) => {
          this.data = res.content;
          this.totalItems = res.totalElements;
          this.dataTable.refresh();
        },
        (error: any) => {
          setTimeout(() => {
            this._dialogService.openAlert({
              message: error.message,
              title: this.getTranslation('ERROR'),
              closeButton: 'CLOSE',
            });
          });
        },
      );
  }
  getTranslation(text: string): string {
    return this.translate.instant(text);
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.pageable = {
      pageSize: pagingEvent.pageSize,
      pageNumber: pagingEvent.page - 1,
      sort: this.pageable.sort,
    };
    this.getSampleData();
  }
  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sorting = [];
    this.sorting.push({
      property: sortEvent.name.split('.').pop(),
      direction: '' + sortEvent.order,
    });
    this.getSampleData();
  }
  openDialog(): void {
    this.dialogRef = this.dialog.open(SampleDataDialogComponent);
    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const payload: any = {
          name: result.name,
          surname: result.surname,
          age: result.age,
          mail: result.mail,
        };
        this.store.dispatch(new AddData(payload));
        this.getSampleData();
      }
    });
  }
  selectEvent(e: any): void {
    e.selected ? (this.selectedRow = e.row) : (this.selectedRow = undefined);
  }
  openEditDialog(): void {
    this.dialogRef = this.dialog.open(SampleDataDialogComponent, {
      data: this.selectedRow,
    });
    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        {
          const payload: any = {
            id: result.id,
            name: result.name,
            surname: result.surname,
            age: result.age,
            mail: result.mail,
            modificationCounter: result.modificationCounter,
          };
          this.store.dispatch(new EditData(payload));
        }
      }
    });
  }
  openConfirm(): void {
    const payload: any = {
      id: this.selectedRow.id,
    };
    this._dialogService
      .openConfirm({
        message: this.getTranslation('sampledatamanagement.alert.message'),
        title: this.getTranslation('sampledatamanagement.alert.title'),
        cancelButton: this.getTranslation(
          'sampledatamanagement.alert.cancelBtn',
        ),
        acceptButton: this.getTranslation(
          'sampledatamanagement.alert.acceptBtn',
        ),
      })
      .afterClosed()
      .subscribe((accept: boolean) => {
        if (accept) {
          this.store.dispatch(new DeleteData(payload));
          this.selectedRow = undefined;
        }
      });
  }
  filter(): void {
    this.pagingBar.firstPage();
  }

  searchReset(form: any): void {
    form.reset();
    this.getSampleData();
  }
}
