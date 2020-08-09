const express = require('express');
const app = express();
const scrapper = require('./scrapper');
const dotenv = require('dotenv');
dotenv.config();


app.get('/', async (req, res, next) => {
    res.send(await scrapper('https://everytime.kr/382283'));
    next();
})


const PORT = process.env.PORT || 8001
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})