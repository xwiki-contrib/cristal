import { enDictionary } from "./en";

/**
 * The selected dictionary is to be embedded inside of the BlockNote editor instance through
 * the `createDictionary` function.
 *
 * It will then be usable in any component inside BlockNote using the `useCustomDictionary` hook
 */
export const customDictionaries = {
  en: enDictionary,
};
