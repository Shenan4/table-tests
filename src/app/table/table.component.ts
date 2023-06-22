import {HttpClient} from '@angular/common/http';
import {Component, ViewChild, AfterViewInit, OnInit, AfterContentChecked} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgIf, DatePipe} from '@angular/common';
import { GithubIssue, GithubApi } from './interface';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'table-http-example',
  styleUrls: ['table.component.scss'],
  templateUrl: 'table.component.html',
  standalone: true,
  imports: [
    NgIf,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class TableHttpExample implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['created', 'state', 'number', 'title'];
  exampleDatabase!: ExampleHttpDatabase | null;
  data: GithubIssue[] = [];
  dataSource!: MatTableDataSource<any>;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  pageSize: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _httpClient: HttpClient) {}

  ngOnInit() {
    if (this.data !== null) {
      this.dataSource = new MatTableDataSource(this.data)
    }
    this.pageSize = this.paginator.pageSize = 10; // Установите желаемое значение pageSize

  }

  ngAfterViewInit() {
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.exampleDatabase!.getRepoIssues(
          this.sort.active,
          this.sort.direction,
          this.paginator.pageIndex,
          ).pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.total_count;
          this.dataSource = new MatTableDataSource(data.items)
          this.dataSource.paginator = this.paginator;
          return data.items;
        }),
        )
        .subscribe(data => {
          this.data = data;

        });

        }


        applyFilter(event: Event) {
          const filterValue = (event.target as HTMLInputElement).value;
          this.dataSource.filter = filterValue.trim().toLowerCase();

          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        }

}

export class ExampleHttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  getRepoIssues(sort: string, order: SortDirection, page: number): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
      page + 1
    }`;

    return this._httpClient.get<GithubApi>(requestUrl);
  }
}
