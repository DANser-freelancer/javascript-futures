const _async_proto = Object.getPrototypeOf(async () => {});
/**
 * A `Promise`-like object.
 * @param {null | any} value - initially `null`, **readonly** value, replaced with `Promise` result or error
 * @param {undefined | null | Function} abort - `undefined` or method of auto-generated `AbortController`
 * @param {string} state - mimicks internal slot `[[PromiseState]]`
 * @param {boolean} isPending - returns `false` for "resolved" or "rejected" `Future`
 * @example
 * const future = new Future((resolve, reject, signal)=>{
 *  // some code
 * });
 */
export default class Future extends Promise {
  /**
   * @param {Function} fn - synchronous or asynchronous executor function
   * @param {Object} [options] - an object of optional args
   * @param {AbortSignal} [options.signal] - event emitter, used to cancel long running promises
   * @param {*} [rest] - any additional args to pass to the executor
   */
  constructor(fn, { signal } = {}, ...rest) {
    let resolve, reject;
    super((res, rej) => {
      resolve = res;
      reject = rej;
    });

    if (signal instanceof AbortSignal) {
      Object.defineProperty(this, 'abort', {
        value: undefined,
        configurable: true
      });
    } else {
      const control = new AbortController();
      Object.defineProperty(this, 'abort', {
        value: control.abort.bind(control),
        configurable: true
      });
      signal = control.signal;
    }

    const source = Object.prototype.isPrototypeOf.call(_async_proto, fn)
      ? fn(signal, ...rest)
      : new Promise((res, rej) => {
          fn(res, rej, signal, ...rest);
        });

    source
      .then((val) => {
        Object.defineProperties(this, {
          value: {
            value: val,
            configurable: false
          },
          abort: {
            value: null,
            configurable: false
          }
        });
        resolve(val);
        this.#state = 'fulfilled';
        return val;
      })
      .catch((err) => {
        Object.defineProperties(this, {
          value: {
            value: err,
            configurable: false
          },
          abort: {
            value: null,
            configurable: false
          }
        });
        reject(err);
        this.#state = 'rejected';
        return err;
      });

    Object.defineProperty(this, 'value', {
      value: null,
      enumerable: true,
      configurable: true
    });
  }

  // private to be ironclad for dependent methods
  #state = 'pending';

  get state() {
    return this.#state;
  }

  get isPending() {
    return this.#state === 'pending';
  }
}

// Copyright (c) 2024 [Dan](https://github.com/DANser-freelancer) dans.channels.contact@gmail.com

// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

// 1.  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

// 2.  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

// 3.  Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
