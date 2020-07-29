import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFormDataComponent } from './input-form-data.component';

describe('InputFormDataComponent', () => {
  let component: InputFormDataComponent;
  let fixture: ComponentFixture<InputFormDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputFormDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFormDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
