import { Selector } from '@ngxs/store';


import { SiteMasterListItemModel } from '../../models/site-master';
import { GlobalState, GlobalStateModel } from '../global.state';

export class GlobalSiteMasterSelectors {
  @Selector([GlobalSiteMasterSelectors._siteMasterList])
  static siteMasterList(
    siteMasterList: SiteMasterListItemModel[],
  ): SiteMasterListItemModel[] {
    return siteMasterList;
  }

  @Selector([GlobalSiteMasterSelectors._siteLoaded])
  static siteMasterLoaded(isLoaded: boolean): boolean {
    return isLoaded;
  }

  @Selector([GlobalSiteMasterSelectors._siteLoadedError])
  static siteMasterLoadedError(loadError: string): string {
    return loadError;
  }

  @Selector([GlobalState])
  private static _siteMasterList(
    state: GlobalStateModel,
  ): SiteMasterListItemModel[] {
    return state.siteMaster.siteList;
  }

  @Selector([GlobalState])
  private static _siteLoaded(state: GlobalStateModel): boolean {
    return state.siteMaster.loaded;
  }

  @Selector([GlobalState])
  private static _siteLoadedError(state: GlobalStateModel): string {
    return state.siteMaster.loadingError ?? '';
  }
}
