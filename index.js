'use strict';

import {
  ap,
  combine,
  merge as mergeF,
  on,
  scan as scanF,
  stream,
  transduce
} from 'flyd';

import {
  always,
  apply,
  call,
  compose,
  head,
  identity,
  is,
  keys,
  lift,
  nth,
  of,
  reverse,
  sortBy,
  toPairs,
  unless,
  unnest
} from 'ramda';


// Helpers
//

const log = console.log;



/////////////////////////////////////////////////////////////////////////
// DATA LAYER
/////////////////////////////////////////////////////////////////////////

/**
 * Represents a field and transformation actions to be applied.
 * A "Signal" is generated as a result of a user interaction event.
 */
type Signal = { field: string, actions: Array<string> };

/*
 * Imagine:
 *
 * +--------+----------+
 * | Name ↓ | Status - |
 * +--------+----------+
 *
 * => Name: Sort, Desc
 * => Status: -
 *
 */

const nameSignal = {
  field: 'name',
  actions: ['sort', 'desc']
};

const statusSignal = {
  field: 'status',
  actions: []
};

const inputSignals = R.map(stream, [nameSignal, statusSignal]);

// Input Management
//

// Maps the signal dictionary to an operable xform fn.
// Expects a signal: { field: String, actions: [String] }
const mapFromSignal = (signal: Signal): Function => {
  // TODO: Go through the signal actions
}

// Merge all input signals into one stream
const signalAggregateStream = apply(mergeF(inputSignals));

// Collect all xform fns, mapped from the signal stream
// NOTE: This operation will need to clean up the aggregate stream, so as to avoid duplicate
// or conflicting xforms.
const xformAggregateStream = scanF((xformList, signal) => {
  return prepend(mapFromSignal(signal), xformList)
}, [], signalAggregateStream);

// Compose xform fns into a single fn
const xformStream = mapF((xformList) => apply(compose, xformList), xformAggregateStream);



// The Data
//
const data = [
  { name: 'zed', status: 'foo' },
  { name: 'yoo', status: 'baz' },
  { name: 'xix', status: 'baz' },
  { name: 'why', status: 'foo' },
  { name: 'vue', status: 'foo' },
  { name: 'umm', status: 'foo' }
];

// The Meat
//
const inputStream = stream(data);
// const xformStream = stream();
const dataStream = xformStream.ap(inputStream);

// The Hook
//
on((d) => log(`Results: ${JSON.stringify(d)}`), dataStream);

// The Testing
//
// let xform;
// while (xform = transformers.shift()) {
//   xformStream(xform);
// }

// Results: [{"a":"z"},{"b":"y"},{"c":"x"},{"d":"w"},{"e":"v"},{"f":"u"}]
// Results: [{"f":"u"},{"e":"v"},{"d":"w"},{"c":"x"},{"b":"y"},{"a":"z"}]
// Results: [["a","z"],["b","y"],["c","x"],["d","w"],["e","v"],["f","u"]]
