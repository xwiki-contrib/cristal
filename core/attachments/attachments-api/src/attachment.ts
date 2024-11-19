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
  // The author is optional in the case of single user backend
  author: string | undefined; // TODO: replace with a user reference
}

export { type Attachment };
