export interface CustomTreeNode {
  data?: any;
  depth?: number;
  key: string;
  label: string;
  children?: CustomTreeNode[];
  selected?: boolean;
  expanded?: boolean;
  indeterminate?: boolean;
}
