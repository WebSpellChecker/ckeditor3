/**
 * @namespace "CKEditor3 WSC plug-in"
 *
 * @property {Number} wsc_left - Sets left position for WSC modal window. If not specified, it would be calculated to show WSC modal window on the middle of the screen.
 * Constraints: 
 * - min: 0
 * - max: [width of window] - [width of WSC modal window]
 *
 * @property {Number} wsc_top - Sets top position for WSC modal window. If not specified, it would be calculated to show WSC modal window on the middle of the screen.
 * Constraints: 
 * - min: 0
 * - max: [height of window] - [height of WSC modal window]
 *
 * @property {Number} wsc_width - Sets width of WSC modal window. If not specified, it would be taken from minimal value for WSC modal window.
 * Constraints: 
 * - min: 485
 * - max: [width of window]
 *
 * @property {Number} wsc_height - Sets height of WSC modal window. If not specified, it would be taken from minimal value for WSC modal window.
 * Constraints: 
 * - min: 380
 * - max: [height of window]
 *
 * @example
 * config.wsc_left = 100;
 * @example
 * config.wsc_top = 0;
 * @example
 * config.wsc_width = 900;
 * @example
 * config.wsc_height = 800;
 */