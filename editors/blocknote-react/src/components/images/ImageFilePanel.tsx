/*
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
import { ImageEditor } from "./ImageEditor";
import { BlockOfType } from "../../blocknote";
import { useEditor } from "../../hooks";
import { LinkEditionContext } from "../../misc/linkSuggest";
import { Box } from "@mantine/core";
import { useCallback } from "react";

export type ImageFilePanelProps = {
  currentBlock: BlockOfType<"image">;
  linkEditionCtx: LinkEditionContext;
};

export const ImageFilePanel: React.FC<ImageFilePanelProps> = ({
  currentBlock: image,
  linkEditionCtx,
}) => {
  const editor = useEditor();

  const updateImage = useCallback(
    (url: string) => {
      console.log({ url });
      editor.updateBlock({ id: image.id }, { props: { url } });
      editor.focus();
    },
    [editor, image],
  );

  return (
    <Box bg="white" p="sm" bd="1px solid black">
      <ImageEditor linkEditionCtx={linkEditionCtx} onSelected={updateImage} />
    </Box>
  );
};
