import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerContentsListComponent } from './list/banner-contents-list.component';
import { RouterModule, Routes } from '@angular/router';
import { BannerContentsEditComponent } from './edit/banner-contents-edit.component';
import { BannerContentsComponent } from './banner-contents.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RoleGuard } from '@core/auth/_guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: BannerContentsComponent,
    children: [
      {
        path:'',
        redirectTo: 'list',
        pathMatch: 'full' 
      },
      {
        path: 'list',
        component: BannerContentsListComponent,
        canActivate: [RoleGuard],
        data: { type: 'read', field: 'banner_content' },
      },
      {
        path: 'edit',
        component: BannerContentsEditComponent,
        canActivate: [RoleGuard],
        data: { type: 'write', field: 'banner_content' },
      },
      {
        path: 'edit/:id',
        component: BannerContentsEditComponent,
        canActivate: [RoleGuard],
        data: { type: 'write', field: 'banner_content' },
      },
    ]
  }
];

@NgModule({
  declarations: [
    BannerContentsComponent,
    BannerContentsListComponent,
    BannerContentsEditComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTooltipModule
  ]
})
export class BannerContentsModule { }
