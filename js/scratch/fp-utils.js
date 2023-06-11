/* Curry Explanation
https://gist.github.com/bendc/9b05735dfa6966859025
Example: add3(x,y,z), arity 3. Curried version is cAdd3. let add20 = cAdd3(20), 1 < 3 so recursion starts.
add20 = curried(20, ...more). add20(8,2) would result in 3!<3 so it would return add3(20,8,2).
let incr21 = add20(1) = curried(20, 1). 2 < 3 so it would return curried(20, 1, ...more).
incr21(5) would call curried(20, 1, 5), which would return add3(20,1,5).


// more verbose version for explanation
const curry = targetFunction => {
  const arity = targetFunction.length // number of arguments the function has

  const curried = (...argsIn) => {
    if (argsIn.length < arity) {
      return (...allowMoreArgs) => curried(...argsIn, ...allowMoreArgs)
    } else {
      return targetFunction(...argsIn)
    }
  }
  return curried
}
*/
export const curry = f => {
  const curried = (...args) =>
    args.length < f.length ? (...more) => curried(...args, ...more) : f(...args)
  return curried
}

// Basic FP
export const id = x => x
export const map = curry((f, arr) => arr.map(f))
export const filter = curry((boolFun, arr) => arr.filter(boolFun))
export const take = n => arr => arr.slice(0, n)
export const join = s => arr => arr.join(s)

export const compose =
  (...fs) =>
  x =>
    fs.reduceRight((y, f) => f(y), x)

export const pipe =
  (...fs) =>
  x =>
    fs.reduce((y, f) => f(y), x)
