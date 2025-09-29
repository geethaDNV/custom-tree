import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverviewComponent } from './components/overview.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,OverviewComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'custom-tree-dropdown';
}
