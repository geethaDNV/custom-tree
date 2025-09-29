import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import {
  LoadGlobalSiteMasterList,
  ResetGlobalSiteMasterState,
} from './actions';
import { SiteMasterListItemModel } from '../models/site-master';
import {OverviewService} from "../services/overview.service";
export interface GlobalStateModel {
  siteMaster: {
    siteList: SiteMasterListItemModel[];
    loaded: boolean;
    loadingError: string | null;
  };
}

const defaultState: GlobalStateModel = {
  siteMaster: {
    siteList: [],
    loaded: false,
    loadingError: null,
  },
};

@State<GlobalStateModel>({
  name: 'global',
  defaults: defaultState,
})
@Injectable()
export class GlobalState {
  constructor(
    private readonly overviewService: OverviewService,
  ) {}

  @Action(LoadGlobalSiteMasterList)
  loadGlobalSiteMasterList(ctx: StateContext<GlobalStateModel>) {
    return this.overviewService.getSiteMasterList().pipe(
      tap((siteMasterDto) => {
        ctx.patchState({
          siteMaster: {
            siteList: siteMasterDto ?? [],
            loadingError: null,
            loaded: true,
          },
        });
      }),
    );
  }

 
  @Action(ResetGlobalSiteMasterState)
  resetGlobalSiteMasterState(ctx: StateContext<GlobalStateModel>): void {
    ctx.patchState({
      siteMaster: {
        siteList: [],
        loadingError: null,
        loaded: false,
      },
    });
  }
}
