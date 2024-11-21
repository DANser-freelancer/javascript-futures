export default class Future extends Promise {
  constructor(fn, { signal } = {}) {
    let resolve, reject;
    super((res, rej) => {
      resolve = res;
      reject = rej;
    });

    if (!(signal instanceof AbortSignal)) {
      const control = new AbortController();
      Object.defineProperty(this, 'abort', { value: control.abort.bind(control) });
      signal = control.signal;
    }

    const source =
      fn.constructor.name === 'AsyncFunction'
        ? fn(signal)
        : new Promise((res, rej) => {
            fn(res, rej, signal);
          });

    source
      .then((val) => {
        Object.defineProperty(this, 'v', {
          value: val,
          configurable: false
        });
        resolve(val);
      })
      .catch((err) => {
        Object.defineProperty(this, 'v', {
          value: err,
          configurable: false
        });
        reject(err);
      });

    Object.defineProperty(this, 'v', {
      value: null,
      enumerable: true,
      configurable: true
    });
  }
}

// Copyright (c) 2024 [Dan](https://github.com/DANser-freelancer) dans.channels.contact@gmail.com

// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

// 1.  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

// 2.  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

// 3.  Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
