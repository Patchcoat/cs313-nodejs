const express = require('express')
const path = require('path')
const url = require('url')
const { Pool } = require('pg')
const PORT = process.env.PORT || 5000
// Heroku Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
// Local Database
/*const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 5432
});*/


function callback(req, res, le) {
    var urlParse = url.parse(req.url, true);
    var weight = Number(urlParse.query['weight']);
    var type;
    if (le) {
        type = 'LE';
    } else {
        type = urlParse.query['type']
    }
    var result = 0;
    if (weight <= 1) {
        result = .55;
    } else if (weight <= 2) {
        result = .7;
    } else if (weight <= 3) {
        result = .85;
    } else if (weight <= 3.5) {
        result = 1;
    } else if (weight > 3.5 && !le) {
        return callback(req, res, true);
    }
    switch(type){
        case 'LS':
            break;
        case 'LM':
            result -= 0.05;
            break;
        case 'LE':
            if (weight <= 1) {
                result = 1;
            } else if (weight <= 2) {
                result = 1.15;
            } else if (weight <= 3) {
                result = 1.30;
            } else if (weight <= 4) {
                result = 1.45;
            } else if (weight <= 5) {
                result = 1.60;
            } else if (weight <= 6) {
                result = 1.75;
            } else if (weight <= 7) {
                result = 1.90;
            } else if (weight <= 8) {
                result = 2.05;
            } else if (weight <= 9) {
                result = 2.20;
            } else if (weight <= 10) {
                result = 2.35;
            } else if (weight <= 11) {
                result = 2.50;
            } else if (weight <= 12) {
                result = 2.65;
            } else if (weight <= 13) {
                result = 2.80;
            }
            break;
        case 'FC':
            if (weight <= 4) {
                result = 3.66;
            } else if (weight <= 8) {
                result = 4.39;
            } else if (weight <= 12) {
                result = 5.19;
            } else if (weight <= 13) {
                result = 5.71;
            }
            break;
        default:
            break;
    }
    return result;
}

function getParents (req, res) {
    var urlParse = url.parse(req.url, true);
    var id = urlParse.query['id'];
    pool.query('SELECT * FROM person WHERE id='+id, (err, results) => {
        if (err) {
            throw err
        }
        console.log(results.rows)
        res.status(200).json(results.rows)
    })
}

function getUsername (req, res) {
    var urlParse = url.parse(req.url, true);
    var username = urlParse.query['user'];
    var sqlQuery = "SELECT * FROM users WHERE username='"+username+"'";
    console.log(sqlQuery);
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            throw err
        }
        var respondWith = "error";
        if (results.rows.length == 0) {
            respondWith = "false";
        } else {
            respondWith = "true";
        }
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send(respondWith);
    })
}

function login (req, res) {
    var urlParse = url.parse(req.url, true);
    var username = urlParse.query['user'];
    var password = urlParse.query['pass'];
    // TODO this is terrible. The password is sent to the server unencrypted. This needs to be fixed in later versions
    var sqlQuery = "SELECT id FROM users WHERE username='"+username+"' AND password=crypt('"+password+"', password)";
    console.log(sqlQuery);
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            throw err
        }
        var respondWith = "error";
        if (results.rows.length == 0) {
            respondWith = "false";
        } else {
            respondWith = "true";
        }
        console.log(results.rows);
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send(respondWith);
    })
}

function usernameFromCookie(username) {
    return username;
}

function getText(req, res) {
    var urlParse = url.parse(req.url, true);
    var cookie = usernameFromCookie(urlParse.query['cookie']);
    var sqlQuery = "SELECT textbox FROM notepads n INNER JOIN users u ON n.id=u.id WHERE username='"+cookie+"'";
    console.log(sqlQuery);
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            throw err
        }
        console.log(results.rows);
        if (results.rows.length == 0) {
            respondWith = "";
        } else {
            respondWith = results.rows[0]["textbox"];
        }
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send(respondWith);
    })
}

function updateText(req, res) {
    var urlParse = url.parse(req.url, true);
    var cookie = usernameFromCookie(urlParse.query['cookie']);
    var text = urlParse.query['text'];
    var sqlQuery = "UPDATE notepads n SET textbox='"+text+"' FROM users u WHERE u.id=n.id AND username='"+cookie+"'";
    console.log(sqlQuery);
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            throw err
        }
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send("resp");
    })
}

function logout(req, res) {
    var urlParse = url.parse(req.url, true);
    var cookie = usernameFromCookie(urlParse.query['cookie']);
    var text = urlParse.query['text'];
    var sqlQuery = "UPDATE notepads n SET textbox='"+text+"' FROM users u WHERE u.id=n.id AND username='"+cookie+"'";
    console.log(sqlQuery);
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            throw err
        }
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send("resp");
    })
}

function newAccount(req, res) {
    var urlParse = url.parse(req.url, true);
    var username = urlParse.query['user'];
    var password = urlParse.query['pass'];
    var cookie = usernameFromCookie(urlParse.query['cookie']);
    var text = urlParse.query['text'];
    var sqlQuery = "INSERT INTO users (username, password) VALUES ('"+username+"', crypt('"+password+"', gen_salt('bf'))) RETURNING id;";
    console.log(sqlQuery);
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            throw err
        }
        var id = results.rows[0].id;
        var sqlQuery2 = "INSERT INTO notepads (id, textbox) VALUES ('"+id+"', '');";
        console.log(sqlQuery2);
        pool.query(sqlQuery2, (err, results) => {
            if (err) {
                throw err
            }
            res.status(200);
            res.setHeader('Content-type', 'text/plain');
            return res.send("resp");
        })
    })
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/movieSearch', (req, res) => res.render('pages/omdbsearch'))
  .get('/login', (req, res) => res.render('pages/login'))
  .get('/logout', logout)
  .get('/newAccount', newAccount)
  .get('/username', getUsername)
  .get('/password', login)
  .get('/getText', getText)
  .get('/updateText', updateText)
  .get('/notepad', (req, res) => res.render('pages/notepad'))
  .get('/getPerson', function (req, res) {
      getParents(req, res);
      //res.render('pages/getPerson');
  })
  .get('/postal', (req, res) => res.render('pages/postal'))
  .get('/postalCalc', function (req, res) {
      var result = callback(req, res, false);
      var urlParse = url.parse(req.url, true);
      var packType = urlParse.query['type'];
      switch(packType) {
          case 'LS':
              packType = "Letters (Stamped)";
              break;
          case 'LM':
              packType = "Letters (Metered)";
              break;
          case 'LE':
              packType = "Large Envelopes (Flats)";
              break;
          case 'FC':
              packType = "First-Class Package Service-Retail";
              break;
          default:
              break;
      }
      var response = {
          weight : urlParse.query['weight'],
          type : packType,
          price : result
      };
      res.render('pages/postalCalc', response);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
