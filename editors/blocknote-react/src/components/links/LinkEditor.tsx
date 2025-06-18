// import { LinkEditionContext } from "../../../components/linkEditionContext";
// import { LinkSuggestion } from "../../../components/linkSuggest";
// import { LinkType } from "@xwiki/cristal-link-suggest-api";
// import { EntityReference } from "@xwiki/cristal-model-api";
// import { debounce } from "lodash-es";
// import { useCallback, useState } from "react";

// type LinkData = {
//   title: string;
//   reference: EntityReference | null;
//   url: string;
// };

// type LinkEditorProps = {
//   linkEditionCtx: LinkEditionContext;
//   current: LinkData | null;
//   updateLink: (linkData: LinkData) => void;
//   hideTitle?: boolean;
// };

// export const LinkEditor: React.FC<LinkEditorProps> = ({
//   linkEditionCtx,
//   current,
//   updateLink,
//   hideTitle,
// }) => {
//   const [target, setTarget] = useState({
//     url: current?.url ?? "",
//     reference: current?.reference ?? null,
//   });

//   const [title, setTitle] = useState(current?.title ?? "");
//   const [results, setResults] = useState<LinkSuggestion[]>([]);

//   const [query, setQuery] = useState(
//     (current?.reference
//       ? linkEditionCtx.modelReferenceSerializer.serialize(current.reference)
//       : current?.url) ?? "",
//   );

//   const search = useCallback(
//     debounce(async (query: string) => {
//       setTarget({ url: query, reference: null });

//       if (query.startsWith("http://") || query.startsWith("https://")) {
//         setResults([]);
//         return;
//       }

//       const suggestions = await linkEditionCtx.suggestLink({ query });

//       setResults(
//         suggestions.filter((suggestion) => suggestion.type === LinkType.PAGE),
//       );
//     }),
//     [setTarget, setResults],
//   );

//   const select = useCallback(
//     (result: LinkSuggestion) => {
//       const reference = linkEditionCtx.modelReferenceParser.parse(
//         result.reference,
//       );

//       setTitle(title || result.title);
//       setQuery(linkEditionCtx.modelReferenceSerializer.serialize(reference)!);
//       setTarget({
//         url: result.url,
//         reference,
//       });
//       setResults([]);
//     },
//     [setTitle, setQuery, setTarget, setResults],
//   );

//   const submit = useCallback(() => {
//     updateLink({
//       title,
//       url: target.url,
//       reference: target.reference,
//     });
//   }, [updateLink]);

//   return <>TODO</>;
// };

// export type { LinkData, LinkEditorProps };
