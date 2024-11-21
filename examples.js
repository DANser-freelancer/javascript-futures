import Future from './future.js';
const { log, clear } = console;

const response = new Future((resolve) => {
  setTimeout(() => {
    resolve(200);
  }, 1500);
});

log(response, '\n', response.v);
log(await response);
response.then((v) => {
  log(
    `this resolves with ${v} on the next event loop\n after previous await, right before next await`
  );
});
log(response.v);
debugger;
clear();

const problematicResponse = new Future((_resolve, reject) => {
  // throw new Error(`Your HDD exploded`);
  setTimeout(() => {
    reject(404);
  }, 1500);
});

log(problematicResponse, '\n', problematicResponse.v);
try {
  log(await problematicResponse);
} catch (e) {
  log(problematicResponse.v === e ? e : 'different');
}
debugger;
clear();

const asyncResponse = new Future(async () => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(200);
    }, 1500);
  });
});

log(asyncResponse, '\n', asyncResponse.v);
log(await asyncResponse);
log(asyncResponse.v);
debugger;
clear();

const problematicAsyncResponse = new Future(async () => {
  throw new Error(`I/O problems, check your wifi adapter`);
});

log(problematicAsyncResponse, '\n', problematicAsyncResponse.v);
try {
  log(await problematicAsyncResponse);
} catch (_e) {
  log(problematicAsyncResponse.v);
}
debugger;
clear();

async function fetchData(signal) {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1', { signal });
  return await response.json();
}

const cancelledFetch = new Future(fetchData);
try {
  // very contrived example just to be short
  cancelledFetch.abort();
  log(await cancelledFetch);
} catch (e) {
  console.log(e);
}

const control = new AbortController();
const cancelledFetch2 = new Future(fetchData, { signal: control.signal });
try {
  // cancelledFetch2.abort(); // not a function
  control.abort();
  log(await cancelledFetch2);
} catch (e) {
  console.log(e);
}

debugger;
clear();

const cancelledFuture = new Future((res, rej, signal) => {
  signal.addEventListener('abort', () => {
    rej(signal.reason);
  });
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

debugger;
