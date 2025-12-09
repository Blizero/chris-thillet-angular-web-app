import {
  Component,
  signal,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  SecurityContext,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import {DecimalPipe, NgForOf, NgIf, NgStyle} from "@angular/common";
import {
  DataRequestService,
  TableDataRefreshObservable,
  TableDataTransferObservable
} from "../../services/data-request.service";
import {Subject, Subscription, takeUntil} from "rxjs";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {MarkdownComponent, MarkdownService, provideMarkdown} from "ngx-markdown";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

import * as THREE from 'three';
import {SatelliteOrbit} from '../../models/satellite-orbit.model';
import {GeminiAiActivityComponent} from "../gemini-ai-activity/gemini-ai-activity.component";

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
  providers: [
    MarkdownService,
    provideMarkdown({
      sanitize: SecurityContext.NONE
    }),
  ],
  imports: [
    NgStyle,
    MatFormField,
    MatInput,
    FormsModule,
    MarkdownComponent,
    ReactiveFormsModule,
    MatButton,
    MatProgressSpinner,
    NgIf,
    NgForOf,
    DecimalPipe,
    GeminiAiActivityComponent,
  ],
  templateUrl: './gemini-ai.component.html',
  styleUrl: './gemini-ai.component.scss'
})
export class GeminiAiComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private ngUnsubscribe: Subject<any> = new Subject();
  aiGenerationForm: FormGroup;
  prediction: MissionPrediction | null = null;

  @ViewChild('rendererContainer', {static: false})
  rendererContainer!: ElementRef<HTMLDivElement>;

  // ===== THREE.JS FIELDS =====
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId: number | null = null;

  private earthMesh!: THREE.Mesh;
  private cloudMesh!: THREE.Mesh;
  private atmosphereMesh!: THREE.Mesh;
  private starfieldMesh!: THREE.Mesh;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  // Scaling: Earth radius in km and our "world" units
  private EARTH_RADIUS_KM = 6371;
  private SCALE = 1 / 1000; // shrink everything so it fits in view

  private clock = new THREE.Clock();

  private satelliteVisuals: {
    mesh: THREE.Group;
    orbitRadius: number;
    currentAngle: number;
    angularSpeed: number;
  }[] = [];

  // ===== GEMINI / FORM STATE =====
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

  constructor(
    private _dataRequestService: DataRequestService,
    private _tableDataTransferObservable: TableDataTransferObservable,
    private _tableDataRefreshObservable: TableDataRefreshObservable,
    private fb: FormBuilder
  ) {
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

    this._tableDataTransferObservable.tableDataTransferObservable$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      data => {
        this.loadSatellites(data);
      });

  }

  ngAfterViewInit(): void {
    this.initThree();
    this.addStarfield();
    this.addEarth();
    this.loadSatellites(null);
    this.animate();
  }

  // ===================== THREE.JS SETUP =====================

  private initThree(): void {
    if (!this.rendererContainer) {
      console.error('rendererContainer ViewChild is not set');
      return;
    }

    const container = this.rendererContainer.nativeElement;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 0, 40); // a bit farther now that we have starfield/atmosphere

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Resize handling
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  private onWindowResize(): void {
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Starfield: big inverted sphere with star texture.
   */
  private addStarfield(): void {
    const geometry = new THREE.SphereGeometry(500, 64, 64);
    const starsTexture = this.textureLoader.load('assets/textures/starfield.jpg');
    const material = new THREE.MeshBasicMaterial({
      map: starsTexture,
      side: THREE.BackSide // render inside the sphere
    });

    this.starfieldMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.starfieldMesh);
  }

  /**
   * Earth: textured globe + clouds shell + atmosphere glow.
   */
  private addEarth(): void {
    const radius = this.EARTH_RADIUS_KM * this.SCALE;

    // --- Earth core (land/ocean) ---
    const earthGeometry = new THREE.SphereGeometry(radius, 64, 64);
    const earthColorMap = this.textureLoader.load('assets/2k_earth_nightmap.jpg');

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthColorMap,
      specular: new THREE.Color(0x333333),
      shininess: 10
      // (You can hook bumpMap / specularMap here later if you add them)
    });

    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    this.scene.add(this.earthMesh);

    // --- Cloud layer ---
    const cloudGeometry = new THREE.SphereGeometry(radius * 1.01, 64, 64);
    const cloudTexture = this.textureLoader.load('assets/2k_earth_clouds.jpg');

    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });

    this.cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.scene.add(this.cloudMesh);

    // --- Atmosphere glow ---
    const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.06, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });

    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(this.atmosphereMesh);
  }


  private loadSatellites(tableData: any): void {
    if (tableData) {
      const request = {
        perigee_km: tableData.perigee_km,
        apogee_km: tableData.apogee_km,
        inclination_deg: tableData.inclination_deg,
        eccentricity: tableData.eccentricity,
        longitude_geo_deg: tableData.longitude_geo_deg,
        period_min: tableData.period_min,
        class_of_orbit: tableData.class_of_orbit
      };

      this._dataRequestService.extraMLPredictActivityData(request)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (result: MissionPrediction) => {
            console.log('Predict Response: ', result);
            this.prediction = result;

            const satForViz: SatelliteOrbit = {
              id: 'prediction-orbit',
              apogee_km: result.input.apogee_km,
              perigee_km: result.input.perigee_km,
              inclination_deg: result.input.inclination_deg,
              eccentricity: result.input.eccentricity,
              longitude_geo_deg: result.input.longitude_geo_deg,
              period_min: result.input.period_min,
              class_of_orbit: result.input.class_of_orbit
            };

            this.addOrbitForSatellite(satForViz);
          },
          error => {
            console.error('Error calling /predict: ', error);
          }
        );
    } else {
      this.prediction = null;
      // const satForViz: SatelliteOrbit = {
      //   id: 'prediction-orbit',
      //   apogee_km: 0,
      //   perigee_km: 0,
      //   inclination_deg: 0,
      //   eccentricity: 0,
      //   longitude_geo_deg: 0,
      //   period_min: 0,
      //   class_of_orbit: "0",
      // };
      //
      // this.addOrbitForSatellite(satForViz);
    }
  }

  /**
   * Adds a full orbit ring + a geometric satellite with animated motion.
   */
  private addOrbitForSatellite(sat: SatelliteOrbit): void {
    console.log('Adding orbit for satellite:', sat);
    this.clearOrbits();
    // 1. Compute orbit radius
    const avgAltitudeKm = (sat.perigee_km + sat.apogee_km) / 2;
    const visualAltitudeKm = avgAltitudeKm * 3; // exaggerate for visibility

    const orbitRadiusKm = this.EARTH_RADIUS_KM + visualAltitudeKm;
    const orbitRadius = orbitRadiusKm * this.SCALE;

    // 2. Build orbit ring in XZ plane
    const segments = 128;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = orbitRadius * Math.cos(theta);
      const z = orbitRadius * Math.sin(theta);
      points.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: this.getOrbitColor(sat.class_of_orbit),
      linewidth: 1
    });

    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);

    // Group so orbit & satellite share same tilted plane
    const orbitGroup = new THREE.Group();
    orbitGroup.add(orbitLine);

    // 3. Build geometric satellite

    // Body
    const bodyGeometry = new THREE.BoxGeometry(
      orbitRadius * 0.08,
      orbitRadius * 0.05,
      orbitRadius * 0.05
    );
    const bodyMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Solar panels
    const panelGeometry = new THREE.BoxGeometry(
      orbitRadius * 0.2,
      orbitRadius * 0.03,
      orbitRadius * 0.005
    );
    const panelMaterial = new THREE.MeshPhongMaterial({color: 0x00aaff});

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-orbitRadius * 0.15, 0, 0);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(orbitRadius * 0.15, 0, 0);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(
      0, orbitRadius * 0.02, orbitRadius * 0.1, 6
    );
    const antennaMaterial = new THREE.MeshPhongMaterial({color: 0xffcc00});
    const antennaMesh = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antennaMesh.position.set(0, orbitRadius * 0.05, 0);
    antennaMesh.rotation.x = Math.PI / 2;

    // Satellite group
    const satellite = new THREE.Group();
    satellite.add(bodyMesh);
    satellite.add(leftPanel);
    satellite.add(rightPanel);
    satellite.add(antennaMesh);

    // Initial position
    satellite.position.set(orbitRadius, 0, 0);
    orbitGroup.add(satellite);

    // 4. Apply inclination & longitude
    orbitGroup.rotation.x = THREE.MathUtils.degToRad(sat.inclination_deg || 0);
    orbitGroup.rotation.y = THREE.MathUtils.degToRad(sat.longitude_geo_deg || 0);

    this.scene.add(orbitGroup);

    // 5. Animation parameters
    const orbitalPeriodSec = sat.period_min * 60;
    const TIME_SCALE = 200; // speed up
    const orbitDurationSec = orbitalPeriodSec / TIME_SCALE || 1;

    this.orbitObjects.push(orbitGroup);

    this.satelliteVisuals.push({
      mesh: satellite,
      orbitRadius,
      currentAngle: 0,
      angularSpeed: (2 * Math.PI) / orbitDurationSec
    });
  }

  private getOrbitColor(classOfOrbit: string): number {
    const c = (classOfOrbit || '').toUpperCase();
    if (c.includes('LEO')) return 0x00ffcc;
    if (c.includes('MEO')) return 0xffcc00;
    if (c.includes('GEO')) return 0xff6600;
    if (c.includes('HEO')) return 0xcc66ff;
    return 0x999999;
  }

  private animate = (): void => {
    const delta = this.clock.getDelta();  // seconds since last frame

    this.animationId = requestAnimationFrame(this.animate);

    // Rotate Earth
    if (this.earthMesh) {
      this.earthMesh.rotation.y += 0.0008;
    }

    // Rotate clouds slightly faster
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += 0.0010;
    }

    // Subtle atmosphere rotation
    if (this.atmosphereMesh) {
      this.atmosphereMesh.rotation.y += 0.0005;
    }

    // Very subtle starfield drift
    if (this.starfieldMesh) {
      this.starfieldMesh.rotation.y += 0.0001;
    }

    // Update all satellites along their orbits
    for (const sat of this.satelliteVisuals) {
      sat.currentAngle += sat.angularSpeed * delta;

      const x = sat.orbitRadius * Math.cos(sat.currentAngle);
      const z = sat.orbitRadius * Math.sin(sat.currentAngle);
      const y = 0;

      sat.mesh.position.set(x, y, z);
      // Optional: keep satellite facing Earth
      // sat.mesh.lookAt(this.earthMesh.position);
    }

    this.renderer.render(this.scene, this.camera);
  };

  // ===================== GEMINI / LLM STUFF (unchanged) =====================

  getCurrentDateTime(): string {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long', day: 'numeric'};
    const timeOptions: Intl.DateTimeFormatOptions = {hour: '2-digit', minute: '2-digit', second: '2-digit'};
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


  private parseFencedJson(raw: any): any {
    if (typeof raw !== 'string') {
      return raw;
    }

    // 1) Trim whitespace
    let text = raw.trim();

    // 2) Strip leading ```json or ``` (case-insensitive)
    text = text.replace(/^```(?:json)?\s*/i, '');

    // 3) Strip trailing ```
    text = text.replace(/```$/, '').trim();

    // 4) Now try to parse
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse fenced JSON:', e, text);
      return null;
    }
  }

  geminiGenerate() {
    this.aIGenerationInProcess = true;
    this.allowAIGeneration = false;

    if (!this.usernameEntered) {
      this.usernameEntered = true;
      this.userName = this.aiGenerationForm.controls['username'].value;
      localStorage.setItem('yorha-username', this.aiGenerationForm.controls['username'].value);
    }


    let promptInstructions = {
      user_prompt_satellite_to_look_for: this.aiGenerationForm.controls['prompt'].value,
      instructions: 'This is a predicting satellite mission type from orbital characteristics interface,' +
        ' I need you to always return the code in the same body structure as in the example provided in the "structure_of_return" ' +
        'node in this request, only when they successfully enter a satellite name that exists,' +
        ' you will do the look up and populate the "generated by you" for each node, and always return everything ' +
        'as it is in the "structure_of_return" and if no satellite is found, simply return "No satellite found, please search for another satellite ",' +
        ' and always only return one result for one character, even if the user requests two, if the user requests more than one then return this message ' +
        '"Only one satellite can be searched at a time"',
      structure_of_return: {
        name_of_satellite: 'generated by you',
        perigee_km: 'generated by you',
        apogee_km: 'generated by you',
        inclination_deg: 'generated by you',
        eccentricity: 'generated by you',
        longitude_geo_deg: 'generated by you',
        period_min: 'generated by you',
        class_of_orbit: 'generated by you, for this only return "LEO, GEO, MEO, Elliptical" etc...'
      }
    }

    const requestResponseBody: object = {
      prompt: JSON.stringify(promptInstructions),

    }

    console.log(' prompt ', requestResponseBody);
    this._dataRequestService.geminiGenerate(requestResponseBody).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      response => {

        console.log('Response from Backend: ', response.content);

        if (!response.content.includes("No satellite found, please search for another satellite") && response.content) {
          if (!response.content.includes("Only one satellite can be searched at a time")) {
            this._tableDataRefreshObservable.refreshTableData(null);
            const parsed = this.parseFencedJson(response.content);
            console.log('Parsed satellite object:', parsed);

            const satForViz: SatelliteOrbit = {
              id: parsed.name_of_satellite ?? 'unknown',
              apogee_km: parsed.apogee_km,
              perigee_km: parsed.perigee_km,
              inclination_deg: parsed.inclination_deg,
              eccentricity: parsed.eccentricity,
              longitude_geo_deg:
                parsed.longitude_geo_deg === 'N/A'
                  ? 0
                  : Number(parsed.longitude_geo_deg) || 0,
              period_min: parsed.period_min,
              class_of_orbit: parsed.class_of_orbit,
            };

            setTimeout(() => {
              this.loadSatellites(satForViz);
            }, 500);


          }
        }


        this.aIGenerationInProcess = false;
        this.responsesFound = true;
        const currentTime = this.getCurrentDateTime();

        this.responses.push({
          username: this.aiGenerationForm.controls['username'].value,
          prompt: this.aiGenerationForm.controls['prompt'].value,
          response: response.content
        });
        this.lastResponse.push({
          username: this.aiGenerationForm.controls['username'].value,
          prompt: this.aiGenerationForm.controls['prompt'].value,
          response: response.content,
          time: currentTime
        });
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

  // add this field
  private orbitObjects: THREE.Object3D[] = [];

// call this before drawing a new orbit
  private clearOrbits(): void {
    for (const obj of this.orbitObjects) {
      this.scene.remove(obj);
    }
    this.orbitObjects = [];
    this.satelliteVisuals = [];
  }


  ngOnDestroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

export interface MissionPrediction {
  input: {
    perigee_km: number;
    apogee_km: number;
    inclination_deg: number;
    eccentricity: number;
    longitude_geo_deg: number;
    period_min: number;
    class_of_orbit: string;
  };
  predicted_mission_type: string;
  probabilities: { [label: string]: number };
  target_classes: string[];
  trained_feature_count: number;
}
