// console.log(arguments);
// console.log(require('module').wrapper);


// module.exports
const C = require('./test-modules/test-modules');
const calc1 = new C();
console.log(calc1.add(4, 5));


//exports
// const calc2 = require('./test-modules/test-module-2');
const {add, multiply} = require('./test-modules/test-module-2')
console.log(add(4,5));
console.log(multiply(4,5));

//caching
require('./test-modules/test-module-3')();
require('./test-modules/test-module-3')();
require('./test-modules/test-module-3')();

