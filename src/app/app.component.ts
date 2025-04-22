import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Footer } from "./components/footer/footer";
import { Navbar } from "./components/navbar/navbar";
import { AlertComponent } from "./shared/alert/alert.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Navbar, Footer, AlertComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang("ar");
    translate.use("ar");
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }
}
