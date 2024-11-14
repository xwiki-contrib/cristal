/**
 * @since 0.9
 */
interface Attachment {
  id: string;
  name: string;
  mimetype: string;
  href: string;
  date: Date;
  size: number;
  author: string; // TODO: replace with a user reference
}

export { type Attachment };
