import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerSerrorComponent } from './server-serror.component';

describe('ServerSerrorComponent', () => {
  let component: ServerSerrorComponent;
  let fixture: ComponentFixture<ServerSerrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerSerrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerSerrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
