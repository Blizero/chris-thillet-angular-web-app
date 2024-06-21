import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeminiAiActivityComponent } from './gemini-ai-activity.component';

describe('GeminiAiActivityComponent', () => {
  let component: GeminiAiActivityComponent;
  let fixture: ComponentFixture<GeminiAiActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeminiAiActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeminiAiActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
