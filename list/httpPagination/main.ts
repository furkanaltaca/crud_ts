import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { firestore } from "firebase/app";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { AppointmentService } from "@core/services/appointment.service";
import { addMonths } from "date-fns";
import { AdminService } from "@core/services/admin.service";
import { User } from "@core/auth/_models/user.model";
import { AngularFirestore } from '@angular/fire/firestore';
import Swal from "sweetalert2";
import * as firebase from 'firebase/app';
import { StatsService } from '@core/services/stats.service';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { ExpenseAd } from '@core/models/expense-ad';
import { ExpenseReportService } from '@core/services/expense-report.service';

@Component({
  selector: 'kt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  public expenseAds: ExpenseAd[] = [];
  public filterForm = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(1),
    pageSize: new FormControl(20),
    colSize: new FormControl(25)
  });
  public activePages = [1];

  constructor(
    cdr: ChangeDetectorRef,
    private expenseReportService: ExpenseReportService
    ) {
  }

  ngOnInit() {
    this.getExpenseData();
  }
  //-------------------------------------------- Giderler --------------------------------------------

  private async getExpenseData() {
    this.expenseAds = await this.expenseReportService.getExpenseReports(this.filterForm.value.page, this.filterForm.value.pageSize);
    console.log('this.expenseAds', this.expenseAds);
    
    this.filterForm.controls.page.valueChanges.subscribe((async (value) => {
      if (this.activePages.indexOf(value) === -1) {
        this.activePages.push(value);
        this.cdr.markForCheck();
        const newData = await this.expenseReportService.getExpenseReports(
          this.filterForm.value.page + 1,
          this.filterForm.value.pageSize
        );

        newData.forEach((item) => {
          this.expenseAds.push(item);
        });

        this.filterForm.controls.colSize.setValue(this.expenseAds.length);
        this.cdr.markForCheck();
      }
    }));
  }


  //--------------------------------------------

}
