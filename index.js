const fs = require('fs');
const https = require('http');
const url = require('url');

const slugify = require('slugify'); 

const replaceTemplate = require('./modules/replaceTemplate.js');

/////////////////////////////////
// File I/O:

// Blocking, synchronus way
// const txt =  fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(txt);
// const txt2 = `This is what we know about avacado: ${txt}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', txt2);
// console.log("File written!");

// Non-Blocking, asynchronus way
// fs.readFile('./txt/start.txt', 'utf-8',(error, data1) => {
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8',(error, data2) => {
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`, 'utf-8',(error, data3) => {
//             if(error){console.log('This file is not exist!');} 
//             console.log(data3);
//             fs.writeFile(`./txt/final.txt`,`${data2}\n${data3}`,'utf-8',(error) => {
//                 console.log('File has been written!');
//             });
//         });
//     });
// });
// console.log('Will read file!');

////////////////////////////////
//SERVER:
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const value = fs.readFileSync(`./dev-data/data.json`, 'utf-8');

const productData = JSON.parse(value);

const slugs = productData.map(el => slugify(el.productName, {lower:true}));

console.log(slugs);

const server = https.createServer((req, res) => {
    const {query, pathname} = url.parse(req.url, true)
    // const pathname = req.url;
    if (pathname === '/overview' || pathname === '/') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        const cardshtml = productData.map(el => replaceTemplate(tempCard, el)).join('');
        // console.log(cardshtml);
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardshtml);
        res.end(output);
    } else if (pathname === '/product' ) {
        res.writeHead(200, { 'Content-type': 'text/html' });
        const product = productData[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
    }
    else if (pathname === '/api') {
        productData.array.forEach(element => {
            res.se
        });
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(value);
    } else {
        res.writeHead('404', {
            'Content-type': 'text/html',
            'my-own-header': 'hello world!!'
        });
        res.end('<h1>Page not found!</h1>')
    }
});

server.listen(8080, '127.0.0.1', () => {
    console.log('Listening to request on port 8080');
});
