'use strict';
/* @flow */

import {
  ap,
  combine,
  isStream,
  map as mapS,
  merge as mergeS,
  on,
  scan as scanS,
  stream,
  transduce
} from 'flyd';

import {
  always,
  append,
  apply,
  call,
  compose,
  cond,
  equals,
  head,
  flatten,
  identity,
  is,
  keys,
  lift,
  map,
  nth,
  prepend,
  prop,
  of,
  reduce,
  reduceRight,
  reverse,
  sortBy,
  toPairs,
  T,
  unless,
  unnest,
  when,
} from 'ramda';


// Helpers
//

const log = console.log;

//
// Data Layer
//

// Represents a field and transformation actions to be applied.
// A "Signal" is generated as a result of a user interaction event.
type Signal = { field: string, actions: Array<string> };

// Signal Stubs
//
const nameSignal: Signal = {
  field: 'name',
  actions: ['desc', 'sort']
};

const statusSignal: Signal = {
  field: 'status',
  actions: ['sort']
};

// This is a stub, we don't really care about it
const inputSignals = map(stream, [nameSignal]);

// Input Management
//

// Maps the signal dictionary to an operable xform fn.
// mapFromSignal :: Signal -> [(Object -> [a)]
const mapFromSignal = (signal: Signal): Function => {
  return reduceRight((acc, action) => {
    return prepend(
      cond([
        [when(is(String), equals('sort')) , always(sortBy(prop(signal.field)))],
        [when(is(String), equals('desc')) , always(reverse)],
        [T                                , always(identity)]
      ])(action)
    )(acc);
  }, [], signal.actions);
}

// Merge all input signals into one stream.
// This is the primary entry point
const signalAggregateStream = reduce(mergeS, stream(), inputSignals);

// Collect all xform fns, mapped from the signal stream.
// TODO This operation will need to EVENTUALLY clean up the aggregate stream,
//      so as to avoid duplicate or conflicting xforms.
const xformAggregateStream = scanS((xformList, signal) => {
  return flatten(prepend(mapFromSignal(signal), xformList));
}, [], signalAggregateStream);

// Compose xform fns into a single fn.
const xformStream = mapS((xformList) => apply(compose, xformList), xformAggregateStream);

// The Data
//
const data = [
  { name: 'why', status: 'foo' },
  { name: 'yoo', status: 'baz' },
  { name: 'xix', status: 'baz' },
  { name: 'vue', status: 'foo' },
  { name: 'zed', status: 'foo' },
  { name: 'umm', status: 'foo' }
];

// The Meat
//
const inputStream = stream(data);
const dataStream = xformStream.ap(inputStream);

// The Hook
//
on(log, dataStream);

// The Bait
//
signalAggregateStream(statusSignal);
