## About

This is an implementation of a `Future` object for vanilla javascript.  
A `Future` extends `Promise` and partially unwraps itself once it is `settled`.

## Overview

The initialization is very similar to a `Promise` and has some QoL improvements.  
A `Future` extends `Promise` so it can be identified as one.  
A `Future` implements `Promise` methods (e.g. `.then()` or `.catch()`), instead of inheriting them.

> [!WARNING]  
> Methods had to be implemented to fix strange interactions.  
> Because methods are implemented they may be inconsistent.  
> **testing required**

### Initialization and Syntax

The accepted function is run immediately, and a `Future` is returned.  
A `Future` accepts both **regular** and **async** functions.

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

Some handles will be passed to the functions, it depends on the kind of initializer function used:

- These args are always sent, they can be called anything
- Any other args are not available (since the function is called from a `Future`)
- You can default assign any extra args, like usual `(a, b, c, d = 55)=>{}`
- **Regular** functions are wrapped in a `Promise`
  - you can manually `reject()` or `resolve()` them
- **Async** functions implicitly return a `Promise`
  - you cannot manually settle the async `Promise`
  - you only get a `signal` arg

A `Future` accepts an options object:

1. `signal` accepts or creates an `AbortSignal` object.
   - it is passed to both kinds of functions

### Structure

A `Future` has 2 exposed, readonly properties:

1. `.v` is the _settled_ value of the underlying `Promise`

   - if **resolved** it is the resolved value
   - if **rejected** it is the rejected value
   - if **thrown** it is the error object

2. `abort()` is the aforementioned method of an `AbortController()`

   - it is only available if no `signal` was passed to the `Future` constructor
   - it becomes `null` once the `Future` is rejected (for memory cleanup)
