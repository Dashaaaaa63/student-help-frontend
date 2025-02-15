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
        title,
        message
      },
      width: '450px',
      contentStyle: { 'max-height': '500px', overflow: 'auto' },
      baseZIndex: 10000
    }).onClose;
  }
}
