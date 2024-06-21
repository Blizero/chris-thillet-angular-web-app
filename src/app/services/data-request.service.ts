import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from "@angular/common/http";
import {map, Observable, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataRequestService {

  constructor(
    private http: HttpClient,
  ) { }

  private google_gemini_generate = 'http://127.0.0.1:5000/generate';
  private google_gemini_save_response = 'http://127.0.0.1:5000/save-response';
  private google_gemini_responses = 'http://127.0.0.1:5000/responses';


  geminiGenerate(prompt: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.google_gemini_generate, prompt, { headers });
  }

  geminiSaveLastResponse(response: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.google_gemini_save_response, response, { headers });
  }


  extraActivityData(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(this.google_gemini_responses, { headers });
  }

  // Raw events Under testing
  rawEvents(prompt: any): Subscription {
    return this.http.post(this.google_gemini_generate, prompt, {
      reportProgress: true,
      observe: 'events',
    }).subscribe(event => {
      switch (event.type) {

        case HttpEventType.UploadProgress:
          console.log('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes');
          break;

        case HttpEventType.Response:
          console.log('Finished uploading!');
          break;
      }
    });
  }

}
