import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from "uuid"
import { last } from 'rxjs'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent {
  isDragover = false
  file: File | null = null
  nextStep = false
  inSubmission = false
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Your clip is being uploaded...'
  showPercentage = false
  percentage = 0

  constructor(private storage: AngularFireStorage) { }

  uploadForm = new FormGroup({
    title: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3)
      ],
      nonNullable: true
    })
  })

  storeFile(e: Event) {
    this.isDragover = false

    this.file = (e as DragEvent).dataTransfer?.files.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    // this.uploadForm.controls.title.setValue(this.file.name.replace(/\.[^\.]+$/, '')); Method 1

    //Method 2
    this.uploadForm.patchValue({
      title: this.file.name.replace(/\.[^\.]+$/, '') // remove the extension
    })
    this.nextStep = true
  }

  uploadFile() {
    this.inSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Your clip is being uploaded...'
    this.showPercentage = true

    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`

    const task = this.storage.upload(clipPath, this.file) // this return a function with Observable

    task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })

    task.snapshotChanges().pipe(
      last()
    ).subscribe({
      next: (snapshot) => {
        this.alertColor = 'green'
        this.alertMsg = " Success! Your clip is now ready"
        this.showPercentage = false
      },
      error: (error) => {
        this.alertColor = 'red'
        this.alertMsg = " Upload failed! Please try again."
        this.showPercentage = false
        this.inSubmission = false
        console.log(error);
      }
    })

  }
}
