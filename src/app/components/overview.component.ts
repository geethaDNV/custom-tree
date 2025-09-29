import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalSiteMasterStoreService } from '../state/store-services/global-site-master-store.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TreeDropdownComponent } from '../custom-tree';
import { CustomTreeNode } from '../models/custom-tree';
import { combineLatest } from 'rxjs';
import { OverviewFilterTypes } from '../state/constants/overview-filter.constants';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TreeDropdownComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  private globalSiteMasterStoreService = inject(GlobalSiteMasterStoreService);
  overviewFilterType = OverviewFilterTypes;

  siteData: CustomTreeNode[] = [];
  latestExpandedState = new Map<string, boolean>();
  filterSites = this.globalSiteMasterStoreService.filterSites;
  globalSelectedIds = new Set<number>();

  protected destroyRef = inject(DestroyRef);
  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  siteMasterList = this.globalSiteMasterStoreService.siteMasterList;
  siteMasterLoaded = toSignal(
    this.globalSiteMasterStoreService.siteMasterLoaded$,
    { initialValue: false }
  );

  ngOnInit(): void {
    this.globalSiteMasterStoreService.loadGlobalSiteMasterList();

    
    this.globalSiteMasterStoreService.dataSites$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dataSites) => {
        this.siteData = dataSites;
        this.cdr.markForCheck();
      });
  }

  onExpandedStateChange(map: Map<string, boolean>) {
    this.latestExpandedState = map;
  }

  onFilterChange(data: unknown, key: OverviewFilterTypes): void {
    this.globalSiteMasterStoreService.updateOverviewListFilterByKey(data, key);
  }

  onSelectionChange(event: {
    changedNode?: CustomTreeNode;
    checked?: boolean;
    selectAll?: boolean;
  }) {
    if (event.selectAll !== undefined) {
      this.handleSelectAll(event.selectAll);
    } else if (event.changedNode) {
      this.handleNodeSelection(event.changedNode, event.checked ?? false);
    }

    const selectedSiteIds = Array.from(this.globalSelectedIds);
    this.onFilterChange(
      { filter: selectedSiteIds },
      this.overviewFilterType.Sites,
    );
  }

  private handleSelectAll(selectAll: boolean) {
    if (selectAll) {
      this.globalSelectedIds = new Set(this.getAllSiteIds(this.siteData));
    } else {
      this.globalSelectedIds.clear();
    }
  }

  private handleNodeSelection(node: CustomTreeNode, checked: boolean) {
    if (node.children && node.children.length > 0) {
      const descendantIds = this.getAllDescendantLeafIds(node);
      descendantIds.forEach((id) =>
        checked
          ? this.globalSelectedIds.add(id)
          : this.globalSelectedIds.delete(id),
      );
    } else {
      if (checked) {
        this.globalSelectedIds.add(node.data);
      }

      if (!checked) {
        this.globalSelectedIds.delete(node.data);
      }
    }
  }

  private getAllDescendantLeafIds(node: CustomTreeNode): number[] {
    if (!node.children || node.children.length === 0) {
      return [node.data];
    }

    return node.children.flatMap((child) =>
      this.getAllDescendantLeafIds(child),
    );
  }

  private getAllSiteIds(nodes: CustomTreeNode[]): number[] {
    return nodes.flatMap((node) => this.getAllDescendantLeafIds(node));
  }
}
