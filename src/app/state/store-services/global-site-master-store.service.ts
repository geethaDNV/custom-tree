import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { Observable } from 'rxjs';

import {
  LoadGlobalSiteMasterList,
  UpdateOverviewListFilterByKey,
} from '../actions';
import { GlobalSiteMasterSelectors } from '../selectors';
import { SiteMasterListItemModel } from '../../models/site-master';
import { OverviewFilterTypes } from '../constants/overview-filter.constants';
import { CustomTreeNode } from '../../models/custom-tree';

@Injectable({ providedIn: 'root' })
export class GlobalSiteMasterStoreService {
  constructor(private store: Store) {}

  get siteMasterList(): Signal<SiteMasterListItemModel[]> {
    return this.store.selectSignal(GlobalSiteMasterSelectors.siteMasterList);
  }

  get siteMasterLoadingError$(): Observable<string | null> {
    return this.store.select(GlobalSiteMasterSelectors.siteMasterLoadedError);
  }

  get siteMasterLoaded$(): Observable<boolean> {
    return this.store.select(GlobalSiteMasterSelectors.siteMasterLoaded);
  }

  get dataSites(): Signal<CustomTreeNode[]> {
    return this.store.selectSignal(GlobalSiteMasterSelectors.dataSites);
  }

  get dataSites$(): Observable<CustomTreeNode[]> {
    return this.store.select(GlobalSiteMasterSelectors.dataSites);
  }

  get filterSites(): Signal<number[]> {
    return this.store.selectSignal(GlobalSiteMasterSelectors.filterSites);
  }

  get filterSites$(): Observable<number[]> {
    return this.store.select(GlobalSiteMasterSelectors.filterSites);
  }

  @Dispatch()
  loadGlobalSiteMasterList(): any {
    return new LoadGlobalSiteMasterList();
  }

  @Dispatch()
  updateOverviewListFilterByKey(data: unknown, key: OverviewFilterTypes) {
    return new UpdateOverviewListFilterByKey(data, key);
  }
}
