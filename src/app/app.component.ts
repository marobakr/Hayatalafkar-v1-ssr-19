import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from "./core/components/navbar/navbar.component";
import { FooterComponent } from "./core/components/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,  FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
