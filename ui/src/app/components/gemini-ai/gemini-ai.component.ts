import {
  Component,
  signal,
  computed, CUSTOM_ELEMENTS_SCHEMA, SecurityContext, OnInit,
} from '@angular/core';

import {NgStyle} from "@angular/common";
import {DataRequestService} from "../../services/data-request.service";
import {Subject, Subscription, takeUntil} from "rxjs";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MarkdownComponent, MarkdownService, provideMarkdown} from "ngx-markdown";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

type Response = {
  username: string;
  prompt: string;
  response: string;
}

type LastResponse = {
  username: string;
  prompt: string;
  response: string;
  time: string;
}

@Component({
  selector: 'gemini-ai',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MarkdownService,
    provideMarkdown({
    sanitize: SecurityContext.NONE
  }),],
  imports: [
    NgStyle,
    MatFormField,
    MatInput,
    FormsModule,
    MarkdownComponent,
    ReactiveFormsModule,
    MatButton,
    MatProgressSpinner,
  ],
  templateUrl: './gemini-ai.component.html',
  styleUrl: './gemini-ai.component.scss'
})
export class GeminiAiComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  private ngUnsubscribe: Subject<any> = new Subject();
  aiGenerationForm: FormGroup;

  userName: any = '';
  usernameEntered: boolean = false;
  allowAIGeneration: boolean = true;
  aIGenerationInProcess: boolean = false;
  responsesFound: boolean = false;

  responses: Response[] = [];
  lastResponse: LastResponse[] = [];

  get f(): { [key: string]: AbstractControl } {
    return this.aiGenerationForm.controls;
  }

  constructor(private _dataRequestService: DataRequestService,
              private fb: FormBuilder) {

    this.aiGenerationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      prompt: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(320)]]
    });

  }

  ngOnInit() {
    if (localStorage.getItem('yorha-username')) {
      this.userName = localStorage.getItem('yorha-username');
      this.aiGenerationForm.controls['username']?.setValue(localStorage.getItem('yorha-username'));
      this.usernameEntered = true;
      console.log(' User: ', this.aiGenerationForm.controls['username'].value);
    }

  }

  getCurrentDateTime(): string {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const date = now.toLocaleDateString(undefined, dateOptions);
    const time = now.toLocaleTimeString(undefined, timeOptions);
    return `${date} ${time}`;
  }


  waitForEvent(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkEvent = () => {
        if (this.isGenerationEventComplete()) {
          resolve();
        } else {
          setTimeout(checkEvent, 300); // Check event every 300ms
        }
      };
      checkEvent();
    });
  }

  isGenerationEventComplete(): boolean {
    return !!this.aIGenerationInProcess;
  }

  geminiGenerate() {
    this.aIGenerationInProcess = true;
    this.allowAIGeneration = false;

    if (!this.usernameEntered) {
      this.usernameEntered = true;
      this.userName = this.aiGenerationForm.controls['username'].value;
      localStorage.setItem('yorha-username', this.aiGenerationForm.controls['username'].value);
    }

    const requestResponseBody: object = {
      prompt: this.aiGenerationForm.controls['prompt'].value
    }

    this._dataRequestService.geminiGenerate(requestResponseBody).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      response => {
        console.log('Response from 2B: ', response);

        this.responses = [];

        this.aIGenerationInProcess = false;
        this.responsesFound = true;
        const currentTime = this.getCurrentDateTime();

        this.responses.push({username: this.aiGenerationForm.controls['username'].value, prompt: this.aiGenerationForm.controls['prompt'].value, response: response.content });
        this.lastResponse.push({username: this.aiGenerationForm.controls['username'].value, prompt: this.aiGenerationForm.controls['prompt'].value, response: response.content, time: currentTime});
        this.aiGenerationForm.controls['prompt']?.setValue('');
      },
      error => {
        this.aIGenerationInProcess = false;
        console.error('Error:', error);
        this.aiGenerationForm.controls['prompt']?.setValue('');
      }
    );

    this.waitForEvent().then(() => {
      setTimeout(() => {
        this.allowAIGeneration = true;
      }, 7000)

    });
  }

  saveLastResponse() {
      this._dataRequestService.geminiSaveLastResponse(this.lastResponse[0]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        response => {
          if (response.response) {
            this.lastResponse = [];
          }
        },
        error => {
          console.error('Error saving the last response: ', error);
          this.lastResponse = [];
        }
      );

   this.totalResponses();
  }


  // Signals
  responseList = signal(this.responses);

  totalResponses = computed(() => {
    console.log('Total responses: ', this.responseList().length)
    return this.responseList().length;
    // return this.responseList().reduce((acc, curr) => acc + curr.response, 0);
  });

  removeResponse(response: Response) {
    this.responseList.set(
      this.responseList().filter(
        (i) => i !== response
      )
    );
  }

  responseExists(response: Response) {
    return this.responseList().includes(response);
  }

  resetResponses() {
    this.responses = [];
  }


}
