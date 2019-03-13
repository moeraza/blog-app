var expressSanitizer    = require("express-sanitizer"),
methodOverride          = require("method-override"),
bodyParser              = require("body-parser"),
mongoose                =  require("mongoose"),
express                 = require("express"), 
app                     = express();
   

// APP CONFIG ---------
    
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
// The sanitizer must go after body parser
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// MONGOOSE MODEL CONFIG -------
var blogSchema = new mongoose.Schema({
    title: String, 
    image: String, 
    body: String, 
    created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//   title: "Test Blog",
//   image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
//   body: "HELLO THIS IS A BLOG POST!"
// });


// RESTFUL ROUTES ---------

app.get("/", function(req, res) {
    res.redirect("/blogs");    
});


// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
       if(err){
           console.log("ERROR!", err)
       } else {
           res.render("index", {blogs:blogs}); 
       }
    });
    
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE 

app.post("/blogs", function(req, res){
    // Create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
       if(err){
           console.log("ERROR!", err)
           res.render("new");
       } else {
        //   Then, redirect to index
           res.redirect("/blogs"); 
       }
    });
    
});

// SHOW ROUTE ------
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   }); 
});

// EDIT ROUTE -------
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

// UPDATE BLOG
app.put("/blogs/:id", function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs/" + req.params.id);
       }
    });
});


// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
           console.log(err);
       } else {
           res.redirect("/blogs");
       }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("serving blog app on: ",process.env.PORT, "with ip of: ", process.env.IP) 
});