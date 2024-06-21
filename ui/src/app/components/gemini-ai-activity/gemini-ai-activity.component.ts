import {Component, OnInit} from '@angular/core';
import {DataRequestService} from "../../services/data-request.service";
import {Subject, Subscription, takeUntil} from "rxjs";
import {GridReadyEvent} from "ag-grid-community";
import {AgGridAngular} from "ag-grid-angular";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'gemini-ai-activity',
  standalone: true,
  imports: [
    AgGridAngular,
    MatButton,
    MatIcon,
    MatTooltip
  ],
  templateUrl: './gemini-ai-activity.component.html',
  styleUrl: './gemini-ai-activity.component.scss'
})
export class GeminiAiActivityComponent implements OnInit {
  private ngUnsubscribe: Subject<any> = new Subject();

  themeClass: string =
    "ag-theme-balham-dark";

  columnDefs = [
    { field: '_id', width: 270, headerName: 'ID', hide: true },
    { field: 'time', width: 170, headerName: 'Time'},
    { field: 'username', width: 170,  headerName: 'Username' },
    { field: 'prompt', width: 470, headerName: 'Prompt' },
    { field: 'response', width: 570, headerName: 'Response' }
  ];

  rowData: any[] = [];

  constructor(private _dataRequestService: DataRequestService) {}

  ngOnInit() {

  }

  onGridReady(params: GridReadyEvent) {
    this._dataRequestService.extraActivityData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        console.log('Response from Database: ', data);
        this.rowData = data;
      },
      error => {
        console.error('Error:', error);
      }
    );
  }

  fetchData() {
    this._dataRequestService.extraActivityData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        console.log('Response from Database: ', data);
        this.rowData = data;
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

}
