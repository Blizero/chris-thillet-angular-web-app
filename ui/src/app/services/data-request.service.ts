import { Injectable, isDevMode } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from "@angular/common/http";
import {Observable, Subscription} from "rxjs";
import {environment} from "../environment.prod";

@Injectable({
  providedIn: 'root'
})
export class DataRequestService {
  inDevMode: boolean;
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) {
    this.inDevMode = isDevMode();
    console.log(' this.inDevMode ', this.inDevMode)

  }

  private google_gemini_generate = `${this.baseUrl}/generate`;
  private google_gemini_save_response = `${this.baseUrl}/save-response`;
  private google_gemini_responses = `${this.baseUrl}/responses`;
  private google_gemini_ml_predict = `${this.baseUrl}/predict`;

  assignEnvironmentUrl(){

    if (this.inDevMode) {
        this.baseUrl = 'http://127.0.0.1:5000';
    }

    this.google_gemini_generate = `${this.baseUrl}/generate`;
    this.google_gemini_save_response = `${this.baseUrl}/save-response`;
    this.google_gemini_responses = `${this.baseUrl}/responses`;
    this.google_gemini_ml_predict = `${this.baseUrl}/predict`;


  }

  geminiGenerate(prompt: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.assignEnvironmentUrl();

    return this.http.post<any>(this.google_gemini_generate, prompt, { headers });
  }

  geminiSaveLastResponse(response: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.assignEnvironmentUrl();
    return this.http.post<any>(this.google_gemini_save_response, response, { headers });
  }


  extraActivityData(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.assignEnvironmentUrl();

    return this.http.get<any>(this.google_gemini_responses, { headers });
  }

  // extraMLPredictActivityData(): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json'
  //   });
  //
  //   this.assignEnvironmentUrl();
  //
  //   return this.http.post<any>(this.google_gemini_ml_predict, { headers });
  // }


  extraMLPredictActivityData(request: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.assignEnvironmentUrl();
    return this.http.post<any>(this.google_gemini_ml_predict, request, { headers });
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
