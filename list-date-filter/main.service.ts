import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JournalReport } from '@core/models/journal-report';
import { first } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JournalReportService {

  constructor(
    private httpClient: HttpClient
  ) { }

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
