const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught rejection!');
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');


mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).then(con => {
    // console.log(con.connections);
    console.log("DB connection successfully");
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection!');
    server.close(() => {
        process.exit(1);
    });
});


