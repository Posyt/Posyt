var React = require('react');

if (typeof process === 'undefined') process = {};
if (!process.nextTick) process.nextTick = setImmediate;

global.process = process;

module.exports = process;
