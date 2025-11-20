import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../enviroment/environment';

export interface CloudinaryUploadResponse {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cloudinary`;

  uploadImage(file: File, folder: string = 'rentmaster'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http.post<CloudinaryUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  uploadPropertyImage(file: FormData, folder: string = 'rentmaster/properties'): Observable<CloudinaryUploadResponse> {
    return this.http.post<CloudinaryUploadResponse>(`${this.apiUrl}/upload?folder=${folder}`, file);
  }


  deleteImage(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${publicId}`);
  }


}
