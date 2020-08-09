const express = require('express');
const morgan = require('morgan');
const scrapper = require('./scrapper');
const dotenv = require('dotenv');
dotenv.config({path:'./.env'});
const url = 'https://everytime.kr/382283';
const app = express();

const PORT = process.env.PORT || 8001;

// Middlewares
app.use(morgan('common'));

// Router
app.route('/').get((req, res) => {
    res.send({
        status: 'success',
        data
    });
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


let data;
scrapper(url).then((d) => {
    data = d;
});
setInterval(async () => {
    data = await scrapper(url);
    console.log(data)
}, 15000)