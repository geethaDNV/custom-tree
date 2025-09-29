
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SiteMasterListItemModel } from '../models/site-master';

@Injectable({
	providedIn: 'root',
})
export class OverviewService {
	private readonly mockDataUrl = 'assets/site-mock-data.json';

	constructor(private http: HttpClient) {}

	/**
	 * Returns mock site data as an array of SiteMasterListItemModel
	 */
	getSiteMasterList(): Observable<SiteMasterListItemModel[]> {
		return this.http.get<{ data: any[] }>(this.mockDataUrl).pipe(
			map(response =>
				response.data.map(item => {
					// Remove __typename and cast to SiteMasterListItemModel
					const { __typename, ...site } = item;
					return site as SiteMasterListItemModel;
				})
			)
		);
	}
}
