const { parse } = require('node-html-parser')
const axios = require('axios').default;
const puppeteer = require('puppeteer');
const url = require('url')
const moment = require('moment-timezone');

const scrapper = async (board_url) => {
    const articlesPage = [];

    return new Promise((res, rej) => {
            
            axios.get(process.env.APIFY_API_URL)
            .then(async (axiosData) => {
            
            try{
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = await browser.newPage();
                await page.goto('https://everytime.kr/login', {waitUntil : 'networkidle2' }).catch(e => void 0);
            
                console.log('Login')
                // Login
                const navigationPromise = page.waitForNavigation();
                await page.type('#container > form > p:nth-child(1) > input', axiosData.data.username);
                await page.type('#container > form > p:nth-child(2) > input', axiosData.data.password);
                await page.click('#container > form > p.submit > input');
                await navigationPromise; 
                console.log('Login Complete')
                    
                const cookies = await page.cookies();
            
            
                page.close();
                
                console.log('Moving to First Page of the Board')
                const page2 = await browser.newPage();
                await page2.setCookie(...cookies);
                await page2.goto(board_url, {waitUntil : 'networkidle2' }).catch(e => void 0);
                await page2.waitForSelector('#writeArticleButton');
                        
                const htmlContent = await page2.content();
                const htmlDOM = parse(htmlContent);
                const aritcleWrapper = htmlDOM.querySelector('.articles')
                const articles = Array.from(aritcleWrapper.querySelectorAll('a.article'));
                // console.log(articles);
                    
                const hrefs = articles.map((a) => {
                    return a.getAttribute('href');
                })
                    
                        
                    
                page2.close();
                
                console.log('Start to Scrap the Articles')
                // console.log(hrefs); 
                for(const href of hrefs){
                    console.log(`Crawling in ${href}`.green);
                    const page3 = await browser.newPage();
                    await page3.setCookie(...cookies);
                    await page3.goto(url.resolve('https://everytime.kr',href), {waitUntil : 'networkidle2' }).catch(e => void 0);
                    await page3.waitForSelector('#writeArticleButton');
                    // console.log(await page3.content());
                    // console.log('https://everytime.kr/' + hrefs[0]);
                    const htmlContent2 = await page3.content();
                    const htmlDOM2 = parse(htmlContent2);
                    
                    const profile = htmlDOM2.querySelector('.profile');
                    const author = profile.querySelector('h3').innerHTML;
                
                    // Time
                    const timeStr = profile.querySelector('time').innerHTML;
                    const tmp_time = moment(new Date()).tz('Asia/Seoul');
                    if(timeStr[timeStr.length-1] === '전'){ // @@분 전 / @분 전
                        if(timeStr.length <= 4)
                            tmp_time.minute(tmp_time.minute() - Number(timeStr[0]))
                        else 
                            tmp_time.minute(tmp_time.minute() - Number(timeStr.slice(0,2)))
                    }
                    else if(timeStr[0] === '방'){ // 방금
                        // nothing to do
                    }
                    else if(timeStr.length === 14){ // @@/@@/@@ @@:@@ (작년이전) // 19/06/07 19:58
                        const year = Number(timeStr.slice(0,2));
                        const month = Number(timeStr.slice(3,5))-1;
                        const date = Number(timeStr.slice(6,8));
                        const hour = Number(timeStr.slice(9,11));
                        const min = Number(timeStr.slice(12,14));
                        tmp_time.year(2000+year);
                        tmp_time.month(month);
                        tmp_time.date(date);
                        tmp_time.hour(hour);
                        tmp_time.minute(min);                    
                    }
                    else{ // 1시간후 올해 
                        const year = new Date(Date.now()).getFullYear();
                        const month = Number(timeStr.slice(0,2))-1;
                        const date = Number(timeStr.slice(3,5));
                        const hour = Number(timeStr.slice(6,8));
                        const min = Number(timeStr.slice(9,11));
                        tmp_time.year(year);
                        tmp_time.month(month);
                        tmp_time.date(date);
                        tmp_time.hour(hour);
                        tmp_time.minute(min);
                    }
                    const time = tmp_time.format();



                    const container = htmlDOM2.querySelector("#container");
                    // console.log('container: ', container !== null)
                    const articlesWrapper = container.querySelector("div.wrap.articles");
                    // console.log('articlesWrapper: ', articlesWrapper !== null)
                    const articleWrapper = articlesWrapper.querySelector("article");
                    // console.log('articleWrapper: ', articleWrapper !== null)
                    const article_a = articleWrapper.querySelector("a.article");
                    const likes = Number(article_a.querySelector(".vote").innerHTML);
                    const scraps = Number(article_a.querySelector(".scrap").innerHTML);
                    // console.log('article_a: ', article_a !== null)
                    const content = article_a.querySelector("p.large").innerHTML;
                    const commentsWrapper = htmlDOM2.querySelector('.comments')
                    const comments = commentsWrapper.querySelectorAll('article').map((a) => {
                        const commentvotestatus  = a.querySelector('.commentvotestatus');
                        const commentvote = commentvotestatus.querySelector('.commentvote');
                        const likes = commentvote.innerHTML;
                        const timeStr = a.querySelector('time').innerHTML;
                        const tmp_time = moment(new Date()).tz('Asia/Seoul');
                        if(timeStr[timeStr.length-1] === '전'){
                            if(timeStr.length <= 4)
                                tmp_time.minute(tmp_time.minute() - Number(timeStr[0]))
                            else 
                                tmp_time.minute(tmp_time.minute() - Number(timeStr.slice(0,2)))
                        }
                        else if(timeStr[0] === '방'){
                            // nothing to do
                        }
                        else if(timeStr.length === 14){
                            const year = Number(timeStr.slice(0,2));
                            const month = Number(timeStr.slice(3,5))-1;
                            const date = Number(timeStr.slice(6,8));
                            const hour = Number(timeStr.slice(9,11));
                            const min = Number(timeStr.slice(12,14));
                            tmp_time.year(year);
                            tmp_time.month(month);
                            tmp_time.date(date);
                            tmp_time.hour(hour);
                            tmp_time.minute(min);    
                        }
                        else{
                            const year = new Date(Date.now()).getFullYear();
                            const month = Number(timeStr.slice(0,2))-1;
                            const date = Number(timeStr.slice(3,5));
                            const hour = Number(timeStr.slice(6,8));
                            const min = Number(timeStr.slice(9,11));
                            tmp_time.year(year);
                            tmp_time.month(month);
                            tmp_time.date(date);
                            tmp_time.hour(hour);
                            tmp_time.minute(min);
                        }
                        const time = tmp_time.format();

                        return {
                            isChild: a.classNames[0] === "child",
                            author: a.querySelector('h3').innerHTML,
                            content: a.querySelector('p').innerHTML,
                            time,
                            likes
                            };
                    });
                    const id = href.split('/')[3]
                    articlesPage.push({
                        id,
                        author,
                        time, 
                        content,
                        likes,
                        scraps,
                        comments
                    })
                
                    page3.close();
                    console.log(`            ${href} Scrapped !`.green);
                }

                    
                await browser.close();
                res(articlesPage);
                
            }catch(e){
                console.log(e);
                rej(e);
            }
        }) // end of axios then

    }) // end of Promise

    
}

module.exports = scrapper;