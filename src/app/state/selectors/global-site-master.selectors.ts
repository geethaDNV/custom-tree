import { CustomTreeNode } from '../../models/custom-tree';
import { Selector } from '@ngxs/store';


import { SiteMasterListItemModel } from '../../models/site-master';
import { GlobalState, GlobalStateModel } from '../global.state';

export class GlobalSiteMasterSelectors {
  @Selector([GlobalSiteMasterSelectors._filterSites])
  static filterSites(filterSites: number[]): number[] {
    return filterSites;
  }

  @Selector([GlobalSiteMasterSelectors._dataSites])
  static dataSites(dataSites: CustomTreeNode[]): CustomTreeNode[] {
    return dataSites;
  }
  @Selector([GlobalState])
  private static _filterSites(state: GlobalStateModel): number[] {
    return state.filterSites;
  }

  @Selector([GlobalState])
  private static _dataSites(state: GlobalStateModel): CustomTreeNode[] {
    return state.dataSites;
  }
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
