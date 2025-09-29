
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SiteMasterListItemModel } from '../models/site-master';
import { OverviewService } from '../services/overview.service';

@Component({
	selector: 'app-overview',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
	siteList$: Observable<SiteMasterListItemModel[]>;
	private overviewService = inject(OverviewService);

	constructor() {
		this.siteList$ = this.overviewService.getSiteMasterList();
	}
}
