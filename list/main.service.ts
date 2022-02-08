import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BannerContent } from '@core/models/banner-content';
import firebase from 'firebase';
import { apiURL } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BannerContentService {

  private collectionName:string = "banner_contents";
  
  constructor(
    private firestore: AngularFirestore,
    private httpClient: HttpClient
  ) { }

  public async getBannerContents(date: number | string = 'none', limit: number = 25) {
    let query = this.firestore.collection(this.collectionName)
      .ref
      .orderBy('create_date', 'desc');

    if (date !== 'none') {
      query = query.startAfter(date);
    }

    query = query.limit(limit);

    return query.get().then((snapshot) => {
      return snapshot.docs.map((snap) => {
        return {
          id: snap.id,
          ...snap.data()
        } as any;
      });
    });
  }

  public async getBannerContent(id: string) {
    return (await this.firestore.collection<BannerContent>(this.collectionName).doc(id).ref.get()).data() as BannerContent;
  }

  public add(bannerContent: BannerContent) {
    bannerContent.create_date = firebase.firestore.Timestamp.now().toMillis();
    bannerContent.enabled = true;
    return this.firestore.collection(this.collectionName).add(bannerContent);
  }

  public update(id:string, bannerContent: BannerContent) {
    delete bannerContent.id;
    bannerContent.modify_date = firebase.firestore.Timestamp.now().toMillis();
    return this.firestore.collection(this.collectionName).doc(id).update(bannerContent);
  }
  
  public uploadImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    
    let id = this.firestore.createId();
    return this.httpClient.post(`${apiURL}v2/banner-content/upload-image/${id}`, formData);
  }

  public updateEnabledField(id:string, enabled:boolean) {
    return this.firestore.collection(this.collectionName).doc(id).update({
      enabled: enabled
    });
  }

  public delete(id:string) {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }

}
