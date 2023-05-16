import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalService } from 'src/app/services/modal.service';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  inSubmission = false
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Updating clip infomation...'
  constructor(private modal: ModalService, private clipService: ClipService) { }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = false
    this.showAlert = false

    this.editForm.patchValue({
      id: this.activeClip.docID,
      title: this.activeClip.title
    })
  }

  editForm = new FormGroup({
    id: new FormControl('', {
      nonNullable: true
    }),
    title: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3)
      ],
      nonNullable: true
    })
  })

  async submit() {
    if (!this.activeClip) return
    this.inSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Updating clip infomation...'
    try {
      await this.clipService.updateClip(
        this.editForm.controls.id.value, this.editForm.controls.title.value
      )
    } catch (e) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Error occurred! Please try again.'
      return
    }

    this.activeClip.title = this.editForm.controls.title.value
    this.update.emit(this.activeClip)

    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Update successfully!'
  }
}
