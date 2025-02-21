import { Injectable } from '@angular/core';
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationDialogComponent} from "./confirmation-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(private dialogService: DialogService) { }

  confirm(title: string, message: string) {
    return this.dialogService.open(ConfirmationDialogComponent, {
      header: title,
      data: {
        message
      },
      contentStyle: { 'max-height': '500px', 'max-width': '450px', overflow: 'auto' },
      baseZIndex: 10000
    }).onClose;
  }
}
