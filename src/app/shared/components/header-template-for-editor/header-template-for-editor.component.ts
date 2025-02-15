import { Component } from '@angular/core';
import {PrimeTemplate} from "primeng/api";
import {Button} from "primeng/button";

@Component({
  selector: 'app-header-template-for-editor',
  standalone: true,
  imports: [
    PrimeTemplate,
    Button
  ],
  templateUrl: './header-template-for-editor.component.html',
  styleUrl: './header-template-for-editor.component.scss'
})
export class HeaderTemplateForEditorComponent {

}
