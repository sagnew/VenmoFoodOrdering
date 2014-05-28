var ordrin = require('ordrin-api'),
    ordrin_api = new ordrin.APIs(process.env.ORDRIN_API_KEY, ordrin.TEST),
    express = require('express'),
    app = express();

//Set up ejs for rendering
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/static'));

// Index page
app.get('/', function (req, res) {
    res.render('index', {});
});

// Renders a page with the list of restaurants based on user input
app.get('/restaurants', function (req, res) {

    var options = {
        'datetime': 'ASAP',
        'addr': req.query.addr,
        'city': req.query.city,
        'zip': req.query.zip
    };

    ordrin_api.delivery_list(options, function (error, data) {
        if (error) { console.log(error); return; }
        res.render('buildTray.html', {
            'restaurants': data,
            'addr': req.query.addr,
            'city': req.query.city,
            'zip': req.query.zip
        });
    });
});

// Retrieves menu data for a given restaurant.
app.get('/menuitems', function (req, res) {
    var options = {
        'rid': req.query.rid
    };

    ordrin_api.restaurant_details(options, function (error, data) {
        if (error) { console.log(error); return; }
        res.send(data.menu);
    });
});

// Retrieves fee information for given restaurant.
app.get('/fee', function (req, res) {
    var options = {
        'rid': req.query.rid,
        'datetime': 'ASAP',
        'subtotal': '0.00',
        'tip': '0.00',
        'addr': req.query.addr,
        'city': req.query.city,
        'zip': req.query.zip
    };

    ordrin_api.fee(options, function (error, data) {
        if (error) { console.log(error); return; }
        res.send(data);
    });
});

app.post('/placeorder', function (req, res) {

});

app.post('/savetray', function (req, res) {

});

app.listen(3000);
console.log('Listening on port 3000');
