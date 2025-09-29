
import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteMasterListItemModel } from '../models/site-master';
import { GlobalSiteMasterStoreService } from '../state/store-services/global-site-master-store.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-overview',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
	private globalSiteMasterStoreService = inject(GlobalSiteMasterStoreService);
	siteMasterList = this.globalSiteMasterStoreService.siteMasterList;
	siteMasterLoaded = toSignal(this.globalSiteMasterStoreService.siteMasterLoaded$, { initialValue: false });

	ngOnInit(): void {
		this.globalSiteMasterStoreService.loadGlobalSiteMasterList();
	}
}
