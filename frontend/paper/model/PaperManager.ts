/**
 * @fileoverview This file handles the bookkeeping of the sole static
 * instance of PaperGraph which represents the paper model currently
 * being viewed/edited. The file provides folding algorithms with
 * manipulate and update the paper; these are the only point of entry
 * which a caller can use to fold the currently opened origami in
 * the abstract mathematical sense, not considering any 3D rendering.
 */