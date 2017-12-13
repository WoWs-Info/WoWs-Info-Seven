import { API } from '../../constant/value';
import { ServerManager } from '../../core';

class NewsParser {
  constructor(index, language) {
    var format = require('string-format');
    var link = format(API.News, ServerManager.getDomainFrom(index));
    this.baseUrl = link;
    switch (index) {
      case 0:  this.url = link; break;
      case 1:
        switch (language) {
          case 'ja':
          case 'ko':
          case 'th': this.url = link + language + '/'; break;
          // There is only Traditional Chinese... What could I do?
          case 'zh':
          case 'zh-cn':
          case 'zh-Hans':
          case 'zh-Hant':
          case 'zh-tw': this.url = link + 'zh-tw/'; break;
          default: this.url = link + 'en/'; break;
        }
      case 2:
        switch (language) {
          case 'es':
          case 'es-mx': this.url = link + 'es-mx/'; break;
          case 'pt':
          case 'pt-br': this.url = link + 'pt-br/'; break;
          default: this.url = link + 'en/'; break;
        }
      case 3:
        switch (language) {
          case 'cs':
          case 'de':
          case 'es':
          case 'fr':
          case 'it':
          case 'pl':
          case 'tr': this.url = link + language + '/'; break;
          default: this.url = link + 'en/'; break;
        }
      // Chinese server... 
      default: this.url = 'https://worldofwarships.asia/zh-tw/'; break;
    }
  }

  async getNews() {
    try {
      console.log(this.url);
      let response = await fetch(this.url);
      let html = await response.text();
      var HTMLParser = require('fast-html-parser');
      let root = HTMLParser.parse(html);

      // Title and rest
      var news = [];
      let title = this.getNewsFrom(root, '._super-layout');
      let rest = this.getNewsFrom(root, '._simple-layout');
      // Merge them together
      news = title.concat(rest);
      console.log('News is here\n' + news);
      return news;
    } catch (error) {
      console.error(error);
    }
  }

  getNewsFrom(root, className) {
    var news = [];
    let title = root.querySelector(className).childNodes;
    for (var i = 0; i < title.length; i++) {
      var curr = title[i];
      if (curr.isWhitespace) continue;
      // This is the last node which is to load more news
      if (curr.tagName == 'vue') continue; 
      curr = curr.childNodes[1].childNodes;
      var newsInfo = {};
      for (var j = 0; j < curr.length; j++) {
        let info = curr[j];
        if (info.isWhitespace) continue;
        // 7 means it is important 
        let data = (info.childNodes.length == 7) ? this.getUseful(info, true) : this.getUseful(info, false);
        newsInfo = Object.assign({}, newsInfo, data);
      }
      news.push(newsInfo);
      // console.log(news);
    }
    return news;
  }

  getUseful(info, title) {
    var newsInfo = {}; 
    if (info.tagName == 'div') {
      // This is for text and image
      var textIndex = 3; var imageIndex = 1;
      if (title == true) {
        textIndex = 5; 
        imageIndex = 3;
      }
      let text = info.childNodes[textIndex].structuredText.split(/\r?\n/);
      newsInfo.title = text[0];
      newsInfo.time = text[1];
      // Get imgae and use a smaller size
      var image = info.childNodes[imageIndex].childNodes[1].attributes.style.split("('")[1].split("')");
      newsInfo.image = 'https:' + image[0].replace('1200x', '660x');
    } else if (info.tagName == 'a') {
      // This is for link (make // -> /)
      newsInfo.link = this.baseUrl + info.attributes.href.substr(1);
    }
    return newsInfo;
  }
}

export {NewsParser};