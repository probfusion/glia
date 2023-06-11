// fp helpers
// function curry(f) {
//   function curried(...args) {
//     args.length < f.length
//       ? function recurse(...more) {
//           return curried(...args, ...more)
//         }
//       : f(...args)
//   }
//   return curried
// }

const curry = (f) => {
  const curried = (...args) => (args.length < f.length ? (...more) => curried(...args, ...more) : f(...args))
  return curried
}

// State variables

const types = [
  // Primitives
  { name: "String", right: ["a", String.raw`\a`] },
  { name: "Number", right: [1, 1.1, BigInt(1), NaN, Infinity, Math.PI] },
  { name: "BigInt", right: [BigInt(1)], wrong: [Math.pow(2, 53)] },
  { name: "Boolean", right: [true, false] },
  { name: "Undefined", right: [undefined] },
  { name: "Symbol", right: [Symbol()] },
  { name: "Null", right: [null] },
  // Numbers
  { name: "Integer", right: [1, BigInt(1)], wrong: [1.1] },
  { name: "Float", right: [1.1, Math.PI], wrong: [1, BigInt(1)] },
  { name: "SafeInt", right: [1, Math.pow(2, 53) - 1] },
  { name: "UnsafeInt", right: [Math.pow(2, 53)] },
  { name: "NaN", right: [NaN] },
  { name: "Infinity", right: [Infinity], wrong: [-Infinity] },
  { name: "NegInfinity", right: [-Infinity], wrong: [Infinity] },
  // Function (is also an object)
  { name: "Function", right: [() => 1, new Function()] },
  // Objects
  { name: "Object", right: [new Date()] },
  { name: "Array", right: [[1, 2]] },
  { name: "Date", right: [new Date()] },
  { name: "Math", right: [Math] },
  { name: "Error", right: [new Error(), new ReferenceError()] },
  // Other
  { name: "Char", right: ["a"], wrong: ["abc"] },
]
// Hierarchical groups that aren't default
const groups = {
  Number: ["Float", "Integer", "SafeInt", "UnsafeInt", "NaN", "Infinity", "NegInfinity"],
  Object: ["Function"], // Note: null not counted as object since it's a bug
  ObjectKey: ["String", "Symbol"],
  GlobalProp: ["Infinity"],
  String: ["Char"],
  // Not included:
  // Iterator - not a global object yet.
}

// Testing
const protoStr = (x) => Object.prototype.toString.call(x).slice(8, -1)
const consName = (x) => x?.constructor?.name
const protoName = (x) => (x?.name ? x.name : x?.className)
const logNames = (x) =>
  console.table({
    proto: protoStr(x),
    cons: consName(x),
    protoName: protoName(x),
  })
console.log(protoStr(new Date()))
console.log(protoStr(new Date("invalid")))
console.log(new Date("invalid").constructor.name)
console.log(types[0])
let testDate = new Date("2023-05-28T07:12:26.1239-04:00")
console.log(testDate.getMilliseconds())
logNames(ReferenceError())

let arrayIter = [1, 2, 3].values()
let testProto = Object.getPrototypeOf(Object.getPrototypeOf({}))
console.log(protoStr(arrayIter))
console.log(testProto)
console.log(Date("2021-02-02")?.name)
logNames(Math)

// Functions
// const addToIncorrect = curry((obj, val, excl, incl) => )
console.log(protoStr(undefined))
// Operators to functions
const is = curry((ref, x) => ref === x)
const and = curry((x, y) => x && y)
const typeOf = (x) => typeof x
const not = (x) => !x

// is
const isOfType = curry((typeStr, x) => is(typeStr, typeOf(x)))

// const eqFun = f => fx => x => f(fx)  x
// const isTypeof = typeOf("")

console.log(typeof Math.pow(2, 53))
const check = {
  isNumber: isOfType("number"),
  isInf: is(Number.POSITIVE_INFINITY),
  isNegInf: is(Number.NEGATIVE_INFINITY),
  isNaN: isNaN,
  isBigInt: isOfType("bigint"),
  isInteger: Number.isInteger,
  isFloat: [isOfType("number"), not(isNaN), not(Number.isInteger)].reduce((f, g) => f && g),
  test: Number.isInteger,
}
function getVarType(x) {}
console.log(check.test)

const comp = (f) => (g) => (x) => f(g(x))
const inc = (x) => x + 1
const mul = (y) => (x) => x * y

comp(mul)(inc)(1)(2) // 4
comp(mul)(inc)(3)(2) // 8

const test = 'This is a test.'
module.exports = { test }
