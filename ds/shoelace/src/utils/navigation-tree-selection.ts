import { type Ref } from "vue";
import type SlTreeItem from "@shoelace-style/shoelace/dist/components/tree-item/tree-item";

export class NavigationTreeSelection {
  private selectedTreeItem: SlTreeItem | undefined = undefined;
  private treeItems: Ref<Map<string, SlTreeItem>>;

  constructor(treeItems: Ref<Map<string, SlTreeItem>>) {
    this.treeItems = treeItems;
  }

  public updateSelection(id: string) {
    if (this.selectedTreeItem) {
      this.selectedTreeItem.selected = false;
    }
    this.selectedTreeItem = this.treeItems.value.get(id);
    this.selectedTreeItem!.selected = true;
  }

  public getSelection(): SlTreeItem | undefined {
    return this.selectedTreeItem;
  }

  public onSelectionChange(event: unknown) {
    // We don't want users to manually select a node, so we undo any change.
    (
      event as { detail: { selection: SlTreeItem[] } }
    ).detail.selection[0].selected = false;
    if (this.selectedTreeItem) {
      this.selectedTreeItem!.selected = true;
    }
  }
}
