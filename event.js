const EventEmitter = require('events');
const http = require('http');

// class Sales extends EventEmitter{
//     constructor(){
//         super();
//     }
// }

// const myEmitter = new Sales();


// myEmitter.on('newSale', (req, res) => {
//     console.log('There was a new sale');
// });

// myEmitter.on('newSale', () => {
//     console.log('Customer name: Minh Dung');
// });

// myEmitter.on('newSale', (stock) => {
//     console.log(`There are now ${stock} left in stock!`);
// });

// myEmitter.emit('newSale', 9);

//////////////////////////

const server = http.createServer();

server.on('request', (req, res) => {
    console.log('Request received!');
    res.end('Request received!');
});

server.on('request', (req, res) => {
    console.log('Another request!');
});

server.on('close', (req, res) => {
    console.log('Server close!');
});

server.listen(8000, '127.0.0.1', ()=>{
    console.log('Waiting for request!');
});
