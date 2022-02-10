import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material';
import { JournalReport } from '@core/models/journal-report';
import { JournalReportService } from '@core/services/journal-report.service';
import moment from 'moment';

@Component({
  selector: 'kt-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {

  public journalReports: JournalReport[] = [];
  public sortedJournalReports: JournalReport[];
  private sortCache: Sort;
  public journalReportDataLoading: boolean = false;
  public filterForm = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(1),
    pageSize: new FormControl(20),
    colSize: new FormControl(25),
    startDate: new FormControl(null),
    endDate: new FormControl(null)
  });
  public activePages = [1];
  public startDateFilter: any;
  public endDateFilter: any;
  public dateRangeFilterType: string = "custom";

  constructor(
    private journalReportService: JournalReportService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    await this.getJournalReportData();
    this.setFilterFormSubscribe();
  }

  private async getJournalReportData() {
    this.journalReportDataLoading = true;
    this.journalReports = await this.journalReportService.getJournalReports(this.filterForm.value.page, this.filterForm.value.pageSize, this.filterForm.value.startDate, this.filterForm.value.endDate);
    this.sortedJournalReports = this.journalReports.slice();
    if (this.sortCache) {
      this.sortData(this.sortCache);
    }
    this.journalReportDataLoading = false;
    this.cdr.detectChanges();
  }

  private setFilterFormSubscribe() {
    this.filterForm.controls.page.valueChanges.subscribe((async (value) => {
      if (this.activePages.indexOf(value) === -1) {
        this.activePages.push(value);
        this.cdr.markForCheck();
        this.journalReportDataLoading = true;
        const newData = await this.journalReportService.getJournalReports(
          this.filterForm.value.page + 1,
          this.filterForm.value.pageSize,
          this.filterForm.value.startDate,
          this.filterForm.value.endDate
        );
        this.journalReportDataLoading = false;

        newData.forEach((item) => {
          this.journalReports.push(item);
        });

        this.sortedJournalReports = this.journalReports.slice();
        if (this.sortCache) {
          this.sortData(this.sortCache);
        }

        this.filterForm.controls.colSize.setValue(this.journalReports.length + 1);
        this.cdr.markForCheck();
      }
    }));
  }

  public sortData(sort: Sort) {
    this.sortCache = sort;
    const data = this.journalReports.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedJournalReports = data;
      return;
    }

    this.sortedJournalReports = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date':
          var firstDate = moment(a.date, "DD.MM.YYYY").toDate();
          var secondDate = moment(b.date, "DD.MM.YYYY").toDate();
          return compare(firstDate.getTime(), secondDate.getTime(), isAsc);
        case 'totalCount':
          return compare(a.totalCount, b.totalCount, isAsc);
        case 'personCount':
          return compare(a.totalCount, b.totalCount, isAsc);
        default:
          return 0;
      }
    });
  }

  public async filterJournalReportData(filterType) {
    if (filterType == 'dropdown') {
      this.endDateFilter = new Date();
      switch (this.dateRangeFilterType) {
        case 'custom':
          break;
        case 'thisMonth':
          var currentDate = new Date();
          this.startDateFilter = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          this.endDateFilter = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case 'lastSevenDays':
          this.startDateFilter = new Date(new Date().setDate(this.endDateFilter.getDate() - 7));
          break;
        case 'lastThirtyDays':
          this.startDateFilter = new Date(new Date().setDate(this.endDateFilter.getDate() - 30));
          break;
        case 'lastNinetyDays':
          this.startDateFilter = new Date(new Date().setDate(this.endDateFilter.getDate() - 90));
          break;
        case 'lastTwelveMonths':
          this.startDateFilter = new Date(new Date().setFullYear(this.endDateFilter.getFullYear() - 1));
          break;
        default:
          this.dateRangeFilterType = 'custom';
          break;
      }
    } else if (filterType == 'datePicker') {
      this.dateRangeFilterType = 'custom';
    }

    if (this.startDateFilter) {
      this.filterForm.value.startDate = new Date(this.startDateFilter).getTime();
    }
    if (this.endDateFilter) {
      this.filterForm.value.endDate = new Date(this.endDateFilter).getTime();
    }

    console.log('last this.startDateFilter', this.startDateFilter)
    console.log('last this.endDateFilter', this.endDateFilter)

    await this.getJournalReportData();
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}