const express = require('express');
const morgan = require('morgan');
const scrapper = require('./scrapper');
const url = require('url');
const dotenv = require('dotenv');
const colors = require('colors');
const moment = require('moment-timezone');
const axios = require('axios').default;
const isScrapping = require('./scrapperWorkingMem');
dotenv.config({path:'./.env'});
// .env
// APIFY_API_URL = { 에타 비번과 아이디를 보내주는 api url }
// PORT = { 사용할 포트번호 }
// ARCHIVER_API_URI = { 아카이버 scrapperJobDone GET }
const board_url = 'https://everytime.kr/382283';
const app = express();

let data;
let currIntervalGap = 0;
const scrapping = async () => {
    console.log(`Current Interval Gap: ${currIntervalGap}`);
    let startTime = moment(new Date());
    try{
        data = await scrapper(board_url);
        console.log('************************************************************************');
        console.log('************************* Data Update Complete *************************');
        console.log('************************************************************************');

    }catch(err){
        console.log(`Scrapping Error`);
        console.log(`${err.message}`);
    }
    let endTime = moment(new Date());
    console.log(`scrapping took ${endTime - startTime} (endTime - startTime)`);
    
    currIntervalGap = endTime - startTime;
    
    while(true){
        try{
            let res = await axios.get(process.env.ARCHIVER_API_JOBDONE_URI);
            if(res.data.success) {
                console.log('ARCHIVER JOBDONE REQUEST SUCCEED')
                break;
            }
        }catch(err){
            console.log(err);
        }    
    }

    setTimeout(scrapping, 5000);
    
};
setTimeout(scrapping, 1000);


setInterval(async () => {
    try{
        console.log(`Wake Up Call For Archiver API`.blue);
        const res = await axios.get(process.env.EVERY_TIME_ARCHIVER_API_URI);
        console.log(`success: ${res.data.success}`.blue);
        console.log('isScrapping: ');
        console.log(isScrapping);

    }catch(err){
        console.log(`WAKE UP CALL FAIL`.red)
    }
}, 30000)

// Middlewares
app.use(morgan('common'));

// Router
app.route('/').get(async (req, res) => {
    res.send({
        status: 'success',
        start:isScrapping,
        data
    });
    console.log('#########################Sending Response Complete#########################'.cyan);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
    const server_seoul_start_time = moment(new Date()).tz('Asia/Seoul');
    console.log(`Time at Seoul : ${server_seoul_start_time}`);
    const server_local_start_time = moment(new Date());
    console.log(`Time at Local : ${server_local_start_time}`);

});


