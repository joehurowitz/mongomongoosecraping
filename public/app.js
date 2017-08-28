// Grab the articles as a json from mongoDB ????
$(document).ready(function(){   
    $.getJSON("/articles",function(data){
      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page data_id is ARTICLE ID
     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<a href=" +data[i].link+ ">" +data[i].link+"</a>"  + "</p>");
      }
    });
});

$("#scrape").on("click", function(e){

  $.getJSON("/scrape", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
     
    }

  });
  console.log("Scrape Complete");

});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article  REFACTOR INTO STANDALONE FUNCTION    ie  "show comment form"
      $("#comments").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#comments").append("<input id='titleinput' name='title' >");
      // An input to enter a new title
      $("#comments").append("<input id='article_id_input' name='article_id' hidden=true value="+ thisId +">");
      // A textarea to add a new note body
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
      // data._id of the Article 
      $("#comments").append("<button data-id='" + data._id + "' id='viewcomment'>View all Comments</button>");

      $("#comments").append("<button data-id='" + data._id + "' id='deletecomment'>Delete Comment</button>");

      // If there's a note in the article
      if (data.comment) {
        // Place the title of the note in the title input
        // add index to data[0].comment ?   how do I get the last element
        $("#titleinput").val(data.comment.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.comment.body);
        console.log(data.comment.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savecomment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id"); // ARTICLE ID

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST", //server.js 147
    url: "/commentOnArticle/" + thisId, // ARTICLE ID
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),

      article: thisId
    }
  })
    // With that done
    .done(function(comment) {
      // Log the response
      console.log("Article ID : " + thisId);
      // Empty the notes section
     // $("#comments").empty();
    
    });

  // Also, remove the values entered in the input and textarea for note entry
  //$("#titleinput").val("");
 // $("#bodyinput").val("");
});


$(document).on("click","#viewcomment",
    function(){

  var thisId = $(this).attr("data-id");
  console.log("app.js 105 Current Article Id" , thisId);

    $.ajax({
      method: "GET",
      url: "/comments/" + thisId
     // url:'/articles/:article_id/comments/:id'
    })
      // With that done
      .done(function(comment) {
        // Log the response
        console.log( "All comments" , comment);

        if (comment) {
          $("#allComments").empty();
          $("#allComments").append(comment.title + " : " + comment.body + " | ");
        } else {
        //$("#allComments").append("");
        }

      });
  //   // Also, remove the values entered in the input and textarea for note entry
  //   $("#titleinput").val(data.title);
  //   $("#bodyinput").val(data.body);
 });


$(document).on("click","#deletecomment", function(){
        var thisId = $(this).attr("data-id");
    $.ajax({
      method : "DELETE",
      url: "/allCommentsFromArticle/" + thisId,
      
    })
    .done(function(){


       console.log("deleted" + comment);
    });




  });










