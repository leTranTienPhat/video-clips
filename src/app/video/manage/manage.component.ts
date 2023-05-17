import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})

export class ManageComponent implements OnInit {
  videoOrder = '1'
  clips: IClip[] = []
  activeClip: IClip | null = null
  sort$: BehaviorSubject<string>

  constructor(private router: Router, private route: ActivatedRoute, private clipsService: ClipService, private modal: ModalService) {
    this.sort$ = new BehaviorSubject(this.videoOrder)
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1'
      this.sort$.next(this.videoOrder)
    })
    this.clipsService.getUserClips(this.sort$).subscribe(docs => {
      this.clips = []

      docs.forEach(doc => {
        this.clips.push({
          docID: doc.id,
          ...doc.data()
        })
      })
    })

  }

  sort(e: Event) {
    const { value } = e.target as HTMLSelectElement

    // this.router.navigateByUrl(`/manage?sort=${value}`) // Method 1

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    })
  }

  openModal(e: Event, clip: IClip) {
    e.preventDefault()
    this.activeClip = clip
    this.modal.toggleModal('editClip')
  }

  update(e: IClip) {
    this.clips.forEach((clip, index) => {
      if (clip.docID === e.docID) {
        this.clips[index].title = e.title
      }
    })
  }

  delete(e: Event, clip: IClip) {
    e.preventDefault()
    this.clipsService.deleteClip(clip)
    this.clips.forEach((element, index) => {
      if (element.docID === clip.docID) this.clips.splice(index, 1)
    })
  }
}
