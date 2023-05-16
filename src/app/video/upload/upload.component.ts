import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from "uuid"
import { last, switchMap } from 'rxjs'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import firebase from 'firebase/compat/app'
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnDestroy {
  isDragover = false
  file: File | null = null
  nextStep = false
  inSubmission = false
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Your clip is being uploaded...'
  showPercentage = false
  percentage = 0
  user: firebase.User | null = null
  task?: AngularFireUploadTask

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth, private clipsService: ClipService, private router: Router) {
    auth.user.subscribe(user => this.user = user)
  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

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

    this.file = (e as DragEvent).dataTransfer
      ? (e as DragEvent).dataTransfer?.files.item(0) ?? null
      : (e.target as HTMLInputElement).files?.item(0) ?? null

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
    this.uploadForm.disable()
    this.inSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Your clip is being uploaded...'
    this.showPercentage = true

    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`

    this.task = this.storage.upload(clipPath, this.file) // this return a function with Observable
    const clipRef = this.storage.ref(clipPath) // this return a function with Observable

    this.task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })

    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: async (url) => {
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.uploadForm.controls.title.value,
          fileName: `${clipFileName}.mp4`,
          url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipsService.createClip(clip)
        setTimeout(() => {
          this.router.navigate(['clip', clipDocRef.id])
        }, 1000)
        this.alertColor = 'green'
        this.alertMsg = " Success! Your clip is now ready"
        this.showPercentage = false
      },
      error: (error) => {
        this.uploadForm.enable()
        this.alertColor = 'red'
        this.alertMsg = " Upload failed! Please try again."
        this.showPercentage = false
        this.inSubmission = false
        console.log(error);
      }
    })

  }
}
