import { Injectable, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { Observable } from 'rxjs';

import {
  LoadGlobalSiteMasterList,
  ResetGlobalSiteMasterState,
} from '../actions';
import { GlobalSiteMasterSelectors } from '../selectors';
import { SiteMasterListItemModel } from '../../models/site-master';

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

  @Dispatch()
  loadGlobalSiteMasterList(): any {
    return new LoadGlobalSiteMasterList();
  }

  @Dispatch()
  resetSiteMasterState = () => new ResetGlobalSiteMasterState();
}
