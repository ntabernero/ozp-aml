// Include Express library.
var express = require('express');

// Define route modules.
var app = express(),
	appRoutes = require('./routes/App'),
	categoryRoutes = require('./routes/Category'),
	groupingRoutes = require('./routes/Grouping');

// Extensive logging.
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
});

// Application route controller.
app.get('/aml/api/v1/app/', appRoutes.findAll);
app.get('/aml/api/v1/app/:id', appRoutes.findById);
app.post('/aml/api/v1/app/', appRoutes.add);
app.put('/aml/api/v1/app/:id', appRoutes.update);
app.delete('/aml/api/v1/app/:id', appRoutes.delete);

//Grouping route controller.
app.get('/aml/api/v1/grouping/', groupingRoutes.findAll);
app.get('/aml/api/v1/grouping/:id', groupingRoutes.findById);
app.post('/aml/api/v1/grouping/', groupingRoutes.add);
app.put('/aml/api/v1/grouping/:id', groupingRoutes.update);
app.delete('/aml/api/v1/grouping/:id', groupingRoutes.delete);

//Category route controller.
app.get('/aml/api/v1/category/', categoryRoutes.findAll);
app.get('/aml/api/v1/category/:id', categoryRoutes.findById);
app.post('/aml/api/v1/category/', categoryRoutes.add);
app.put('/aml/api/v1/category/:id', categoryRoutes.update);
app.delete('/aml/api/v1/category/:id', categoryRoutes.delete);

// Kickstart REST controller process.
app.listen(3000);
console.log('AML Node.js API on port 3000.');