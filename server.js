

// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express');        // call express
var bodyParser 	= require('body-parser');
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express")
var Robot     	= require('./app/models/robot');
var path = require('path');
var app        	= express();


var mongoose   	= require('mongoose');
mongoose.connect('mongodb://node:node@ds011158.mongolab.com:11158/simple', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
}); // connect to our database

// configure app to use bodyParser()
// this will let us get the data from a POST

var subpath = express();
app.use("/v1", subpath);
swagger.setAppHandler(subpath);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static('dist'));

var port = process.env.PORT || 8080;        // set our port




swagger.setApiInfo({
        title: "example API",
        description: "API to do something, manage something...",
        termsOfServiceUrl: "",
        contact: "yourname@something.com",
        license: "",
        licenseUrl: ""
    });

// Set api-doc path
swagger.configureSwaggerPaths('', 'api-docs', '');

// Configure the API domain
var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
else
    console.log('No --domain=xxx specified, taking default hostname "localhost".')

if(argv.port !== undefined)
	port = argv.port;
else
    console.log('No --port=xxx specified, taking default port ' + port + '.')

var applicationUrl = 'http://' + domain + ':' + port;
console.log('API running on ' + applicationUrl);


swagger.configure(applicationUrl, '1.0.0');


app.get('/', function (req, res) {
        res.sendFile(__dirname + '/dist/index.html');
    });






// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.render('index', {title: 'Building API', message: 'Enter the building_id'}); 
});

// more routes for our API will happen here

router.get('/:building_id', function(req, res){
	res.render('building', {title: 'Building API'});
})

// on routes that end in /robot
// ----------------------------------------------------
router.route('/:building_id/robots')

    // create a robot (accessed at POST http://localhost:8080/api/)
	.post(function(req, res) {
        console.log("Posting");
	var robot = new Robot();      // create a new instance of the robot model
        robot.home = req.params.building_id; // set the robots home building
        robot.name = req.body.c_name;  // set the robots name (comes from the request)
        robot.updated = Date.now();
        robot.movement = 'tracks';
        robot.offensive = false;
        robot.emergency = false;
        robot.floor = 0;
        robot.x_pos = 0;
        robot.y_pos = 0;

	
        //if these values are available they will be set accordingly
        if (req.body.c_movement)
        	robot.movement = req.body.c_movement;
        if (req.body.c_offensive)
        	robot.offensive = req.body.c_offensive;
        if (req.body.c_emergency)
        	robot.emergency = req.body.c_emergency;
        if (req.body.c_floor)
        	robot.floor = req.body.c_floor;
        if (req.body.c_x_pos)
        	robot.x_pos = req.body.c_x_pos;
        if (req.body.c_y_pos)
        	robot.y_pos = req.body.c_y_pos;
	if (req.body.c_movement)
		robot.movement = req.body.c_movement;

        // save the robot and check for errors
        robot.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Robot created!' });
        });
        
    })

    // get all the robots (accessed at GET http://localhost:8080/api/:building_id/robots)
    .get(function(req, res) {
        console.log("GET /api/builiding_id/robots");
        Robot.find({}, function(err, robots) {
        	var robotMap = {};

        	robots.forEach(function(robot){
        		if (robot.home == req.params.building_id)
        			robotMap[robot._id] = robot;	
        	});
            if (err)
                res.send(err);

            res.json(robotMap);
        });
    })

// on routes that end in /robot/:robot_id
// ----------------------------------------------------
router.route('/:building_id/robots/:robot_id')

    // update the robot with this id (accessed at PUT http://localhost:8080/api/robots/:robot_id)
    .post(function(req, res) {
	console.log("Here111");

        // use our robot model to find the robot we want
        Robot.findById(req.params.robot_id, function(err, robot) {
		console.log(robot);	
       
		console.log(req.params);
		console.log("body");
		console.log(req.body);

	    if (err)
                res.send(err);
 
	    robot.updated = Date.now();

	        //if these values are available they will be set accordingly
	        if (req.body.name)
	        	robot.name = req.body.name;
	        if (req.body.movement)
	        	robot.movement = req.body.movement;
	        if (req.body.offensive)
	        	robot.offensive = req.body.offensive;
	        if (req.body.emergency)
	        	robot.emergency = req.body.emergency;
	        if (req.body.floor)
	        	robot.floor = req.body.floor;
	        if (req.body.x_pos)
	        	robot.x_pos = req.body.x_pos;
	        if (req.body.c_y_pos)
	        	robot.y_pos = req.body.y_pos;
		

            robot.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'Robot updated!' });
            });
	  
        });
    })



    .get(function(req, res) {

            // delete the robot with this id (accessed at DELETE http://localhost:8080/api/robots/:robot_id)
        if (req.body.delete){
            Robot.remove({_id: req.params.robot_id}, function(err, robot) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        }

        else{
	    Robot.findById(req.params.robot_id, function(err, robot) {
            if (err)
                res.send(err);
            res.json(robot);
            });
        }
     });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Hosted on port ' + port);
