import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

import { CustomTreeComponent } from '../custom-tree.component';
import { VirtualTreeComponent } from '../virtual-tree.component';
import { CustomTreeNode } from '../../models/custom-tree';
import { truncateTooltipText } from '../../helpers/string-helpers';

@Component({
  selector: 'shared-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
  imports: [
    CustomTreeComponent,
    VirtualTreeComponent,
    CommonModule,
    TooltipModule,
    FormsModule,
  ],
})
export class TreeDropdownComponent implements OnChanges, OnInit {
  nodes = input<CustomTreeNode[]>([]);
  selectedIds = input<number[]>([]);
  expandedState = input<Map<string, boolean>>(new Map());
  placeholder = input<string>('All sites');
  ariaLabel = input<string>('All sites');
  enableVirtualScroll = input<boolean>(true);
  virtualScrollThreshold = input<number>(500);
  virtualScrollItemHeight = input<number>(40);
  virtualScrollHeight = input<string>('280px');

  selectionChange = output<{
    changedNode?: CustomTreeNode;
    checked?: boolean;
    selectAll?: boolean;
  }>();
  expandedStateChange = output<Map<string, boolean>>();

  dropdownOpen = false;

  searchTerm = '';
  filteredNodes: CustomTreeNode[] = [];
  selectOverflowLimit = 5;

  get allSelected(): boolean {
    const leaves = this.getAllNodes(this.filteredNodes).filter(
      (n) => n.depth === 2,
    );

    return leaves.length > 0 && leaves.every((n) => n.selected);
  }

  get someSelected(): boolean {
    const leaves = this.getAllNodes(this.filteredNodes).filter(
      (n) => n.depth === 2 && n.selected,
    );

    return leaves.some((n) => n.selected) && !this.allSelected;
  }

  get selectedTooltip(): string {
    const tooltip = this.getSelectedLeafNodes()
      .map((n) => n.label)
      .join(', ');

    return truncateTooltipText(tooltip, 150);
  }

  get selectedLabel(): string {
    const selectedNodes = this.getSelectedLeafNodes();

    if (selectedNodes.length > 0) {
      if (selectedNodes.length < this.selectOverflowLimit) {
        return this.selectedTooltip;
      }

      return `${selectedNodes.length} selected`;
    }

    return this.placeholder();
  }

  get shouldUseVirtualScroll(): boolean {
    if (!this.enableVirtualScroll()) return false;
    const totalNodes = this.getAllNodes(this.nodes()).length;

    return totalNodes > this.virtualScrollThreshold();
  }

  ngOnInit() {
    this.filteredNodes = this.deepCloneNodes(this.nodes());
    this.expandedStateChange.emit(this.getExpandedStateMap(this.filteredNodes));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      if (this.searchTerm) {
        this.filteredNodes = this.filterTree(
          this.nodes(),
          this.searchTerm.toLowerCase(),
        );
        this.copyExpandedState(this.nodes(), this.filteredNodes);
      } else {
        this.filteredNodes = this.deepCloneNodes(this.nodes());
      }

      this.filteredNodes = this.markSelectedNodes(
        this.filteredNodes,
        this.selectedIds(),
      );
      this.filteredNodes = this.updateIndeterminateStates(this.filteredNodes);
      this.filteredNodes = this.applyExpandedState(
        this.filteredNodes,
        this.expandedState(),
      );
      this.expandedStateChange.emit(
        this.getExpandedStateMap(this.filteredNodes),
      );
    }
  }

  onSelectAll(event: Event) {
    const { checked } = event.target as HTMLInputElement;
    this.selectionChange.emit({ selectAll: checked });
  }

  markSelectedNodes(
    tree: CustomTreeNode[],
    selectedIds: number[],
  ): CustomTreeNode[] {
    return tree.map((node) => ({
      ...node,
      selected: selectedIds.includes(node.data),
      children: node.children
        ? this.markSelectedNodes(node.children, selectedIds)
        : undefined,
    }));
  }

  updateIndeterminateStates(nodes: CustomTreeNode[]): CustomTreeNode[] {
    return nodes.map((node) => {
      if (node.children && node.children.length > 0) {
        const updatedChildren = this.updateIndeterminateStates(node.children);
        const selectedChildren = updatedChildren.filter(
          (child) => child.selected,
        );
        const indeterminateChildren = updatedChildren.filter(
          (child) => child.indeterminate,
        );
        let selected = false;
        let indeterminate = false;

        if (selectedChildren.length === updatedChildren.length) {
          selected = true;
          indeterminate = false;
        } else if (
          selectedChildren.length === 0 &&
          indeterminateChildren.length === 0
        ) {
          selected = false;
          indeterminate = false;
        } else {
          selected = false;
          indeterminate = true;
        }

        return {
          ...node,
          selected,
          indeterminate,
          children: updatedChildren,
        };
      }

      return { ...node };
    });
  }

  applyExpandedState(
    nodes: CustomTreeNode[],
    expandedMap: Map<string, boolean>,
  ): CustomTreeNode[] {
    return nodes.map((node) => ({
      ...node,
      expanded: expandedMap.get(node.key) || false,
      children: node.children
        ? this.applyExpandedState(node.children, expandedMap)
        : undefined,
    }));
  }

  onExpandedStateChange(map: Map<string, boolean>) {
    this.expandedStateChange.emit(map);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onSearchChange() {
    if (!this.searchTerm) {
      this.filteredNodes = this.deepCloneNodes(this.nodes());
    } else {
      this.filteredNodes = this.filterTree(
        this.nodes(),
        this.searchTerm.toLowerCase(),
      );
    }
    this.copyExpandedState(this.nodes(), this.filteredNodes);
    this.filteredNodes = this.markSelectedNodes(
      this.filteredNodes,
      this.selectedIds(),
    );
    this.filteredNodes = this.updateIndeterminateStates(this.filteredNodes);
    this.expandedStateChange.emit(this.getExpandedStateMap(this.filteredNodes));
  }

  filterTree(nodes: CustomTreeNode[], search: string): CustomTreeNode[] {
    function filterTreeNodes(
      treeNodes: CustomTreeNode[],
    ): [CustomTreeNode[], boolean] {
      return treeNodes.reduce<[CustomTreeNode[], boolean]>(
        (acc, node) => {
          const selfMatch = node.label.toLowerCase().includes(search);
          let children: CustomTreeNode[] | undefined;
          let childMatched = false;

          if (node.children && node.children.length > 0) {
            const [filteredChildren, childHasMatch] = filterTreeNodes(
              node.children,
            );

            if (filteredChildren.length > 0) {
              children = filteredChildren;
              childMatched = childHasMatch;
            }
          }

          if (selfMatch) {
            acc[0].push({
              ...node,
              expanded: true,
              children: node.children
                ? node.children.map((child) => ({
                    ...child,
                    expanded: true,
                    children: child.children,
                  }))
                : undefined,
            });
            acc[1] = true;
          } else if (childMatched) {
            acc[0].push({
              ...node,
              expanded: true,
              children,
            });
            acc[1] = true;
          }

          return acc;
        },
        [[], false],
      );
    }

    return filterTreeNodes(nodes)[0];
  }

  deepCloneNodes(nodes: CustomTreeNode[]): CustomTreeNode[] {
    return nodes.map((node) => ({
      ...node,
      children: node.children ? this.deepCloneNodes(node.children) : undefined,
    }));
  }

  onNodeSelect({
    changedNode,
    checked,
  }: {
    changedNode: CustomTreeNode;
    checked: boolean;
  }) {
    this.selectionChange.emit({ changedNode, checked });
  }

  getAllNodes(nodes: CustomTreeNode[]): CustomTreeNode[] {
    let all: CustomTreeNode[] = [];
    nodes.forEach((node) => {
      all.push(node);

      if (node.children && node.children.length > 0) {
        all = all.concat(this.getAllNodes(node.children));
      }
    });

    return all;
  }

  getExpandedStateMap(
    nodes: CustomTreeNode[],
    map = new Map<string, boolean>(),
  ) {
    nodes.forEach((node) => {
      if (node.expanded) map.set(node.key, true);
      if (node.children) this.getExpandedStateMap(node.children, map);
    });

    return map;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.tree-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  private copyExpandedState(
    src: CustomTreeNode[],
    tgt: CustomTreeNode[],
  ): CustomTreeNode[] {
    if (!src || !tgt) return tgt;

    return tgt.map((tgtNode, i) => {
      const srcNode = src[i];
      if (!srcNode) return tgtNode;

      return {
        ...tgtNode,
        expanded: srcNode.expanded,
        children:
          tgtNode.children && srcNode.children
            ? this.copyExpandedState(srcNode.children, tgtNode.children)
            : tgtNode.children,
      };
    });
  }

  private getSelectedLeafNodes(): CustomTreeNode[] {
    return this.getAllNodes(this.filteredNodes).filter(
      (n) => n.depth === 2 && n.selected,
    );
  }
}
