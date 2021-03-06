const Resource = require('./models/resource');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
// Un-comment the lines below to populate the database with resources
// const populateDatabase = require('./data');
// populateDatabase();

//mount the body-parser middleware function
app.use(bodyParser.urlencoded({
    extended: true
}));
//to be able to get post data from axios
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
//Require templating engine handlebars. The default file extension is changed to .html
const handlebars = require("express-handlebars")
    .create({
        defaultLayout: 'main',
        extname: '.html'
    });
app.engine("html", handlebars.engine);
app.set("view engine", ".html");
//Enable cross-origin resource sharing (CORS) for the api route
app.use('/api', require('cors')());
//=====================
//   API ROUTES
//=====================
//get a single item
app.get('/api/resources/:id', (req, res) => {
    Resource.findById(req.params.id, (err, resource) => {
        if (err) {
            console.log("Logging out the error: ", err);
            res.status(500).send("Not found");

        } else {
            console.log(resource);
            res.json({
                id: resource._id,
                name: resource.name,
                author: resource.author,
                image: resource.image,
                description: resource.description
            });
        }
    });
});
//get all items
app.get('/api/resources', (req, res) => {
    Resource.find({}, (err, resources) => {
        if (err) {
            res.status(500).send("There was an error retrieving resources from the database");
        } else {
            res.json(resources.map((resource) => {
                return {
                    id: resource._id,
                    name: resource.name,
                    author: resource.author,
                    image: resource.image,
                    type: resource.type,
                    description: resource.description
                };

            }));
        }
    });
});

//delete an item
app.delete('/api/resource/:id', (req, res) => {
    Resource.findByIdAndRemove(req.params.id, (err, result) => {
        if (err) {
            res.status(500).send("There was an error: " + err);
        } else { 
            res.status(200).send(result._id);
        }
    });
});//end of route
  
            
//add an item
//test the API with Postman, select x-www-form-urlencoded in the body
app.post('/api/resource/', (req, res) => {
    var newResource = {
        name: req.body.name,
        image: req.body.image,
        author: req.body.author,
        type: req.body.type,
        description: req.body.description
    };

    Resource.create(newResource, (err, result) => {
        if (err) {
            res.status(500).send("There was an error adding a resource");
        } else {
            res.send(result);
        }
    });
});

//edit item
app.post('/api/resource/:id', (req, res) => {
    Resource.findByIdAndUpdate(req.body.id, req.body, (err, result)=>{
        if(err){
            console.log(err);
        } else {
            res.send("Resource updated!");
        }
    })
}) 

//=====================
//   ROUTES
//=====================
app.get('/react', (req, res)=>{
    res.render('index');
});

app.get('/', function(req, res) {
    var allResources = Resource.find({}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.render('home', {
                resources: data
            });
        }
    });

});
app.get('/about', function(req, res) {
    res.render('about');
});

app.get('/resource/:id', function(req, res) {

    Resource.findById(req.params.id, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.render('result', {
                resource: data
            });
        }
    });
});
app.post('/resource', function(req, res) {
    Resource.findOne({
        name: req.body.name
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.render('result', {
                name: req.body.name,
                resource: data
            });
        }
    });
});
app.post('/delete', function(req, res) {
    Resource.findByIdAndRemove(req.body.resourceID, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});
app.get('/add', function(req, res) {
    res.render('add');
});
app.post('/add', function(req, res) {

    Resource.create(req.body.resource, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});
//default(catch all) route
app.get('*', function(req, res) {
    res.sendFile(`${__dirname}/public/404.html`);
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is up and running");
});