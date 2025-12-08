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
    { field: 'id', headerName: 'ID', width: 260 },

    { field: 'class_of_orbit', headerName: 'Orbit Class', width: 150 },

    { field: 'perigee_km', headerName: 'Perigee (km)', width: 150 },
    { field: 'apogee_km', headerName: 'Apogee (km)', width: 150 },

    { field: 'inclination_deg', headerName: 'Inclination (°)', width: 160 },
    { field: 'eccentricity', headerName: 'Eccentricity', width: 150 },

    { field: 'period_min', headerName: 'Period (min)', width: 150 },
    { field: 'longitude_geo_deg', headerName: 'Longitude GEO (°)', width: 180 }
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
