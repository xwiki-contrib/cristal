import { BlockType } from "../blocknote";
import { BlockNoteViewWrapper } from "../components/BlockNoteViewWrapper";
import { LinkEditionContext } from "../misc/linkSuggest";
import {
  AttachmentReference,
  DocumentReference,
  EntityType,
  SpaceReference,
} from "@xwiki/cristal-model-api";
import { useMemo } from "react";

export type BlockNoteForTestProps = {
  content: BlockType[];
};

export const BlockNoteForTest: React.FC<BlockNoteForTestProps> = ({
  content,
}) => {
  const linkEditionCtx = useMemo(linkEditionCtxMock, []);

  return (
    <BlockNoteViewWrapper
      content={content}
      lang="en"
      linkEditionCtx={linkEditionCtxMock()}
    />
  );
};

function linkEditionCtxMock(): LinkEditionContext {
  return {
    attachmentsService: null as any,
    documentService: null as any,
    linkSuggestService: {
      async getLinks() {
        return [
          {
            id: "some page id",
            hint: "some page hint",
            label: "some page label",
            reference: "some page reference",
            type: 0,
            url: "some page url",
          },
          {
            id: "some attachment id",
            hint: "some attachment hint",
            label: "some attachment label",
            reference: "some attachment reference",
            type: 1,
            url: "some attachment url",
          },
        ];
      },
    },
    modelReferenceHandler: null as any,
    modelReferenceParser: {
      parse(reference, type) {
        if (
          reference === "some page reference" &&
          (!type || type === EntityType.DOCUMENT)
        ) {
          return new DocumentReference("some page", new SpaceReference());
        }

        if (
          reference === "some attachment reference" &&
          (!type || type === EntityType.ATTACHMENT)
        ) {
          return new AttachmentReference(
            "some attachment",
            new DocumentReference("some attachment", new SpaceReference()),
          );
        }

        throw new Error("Invalid reference provided");
      },
    },
    modelReferenceSerializer: {
      serialize(reference) {
        if (!reference) {
          throw new Error("Please provide a reference to serialize");
        }

        if (reference.type === EntityType.DOCUMENT) {
          return "some page reference";
        }

        if (reference.type === EntityType.ATTACHMENT) {
          return "some attachment reference";
        }

        throw new Error("Invalid reference provided");
      },
    },
    remoteURLParser: null as any,
    remoteURLSerializer: null as any,
  };
}

// const cristalMock = mock<CristalApp>();
//   const containerMock = mock<Container>();
//   containerMock.get
//     .calledWith("ClickListener")
//     .mockReturnValue(mock<ClickListener>());
//   const modelReferenceParserProviderMock = mock<ModelReferenceParserProvider>();
//   const modelReferenceParserMock = mock<ModelReferenceParser>();
//   modelReferenceParserMock.parse
//     .calledWith("test.jpg", EntityType.ATTACHMENT)
//     .mockReturnValue(
//       new AttachmentReference("test.jpg", new DocumentReference("A")),
//     );
//   modelReferenceParserProviderMock.get.mockReturnValue(
//     modelReferenceParserMock,
//   );
