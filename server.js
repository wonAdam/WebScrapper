const express = require('express');
const morgan = require('morgan');
const scrapper = require('./scrapper');
const url = require('url');
const dotenv = require('dotenv');
const colors = require('colors');
const axios = require('axios').default;
dotenv.config({path:'./.env'});
// .env
// APIFY_API_URL = { 에타 비번과 아이디를 보내주는 api url }
// PORT = { 사용할 포트번호 }
const board_url = 'https://everytime.kr/382283';
const app = express();


let data;

(async () => {
    while(true){
        data = await scrapper(board_url);
        console.log('************************************************************************');
        console.log('************************* Data Update Complete *************************');
        console.log('************************************************************************');
    }
})()

// Middlewares
app.use(morgan('common'));

// Router
app.route('/').get(async (req, res) => {
    res.send({
        status: 'success',
        data
    });
    console.log('#########################Sending Response Complete#########################');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


