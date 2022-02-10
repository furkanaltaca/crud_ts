import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExpenseAd } from '@core/models/expense-ad';
import { first } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ExpenseReportService {

  constructor(
    private httpClient: HttpClient
  ) { }

  public getExpenseReports(pageNumber: number, take: number = 25, year: number=null, month: number=null) {
    return this.httpClient
      .get(`${environment.sqlApi}report/getExpenseAdsReport/${pageNumber}/${take}?year=${year}&month=${month}`)
      .pipe(first())
      .toPromise() as Promise<ExpenseAd[]>;
  }

  public create(expenseAd: ExpenseAd) {
    return this.httpClient
      .post(`${environment.sqlApi}report/createExpenseReport`, expenseAd)
      .pipe(first())
      .toPromise() as Promise<ExpenseAd[]>;
  }

  public update(id: number, expenseAd: ExpenseAd) {
    expenseAd.id = id;
    return this.httpClient
      .put(`${environment.sqlApi}report/updateExpenseReport`, expenseAd)
      .pipe(first())
      .toPromise() as Promise<ExpenseAd[]>;
  }

  public delete(id: number) {
    return this.httpClient
      .delete(`${environment.sqlApi}report/deleteExpenseReport/${id}`)
      .pipe(first())
      .toPromise() as Promise<any>;
  }

  public getFirebaseSummaryReport(year: number, month: number) {
    return this.httpClient
      .get(`${environment.sqlApi}report/getFirebaseSummaryReport/${year}/${month}`)
      .pipe(first())
      .toPromise() as Promise<ExpenseAd>;
  }

  public getJournalReports(pageNumber: number, take: number = 25, startDate: number=null, endDate: number=null) {
    let url = `${environment.sqlApi}journal/getJournalReport/${pageNumber}/${take}`;
    
    if(startDate || endDate) {
      if(startDate && !endDate) {
        url += `?startDate=${startDate}`;
      } else if (endDate && !startDate) {
        url += `?endDate=${endDate}`;
      } else if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
    }

    return this.httpClient
      .get(url)
      .pipe(first())
      .toPromise() as Promise<JournalReport[]>;
  }
}
