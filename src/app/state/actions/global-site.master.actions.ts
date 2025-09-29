import { SharedSelectTreeChangeEventOutput } from "../../models/custom-tree";
import { OverviewFilterTypes } from "../constants/overview-filter.constants";

export class LoadGlobalSiteMasterList {
  static readonly type = '[Overview List] Load Site Master List';
}
export class UpdateOverviewListFilterByKey {
  static readonly type = '[Overview List] Overview List Update Filter By Key';

  constructor(
    public data: any,
    public key: OverviewFilterTypes,
  ) {}
}

export class UpdateOverviewListFilterSites {
  static readonly type = '[Overview List] Update Filter Sites';

  constructor(public data: SharedSelectTreeChangeEventOutput) {}
}

