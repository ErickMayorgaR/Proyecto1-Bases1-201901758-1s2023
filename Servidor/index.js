const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const router = require('./Routes/router');


const port = 5000;
const app = express();

app.use(cors());

app.set('port', port);
app.set('json spaces', 2);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// MIDDLEWARES
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);

app.listen(app.get('port'), () => {
    console.log(`SERVIDOR EN PUERTO: ${app.get('port')}`);
});


exports.chat = app;