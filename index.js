'use strict';

import {
  ap,
  combine,
  merge,
  on,
  stream,
  transduce
} from 'flyd';

import {
  always,
  call,
  compose,
  head,
  identity,
  is,
  keys,
  lift,
  map,
  nth,
  of,
  reverse,
  sortBy,
  toPairs,
  unless,
  unnest
} from 'ramda';

const log = console.log;

// The Data
//
const transformers = [
  identity,
  reverse,
  lift(compose(unnest, toPairs))
];

const data = [
  { a: 'z' },
  { b: 'y' },
  { c: 'x' },
  { d: 'w' },
  { e: 'v' },
  { f: 'u' }
];

// The Meat
//
const inputStream = stream(data);
const xformStream = stream();

const dataStream = combine((xform, d) => {
  return call(xform(), d());
}, [xformStream, inputStream]);

// The Hook
//
on((d) => log(`Results: ${JSON.stringify(d)}`), dataStream);

// The Testing
//
let xform;
while (xform = transformers.shift()) {
  xformStream(xform);
}

// Results: [{"a":"z"},{"b":"y"},{"c":"x"},{"d":"w"},{"e":"v"},{"f":"u"}]
// Results: [{"f":"u"},{"e":"v"},{"d":"w"},{"c":"x"},{"b":"y"},{"a":"z"}]
// Results: [["a","z"],["b","y"],["c","x"],["d","w"],["e","v"],["f","u"]]
