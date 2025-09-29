import { CustomTreeNode } from "../models/custom-tree";
import { SiteMasterListItemModel } from "../models/site-master";

export class OverviewListMapperService {
    static buildOverviewFiltersSitesData(
    siteMasterList: SiteMasterListItemModel[],
  ) {
    const siteMap = new Map(siteMasterList.map((s) => [s.id, s]));
    const countryMap = new Map<
      string,
      Map<string, SiteMasterListItemModel[]>
    >();

    siteMasterList.forEach((item) => {
      const site = siteMap.get(item.id);
      if (!site) return;

      if (!countryMap.has(site.countryName)) {
        countryMap.set(site.countryName, new Map());
      }
      const cityMap = countryMap.get(site.countryName)!;

      if (!cityMap.has(site.city)) {
        cityMap.set(site.city, []);
      }

      if (!(cityMap.get(site.city) ?? []).some((s) => s.id === site.id)) {
        cityMap.get(site.city)?.push(site);
      }
    });

    let cityIdCounter = 1;
    const countryNodes: { id: number; label: string; children: any[] }[] = [];

    const sortedCountryEntries = Array.from(countryMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    sortedCountryEntries.forEach(([countryName, cityMapEntry]) => {
      const firstCitySites = Array.from(cityMapEntry.values())[0];
      const countryId =
        firstCitySites?.[0]?.countryId || Math.floor(Math.random() * 100000);

      const sortedCityEntries = Array.from(cityMapEntry.entries()).sort(
        (a, b) => a[0].localeCompare(b[0]),
      );
      const cityNodes: { id: number; label: string; children: any[] }[] = [];
      sortedCityEntries.forEach(([cityName, sites]) => {
        const cityId = cityIdCounter;
        cityIdCounter += 1;
        const sortedSites = [...sites].sort((a, b) =>
          a.siteName.localeCompare(b.siteName),
        );
        const siteNodes = sortedSites
          .map((site) => ({
            id: site.id,
            label: site.siteName,
          }))
          .filter(Boolean);

        cityNodes.push({
          id: cityId,
          label: cityName,
          children: siteNodes,
        });
      });

      countryNodes.push({
        id: countryId,
        label: countryName,
        children: cityNodes,
      });
    });

    return countryNodes.filter(Boolean);
  }

  static mapToOverviewFilterSites(
    data: any[] | undefined,
    depth = 0,
    parentIds: Set<number> = new Set(),
  ): CustomTreeNode[] {
    return (data || []).map((datum) => {
      if (parentIds.has(datum.id)) {
        return {
          data: datum.id,
          depth,
          key: `${datum.id}-${datum.label}`,
          label: datum.label,
          children: [],
        };
      }
      const nextParentIds = new Set(parentIds);
      nextParentIds.add(datum.id);

      return {
        data: datum.id,
        depth,
        key: `${datum.id}-${datum.label}`,
        label: datum.label,
        children: Array.isArray(datum.children)
          ? this.mapToOverviewFilterSites(
              datum.children,
              depth + 1,
              nextParentIds,
            )
          : [],
      };
    });
  }

  static buildDataSites(
    siteMasterList: SiteMasterListItemModel[],
  ): CustomTreeNode[] {
    const sitesDto = this.buildOverviewFiltersSitesData(siteMasterList);
    const sortedSitesDto = [...sitesDto].sort((a, b) =>
      a.label.localeCompare(b.label),
    );

    return this.mapToOverviewFilterSites(sortedSitesDto);
  }

   static calculateOverviewFilters(
    siteMasterList: SiteMasterListItemModel[],
  ) {
   
    const dataSites = this.buildDataSites(siteMasterList);

    return {
      dataSites,
    };
  }
}