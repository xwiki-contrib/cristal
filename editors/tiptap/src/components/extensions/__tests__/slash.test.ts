import { ActionCategoryDescriptor, filterActionsByQuery } from "../slash";

import { describe, expect, it } from "vitest";

describe("filterActionsByQuery", () => {
  it("do nothing on empty", () => {
    expect(filterActionsByQuery("", [])).toStrictEqual([]);
  });
  it("removes empty categories", () => {
    const category2: ActionCategoryDescriptor = {
      title: "category2",
      actions: [],
    };
    const category1 = {
      title: "category1",
      actions: [],
    };
    expect(filterActionsByQuery("", [category2, category1])).toStrictEqual([]);
  });
  it("be sorted", () => {
    const actionA = {
      title: "actionA",
      command() {},
      hint: "Action A",
      icon: "action-a",
    };
    const actionB = {
      title: "actionB",
      command() {},
      hint: "Action B",
      icon: "action-a",
    };
    const category2: ActionCategoryDescriptor = {
      title: "category2",
      actions: [actionA],
    };
    const category1 = {
      title: "category1",
      actions: [actionB],
    };
    expect(filterActionsByQuery("", [category2, category1])).toStrictEqual([
      category1,
      category2,
    ]);
  });
});
