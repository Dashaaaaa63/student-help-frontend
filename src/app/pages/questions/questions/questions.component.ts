import {Component} from '@angular/core';

import {DialogService} from "primeng/dynamicdialog";
import {QuestionsListComponent} from "../../../shared/components/questions-list/questions-list.component";


@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [QuestionsListComponent],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
  providers: [DialogService]
})
export class QuestionsComponent {

}
