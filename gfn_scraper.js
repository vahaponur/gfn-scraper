import puppeteer from 'puppeteer';
const TARGET_URL = 'https://api-prod.nvidia.com/gfngames/v1/gameList';

const POST_JSON2 = "{ apps(country:\"US\" language:\"en_US\" after:\"MTUwMA==\" ) {\n  numberReturned\n  pageInfo {\n    endCursor\n    hasNextPage\n  }\n  items {\n  title\n  sortName\nvariants{\n  appStore\n  publisherName\n  \n    }\n  }\n}}"
;
const POST_JSON1 = "{ apps(country:\"US\" language:\"en_US\") {\n  numberReturned\n  pageInfo {\n    endCursor\n    hasNextPage\n  }\n  items {\n  title\n  sortName\nvariants{\n  appStore\n  publisherName\n  \n    }\n  }\n}}"
;
const POST_JSON3 = "{ apps(country:\"US\" language:\"en_US\" after:\"NzUw\") {\n  numberReturned\n  pageInfo {\n    endCursor\n    hasNextPage\n  }\n  items {\n  title\n  sortName\nvariants{\n  appStore\n  publisherName\n  \n    }\n  }\n}}"
;
class GfnGameData {
    constructor(name, sort_name, variants) {
      this.title = name;
      this.sort_name = sort_name;
      this.app_stores = [];
      this.publisher = null;
      this.register_variants(variants);
    }
  
    register_variants(variants) {
      this.publisher = variants[0]["publisherName"];
      for (let item of variants) {
        this.app_stores.push(item["appStore"]);
      }
    }
  
    toString() {
      return `Name: ${this.title}, Sort Name: ${this.sort_name}, Publisher: ${this.publisher}, App Store: ${this.app_stores}`;
    }
  }
  
  class GFN_Games {
    constructor(ls1,ls2,ls3) {
      this.games = [];
        this.json_to_games(ls1)
        this.json_to_games(ls2)
        this.json_to_games(ls3)
    }
  
    print_games() {
      for (let i of this.games) {
        console.log(i.toString());
      }
    }
  

  
    json_to_games(json_data) {
      const items = json_data["data"]["apps"]["items"];
      for (let item of items) {
        const game = new GfnGameData(item["title"], item["sortName"], item["variants"]);
        this.games.push(game);
      }
    }
  

  }
  
async function getGamesRaw(postdata){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.once('request', request => {
        request.continue({ method: 'POST', postData: postdata });
    });
    await page.goto(TARGET_URL);
    const con = await page.content()
    let innerText = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    }); 
    await browser.close()
    return innerText
    
};
export default async function getGfnGames(){
    let jsonData1=await getGamesRaw(POST_JSON1)
    let jsonData2=await getGamesRaw(POST_JSON2)
    let jsonData3=await getGamesRaw(POST_JSON3)
    return new GFN_Games(jsonData1,jsonData2,jsonData3)
    
}

