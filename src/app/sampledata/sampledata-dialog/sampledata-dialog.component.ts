import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Sampledata } from '../models/sampledata.model';

@Component({
  selector: 'public-sampledata-dialog',
  templateUrl: './sampledata-dialog.component.html',
})
export class SampleDataDialogComponent {
  titleTranslationKey: string;
  items: any = {
    name: '',
    surname: '',
    age: '',
    mail: '',
  };
  userDetails: Sampledata = new Sampledata();
  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<SampleDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: any,
  ) {
    if (!dialogData) {
      this.titleTranslationKey = 'sampledatamanagement.addTitle';
    } else {
      this.titleTranslationKey = 'sampledatamanagement.editTitle';
      this.items = dialogData;
    }
  }
}
