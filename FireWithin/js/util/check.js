//***
//*** convenience type checkers with ZERO dependencies (i.e. NO lodash)
//***

// isArray(ref): boolean
export function isArray(ref) {
  return Array.isArray(ref);
}

// isBoolean(ref): boolean
export function isBoolean(ref) {
  return ref === true || ref === false;
}

// isPlainObject(ref): boolean
export function isPlainObject(ref) {
  return typeof ref === 'object' && ref.constructor === Object;
}

// isString(ref): boolean
export function isString(ref) {
  return typeof ref === 'string' || ref instanceof String;
}





/**
 * A convenience assertion utility, used to validate
 * pre-conditions of a routine.
 *
 * **API**: check(condition, msg): void
 *          - throws new Error(msg) WHEN condition is NOT met
 *
 * **Advanced**: check.prefix(msgPrefix): hof-check
 *               - hof-check: a higher-order check function
 *               - same API as check(), but prefixes ALL messages
 *               - NOTE: msgPrefix is accumulative when invoked
 *                       on: hof-check.prefix() ... KOOL!
 *
 * @param {truthy} condition - a "truthy" condition which
 * must be satisfied.
 *
 * @param {string} msg - a message clarifying the condition being
 * checked.
 * 
 * @throws {Error} an Error is thrown when the supplied condition is
 * NOT met.
 */

// our check() generator:
function generateCheck(baseCheckFn, // the base check() function (if any) on which our newly generated function accumulatively based
                       msgPrefix='') {
  const outerMsgPrefix = baseCheckFn ? baseCheckFn.msgPrefix : '';
  const check = (condition, msg) => { // ... the check(condition, msg) function promoted TO our client
    if (!condition) {
      // console.error(`Error: ${outerMsgPrefix + msgPrefix + msg}`); // supplement exception with error log
      throw new Error(outerMsgPrefix + msgPrefix + msg);
    }
  }
  check.msgPrefix = outerMsgPrefix + msgPrefix; // ... retain the accumulative msgPrefixes within our higher-order-functions
  check.prefix = (msgPrefix) => generateCheck(check, msgPrefix); // ... the value-added prefix function
  return check;
}

// the publicly promoted check function (the outer-most one)
export const check = generateCheck();

// run this test (in babel REPL):
// function outer() {
//   check(1===2, 'plain ole check');
// 
//   const checkInner1 = check.prefix('inner1: ');
//   checkInner1(1===2, 'Check it out (should include inner1)');
// 
//   const checkInner2 = checkInner1.prefix('inner2: ');
//   checkInner2(1===2, 'Check it out (should include BOTH inner1/inner2)');
// 
//   const checkInner3 = checkInner2.prefix('inner3: ');
//   checkInner3(1===2, 'Check it out (should include ALL inner1/inner2/inner3)');
// 
//   checkInner2(1===2, 'back to inner2 (should include BOTH inner1/inner2)');
// 
//   checkInner1(1===2, 'back to inner1 (should include inner1)');
// 
//   check(1===2, 'back to plain ole check');
// }
// 
// outer();
