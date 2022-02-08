import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerContent } from '@core/models/banner-content';
import { SwalProvider } from '@core/providers/swal.provider';
import { BannerContentService } from '@core/services/banner-content.service';
import { first } from 'rxjs/operators';

declare let $:any;
@Component({
  selector: 'kt-banner-contents-edit',
  templateUrl: './banner-contents-edit.component.html',
  styleUrls: ['./banner-contents-edit.component.scss']
})
export class BannerContentsEditComponent implements OnInit {

  public form: FormGroup;
  public loading: boolean = false;
  public bannerContent: BannerContent;
  public id: string;
  public selectedImage: File = null;
  public imageSrc: string;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private bannerContentService: BannerContentService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {

    this.buildForm();

    this.id = this.activatedRoute.snapshot.params.id;
    console.log('edit id', this.id);
    if (this.id) {
      this.bannerContent = await this.bannerContentService.getBannerContent(this.id);

      if (this.bannerContent) {
        this.setDataToForm(this.bannerContent);
      }
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      analytics_name: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      href_type: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      href: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      order: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
      image_url: [
        null,
        Validators.compose([
          Validators.required
        ])
      ],
    });
  }

  private setDataToForm(bannerContent: BannerContent) {
    this.form.patchValue(bannerContent);
    this.imageSrc = bannerContent.image_url;
    this.cdr.detectChanges();
  }

  public async submit() {
    if(this.form.invalid) {
      SwalProvider.fire('Uyarı', 'Girdiğiniz verileri kontrol ediniz.', 'warning');
      return;
    }

    this.loading = true;

    let bannerContent: BannerContent = Object.assign({}, this.form.value);
    console.log('bannerContent', bannerContent);

    let imageUrl = await this.uploadImage();
    if(imageUrl) {
      bannerContent.image_url = imageUrl;
      if (this.id) {
        this.bannerContentService.update(this.id, bannerContent).then(()=>{
          this.loading = false;
          SwalProvider.fire('Başarılı', 'Banner content güncellendi!', 'success');
          this.route.navigate(['/banner-contents/list']);
        });
      } else {
        this.bannerContentService.add(bannerContent).then(()=>{
          this.loading = false;
          SwalProvider.fire('Başarılı', 'Banner content eklendi!', 'success');
          this.route.navigate(['/banner-contents/list']);
        });;
      }
    } else {
      this.loading = false;
      SwalProvider.fire('Başarısız', 'Banner content kaydedilirken hata oluştu! Görsel yüklenemedi.', 'error');
    }
  }

  async uploadImage() {
    let imageUrl = await new Promise<string>(async resolve => {
      await this.bannerContentService.uploadImage(this.selectedImage).pipe(first()).subscribe(async (res:any) => {
        if(res.success == true) {
          console.log('image upload res', res);
          resolve(res.data as string);
        } else {
          resolve(null);
        }
      });
    });
    return imageUrl;
  }

  public onImageSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedImage = event.target.files[0];
      if (this.selectedImage.type.split('/')[0] !== 'image') {
        console.error('Desteklenmeyen dosya türü.');
        return;
      }

      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedImage);
      this.form.get('image_url').setValue(this.selectedImage.name);
      this.form.get('image_url').markAsDirty();
      this.cdr.detectChanges();

    } else {
      this.clearImageSelection();
    }
  }

  private clearImageSelection() {
    this.imageSrc = '#';
    this.selectedImage = null;
    this.form.get('image_url').setValue(null);
  }

}
