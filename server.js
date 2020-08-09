const express = require('express');
const morgan = require('morgan');
const timeout = require('connect-timeout');
const scrapper = require('./scrapper');
const dotenv = require('dotenv');
dotenv.config({path:'./.env'});
const url = 'https://everytime.kr/382283';
const app = express();


let data;
scrapper(url).then(function(d){
    data = d;
});
setInterval(async function () {
    data = await scrapper(url);
    console.log(data)
}, 30000)


// Middlewares
app.use(morgan('common'));
app.use(timeout('59s'))

// Router
app.route('/').get(async (req, res) => {
    // const data = await scrapper(url)
    res.send({
        status: 'success',
        data
    });
    console.log(data);
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


