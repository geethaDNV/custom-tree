import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import {
  LoadGlobalSiteMasterList,
  UpdateOverviewListFilterByKey,
  UpdateOverviewListFilterSites,
} from './actions';
import { SiteMasterListItemModel } from '../models/site-master';
import { OverviewService } from '../services/overview.service';
import { OverviewListMapperService } from '../services/overview.mapper.service';
import {
  CustomTreeNode,
  SharedSelectTreeChangeEventOutput,
} from '../models/custom-tree';
import { OverviewFilterTypes } from './constants/overview-filter.constants';
export interface GlobalStateModel {
  originalFilterSites: number[];
  filterSites: number[];
  dataSites: CustomTreeNode[];
  siteMaster: {
    siteList: SiteMasterListItemModel[];
    loaded: boolean;
    loadingError: string | null;
  };
}

const defaultState: GlobalStateModel = {
  originalFilterSites: [],
  filterSites: [],
  dataSites: [],
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
  constructor(private readonly overviewService: OverviewService) {}

  @Action(LoadGlobalSiteMasterList)
  loadGlobalSiteMasterList(ctx: StateContext<GlobalStateModel>) {
    return this.overviewService.getSiteMasterList().pipe(
      tap((siteMasterDto) => {
        const { dataSites } =
          OverviewListMapperService.calculateOverviewFilters(siteMasterDto);

        ctx.patchState({
          dataSites: dataSites ?? [],
          siteMaster: {   
            siteList: siteMasterDto ?? [],
            loadingError: null,
            loaded: true,
          },
        });
      })
    );
  }

  @Action(UpdateOverviewListFilterByKey)
  updateOverviewListFilterByKey(
    ctx: StateContext<GlobalStateModel>,
    { data, key }: UpdateOverviewListFilterByKey
  ) {
    const actionsMap = {
      [OverviewFilterTypes.Sites]: [
        new UpdateOverviewListFilterSites(
          data as SharedSelectTreeChangeEventOutput
        ),
      ],
    };

    ctx.dispatch(actionsMap[key]);
  }
  @Action(UpdateOverviewListFilterSites)
  updateOverviewListFilterSites(
    ctx: StateContext<GlobalStateModel>,
    { data }: UpdateOverviewListFilterSites
  ) {
    let state = ctx.getState();

    state = this.patchAndGetState(ctx, {
      filterSites: data.filter as number[],
      originalFilterSites: data.filter as number[],
    });
  }

  private patchAndGetState(
    ctx: StateContext<GlobalStateModel>,
    patch: Partial<GlobalStateModel>
  ): GlobalStateModel {
    ctx.patchState(patch);

    return ctx.getState();
  }
}
