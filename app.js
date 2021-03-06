var ordrin = require('ordrin-api'),
    ordrin_api = new ordrin.APIs(process.env.ORDRIN_API_KEY, ordrin.TEST),
    express = require('express'),
    app = express();

//Set up ejs for rendering
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/static'));

//Mimicing curl because I don't want to fix errors.
var pay = function(accessToken, amount, note){
    var curlString = 'curl https://api.venmo.com/v1/payments -d access_token=' + accessToken + ' -d email="sagnew92@gmail.com" -d amount=' + amount + ' -d note="' + note + '"';
    var child = exec(curlString, function(error, stdout, stderr){
        console.log(curlString);
        sys.print('stdout: ' + stdout);
        if(error){
            console.log('Error: ' + error);
        }
    });
};

// Immediate Venmo redirect FOR NOW.
app.get('/', function(req, res){
    res.redirect('https://api.venmo.com/v1/oauth/authorize?client_id=1745&scope=make_payments%20access_profile');
});

// Index page
app.get('/index', function (req, res) {
    var accessToken = req.query.access_token;
    res.render('index', { 'accessToken': accessToken });
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
            'zip': req.query.zip,
            'state': req.query.state,
            'first_name': req.query.first_name,
            'last_name': req.query.last_name,
            'email': req.query.email,
            'phone': req.query.phone,
            'accessToken': req.query.accessToken
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
        console.log(data);
        res.send(data);
    });
});

app.get('/placeorder', function (req, res) {
    var params = req.query;
    console.log(params);

    var options = {
        'rid': params.rid,
        'em': params.email,
        'tray': params.tray,
        'tip': '0.00',
        'first_name': params.first_name,
        'last_name': params.last_name,
        'phone': params.phone,
        'zip': params.zip,
        'addr': params.addr,
        'city': params.city,
        'state': params.state,
        'delivery_date': 'ASAP',
        'card_name': process.env.CARD_NAME,
        'card_number': process.env.CARD_NUMBER,
        'card_cvc': process.env.CARD_CVC,
        'card_expiry': process.env.CARD_EXPIRY,
        'card_bill_addr': process.env.CARD_BILL_ADDR,
        'card_bill_city': process.env.CARD_BILL_CITY,
        'card_bill_state': process.env.CARD_BILL_STATE,
        'card_bill_zip': process.env.CARD_BILL_ZIP,
        'card_bill_phone': process.env.CARD_BILL_PHONE
    };

    var accessToken = params.accessToken;

    ordrin_api.order_guest(options, function (error, data) {
        console.log(error);
        if (error) {
            console.log(error);
        } else {
            // pay(params.accessToken, params.totalPrice, "Ordering food: " + params.tray);
            console.log(accessToken);
        }
        res.send(data);
    });
});

app.listen(3000);
console.log('Listening on port 3000');
