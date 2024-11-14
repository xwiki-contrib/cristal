import { AttachmentReference } from "@xwiki/cristal-model-api";
import { Ref } from "vue";

/**
 * @since 0.12
 */
interface AttachmentPreview {
  preview(attachment: AttachmentReference): void;
  attachment(): Ref<AttachmentReference | undefined>;
  loading(): Ref<boolean>;
}

export { type AttachmentPreview };
