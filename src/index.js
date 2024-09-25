// this is the entry point for the library
// it exports all the functions that are available to the user
// it uses also for the bundling and minifying
// (see package.json's "build" script)
export { jUnit } from './junit.js';
export { humanizeValue, textSummary } from './text.js';
export { htmlSummary } from './html.js';
