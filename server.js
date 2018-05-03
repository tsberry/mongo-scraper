var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

request("https://theguardian.com", function (error, response, html) {
    var $ = cheerio.load(html);
    var results = [];
    var links = [];
    $("a.fc-item__link").each(function (i, element) {
        links.push($(element).attr("href"));
    });
    console.log(links.length);
    scrapeArticle(links, results, 0);
});

function scrapeArticle(links, results, i) {
    console.log(i);
    if (i === links.length) console.log(results);
    else {
        request(links[i], function (error, response, html) {
            var $ = cheerio.load(html);
            var title = $("h1.content__headline").text();
            var summary = $("div.content__standfirst").children("p").text();
            results.push({
                title: title,
                summary: summary,
                link: links[i]
            });
            scrapeArticle(links, results, i + 1);
        });
    }
}