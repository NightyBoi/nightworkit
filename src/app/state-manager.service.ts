import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {

  moonUnblured: boolean = false;
  moonChanged = new EventEmitter<boolean>();

  constructor() { }

  setMoon(newMoon: boolean){
    this.moonUnblured = newMoon;
    this.moonChanged.emit();
  }

  getMoon(){
    return this.moonUnblured;
  }
}
