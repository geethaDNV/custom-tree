import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CustomTreeNode } from '../models/custom-tree';



interface FlatTreeNode extends CustomTreeNode {
  level: number;
  visible: boolean;
  parentKey?: string;
}

@Component({
  selector: 'shared-virtual-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule],
  template: `
    <div class="virtual-tree-container">
      @if (visibleNodes().length === 0) {
        <div class="empty-state">No nodes to display</div>
      } @else {
        <cdk-virtual-scroll-viewport
          class="virtual-tree-scroller"
          [itemSize]="itemHeight()"
          [style.height]="scrollHeight()">
          <div *cdkVirtualFor="let item of visibleNodes(); trackBy: trackByKey" class="tree-node">
            <div
              class="node-content"
              [style.padding-left.px]="
                (item?.depth ?? item?.level ?? 0) * 20
              ">
              @if (item.children && item.children.length > 0) {
                <button
                  class="expand-toggle"
                  type="button"
                  [attr.aria-expanded]="item.expanded"
                  (click)="toggleExpansion(item); $event.stopPropagation()">
                  @if (!item.expanded) {
                    <svg
                      fill="none"
                      height="18"
                      viewBox="0 0 18 18"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7 5l4 4-4 4"
                        stroke="#1a1a1a"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2" />
                    </svg>
                  }
                  @if (item.expanded) {
                    <svg
                      fill="none"
                      height="18"
                      viewBox="0 0 18 18"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 7l4 4 4-4"
                        stroke="#1a1a1a"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2" />
                    </svg>
                  }
                </button>
              } @else {
                <span class="expand-spacer"></span>
              }
              <input
                class="node-checkbox"
                type="checkbox"
                [attr.aria-label]="'Select ' + (item?.label || 'item')"
                [checked]="item?.selected || false"
                [id]="'checkbox-' + (item?.key || '')"
                [indeterminate]="item?.indeterminate || false"
                (change)="onCheckboxChange(item, $event)" />
              <label
                class="node-label"
                [for]="'checkbox-' + (item?.key || '')">
                {{ item?.label || 'Unknown' }}
              </label>
            </div>
          </div>
        </cdk-virtual-scroll-viewport>
      }
    </div>
  `,
  styleUrls: ['./custom-tree.component.scss'],
  styles: [
    `
      .virtual-tree-container {
        box-sizing: border-box;
      }
      .virtual-tree-container .virtual-tree-scroller {
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background: white;
        box-sizing: border-box;
      }
      .virtual-tree-container .virtual-tree-scroller .cdk-virtual-scroll-content-wrapper {
        display: block;
      }
      .virtual-tree-container .tree-node {
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.15s ease;
      }
      .virtual-tree-container .tree-node:hover {
        background-color: #f9fafb;
      }
      .virtual-tree-container .node-content {
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
        min-height: 2.5rem;
      }
      .virtual-tree-container .expand-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 0.25rem;
        flex-shrink: 0;
        color: #6b7280;
        transition: all 0.15s ease;
      }
      .virtual-tree-container .expand-toggle:hover {
        background-color: #e5e7eb;
        color: #374151;
      }
      .virtual-tree-container .expand-spacer {
        width: 1.5rem;
        height: 1.5rem;
        flex-shrink: 0;
      }
      .virtual-tree-container .node-checkbox {
        width: 1rem;
        height: 1rem;
        margin: 0;
        cursor: pointer;
        flex-shrink: 0;
        accent-color: #3b82f6;
      }
      .virtual-tree-container .node-label {
        flex: 1;
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: #374151;
        cursor: pointer;
        user-select: none;
        font-weight: 500;
      }
      .virtual-tree-container .node-label:hover {
        color: #1f2937;
      }
      .virtual-tree-container .empty-state {
        padding: 2rem;
        text-align: center;
        color: #6b7280;
        font-style: italic;
      }
    `,
  ],
})
export class VirtualTreeComponent {
  // Internal state
  private flatNodes = signal<FlatTreeNode[]>([]);
  private originalNodes = signal<CustomTreeNode[]>([]);

  nodes = input<CustomTreeNode[]>([]);
  level = input<number>(0);
  itemHeight = input<number>(40);
  scrollHeight = input<string>('280px');

  selectionChange = output<{
    changedNode: CustomTreeNode;
    checked: boolean;
  }>();
  expandedStateChange = output<Map<string, boolean>>();

  // Computed visible nodes for virtual scroller
  visibleNodes = computed(() =>
    this.flatNodes().filter((node) => node.visible),
  );

  // Track by function for virtual scrolling performance
  trackByKey = (index: number, item: FlatTreeNode): string => {
    return item.key;
  };

  // Debug getters
  get debugFlatNodesCount(): number {
    return this.flatNodes().length;
  }

  get debugFlatNodesSample(): string {
    const sample = this.flatNodes().slice(0, 3);

    return JSON.stringify(
      sample.map((n) => ({
        key: n.key,
        level: n.level,
        visible: n.visible,
        label: n.label,
      })),
    );
  }

  get debugVisibleNodesSample(): string {
    const sample = this.visibleNodes().slice(0, 3);

    return JSON.stringify(
      sample.map((n) => ({
        key: n?.key,
        level: n?.level,
        visible: n?.visible,
        label: n?.label,
      })),
    );
  }

  constructor() {
    // Watch for input changes and update the tree
    effect(() => {
      const nodes = this.nodes();

      if (nodes && nodes.length > 0) {
        this.updateTree(nodes);
      }
    });
  }

  updateTree(nodes: CustomTreeNode[]) {
    // Deep clone to avoid mutating input
    const clonedNodes = this.deepCloneNodes(nodes);
    this.originalNodes.set(clonedNodes);
    this.initializeNodes(clonedNodes);
    this.rebuildFlatList();
  }

  initializeNodes(nodes: CustomTreeNode[]) {
    nodes.forEach((nd) => {
      if (nd.expanded === undefined) Object.assign(nd, { expanded: false });
      if (nd.selected === undefined) Object.assign(nd, { selected: false });
      if (nd.indeterminate === undefined)
        Object.assign(nd, { indeterminate: false });

      if (nd.children && nd.children.length > 0) {
        this.initializeNodes(nd.children);
      }
    });
  }

  toggleExpansion(node: FlatTreeNode): void {
    // Find and update the original node
    const originalNode = this.findOriginalNode(node.key, this.originalNodes());

    if (originalNode) {
      const newExpandedState = !originalNode.expanded;
      Object.assign(originalNode, { expanded: newExpandedState });
      Object.assign(node, { expanded: newExpandedState });

      this.rebuildFlatList();

      this.expandedStateChange.emit(
        this.getExpandedStateMap(this.originalNodes()),
      );
    }
  }

  onCheckboxChange(node: FlatTreeNode, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    // Find and update the original node
    const originalNode = this.findOriginalNode(node.key, this.originalNodes());

    if (originalNode) {
      Object.assign(originalNode, {
        selected: isChecked,
        indeterminate: false,
      });

      if (originalNode.children) {
        this.updateChildrenSelection(originalNode.children, isChecked);
      }
      this.updateParentStates();
      this.rebuildFlatList(); // Rebuild to reflect updated states

      this.selectionChange.emit({
        changedNode: originalNode,
        checked: isChecked,
      });
    }
  }

  private rebuildFlatList(): void {
    const flatList: FlatTreeNode[] = [];
    this.flattenTree(this.originalNodes(), flatList, 0, true);
    this.flatNodes.set(flatList);
  }

  private flattenTree(
    nodes: CustomTreeNode[],
    flatList: FlatTreeNode[],
    level: number,
    parentVisible: boolean,
    parentKey?: string,
  ): void {
    nodes.forEach((node) => {
      // Node is visible if parent is visible
      const visible = parentVisible;
      const flatNode: FlatTreeNode = {
        ...node,
        level,
        visible,
        parentKey,
      };

      flatList.push(flatNode);

      // If node is expanded and has children, add them to the flat list
      // Children are visible only if their parent is visible AND expanded
      if (node.expanded && node.children && node.children.length > 0) {
        this.flattenTree(node.children, flatList, level + 1, visible, node.key);
      }
    });
  }

  private findOriginalNode(
    key: string,
    nodes: CustomTreeNode[],
  ): CustomTreeNode | null {
    // First check direct match
    const directMatch = nodes.find((node) => node.key === key);

    if (directMatch) {
      return directMatch;
    }

    // Then search in children
    const childMatches = nodes
      .filter((node) => node.children && node.children.length > 0)
      .map((node) => this.findOriginalNode(key, node.children!))
      .filter((result) => result !== null);

    return childMatches.length > 0 ? childMatches[0] : null;
  }

  private updateChildrenSelection(
    children: CustomTreeNode[],
    selected: boolean,
  ): void {
    children.forEach((child) => {
      Object.assign(child, { selected, indeterminate: false });

      if (child.children) {
        this.updateChildrenSelection(child.children, selected);
      }
    });
  }

  private updateParentStates(): void {
    this.originalNodes().forEach((n) => this.updateNodeState(n));
  }

  private updateNodeState(n: CustomTreeNode): void {
    if (!n.children || n.children.length === 0) {
      return;
    }
    n.children.forEach((c) => this.updateNodeState(c));
    const selectedChildren = n.children.filter((c) => c.selected);
    const indeterminateChildren = n.children.filter((c) => c.indeterminate);
    let selected = false;
    let indeterminate = false;

    if (selectedChildren.length === n.children.length) {
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
    Object.assign(n, { selected, indeterminate });
  }

  private getExpandedStateMap(
    nodes: CustomTreeNode[],
    map = new Map<string, boolean>(),
  ): Map<string, boolean> {
    nodes.forEach((node) => {
      if (node.expanded) map.set(node.key, true);
      if (node.children) this.getExpandedStateMap(node.children, map);
    });

    return map;
  }

  private deepCloneNodes(nodes: CustomTreeNode[]): CustomTreeNode[] {
    return nodes.map((node) => ({
      ...node,
      children: node.children ? this.deepCloneNodes(node.children) : undefined,
    }));
  }
}
