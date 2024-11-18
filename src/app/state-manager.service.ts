import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {

  moonUnblured: boolean = false;
  isMediumScreen = false;
  moonChanged = new EventEmitter<boolean>();

  constructor() { }

  setMoon(newMoon: boolean){
    this.moonUnblured = newMoon;
    this.moonChanged.emit();
  }

  setScreen(newScreen: boolean){
    this.isMediumScreen = newScreen;
  }

  getMediumScreen(){
    return this.isMediumScreen;
  }

  getMoon(){
    return this.moonUnblured;
  }
}
