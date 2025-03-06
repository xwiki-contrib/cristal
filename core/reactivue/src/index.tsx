/* eslint-disable vue/multi-word-component-names */

import { createRef, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp, defineComponent, h } from "vue";
import type { ReactElement } from "react";
import type { Root } from "react-dom/client";
import type { App, SlotsType, VNode } from "vue";

// This import is required as the return type of `reactComponentAdapter` references some types from `@vue/shared`
// If we remove this import, we will get a fatal error from the TypeScript compiler:
//
// > The inferred type of 'reactComponentAdapter' cannot be named without a reference to '[...]/@vue/shared'.
// > This is likely not portable. A type annotation is necessary.
//
// eslint-disable-next-line vue/prefer-import-from-vue
import "@vue/shared";

/**
 * Options for {@link reactComponentAdapter}
 */
type ReactComponentAdapterOptions = {
  dontHyphenizeProps?: boolean;
  modifyVueApp?: (app: App) => void;
};

/**
 * Wrap a React component to render it as a Vue component
 *
 * @param Component - A React component
 * @param options - Options for the adapter
 * @returns A Vue component
 */
function reactComponentAdapter<Props extends Record<string, unknown>>(
  Component: React.FC<Props>,
  options?: ReactComponentAdapterOptions,
) {
  return defineComponent({
    // We need to use '__typeProps' and 'slots' for typing
    //
    // Unfortunately, the `DefineComponent` type from Vue takes a *LOT* of generics,
    // so we resort to using this to get correct typing
    __typeProps: {} as ReactNonSlotProps<Props>,
    slots: {} as SlotsType<ReactSlotsTypeAdapter<Props>>,

    // Initialize the wrapper component's state
    data(): ReactAdapterComponentState<Props> {
      const mergePropsAndSlots: ReactAdapterComponentState<Props>["mergePropsAndSlots"] =
        (props, slots) => {
          const merged = {
            // Properties are left "as is"
            ...props,
            // Slots are transformed as we need to render Vue component inside React
            ...Object.fromEntries(
              Object.entries(slots).map(([slotName, vueComponent]) => [
                slotName,
                // biome-ignore lint/correctness/useJsxKeyInIterable: TODO
                (props: Record<string, unknown>) => (
                  <VueComponentWrapper
                    vueComponent={
                      vueComponent as VueComponent<Record<string, unknown>>
                    }
                    props={props}
                    modifyVueApp={options?.modifyVueApp}
                  />
                ),
              ]),
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;

          return options?.dontHyphenizeProps
            ? merged
            : transformVuePropsHyphenCasing(merged);
        };

      return {
        // Provided options
        options: options ?? {},
        // The HTML element where the component is going to be rendered
        root: null,
        // Props & slots merger
        mergePropsAndSlots,
        // Create an Observable object with the props so the indirection layer (see below)
        // can be notified when props or slots change
        observableProps: new Observable<Props>(
          mergePropsAndSlots(
            // Note that we use '$attrs', as `defineComponent` will only list
            // properties that are listed in the `props` field into `this.$props`
            // But as we only provided an object _shape_ and not an actual description object,
            // Vue will consider our component does not have any property, and will put
            // anything provided to this component into `this.$attrs`
            //
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.$attrs as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.$slots as any,
          ),
        ),
      };
    },

    mounted() {
      // Ensure the container HTML element has been rendered correctly
      if (!(this.$el instanceof HTMLElement)) {
        throw new Error(
          "Rendered element is not defined in React component adapter",
        );
      }

      // Render the element inside the container element
      this.$data.root = createRoot(this.$el);
      this.$data.root.render(
        <ReactIndirectionLayer
          Component={Component}
          componentProps={this.$data.observableProps}
        />,
      );

      // Be notified of any properties and slot changes
      // There isn't a 'native' way to watch these in Vue, so we resort to using a custom watcher
      this.$watch(
        () => ({ props: { ...this.$attrs }, slots: { ...this.$slots } }),
        ({ props, slots }) => {
          // Update the observable in order to notify the indirection layer
          this.$data.observableProps.set(
            this.$data.mergePropsAndSlots(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              props as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              slots as any,
            ),
          );
        },
      );
    },

    // The component will be rendered inside this element
    render: () => h("div"),
  });
}

/**
 * State of the wrapper component
 */
type ReactAdapterComponentState<Props extends Record<string, unknown>> = {
  root: Root | null;
  observableProps: Observable<Props>;
  options: ReactComponentAdapterOptions;
  mergePropsAndSlots: (
    props: ReactNonSlotProps<Props>,
    slots: ReactSlotsTypeAdapter<Props>,
  ) => Props;
};

/**
 * Type of a Vue component
 */
type VueComponent<Props extends Record<string, unknown>> = (
  props: Props,
) => VNode[];

/**
 * Type of a Reactivue-compatible React child element
 */
type ReactivueChild<Props extends Record<string, unknown>> = (
  props: Props,
) => ReactElement;

/**
 * Remove all keys whose value is `never` from a record
 */
type FilterOutNeverKeys<T extends Record<string, unknown>> = Pick<
  T,
  {
    [K in keyof T]-?: T[K] extends never ? never : K;
  }[keyof T]
>;

/**
 * Transform the slot types in a shape that can be used in Vue's `defineComponent`
 */
type ReactSlotsTypeAdapter<Props extends Record<string, unknown>> =
  FilterOutNeverKeys<{
    [Prop in keyof Required<Props>]: Props[Prop] extends ReactivueChild<
      infer SlotProps
    >
      ? VueComponent<SlotProps>
      : never;
  }>;

/**
 * Filter out slots from a component's properties
 */
type ReactNonSlotProps<Props extends Record<string, unknown>> =
  FilterOutNeverKeys<{
    [Prop in keyof Props]: Props[Prop] extends (
      props: infer _ extends Record<string, unknown>,
    ) => ReactElement
      ? never
      : Props[Prop];
  }>;

/**
 * Transform properties from Vue to correct hyphen-casing to camel-casing
 *
 * Required as Vue isn't case-sensitive when it comes to using properties in a <template>,
 * so we need to use this function to "fix" properties that are written with hyphens
 *
 * @param props - Hyphen-cased props
 * @returns Corrected props
 */
function transformVuePropsHyphenCasing<Props extends Record<string, unknown>>(
  // Note that we don't actually get `Props`, we get a hyphen-cased version of that type
  props: Props,
): Props {
  return Object.fromEntries(
    Object.entries(props).map(([name, value]) => [
      name.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase()),
      value,
    ]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
}

/**
 * Indirection layer, used to wrap the component to render and update its properties dynamically
 *
 * This only renders the underlying component with the provided properties, nothing else
 *
 * @param param0 -
 * @returns
 */
function ReactIndirectionLayer<Props extends Record<string, unknown>>({
  Component,
  componentProps,
}: ReactIndirectLayerProps<Props>) {
  const [props, setProps] = useState(componentProps.get());

  // Update this component when the provided underlying component's properties change
  useEffect(() => {
    componentProps.watch((props) => {
      setProps(props);
    });
  }, [componentProps]);

  return <Component {...props} />;
}

/**
 * Properties for the indirection layer component
 */
type ReactIndirectLayerProps<Props extends Record<string, unknown>> = {
  Component: React.FC<Props>;
  componentProps: Observable<Props>;
};

/**
 * Wrap a Vue component to render it inside React
 *
 * Note that this spawns an entire Vue application for every component
 *
 * @param param0 - The Vue component to render
 * @returns A wrapping React component
 */
function VueComponentWrapper<Props extends Record<string, unknown>>({
  vueComponent,
  props,
  modifyVueApp,
}: {
  vueComponent: VueComponent<Props>;
  props: Props;
  modifyVueApp: ReactComponentAdapterOptions["modifyVueApp"];
}) {
  // The element the Vue component is going to be rendered into
  const containerRef = createRef<HTMLDivElement>();

  // Instance of a Vue application
  const vueInstanceRef = useRef<App<Element> | null>(null);

  useEffect(() => {
    // Only import Vue when the component mounts
    if (containerRef.current) {
      // Clean up previous instance if it exists
      if (vueInstanceRef.current) {
        vueInstanceRef.current.unmount();
      }

      // Create a new Vue app with your component
      // TODO: if perf is bad, consider implementing https://github.com/gloriasoft/veaury?tab=readme-ov-file#context
      const app = createApp(vueComponent, props);
      modifyVueApp?.(app);
      app.mount(containerRef.current);
      vueInstanceRef.current = app;
    }

    // Clean up when component unmounts
    return () => {
      if (vueInstanceRef.current) {
        vueInstanceRef.current.unmount();
      }
    };
  }, [vueComponent, containerRef]);

  return <div ref={containerRef} />;
}

/**
 * Lightweight observable type
 */
class Observable<T> {
  private _listeners = new Array<(value: T) => void>();

  constructor(private _value: T) {}

  get(): T {
    return this._value;
  }

  set(value: T): void {
    this._value = value;

    for (const listener of this._listeners) {
      listener(this._value);
    }
  }

  // TODO: return a cleanup ID
  // TODO: use that ID in useEffect()'s return callback
  watch(listener: (value: T) => void): void {
    this._listeners.push(listener);
  }
}

export { VueComponentWrapper, reactComponentAdapter };
export type { ReactComponentAdapterOptions, ReactNonSlotProps, ReactivueChild };
