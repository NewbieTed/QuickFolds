/**
 * @fileoverview Any english text/message that may show up on the origami 
 * editor page should be added to an enum here and referred to via the
 * correponding enum constant.
 */

export const EditorStatus = {

    NORMAL: {code: 0, msg: ""},
    BAD_LINE_ADD:  {code: 1, msg: ""},
    BAD_POINT_DELETE: {code: 2, msg: ""}

} as const;

export type EditorStatusType = keyof typeof EditorStatus;

// Usage example:
// const myStatus: EditorStatusType = "BAD_LINE_ADD";
// const msg = EditorStatus[myStatus].msg;