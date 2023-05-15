import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[app-event-blocker]' // This naming convention is standard with most attributes
})
export class EventBlockerDirective {

  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  public handleEvent(e: Event) {
    e.preventDefault()
    // e.stopPropagation()
  }
}
