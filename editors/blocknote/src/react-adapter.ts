import TypingAdapter from "./react-typing_adapter.vue";
import { ReactElement, ReactNode } from "react";
import { applyPureReactInVue } from "veaury";

function reactComponentAdapter<Props extends Record<string, unknown>>(
  component: (props: Props) => ReactNode,
): typeof TypingAdapter<NonSlotProps<Props>, SlotProps<Props>> {
  return applyPureReactInVue(component);
}

/**
 * Extract keys whose value type may be assigned a `ReactElement`
 * This matches all properties with the `ReactNode` type
 */
type SlotPropKeys<T extends Record<string, unknown>> = {
  [K in keyof T]-?: [ReactElement] extends [T[K]] ? K : never;
}[keyof T];

/**
 * Extract all slot properties from a set
 * Then prefix them with `node:` for use in Veaury
 */
type SlotProps<T extends Record<string, unknown>> = {
  [Key in SlotPropKeys<T> as Key extends string
    ? `node:${Key}`
    : never]: T[Key];
};

/**
 * Remove all slot properties from a set
 */
type NonSlotProps<T extends Record<string, unknown>> = Omit<T, SlotPropKeys<T>>;

export { reactComponentAdapter };
export type { NonSlotProps, SlotPropKeys, SlotProps };
