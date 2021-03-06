var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");

var app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.PORT || 7000;

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const comment = new Schema({
    id: ObjectId,
    text: String
});

const article = new Schema({
    id: ObjectId,
    title: String,
    summary: String,
    link: String,
    comments: [comment]
});



const Article = mongoose.model('Article', article);



app.get("/", function (req, res) {
    Article.find({}, function (error, docs) {
        res.render("index", { docs: docs });
    });
});

app.get("/articles/:id", function (req, res) {
    Article.find({ _id: req.params.id }, function (error, docs) {
        res.render("article", docs[0]);
    });
});

app.post("/api/comments", function (req, res) {
    var id = req.body.id;
    var text = req.body.comment;
    console.log(id);
    Article.find({ _id: id }, function (error, docs) {
        console.log(docs[0]);
        docs[0].comments.push({text: text});
        docs[0].save(function (err) {
            if (!err) console.log("Success! Added comment: " + text);
            res.end();
        });
    });
});

app.post("/api/scrape", function (req, res) {
    request("https://theguardian.com", function (error, response, html) {
        var $ = cheerio.load(html);
        // var results = [];
        var links = [];
        $("a.fc-item__link").each(function (i, element) {
            links.push($(element).attr("href"));
        });
        console.log(links.length);
        scrapeArticle(links, 0, res);
    });
});

function scrapeArticle(links, i, res) {
    console.log(i);
    if (i === links.length) res.end();
    else {
        Article.find({ link: links[i] }, function (error, docs) {
            if (docs.length > 0) {
                console.log("Article already in database!");
                scrapeArticle(links, i + 1, res);
            }
            else {
                request(links[i], function (error, response, html) {
                    var $ = cheerio.load(html);
                    var title = $("h1.content__headline").text();
                    var summary = $("div.content__standfirst").children("p").text();
                    var newArticle = Article();
                    newArticle.title = title;
                    newArticle.summary = summary;
                    newArticle.link = links[i];
                    newArticle.save(function (err) {
                        if (!err) console.log(`Success! Added ${title}`);
                    })
                    scrapeArticle(links, i + 1, res);
                });
            }
        });
    }
}

app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT + "!");
});