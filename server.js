const express = require('express');
const morgan = require('morgan');
const scrapper = require('./scrapper');
const dotenv = require('dotenv');
const axios = require('axios').default;
dotenv.config({path:'./.env'});
// .env
// APIFY_API_URL = { 에타 비번과 아이디를 보내주는 api url }
// PORT = { 사용할 포트번호 }
const url = 'https://everytime.kr/382283';
const app = express();


let data;

(async () => {
    while(true){
        data = await scrapper(url);
        console.log('************************************************************************');
        console.log('************************* Data Update Complete *************************');
        console.log('************************************************************************');
        
        data.forEach(async(d) => {
            try{
                const res = await axios.post(process.env.EVERY_TIME_ARCHIVER_API_URI, d);
                if(!res.success){
                    const res = await axios.put(process.env.EVERY_TIME_ARCHIVER_API_URI + "/" + d.id, d);
                }
                console.log(`************************** Data ${d.id} Sent ***************************`);
            }catch(err){
                const res = await axios.put(process.env.EVERY_TIME_ARCHIVER_API_URI + "/" + d.id, d);
            }
        })
        
    
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


