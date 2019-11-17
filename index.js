const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

function callback(req, res, le) {
    var urlParse = url.parse(req.url, true);
    var weight = Number(urlParse.query['weiht']);
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
    } else if (weight > 3.5) {
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

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/postal', (req, res) => res.render('pages/postal'))
  .get('/postalCalc', function (req, res) {
      var result = callback(req, res, false);
      var urlParse = url.parse(req.url, true);
      var response = {
          weight : urlParse.query['weight'],
          type : urlParse.query['type'],
          price : result
      };
      res.render('pages/postalCalc', response);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
