import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MenuBarComponent} from "./shared/components/menu-bar/menu-bar.component";
import {DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuBarComponent, DynamicDialogModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    DynamicDialogRef,
  ]
})
export class AppComponent {
  title = 'student-help-frontend';
}
