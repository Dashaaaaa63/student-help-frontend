import {Component} from '@angular/core';
import {ICreateQuestionRequest} from "../../../models/question/ICreateQuestionRequest";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EQuestionCategory} from "../../../models/question/EQuestionCategory";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {InputTextModule} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {DropdownModule} from "primeng/dropdown";
import {InputTextareaModule} from "primeng/inputtextarea";
import {Button, ButtonDirective} from "primeng/button";
import {EditorModule} from "primeng/editor";
import {HeaderTemplateForEditorComponent} from "../header-template-for-editor/header-template-for-editor.component";

@Component({
  selector: 'app-create-question-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    NgIf,
    DropdownModule,
    InputTextareaModule,
    EditorModule,
    HeaderTemplateForEditorComponent,
    FormsModule,
    Button
  ],
  templateUrl: './create-question-dialog.component.html',
  styleUrl: './create-question-dialog.component.scss'
})
export class CreateQuestionDialogComponent {
  form: FormGroup;
  categories= Object.values(EQuestionCategory);
  questionText: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      category: [null, Validators.required],
    });
  }

  get title() {
    return this.form.get('title');
  }

  get category() {
    return this.form.get('category');
  }

  get content() {
    return this.form.get('content');
  }

  get clearQuestionText() {
    return this.questionText?.replace(/<[^>]*>/g, '');
  }

  onSubmit() {
    if(!this.questionText || this.questionText.length < 1) {
      return;
    }

    if (this.form.valid) {
      const request: ICreateQuestionRequest = {
        title: this.title?.value,
        category: this.category?.value,
        content: this.questionText,
      };
     this.ref.close(request)
    }
  }

  onCancel() {
    this.ref.close()
  }

  protected readonly length = length;
}

