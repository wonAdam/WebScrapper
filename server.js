const express = require('express');
const app = express();
const scrapper = require('./scrapper');
const dotenv = require('dotenv');
dotenv.config();

setInterval(() => {
    scrapper('https://everytime.kr/382283'); // cs board
}, 10000)


const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log('server running');
})