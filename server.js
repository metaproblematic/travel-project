var express     = require('express')
var bodyParser  = require('body-parser')
var request     = require('request')

const mongoose = require('mongoose')
var app = express()

mongoose.connect('mongodb://localhost:27017/travel-project', {useMongoClient: true})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

app.use(express.static('./public'))

var hotelSchema = new mongoose.Schema({
    name: {type: String},
    address: {type: String},
    phoneNumber: {type: String},
    rating:{type: String},
    website: {type: String},
    reviews: {type: String},

})

var hotelModel = mongoose.model('hotel', hotelSchema)

var users = {
    raphael: 'dragons',
    eric: 'dingleberries',
    michael: 'goats',
    bernidette  : 'feelthebern',
    password: 'password',
}

var isLoggedIn = function(req, res, next){
    // console.log('Data from sign-in isLoggedIn function: ', req.query.name, req.query.password)
    
    var name = req.query.name
    var pass = req.query.password
    if ( name in users && users[name] === pass ) {
        // console.log("isLoggedIn was called successfully")
        res.send({success: "Sucessfullly logged in!"})
    }
    else {
        res.redirect('/login-page')
    }
}

app.get('/', function(req, res){
    res.sendFile('./html/index.html', {root: './public'})
})

app.get('/login-page', function(request, response){
    response.sendFile('./public/html/login-page.html', {root: './'})
})

app.get('/VIP-suite', function(req, res, next){
    res.sendFile('./html/VIP-Suite.html', {root: './public'})
})


app.post('/hoteldata', function(req, res) {

    console.log(req.body.hotelObject)
    request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${req.body.hotelObject}&type=lodging&radius=10000&key=AIzaSyCp6N27cY817n1orUFFOE4D6SDRqyzFy20`, function (error, response, body) {

    // console.log(req.body.hotelObject)

    //console.log('data from google: ', body)
    //console.log(res, 'res')
    // console.log(body)

    res.send(body)

    
    })
})

app.post('/hoteldetails', function(req, res) {

    request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.body.hotelObject}&key=AIzaSyCp6N27cY817n1orUFFOE4D6SDRqyzFy20`, function (error, response, body) {
    console.log('data from google: ', body)

    res.send(body)
})
})

app.get('/log-in', isLoggedIn, function(req, res) {
    // console.log('Data from sign-in: ', req.query.name, req.query.password)
})

app.post('/hoteldata', function(req, res) {

    console.log(req.body.hotelObject)
    request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${req.body.hotelObject}&type=lodging&radius=10000&key=AIzaSyCp6N27cY817n1orUFFOE4D6SDRqyzFy20`, function (error, response, body) {


    //console.log('data from google: ', body)
    //console.log(res, 'res')
    // console.log(body)

    res.send(body)
    })
})

app.post('/hotelMapdata', function(req, res) {

    console.log(req.body.hotelObject)
    request(`https://maps.googleapis.com/maps/api/place/textsearch/json?location=${req.body.hotelObject}&type=lodging&radius=10000&key=AIzaSyCp6N27cY817n1orUFFOE4D6SDRqyzFy20`, function (error, response, body) {

    //console.log('data from google: ', body)
    //console.log(res, 'res')
    // console.log(body)

    res.send(body)
    })
})

app.post('/saveHotel', function(req, res) {

    let newHotel = {
        name: req.body.location.name,
        address: req.body.location.formatted_address,
        phoneNumber: req.body.location.formatted_phone_number,
        rating:req.body.location.rating,
        website: req.body.location.website,
        reviews: req.body.location.reviews[0].text,
    }
    
    new hotelModel(newHotel).save(function(err, createdHotel) {
        if (err) { 
            res.status(500).send(err);
            return console.log(err);
        }
        console.log(createdHotel)
        res.status(200).send(createdHotel);
    })

})

app.post("/currentHotels", function(req, res){
    hotelModel.find(
        {},
        function(err, hotels) {
            if (err) {
                res.status(500).send(err);
                return console.log(err);
            }
            res.status(200).send(hotels);
        }
    )
})

app.post("/deleteHotel", function(req, res){
    console.log('body:', req.body);
    hotelModel.findOneAndRemove(
        { _id: req.body.id },
        function(err, deletedHotel) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            console.log('It deleted:', deletedHotel)
            res.status(200).send(deletedHotel._id);
        })
})

app.listen(8080, function() {
    console.log('started on 8080')
})




