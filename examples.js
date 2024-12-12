import Future from './future.js';
const { log, clear } = console;

const response = new Future((resolve) => {
  setTimeout(() => {
    resolve(200);
  }, 1500);
});

log(response, '\n', response.value);
// value is auto-unwrapped the first time a Future resolves
log(await response);
response.then((value) => {
  log(
    `this resolves with ${value} on the next event loop\n after previous await, right before next await`
  );
});
// don't have to await again
log(response.value);
log(response.value);
log(response.value);
debugger;
clear();

const problematicResponse = new Future((_resolve, reject) => {
  throw new Error(`Your HDD exploded`);
  setTimeout(() => {
    reject(404);
  }, 1500);
});

log(problematicResponse, '\n', problematicResponse.value);
try {
  log(await problematicResponse);
} catch (e) {
  log(problematicResponse.value === e ? e : 'different');
}
debugger;
clear();

const asResFunc = async (_, catColor, catAge) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 200, catColor, catAge });
    }, 1500);
  });
};
const asyncResponse = new Future(asResFunc, {}, 'green-ish blue', Infinity);

log(asyncResponse, '\n', asyncResponse.value);
log(
  await asyncResponse.catch((e) => {
    log(e);
  })
);
log(asyncResponse.value);
debugger;
clear();

const problematicAsyncResponse = new Future(async () => {
  throw new Error(`I/O problems, check your wifi adapter`);
});

log(problematicAsyncResponse, '\n', problematicAsyncResponse.value);
try {
  log(await problematicAsyncResponse);
} catch (_e) {
  log(problematicAsyncResponse.value);
}
debugger;
clear();

async function fetchData(signal) {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1', {
    signal
  });
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

debugger;
clear();

function fileAsync(path) {
  return new Promise((res) => {
    setTimeout(() => {
      res(path);
    }, 1000);
  });
}

function numberAsync(num) {
  return new Promise((res) => {
    setTimeout(() => {
      res(num);
    }, 1000);
  });
}

async function longTask() {
  const file1 = fileAsync('bunny.png');
  const file2 = fileAsync('carrot.png');
  let number = numberAsync(1);
  // avoid awaiting in a loop
  number = await number;
  // long action
  for (let i = 0; i < 100000; i++) {
    number = i * 3;
  }

  // actual use of data
  return (await file1) + (await file2) + number;
}

log(await longTask());
debugger;
