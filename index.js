const express = require('express')
const cookieParser = require('cookie-parser')
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
    pool.query('SELECT * FROM person WHERE id=$1',[id], (err, results) => {
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
    var sqlQuery = "SELECT * FROM users WHERE username=$1";
    console.log(sqlQuery);
    pool.query(sqlQuery, [username], (err, results) => {
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

function usernameFromCookie(cookie) {
    var res = cookie.split(".");
    var key = res.pop();
    var username = res.join('.');
    var returnRes = [username, key];
    return returnRes;
}

function login (req, res) {
    var urlParse = url.parse(req.url, true);
    var username = urlParse.query['user'];
    var password = urlParse.query['pass'];
    var sqlQuery = "SELECT id FROM users WHERE username=$1 AND password=crypt($2, password)";
    console.log(sqlQuery);
    pool.query(sqlQuery, [username, password], (err, results) => {
        if (err) {
            throw err
        }
        if (results.rows.length == 0) {
            res.status(200);
            res.setHeader('Content-type', 'text/plain');
            return res.send("false");
        } else {
            // log in
            var key = username+"."+Math.floor(Math.random() * 100000000000);
            var sqlQuery = "INSERT INTO sessions (id, sessionKey) VALUES ($1, '"+key+"')";
            console.log(sqlQuery);
            pool.query(sqlQuery, [results.rows[0]["id"]], (err, results) => {
                if (err) {
                    throw err
                }
                console.log(results.rows);
                res.status(200);
                res.setHeader('Content-type', 'text/plain');
                return res.send(key);
            })
        }
    })
}

function getText(req, res) {
    var cookie = req.cookies['login'];
    if (cookie === undefined) {
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send(req.cookies['text']);
    }
    var result = usernameFromCookie(cookie);
    var username = result[0];
    var key = result[1];
    var sqlQuery = "SELECT sessionKey FROM sessions s INNER JOIN users u ON s.id=u.id WHERE u.username=$1";
    console.log(sqlQuery);
    pool.query(sqlQuery, [username], (err, results) => {
        if (err) {
            throw err
        }
        if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
                if (results.rows[i]["sessionkey"] == cookie) {
                    var sqlQuery = "SELECT textbox FROM notepads n INNER JOIN users u ON n.id=u.id WHERE username=$1";
                    console.log(sqlQuery);
                    pool.query(sqlQuery, [username], (err, results) => {
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
            }
        } else {
            res.status(200);
            res.setHeader('Content-type', 'text/plain');
            return res.send("");
        }
    })
}

function updateText(req, res) {
    console.log(req.cookies);
    var urlParse = url.parse(req.url, true);
    var cookie = req.cookies['login'];
    if (cookie === undefined) {
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send(req.cookies['text']);
    }
    var result = usernameFromCookie(cookie);
    var username = result[0];
    var key = result[1];
    var text = req.cookies['text'];
    console.log(text);
    var sqlQuery = "SELECT sessionKey FROM sessions s INNER JOIN users u ON s.id=u.id WHERE u.username=$1";
    console.log(sqlQuery);
    pool.query(sqlQuery, [username], (err, results) => {
        if (err) {
            throw err
        }
        if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
                if (results.rows[i]["sessionkey"] == cookie) {
                    var sqlQuery = "UPDATE notepads n SET textbox=$1 FROM users u WHERE u.id=n.id AND username=$2";
                    console.log(sqlQuery);
                    pool.query(sqlQuery, [text, username], (err, results) => {
                        if (err) {
                            throw err
                        }
                        console.log("No err");
                    })
                }
            }
        } else {
            return false;
        }
    })
    res.status(200);
    res.setHeader('Content-type', 'text/plain');
    return res.send("resp");
}

function logout(req, res) {
    var urlParse = url.parse(req.url, true);
    var cookie = req.cookies['login'];
    if (cookie === undefined) {
        res.status(200);
        res.setHeader('Content-type', 'text/plain');
        return res.send(req.cookies['text']);
    }
    var username = usernameFromCookie(cookie)[0];
    var text = req.cookies['text'];
    var sqlQuery = "SELECT sessionKey FROM sessions s INNER JOIN users u ON s.id=u.id WHERE u.username=$1";
    console.log(sqlQuery);
    pool.query(sqlQuery, [username], (err, results) => {
        if (err) {
            throw err
        }
        if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
                if (results.rows[i]["sessionkey"] == cookie) {
                    var sqlQuery = "UPDATE notepads n SET textbox=$1 FROM users u WHERE u.id=n.id AND username=$2";
                    console.log(sqlQuery);
                    pool.query(sqlQuery, [text, username], (err, results) => {
                        if (err) {
                            throw err
                        }
                        var sqlQuery = "DELETE FROM sessions s USING users AS u WHERE sessionkey=$1 OR s.id=u.id AND u.username=$2";
                        console.log(sqlQuery);
                        pool.query(sqlQuery, [cookie, username], (err, results) => {
                            if (err) {
                                throw err
                            }
                        })
                    })
                }
            }
        }
    })
    res.status(200);
    res.setHeader('Content-type', 'text/plain');
    return res.send("resp");
}

function newAccount(req, res) {
    var urlParse = url.parse(req.url, true);
    var username = urlParse.query['user'];
    var password = urlParse.query['pass'];
    var cookie = usernameFromCookie(urlParse.query['cookie']);
    var sqlQuery = "INSERT INTO users (username, password) VALUES ($1, crypt($2, gen_salt('bf'))) RETURNING id;";
    console.log(sqlQuery);
    pool.query(sqlQuery, [username, password], (err, results) => {
        if (err) {
            throw err
        }
        var id = results.rows[0].id;
        var sqlQuery2 = "INSERT INTO notepads (id, textbox) VALUES ($1, '');";
        console.log(sqlQuery2);
        pool.query(sqlQuery2, [id], (err, results) => {
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
  .use(cookieParser())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/movieSearch', (req, res) => res.render('pages/omdbsearch'))
  .get('/login', function (req, res){
      console.log(req.cookies);
      var cookie = req.cookies['login'];
      if (cookie === undefined) {
          return res.render('pages/login');
      }
      var result = usernameFromCookie(cookie);
      var username = result[0];
      var key = result[1];
      var sqlQuery = "SELECT sessionKey FROM sessions s INNER JOIN users u ON s.id=u.id WHERE u.username=$1";
      console.log(sqlQuery);
      pool.query(sqlQuery, [username],(err, results) => {
          if (err) {
              throw err
          }
          if (results.rows.length > 0) {
              for (var i = 0; i < results.rows.length; i++) {
                  if (results.rows[i]["sessionkey"] == cookie) {
                      return res.redirect('/notepad');
                  }
              }
          } else {
              return res.render('pages/login');
          }
      })
  })
  .get('/logout', logout)
  .get('/newAccount', newAccount)
  .get('/username', getUsername)
  .get('/password', login)
  .get('/getText', getText)
  .post('/updateText', updateText)
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
