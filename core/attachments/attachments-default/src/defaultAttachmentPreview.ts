import { AttachmentPreview } from "@xwiki/cristal-attachments-api";
import { AttachmentReference } from "@xwiki/cristal-model-api";
import { injectable } from "inversify";
import { Store, StoreDefinition, defineStore, storeToRefs } from "pinia";
import { Ref } from "vue";

type Id = "attachment-preview";
type State = {
  loading: boolean;
  attachment: AttachmentReference | undefined;
};
/**
 * Take a given type "Type" and wraps each of its fields in a readonly Ref.
 */
type WrappedRefs<Type> = {
  readonly [Property in keyof Type]: Ref<Type[Property]>;
};
type StateRefs = WrappedRefs<State>;
type Getters = Record<string, never>;
type Actions = {
  openAttachment(attachment: AttachmentReference): void;
  startLoading(): void;
};
type AttachmentPreviewStoreDefinition = StoreDefinition<
  Id,
  State,
  Getters,
  Actions
>;
type AttachmentPreviewStore = Store<Id, State, Getters, Actions>;

const attachmentPreviewStore: AttachmentPreviewStoreDefinition = defineStore<
  Id,
  State,
  Getters,
  Actions
>("attachment-preview", {
  state() {
    return {
      loading: false,
      attachment: undefined,
    };
  },
  actions: {
    startLoading() {
      this.loading = true;
    },
    openAttachment(attachment: AttachmentReference) {
      this.startLoading();
      try {
        this.attachment = attachment;
        // TODO: add complementary details from the backend.
      } finally {
        this.loading = false;
      }
    },
  },
});

@injectable()
class DefaultAttachmentPreview implements AttachmentPreview {
  private readonly refs: StateRefs;
  private readonly store: AttachmentPreviewStore;
  constructor() {
    this.store = attachmentPreviewStore();
    this.refs = storeToRefs(this.store);
  }

  preview(attachment: AttachmentReference): void {
    this.store.openAttachment(attachment);
  }

  attachment(): StateRefs["attachment"] {
    return this.refs.attachment;
  }

  loading(): StateRefs["loading"] {
    return this.refs.loading;
  }
}

export { DefaultAttachmentPreview };
