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

  public getExpenseReports(pageNumber:number, take:number = 25) {
    return this.httpClient.get(`${environment.sqlApi}report/getExpenseAdsReport/${pageNumber}/${take}`)
            .pipe(first()).toPromise() as Promise<ExpenseAd[]>;
  }
}
