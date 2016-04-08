import axios from "axios";
import cheerio from "cheerio";
import Event from "./event";
const debug = require("debug")("bot:nissan-stadium");

class NissanStadium{

  constructor(){
    this.url = "http://www.nissan-stadium.jp/calendar/index.php";
  }

  async getEvents(){
    const html = await this.getHtml();
    return this.parseHtml(html);
  }

  async getMajorEvents(){
    const events = await this.getEvents();
    return events.filter((i) => { return /(スタジアム|競技場)/.test(i.where) });
  }

  async getHtml(){
    debug(`get ${this.url}`);
    return (await axios.get(this.url)).data;
  }

  parseHtml(html){
    const $ = cheerio.load(html);
    const m = $("#areatitle01 h3").text().match(/(\d{4})年(\d?\d)月/);
    if(!m){
      return null;
    }
    const year  = m[1] - 0;
    const month = m[2] - 0;
    const tds = $("#areacontents01 table td");
    const events = [];
    var date, title;
    tds.each((i, el) => {
      switch(i % 4){
      case 0: {
        date = ($(el).text() || date) - 0;
        break;
      }
      case 2: {
        title = $(el).text().trim() || null;
        break;
      }
      case 3: {
        let where = $(el).text().trim() || null;
        if(title){
          let event = new Event({
            title: title,
            where: where
          });
          event.date = new Date(year, month - 1, date);
          debug(event);
          events.push(event);
          title = null;
        }
        break;
      }
      }
    });
    return events;
  }

}

export default new NissanStadium;

if(process.argv[1] === __filename){
  const nissan = new NissanStadium();
  (async function(){
    console.log(await nissan.getEvents());
  })().catch((err) => {
    console.error(err.stack || err);
  });
}
