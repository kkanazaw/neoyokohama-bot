"use strict";

import co from "co";
import superagent from "superagent";
import cheerio from "cheerio";
import Event from "./event";
const debug = require("debug")("bot:yokohama-arena");

class YokohamaArena{

  constructor(){
    this.url = "http://www.yokohama-arena.co.jp/event/"
  }

  getEvents(){
    return co.wrap(function *(){
      const html = yield this.getHtml();
      const events = this.parseHtml(html);
      return events;
    }).call(this);
  }

  getMajorEvents(){
    return co.wrap(function *(){
      const events = yield this.getEvents();
      return events.filter((i) => { return !(/設営日/.test(i.title)) });
    }).call(this);
  }

  getHtml(){
    debug(`get ${this.url}`);
    return new Promise((resolve, reject) => {
      superagent
        .get(this.url)
        .end((err, res) => {
          if(err) return reject(err);
          return resolve(res.text);
        })
    });
  }

  parseHtml(html){
    const $ = cheerio.load(html, {decodeEntities: false});
    const year = $(".year").eq(0).text() - 0;
    const month = $(".month").eq(0).text() - 0;
    const tds = $("table#event-cal td");
    const events = [];
    var event;
    tds.each((i, el) => {
      switch(i % 6){
      case 0:
        event = null;
        const date = Number.parseInt($(el).text());
        if(!date) break;
        event = new Event();
        event.date.setYear(year);
        event.date.setMonth(month - 1);
        event.date.setDate(date);
        break;
      case 1:
        if(!event) break;
        const title = $(el).text().trim();
        if(!title) break;
        event.set({title: title, where: "横浜アリーナ"});
        break;
      case 2:
        if(!event) break;
        const openAt = $(el).html().trim().replace(/<br>/g, " ");
        if(!openAt) break;
        event.note += `開場${openAt}`
        break;
      case 3:
        if(!event) break;
        const startAt = $(el).html().trim().replace(/<br>/g, " ");
        if(startAt){
          event.note += ` 開演${startAt}`
        }
        if(!event.title) break;
        events.push(event);
        debug(event);
        break;
      }
    });
    return events;
  }

}

export default new YokohamaArena;

if(process.argv[1] === __filename){
  const arena = new YokohamaArena();
  co(function *(){
    console.log(yield arena.getMajorEvents());
  }).catch((err) => {
    console.error(err.stack || err)
  });
}
