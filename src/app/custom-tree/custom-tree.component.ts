import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomTreeNode } from '../models/custom-tree';


@Component({
  selector: 'shared-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-tree.component.html',
  styleUrls: ['./custom-tree.component.scss'],
})
export class CustomTreeComponent implements OnInit {
  nodes = input<CustomTreeNode[]>([]);
  level = input<number>(0);

  selectionChange = output<{
    changedNode: CustomTreeNode;
    checked: boolean;
  }>();
  expandedStateChange = output<Map<string, boolean>>();

  ngOnInit() {
    this.initializeNodes(this.nodes());
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

  toggleExpansion(nd: CustomTreeNode): void {
    Object.assign(nd, { expanded: !nd.expanded });
    this.expandedStateChange.emit(this.getExpandedStateMap(this.nodes()));
  }

  onExpandChildStateChange() {
    this.expandedStateChange.emit(this.getExpandedStateMap(this.nodes()));
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

  onCheckboxChange(nd: CustomTreeNode, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    Object.assign(nd, { selected: isChecked, indeterminate: false });

    if (nd.children) {
      this.updateChildrenSelection(nd.children, isChecked);
    }
    this.updateParentStates();

    this.selectionChange.emit({
      changedNode: nd,
      checked: isChecked,
    });
  }

  onChildSelectionChange(event: {
    changedNode: CustomTreeNode;
    checked: boolean;
  }): void {
    this.updateParentStates();
    this.selectionChange.emit(event);
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
    this.nodes().forEach((n) => this.updateNodeState(n));
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

  private getAllSelectedNodes(): CustomTreeNode[] {
    const selected: CustomTreeNode[] = [];

    this.collectSelectedNodes(this.nodes(), selected);

    return selected;
  }

  private collectSelectedNodes(
    nodes: CustomTreeNode[],
    selected: CustomTreeNode[],
  ): void {
    nodes.forEach((nd) => {
      if (nd.selected) {
        selected.push(nd);
      }

      if (nd.children) {
        this.collectSelectedNodes(nd.children, selected);
      }
    });
  }
}
