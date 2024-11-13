import { AttachmentPreview } from "@xwiki/cristal-attachments-api";
import { AttachmentReference } from "@xwiki/cristal-model-api";
import { injectable } from "inversify";

@injectable()
class DefaultAttachmentPreview implements AttachmentPreview {
  preview(attachment: AttachmentReference): void {
    console.log("attachment", attachment);
  }
}

export { DefaultAttachmentPreview };
