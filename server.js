var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

request("https://theguardian.com", function(error, response, html) {
    var $ = cheerio.load(html);
    var results = [];

    $("a.fc-item__link").each(function (i, element) {

        var link = $(element).attr("href");
        var kicker = $(element).children(".fc-item__kicker").text();
        var title = $(element).children(".fc-item__headline").text();

        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
            kicker: kicker,
            title: title,
            link: link
        });
    });

    console.log(results);
});

