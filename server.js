// Setup ===========================
var express			= require('express');
var app				= express();
var mongoose		= require('mongoose');
var morgan			= require('morgan');
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var $http			= require('http');

// Configuration ===================
mongoose.connect('mongodb://127.0.0.1:27017/sharpjs');

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/sources', express.static(__dirname + '/sources'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

// Get Data Sources ================
var cache_len = new Date(new Date().getTime() - 30000).getTime();

var spc_base_url = "http://www.spc.noaa.gov/exper/soundings/";
var spc_text = "";
var spc_time = null;

function _download_spc() {
	var now = new Date().getTime();
	if (spc_time == null || spc_time < now - cache_len) {
		var options = {
			host: spc_base_url,
			port: 80,
			path: '/index.html'
		};
		$http.get(options, function(res) {
			var spc_text = res;
			spc_time = new Date().getTime();
			console.log(spc_text);
		});
	}
}

// Define Model ====================
// var SHARP = mongoose.model('SHARP', {
	// text: String
// });

// Create API ======================
app.get('/api/v1/sources/download_spc', function(req, res) {
	var cache_len = new Date(new Date().getTime() - 30000).getTime();
	var spc_base_url = "http://www.spc.noaa.gov/exper/soundings/";
	var spc_text = "";
	var spc_time = null;

	var now = new Date().getTime();
	if (spc_time == null || spc_time < now - cache_len) {
		var options = {
			host: 'http://www.spc.noaa.gov',
			path: '/exper/soundings/'
		};
		$http.get(spc_base_url, function(spc_res) {
			var spc_text = spc_res;
			spc_time = new Date().getTime();
			spc_res.on("data", function(chunk) {
				console.log(chunk.toString());
			});
			// console.log(spc_res);
			// res.json(spc_res);
		}).on('error', function(e) {
			console.log("Error: " + e);
		});
		// res.json(spc_text);
	}
});

app.post('/api/v1/todos', function(req, res) {
	Todo.create({
		text: req.body.text,
		done: false
	}, function(err, todo) {
		if (err) {
			res.send(err);
		}
		Todo.find(function(err, todos) {
			if (err) {
				res.send(err);
			}
			res.json(todos);
		});
	});
});

app.delete('/api/v1/todos/:todo_id', function(req, res) {
	Todo.remove({
		_id: req.params.todo_id
	}, function(err, todo) {
		if (err) {
			res.send(err);
		}
		Todo.find(function(err, todos) {
			if (err) {
				res.send(err);
			}
			res.json(todos);
		});
	});
});

// Application =====================
app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// Listen (node server.js) =========
app.listen(8080);
console.log("Aaaaaand we're off to port 8080!");