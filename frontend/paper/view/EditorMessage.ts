/**
 * @fileoverview Any english text/message that may show up on the origami
 * editor page should be added to an enum here and referred to via the
 * correponding enum constant.
 */

export const EditorStatus = {

    NORMAL: {
        code: 0,
        msg: ""
    },

    BAD_LINE_ADD_OVERLAP:  {
        code: 1,
        msg: "That annotated line would too closely overlap an existing one."
    },

    BAD_POINT_DELETE: {
        code: 2,
        msg: "Deleting that point would cause an annotated line to be deleted."
    },

    FRONTEND_SYSTEM_ERROR: {
        code: 3,
        msg: "An error occured trying to create your request"
    },

    BACKEND_500_ERROR: {
        code: 4,
        msg: "An error occured trying save your action to our servers"
    },

    POINT_NOT_ON_EDGE_ERROR: {
        code: 5,
        msg: "The point must be on the edge of a face"
    },

} as const;

export type EditorStatusType = keyof typeof EditorStatus;


// Usage example:
// const myStatus: EditorStatusType = "BAD_LINE_ADD";
// const msg = EditorStatus[myStatus].msg;