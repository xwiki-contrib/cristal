import { AttachmentReference } from "@xwiki/cristal-model-api";

/**
 * @since 0.12
 */
interface AttachmentPreview {
  preview(attachment: AttachmentReference): void;
}

export { type AttachmentPreview };
