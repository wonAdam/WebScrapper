const Apify = require('apify');
const { parse } = require('node-html-parser')
const request = require('request');

mongoose.connect(process.env.MONGO_CONNECT, {useNewUrlParser: true});

const scrap_board = (url) => {

    const articlesPage = {
        articles:[]
    }

    Apify.main(async () => {
    
        let input;
        await request(process.env.APIFY_API_URL, 
            function (error, response, body) {
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
            input = JSON.parse(body);
            // console.log(input);
            });
    
        const browser = await Apify.launchPuppeteer();
        const page = await browser.newPage();
        await page.goto('https://everytime.kr/login');
    
        // Login
        const navigationPromise = page.waitForNavigation();
        await page.type('input[name="userid"]', input.username);
        await page.type('input[name="password"]', input.password);
        await page.click('input[type="submit"]');
        await navigationPromise; 
    
        const cookies = await page.cookies();
    
        page.close();

        const page2 = await browser.newPage();
        await page2.setCookie(...cookies);
        await page2.goto(url);
        await page2.waitForSelector('#writeArticleButton');
        
        // console.log(await page2.content())
    
        const htmlContent = await page2.content();
        const htmlDOM = parse(htmlContent);
        const aritcleWrapper = htmlDOM.querySelector('.articles')
        const articles = Array.from(aritcleWrapper.querySelectorAll('a.article'));
        // console.log(articles);
    
        const hrefs = articles.map((a) => {
            return a.getAttribute('href');
        })
    
        
    
        page2.close();


        console.log(hrefs); 
        for(const href of hrefs){
            const page3 = await browser.newPage();
            await page3.setCookie(...cookies);
            await page3.goto('https://everytime.kr' + href);
            await page3.waitForSelector('.profile');
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
            
            
            const content = htmlDOM2.querySelector('.wrap.articles').querySelector('article').querySelector('a.article').querySelector('p').innerHTML;
            const commentsWrapper = htmlDOM2.querySelector('.comments')
            const comments = commentsWrapper.querySelectorAll('article').map((a) => {
                return {
                    author: a.querySelector('h3').innerHTML,
                    content: a.querySelector('p').innerHTML
                };
            });
            const id = htmlDOM2.querySelector('.status').querySelector('.messagesend').getAttribute('data-article-id');
            articlesPage.articles.push({
                id,
                author,
                time, 
                content,
                comments
            })

            // debug
            // console.log(profile.innerHTML);
            // console.log(content.innerHTML);
            // console.log(comments);
            page3.close();
        }
    
        console.dir(articlesPage)
    
        await browser.close();
    
        console.log('Done.');
    })

    
}


module.exports = scrapper;





