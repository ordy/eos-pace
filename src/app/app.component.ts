import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { NgIf } from "@angular/common";
import { Time } from "./model/time";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
	standalone: true,
	imports: [
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		HttpClientModule,
		MatCardModule,
		MatButtonModule,
		NgIf,
		MatListModule,
		ReactiveFormsModule
	],
})
export class AppComponent implements OnInit {
	public title: string = "EoS Calculator";
	public showResults: boolean = false;
	public pst_time: string;
	public resets_left: number = 0;
	public days_left: number;
	public current_ex: number;
	public current_score: number;
	public exercises_left: number;
	public pace: number[] = [];
	public paceForm: FormGroup;
	private readonly basePoints: number[] = [25, 22, 20, 17, 15, 12, 10];
	private readonly rankThreshold: number[] = [0, 100, 200, 300, 400, 850, 1050];
	private eos_score: number;
	private current_hour: number;
	private res: Time;
	private readonly timeUrl: string = "https://worldtimeapi.org/api/timezone/America/Los_Angeles";

	constructor(private http: HttpClient, private fb: FormBuilder) {
		this.createForm();
	}

	ngOnInit(): void {
		this.http.get<Time>(this.timeUrl, { observe: "body", responseType: "json" }).subscribe((data) => {
			this.res = data;
			this.pst_time = new Date(this.res.datetime).toLocaleTimeString("en", { hour12: false, timeZone: "US/Pacific" });
		});
	}

	public createForm(): void {
		this.paceForm = this.fb.group({
			exercises: ['',Validators.required],
			score: ['',Validators.required]
		})
	}

	private calculateDaysLeft(): void {
		this.days_left =
			this.res.week_number % 2 ? 14 - parseInt(this.res.day_of_week, 10) : 7 - parseInt(this.res.day_of_week, 10);
	}

	private calculateResetsLeft(): void {
		this.current_hour = parseInt(
			new Date(this.res.datetime).toLocaleTimeString("en", { hour: "2-digit", hour12: false, timeZone: "US/Pacific" }),
			10
		);
		if (this.current_hour >= 18) this.resets_left = 0;
		else if (this.current_hour >= 12) this.resets_left = 1;
		else this.resets_left = 2;
		this.resets_left += this.days_left * 3;
	}

	private calculateExercisesLeft(): void {
		this.exercises_left = this.resets_left * 5 + +this.current_ex;
	}

	private calculateScore(current_score: number, exercises: number): void {
		this.eos_score = current_score;
		let rank = this.rankThreshold.findIndex((score) => score > current_score) - 1;
		while (rank >= 0 && rank < 6 && exercises) {
			while (this.eos_score < this.rankThreshold[rank + 1] && exercises) {
				this.eos_score += this.basePoints[rank];
				--exercises;
			}
			++rank;
		}
		this.eos_score += +(10 * exercises);
	}

	public calculatePace(): void {
		if(!this.isValid()) {
			this.calculateDaysLeft();
			this.calculateResetsLeft();
			this.calculateExercisesLeft();
			this.calculateScore(this.current_score, this.exercises_left);
			this.pace[0] = this.eos_score - this.resets_left * 1 - Math.floor(this.current_ex/5);
			this.pace[1] = this.eos_score;
			this.pace[2] = this.eos_score + this.resets_left * 1 + Math.floor(this.current_ex/5);
			this.pace[3] = this.eos_score + this.resets_left * 2 + Math.floor(this.current_ex/5)* 2;
			this.showResults = true;
		}
	}

	public isValid(): boolean {
		return !(this.paceForm.controls['score'].valid && this.paceForm.controls['exercises'].valid);
	}
}
