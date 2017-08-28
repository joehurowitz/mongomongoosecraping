/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
var User = require("./models/User.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises



// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));
const MONGODB_URI = process.env.MONGODB_URI
|| "mongodb://heroku_cm4475zb:8p060k38lkjufq3bggjde9gfpg@ds151222.mlab.com:51222/heroku_cm4475zb";
const PORT = process.env.PORT || 3000
mongoose.Promise = Promise;
// Database configuration with mongoose
mongoose.connect(MONGODB_URI);
//mongoose.connect("mongodb://localhost/newScraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
 request("http://www.reuters.com", function(error, response, html) {

  //request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
      $("h3.article-heading").each(function(i, element) {
    //$("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).text();
      result.link = "http://www.reuters.com/" + $(element).find("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });


    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
  res.redirect("/");
});

// This will get the articles we scraped from the mongoDB
//mapped route  points to this as endpoint on server.js
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// express puts into params the name I define =  article_id is a key whose value is whateveris in that blank..
app.get("/comments/:article_id", function(req, res) {
  // Grab every doc in the Articles array
  Comment.findOne({article:req.params.article_id}, function(error,doc){

    
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
      console.log("found comment from .findOne" , doc);
    }
 
  });
});



// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it in the Article Schema
  // populate comments field in Article Schema
  .populate("comments") 
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
      console.log("article" , JSON.stringify(doc,null,2));
    }
  });
});


// Create a new note or replace an existing note
app.post("/commentOnArticle/:article_id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new note the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's comment
      Article.findOneAndUpdate({ "_id": req.params.article_id }, {$push:{ "comments": doc._id }})
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
          console.log(res);
        }
      });
    }
  });
});

    // Route for deleting comment 
app.delete('/allCommentsFromArticle/:article_id',function(req,res){
Comment.remove({article:req.params.article_id})

    .exec(function(err,doc){
      if(err){

      }
      else{
        console.log("all comments removed from Article : "+ req.params.article_id);
        // DO SOMETHING  
    }

  });

});


// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
