const fs = require('fs');
const superagent = require('superagent');

const readFilePro = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject('I could not find that file');
            resolve(data);
        })
    });
};

const writeFilePro = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, (err) => {
            if (err) reject('Could not write the file!');
            resolve('Write successfully!');
        })
    });
};

const getDogPic = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`);
        console.log(`Breed: ${data}`);

        const res1Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        
        const res2Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

        const res3Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

        const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
        const imgs = all.map(x => x.body.message);
        console.log(imgs);
        // console.log(res.body.message);

        await writeFilePro(`${__dirname}/dog-img.txt`, imgs.join('\n'));
        console.log('Random image saved to file!');
    } catch (err) {
        // console.log(err);
        throw err;
    }
    return "2: Ready!"
};

(async () => {
    try{
        console.log('1: Will get dog pics!');
        const res = await getDogPic();
        console.log(res);
        console.log('3: Done getting dog pics');
    }catch(err){
        console.log(err);
    }
})();


// console.log(getDogPic());

// getDogPic()
//     .then(x => {
//         console.log(x);
//         console.log('3: Done getting dog pics');
//     })
//     .catch(err => {
//         console.log(err);
//     });


/*
readFilePro(`${__dirname}/doggg.txt`)
    .then(data => {
        console.log(`Breed: ${data}`);
        return superagent
            .get(`https://dog.ceo/api/breed/${data}/images/random`)
    })
    .then(data => {
        return writeFilePro(`${__dirname}/dog-img.txt`, data.body.message);

        // fs.writeFile(`${__dirname}/dog-img.txt`, data.body.message, err => {
        //     if(err) return console.log(err.message);
        //     console.log('Random dog is saved to file');
        // });
    })
    .then(data => {
        console.log('Random dog is saved to file');
    })
    .catch(err => {
        console.log(err);
    });
*/
