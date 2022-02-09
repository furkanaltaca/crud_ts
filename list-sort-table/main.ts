import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material';
import { Router } from '@angular/router';
import { ExpenseAd } from '@core/models/expense-ad';
import { SwalProvider } from '@core/providers/swal.provider';
import { ExpenseReportService } from '@core/services/expense-report.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'kt-expense-ads',
  templateUrl: './expense-ads.component.html',
  styleUrls: ['./expense-ads.component.scss']
})
export class ExpenseAdsComponent implements OnInit {

  @ViewChild('expenseAdSaveModal', { static: false }) expenseAdSaveModal: ElementRef;
  public expenseAds: ExpenseAd[] = [];
  public sortedExpenseAds: ExpenseAd[];
  private sortCache: Sort;
  public expenceDataLoading: boolean = false;
  public filterForm = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(1),
    pageSize: new FormControl(20),
    colSize: new FormControl(25),
    year: new FormControl(''),
    month: new FormControl('')
  });
  public activePages = [1];

  public form: FormGroup;
  public formLoading: boolean = false;
  public editId: number = null;
  public modalReference: any;
  public firebaseSummaryReport: ExpenseAd;

  constructor(
    private expenseReportService: ExpenseReportService,
    private ngbModal: NgbModal,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private route: Router
  ) { }

  async ngOnInit() {
    await this.getExpenseData();
    this.setFilterFormSubscribe();
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      month: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      year: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      googleAds: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      facebookAds: [
        null,
        Validators.compose([
          Validators.required
        ])
      ]
    });
  }

  private setFormValue(expenseAd: ExpenseAd) {
    this.form.patchValue(expenseAd);
  }

  private async getExpenseData() {
    this.expenceDataLoading = true;
    this.expenseAds = await this.expenseReportService.getExpenseReports(this.filterForm.value.page, this.filterForm.value.pageSize, this.filterForm.value.year, this.filterForm.value.month);
    this.sortedExpenseAds = this.expenseAds.slice();
    if(this.sortCache) {
      this.sortData(this.sortCache);
    }
    this.expenceDataLoading = false;
    this.cdr.detectChanges();
  }

  private setFilterFormSubscribe() {
    this.filterForm.controls.page.valueChanges.subscribe((async (value) => {
      if (this.activePages.indexOf(value) === -1) {
        this.activePages.push(value);
        this.cdr.markForCheck();
        this.expenceDataLoading = true;
        const newData = await this.expenseReportService.getExpenseReports(
          this.filterForm.value.page + 1,
          this.filterForm.value.pageSize, 
          this.filterForm.value.year, 
          this.filterForm.value.month
        );
        this.expenceDataLoading = false;

        newData.forEach((item) => {
          this.expenseAds.push(item);
        });

        this.sortedExpenseAds = this.expenseAds.slice();
        if(this.sortCache) {
          this.sortData(this.sortCache);
        }

        this.filterForm.controls.colSize.setValue(this.expenseAds.length);
        this.cdr.markForCheck();
      }
    }));
  }

  public openExpenseAdSaveModal(expenseAd: ExpenseAd = null) {
    if (expenseAd) {
      this.editId = expenseAd.id;
      this.setFormValue(expenseAd);
      this.getFirebaseSummary();
    } else {
      this.form.get('year').setValue(new Date().getFullYear());
      this.form.get('month').setValue(new Date().getMonth() + 1);
    }

    this.modalReference = this.ngbModal.open(this.expenseAdSaveModal, {
      ariaLabelledBy: 'modal-expense-save-title',
      centered: true
    });
    this.modalReference.result.then(result => {
      console.log(result);
    }).catch(reason => console.log(reason));
  }

  public async submit() {
    if (this.form.invalid) {
      SwalProvider.fire('Uyarı', 'Girdiğiniz verileri kontrol ediniz.', 'warning');
      return;
    }

    this.formLoading = true;

    let expenseAd: ExpenseAd = Object.assign({}, this.form.value);

    let process = new Promise(null);
    if (this.editId) {
      process = this.expenseReportService.update(this.editId, expenseAd);
    } else {
      process = this.expenseReportService.create(expenseAd);
    }
    process.then(async (value) => {
      console.log('value', value);
      this.formLoading = false;
      this.editId = null;
      SwalProvider.fire('Başarılı', 'Başarıyla kaydedildi!', 'success');
      this.modalReference.close();
      this.form.reset();
      await this.getExpenseData();
      this.cdr.detectChanges();
    }).catch((error) => {
      this.formLoading = false;
      SwalProvider.fire('Başarısız', 'Kaydedilirken hata oluştu!', 'error');
      console.log('error', error);
    });
  }

  public async getFirebaseSummary() {
    const selectedYear = this.form.value.year;
    const selectedMonth = this.form.value.month;

    if (!selectedYear || !selectedMonth) {
      return;
    }

    this.firebaseSummaryReport = await this.expenseReportService.getFirebaseSummaryReport(selectedYear, selectedMonth);
  }

  public async deleteExpenseAd(id: number, index: number) {
    Swal.fire({
      title: 'Sil',
      text: 'Silmek istediğinize emin misin?',
      icon: 'warning',
      confirmButtonText: 'Sil',
      confirmButtonColor: '#EB5D29',
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: 'İptal',
    }).then((res) => {
      if (res.value) {
        this.expenseReportService.delete(id).then(() => {
          SwalProvider.fire('Başarılı', 'Kayıt silindi!', 'success');
          this.expenseAds.splice(index, 1);
          this.cdr.detectChanges();
        }).catch(() => {
          SwalProvider.fire('Başarısız', 'İşlem gerçekleştirilirken hata oluştu!', 'error');
        });
      }
    });
  }

  public sortData(sort: Sort) {
    this.sortCache = sort;
    const data = this.expenseAds.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedExpenseAds = data;
      return;
    }

    this.sortedExpenseAds = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'year':
          return compare(a.year, b.year, isAsc);
        case 'month':
          return compare(a.month, b.month, isAsc);
        case 'googleAds':
          return compare(a.googleAds, b.googleAds, isAsc);
        case 'facebookAds':
          return compare(a.facebookAds, b.facebookAds, isAsc);
        case 'preMeeting':
          return compare(a.preMeeting, b.preMeeting, isAsc);
        case 'preMeetingCompleted':
          return compare(a.preMeetingCompleted, b.preMeetingCompleted, isAsc);
        case 'orderQty':
          return compare(a.orderQty, b.orderQty, isAsc);
        case 'userQty':
          return compare(a.userQty, b.userQty, isAsc);
        default:
          return 0;
      }
    });
  }

  public async filterExpenseAds() {
    await this.getExpenseData();
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
