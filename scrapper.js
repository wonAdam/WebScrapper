const { parse } = require('node-html-parser')
const axios = require('axios').default;
const puppeteer = require('puppeteer');



const scrapper = async (url) => {
    const articlesPage = [];

    return new Promise((res, rej) => {
            
            axios.get(process.env.APIFY_API_URL)
            .then(async (axiosData) => {
            
            try{
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.goto('https://everytime.kr/login');
        
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
            await page2.goto(url);
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
                console.log(`Crawling in ${href}`)
                const page3 = await browser.newPage();
                await page3.setCookie(...cookies);
                await page3.goto('https://everytime.kr' + href);
                await page3.waitForSelector('#writeArticleButton');
                // console.log(await page3.content());
                // console.log('https://everytime.kr/' + hrefs[0]);
                const htmlContent2 = await page3.content();
                const htmlDOM2 = parse(htmlContent2);
                
                const profile = htmlDOM2.querySelector('.profile');
                const author = profile.querySelector('h3').innerHTML;
            
                // Time
                const timeStr = profile.querySelector('time').innerHTML;
                const time = new Date();
                if(timeStr[timeStr.length-1] === '전'){
                    time.setTime(Date.now() - 60 * 1000 * Number(timeStr[0]))
                }
                else if(timeStr[0] === '방'){
                    time.setTime(Date.now())
                }
                else{
                    const year = new Date(Date.now()).getFullYear();
                    const month = new Date(timeStr).getMonth();
                    const day = new Date(timeStr).getDate();
                    const hour = new Date(timeStr).getHours();
                    const min = new Date(timeStr).getMinutes();
                    time.setFullYear(year);
                    time.setMonth(month);
                    time.setDate(day);
                    time.setHours(hour);
                    time.setMinutes(min);
                }
                const container = htmlDOM2.querySelector("#container");
                // console.log('container: ', container !== null)
                const articlesWrapper = container.querySelector("div.wrap.articles");
                // console.log('articlesWrapper: ', articlesWrapper !== null)
                const articleWrapper = articlesWrapper.querySelector("article");
                // console.log('articleWrapper: ', articleWrapper !== null)
                const article_a = articleWrapper.querySelector("a.article");
                // console.log('article_a: ', article_a !== null)
                const content = article_a.querySelector("p.large").innerHTML;
                const commentsWrapper = htmlDOM2.querySelector('.comments')
                const comments = commentsWrapper.querySelectorAll('article').map((a) => {
                    return {
                        author: a.querySelector('h3').innerHTML,
                        content: a.querySelector('p').innerHTML
                        };
                });
                const id = href.split('/')[3]
                articlesPage.push({
                    id,
                    author,
                    time, 
                    content,
                    comments
                })
            
                page3.close();
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