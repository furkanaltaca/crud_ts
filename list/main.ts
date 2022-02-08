import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BannerContent } from '@core/models/banner-content';
import { SwalProvider } from '@core/providers/swal.provider';
import { BannerContentService } from '@core/services/banner-content.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'kt-banner-contents-list',
  templateUrl: './banner-contents-list.component.html',
  styleUrls: ['./banner-contents-list.component.scss']
})
export class BannerContentsListComponent implements OnInit {

  public bannerContents: BannerContent[] = [];
  public filterForm = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(0),
    pageSize: new FormControl(20),
    colSize: new FormControl(25)
  });
  public activePages = [1];

  constructor(
    private bannerContentService: BannerContentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.bannerContentService.getBannerContents('none').then((result) => {
      this.bannerContents = result;

      this.filterForm.controls.colSize.setValue(this.bannerContents.length);
      this.cdr.markForCheck();

      this.filterForm.controls.page.valueChanges.subscribe((async (value) => {
        if (this.activePages.indexOf(value) === -1) {
          this.activePages.push(value);
          this.cdr.markForCheck();
          const newData = await this.bannerContentService.getBannerContents(
            this.bannerContents[this.bannerContents.length - 1].create_date, 20
          );

          newData.forEach((item) => {
            this.bannerContents.push(item);
          });

          this.filterForm.controls.colSize.setValue(this.bannerContents.length);
          this.cdr.markForCheck();
        }
      }));
    });
  }

  public deleteBannerContent(id:string, index:number) {

    Swal.fire({
      title: 'Banner Content silinecek',
      text: 'Silmek istediğinize emin misin?',
      icon: 'warning',
      confirmButtonText: 'Sil',
      confirmButtonColor: '#EB5D29',
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: 'İptal',
    }).then((res) => {
      if (res.value) {
        this.bannerContentService.delete(id).then(()=>{
          SwalProvider.fire('Başarılı', 'Banner content silindi!', 'success');
          this.bannerContents.splice(index, 1);
          this.cdr.detectChanges();
        }).catch(()=>{
          SwalProvider.fire('Başarısız', 'İşlem gerçekleştirilirken hata oluştu!', 'error');
        });
      }
    });
  }

  public toggleActiveBannerContent(id:string, bannerContent:BannerContent) {
    this.bannerContentService.updateEnabledField(id, !bannerContent.enabled).then(()=>{
      bannerContent.enabled = !bannerContent.enabled;
      let message = 'Banner content aktif hale getirildi!';
      if(!bannerContent.enabled == false) {
        message = 'Banner content pasif hale getirildi!';
      }
      SwalProvider.fire('Başarılı', message, 'success');
      this.cdr.detectChanges();
    }).catch(()=>{
      SwalProvider.fire('Başarısız', 'İşlem gerçekleştirilirken hata oluştu!', 'error');
    });
  }

}
