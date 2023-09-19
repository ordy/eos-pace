import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list'
import { NgIf } from '@angular/common';
import { Time } from './model/time';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, HttpClientModule,MatCardModule, MatButtonModule, NgIf, MatListModule],
})
export class AppComponent implements OnInit {
  public title:string = 'EoS Calculator';
  public showResults:boolean = false;
  public pst_time:string;
  public resets_left:number = 0;
  public days_left:number = 0;
  public current_ex:number;
  public current_score:number;
  public exercises_left:number;
  public pace:number[] = [0,0,0,0];
  private eos_score:number = 0;
  private current_hour:number;
  private bonus:number = 0;
  private res:Time;

  timeUrl:string = 'https://worldtimeapi.org/api/timezone/America/Los_Angeles';

  constructor(private http: HttpClient) {
  }
  ngOnInit(): void {
    this.http.get<Time>(this.timeUrl, {observe: 'body', responseType: 'json'})
      .subscribe((data) => {
        this.res = data;
        this.pst_time = new Date(this.res.datetime).toLocaleTimeString('en', { hour12: false, timeZone: 'US/Pacific' });
      });
  }

  calculateDaysLeft() {
    this.days_left = this.res.week_number%2 ? 14-parseInt(this.res.day_of_week, 10) : 7-parseInt(this.res.day_of_week, 10);
  }

  calculateResetsLeft() {
    this.current_hour = parseInt(new Date(this.res.datetime).toLocaleTimeString('en', { hour: '2-digit', hour12: false, timeZone: 'US/Pacific' }), 10);
    if (this.current_hour >= 18)
      this.resets_left = 0
    else if (this.current_hour >= 12)
      this.resets_left = 1
    else
      this.resets_left = 2
    this.resets_left += this.days_left*3;
  }
  
  calculateExercisesLeft() {
    this.exercises_left = this.resets_left*5 + +this.current_ex;
  }

  calculatePace() {
    this.calculateDaysLeft();
    this.calculateResetsLeft();
    this.calculateExercisesLeft();
    this.eos_score = +this.current_score + +(10*this.exercises_left);
    if (this.current_ex == 0)
      this.bonus = 0;
    else
      this.bonus = this.current_ex > 5 ? 2 : 1;
    this.pace[0] = this.eos_score - this.resets_left*1 - this.bonus;
    this.pace[1] = this.eos_score;
    this.pace[2] = this.eos_score + this.resets_left*1 + this.bonus;
    this.pace[3] = this.eos_score + this.resets_left*2 + this.bonus*2;
    this.showResults = true;
  }

  isValid() {
    if (this.current_ex !== undefined && this.current_score !== undefined){
      return !isNaN(this.current_ex) && !isNaN(this.current_score) ? true : false;
    } else
      return false;
  }
}