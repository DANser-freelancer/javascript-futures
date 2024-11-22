# About

This is an implementation of a `Future` object for vanilla javascript.  
A `Future` extends `Promise` and partially unwraps itself once it is `settled`.

# Overview

The initialization is very similar to a `Promise` and has some QoL improvements.  
A `Future` extends `Promise` for 2 reasons:

1. to inherit all the `Promise` methods (e.g. `.then()` or `.catch()`), even from future ES specs
2. they are very similar concepts and so `new Future(() => {}) instanceof Promise` should be `true`

You can grab a test file [here](https://github.com/DANser-freelancer/javascript-futures/blob/main/examples.js).

## Initialization and Syntax

The accepted function is run immediately, and a `Future` is returned.  
A `Future` accepts both **regular** and **async** executor functions.

```javascript
const futuro = new Future((resolve, reject, signal) => {
  /*your code*/
});
```

```javascript
const futuroAsincrono = new Future(async (signal) => {
  /*your code*/
});
```

Some handles will be passed to the executor, it depends on the kind of function used as executor:

- These args are always sent, they can be called anything
- Any other args are not available (since the executor is called from a `Future`)
- You can default assign any extra args, as usual `(a, b, c, d = 55) => {}`
- **Regular** executor is wrapped in a `Promise`
  - you can manually `reject()` or `resolve()` it
- **Async** executor implicitly returns a `Promise`
  - you cannot manually settle the async `Promise`
  - it only receives a `signal` arg

A `Future` accepts an options object:

1. `signal` accepts an `AbortSignal` object
   - it is passed to both kinds of executors

## Structure

A `Future` has exposed, **readonly** properties:

1. `.v` is the **settled** value of the underlying `Promise`

   - initially `null`
   - if **resolved** it is the resolved value
   - if **rejected** it is the rejected value
   - if **thrown** it is the error object

2. `abort()` is a reference to the aforementioned method of an `AbortController`

   - if no `signal` was passed to the `Future` constructor, it is present but `undefined`
     - this prevents accidental abort of other dependants when you only meant to abort the one `Future`
     - also `AbortSignal` has no reference to `AbortController.abort()`, so I can't grab it
   - once the `Future` is **settled**, it is `null` (for memory cleanup)
   - see [abort example](#signal-example)

3. `.state` **mimicks** internal `[[PromiseState]]` property
4. `.isPending` returns `false` for "resolved" or "rejected" `Future`

## Usage

The main use case is to achieve some performance gain by avoiding frequent use of `await`.  
`Promise` always has to be unwrapped with `await` or `.then()` otherwise the value is inaccessible.  
`await` schedules a microtask just like `.then()`:

1. this means every `await` surrenders this iteration of the event loop, because a `microtask` is only executed between iterations of the event loop.
2. this also means that an `async` function will be frozen untill it resolves its first `await` and then the next, and the next...

There is one trick to `await` the value at the very last moment, letting the function start other `Promise`s and complete some synchronous setup.

```javascript
async function longTask() {
  const file1 = fileAsync('bunny.png');
  const file2 = fileAsync('carrot.png');
  let number = numberAsync(1);
  // long setup
  for (let i = 0; i < 100000; i++) {
    const x = i * 3;
  }

  // actual use of data
  number = await number;
  return (await file1) + (await file2) + number;
}
```

I find several problems with this approach, specifically in more complicated production grade code.

1. we still can only get the value out by `awaiting` **again**
   - bad in case we need to use `const file1` more than once
2. we could reassign `let number` to the once `awaited` value
   - but it's very easy to reassign it somewhere else by accident
3. we could start all `Promise`s with `Promise.all()`
   - but now it's another `Promise` which has to be unwrapped with an `await`
     - and possibly destructured into more variables
   - and it doesn't work if there are more `async` tasks dependent on the result of some initial `Promise`s
     - especially if those secondary `Promise`s are best awaited at different points in the function

`Future` removes the need for tricks.  
Once a `Future` is created, you only need to `await` it **once** to receive the value.  
Any later access is direct and **synchronous** via `<future>.v`.  
A `Future` also facilitates the use of `AbortSignal` in two ways:

1. you can pass an `AbortController.signal` object in the `Future` constructor options
2. or an `AbortController` will be created
   - this makes sure the `AbortSignal` is always passed into executors
   - and exposes the `.abort()` method on the `Future` itself

<a name="signal-example"></a>
Here is an example of how to use it:

```javascript
const cancelledFuture = new Future((res, rej, signal) => {
  signal.addEventListener(
    'abort',
    () => {
      rej(signal.reason);
    },
    { once: true }
  );
  // never resolves
  setTimeout(() => {
    res(200);
  }, 1500);
});

try {
  cancelledFuture.abort(`I don't want this`);
  log(await cancelledFuture);
} catch (e) {
  console.log(e);
}
```

# Authors

[Dan](https://github.com/DANser-freelancer): Code
