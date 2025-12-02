import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BoardComponent } from './components/board/board.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public readonly title: string = 'game-of-life';
  
  public ratio: number = 35;
  public evolving: boolean = false;
  public hasLiveCells: boolean = false;
  public readonly MIN_RATIO: number = 10;
  public readonly MAX_RATIO: number = 70;

  @ViewChild(BoardComponent) private board!: BoardComponent;

  public readonly form: FormGroup = new FormGroup({
    ratio: new FormControl('', [
      Validators.min(this.MIN_RATIO),
      Validators.max(this.MAX_RATIO),
    ]),
  });

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.form.controls.ratio.setValue(this.ratio);
  }

  public reset(): void {
    this.board.reset();
  }

  public randomize(): void {
    this.board.randomize();
  }

  public next(): void {
    this.board.next();
  }

  public auto(): void {
    this.board.auto();
  }

  public playPause(): void {
    if (this.evolving) {
      this.board.pause();
    } else {
      this.board.auto();
    }
  }

  public onEvolve(evolving: boolean):void {
    this.evolving = evolving
  }

  public onHasLiveCells(hasLiveCells: boolean): void {
    this.hasLiveCells = hasLiveCells;
  }

  public setRatio(): void {
    if(this.form.controls.ratio.value === this.ratio) {
      this.notificationService.info('Ratio already set to current value.')
      return
    }

    if(this.form.controls.ratio.value % 1 !== 0) {
      this.ratio = Math.floor(this.form.controls.ratio.value);
      this.notificationService.warning(`Board ratio can't be a decimal number!`);
      this.form.controls.ratio.setValue(Math.floor(this.form.controls.ratio.value));
      return;
    }

    if (this.form.controls.ratio.value < this.MIN_RATIO) {
      this.ratio = this.MIN_RATIO;
      this.form.controls.ratio.setValue(this.MIN_RATIO);
      this.notificationService.warning(`Minimum ratio must be ${this.MIN_RATIO}!`);
      return
    } else { 
      this.ratio = this.form.controls.ratio.value
    }

    if (this.form.controls.ratio.value > this.MAX_RATIO) {
      this.ratio = this.MAX_RATIO;
      this.form.controls.ratio.setValue(this.MAX_RATIO);
      this.notificationService.warning(`Maximum ratio must be ${this.MAX_RATIO}!`);
      return
    } else { 
      this.ratio = this.form.controls.ratio.value
    }
  }
}
