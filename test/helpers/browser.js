require('babel-register')();

const jsdom = require('jsdom').jsdom;
global.document = jsdom('<!doctype html><html><body><div id="app"></div></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;
