// Snippets of code used from course modules, W3 Schools and GeeksforGeeks.
// Import express and handlebars.
var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});

var app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser');

// Tell node to choose parser depending on whether it see URL or JSON.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Create mysql connection.
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs290_kimte',
    password        : '9991',
    database        : 'cs290_kimte'
});

// GET route to create a new table and drop the existing one.
app.get('/reset-table', function(req, res, next) {
    var context = {};

    pool.query("DROP TABLE IF EXISTS workouts", function(err){
      var createString = "CREATE TABLE workouts("+
      "id INT PRIMARY KEY AUTO_INCREMENT,"+
      "name VARCHAR(255) NOT NULL,"+
      "reps INT,"+
      "weight INT,"+
      "date DATE,"+
      "lbs BOOLEAN)";

      pool.query(createString, function(err) {
        res.render('home', context);
      })
    });
  });

  // GET route retrieving workouts from the table.
  app.get('/', function(req, res, next) {
    var context = {};
    
    // Query to return everything from the table and format the date as month-day-year.
    pool.query('SELECT id, name, reps, weight, DATE_FORMAT(date, "%m-%d-%Y") as date, lbs FROM workouts', function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
    context.results = rows;
    res.render('home', context);
     });
   });

// POST route to insert new entry into table.
app.post('/', function(req,res,next){
  var context = {};

  pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", 
    [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result) {
    if(err){
      next(err);
      return;
    }
  context.results = "Inserted id " + result.insertId;
  res.render('home', context);
  });
});

// GET route to delete a table row based on id.
app.get('/delete', function(req, res, next){
  var context = {};

  pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Deleted" + result.changedRows;
    res.render('home', context);
  });
});

// POST route to update row based on id and to keep current values if no new ones are provided.
app.post('/update',function(req,res,next){
  var context = {};
  pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      
      pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight, req.query.date || curVals.date, req.query.lbs || curVals.lbs, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.send("Entry has been updated");
      });
    }
  });
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(9199)