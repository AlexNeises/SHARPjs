// Setup ===========================
var express			= require('express');
var app				= express();
var mongoose		= require('mongoose');
var morgan			= require('morgan');
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');

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

// Define Model ====================
var Todo = mongoose.model('Todo', {
	text: String
});

// Create API ======================
app.get('/api/v1/todos', function(req, res) {
	Todo.find(function(err, todos) {
		if (err) {
			res.send(err);
		}
		res.json(todos);
	});
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