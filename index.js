var express = require('express');
var app = express();
var mongo = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

const port = 4000;
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
mongo.connect("mongodb://localhost/dbNodeWksh", { useNewUrlParser: true }, (err) => {

    if (err)
        console.log("error connecting the db")
    else
        console.log("connected successfully")

})


var userSchema = mongo.Schema({

    name: { firstname: String, lastname: String },
    username: String,
    password: String,
    identification: { typeId: String, numberId: Number },
    photo: String,
    active: Boolean

})

var User = mongo.model("User", userSchema);

app.get('/', function (req, res) {

    res.redirect('/user');
})

var allUsers = [];
//all users
app.get('/user', function (req, res) {



    User.find().exec(function (err, users) {
        allUsers = [];
        for (var i = 0; i < users.length; i++) {

            var userAct = users[i];

            allUsers[i] = (userAct);

        }

        res.render('pages/table', { userList: allUsers })   
    })
    // console.log(allUsers)
})
var userTemp = [{

    "name": { "firstname": "", "lastname": "" },
    "identification": { "typeId": "", "numberId": "" },
    "username": "",
    "password": "",
    "photo": "",
    "active": ""


}];
//add new user
app.get('/user/new', function (req, res) {


    res.render('pages/form', { userAct: userTemp })
})

//create new user
app.post('/user', function (req, res, next) {


    var firstn = req.body.firstnameAct;
    var lastn = req.body.lastnameAct;
    var typeId = req.body.typeIdAct;
    var numberId = req.body.numberIdAct;

    var username = req.body.usernameAct;
    var password = req.body.passwordAct;
    var photo = req.body.photoAct;
    //radiobutton selected
    var active = req.body.member;
    var userExists = false;


    var user = new User(
        {
            "name.firstname": firstn,
            "name.lastname": lastn,
            "identification.typeId": typeId,
            "identification.numberId": numberId,
            "username": username,
            "password": password,
            "photo": photo,
            "active": active


        })

    //console.log("user to add:" + user)
    User.findOne({ "identification.numberId": numberId }, (err, u) => {

        if (u) {
            console.error("this user already exists on the db");
            res.redirect('/user/new')
        } else {

            user.save((function (error, uAct) {
                if (err)
                    return console.error(error)

                else {
                    console.log("created successfully")
                    res.redirect("/user")
                }
            }));

        }

    })



})

var userById = {};
//show user
app.post('/user/:id', function (req, res) {

    var id = parseInt(req.params.id);

    console.log(id)

    User.findOne({ "identification.numberId": id }).exec(function (err, user) {


        if (user) {
            var userFinded = user;

            userById = userFinded;

//console.log(userById);
            res.render('pages/userInfo', { userAct: userById })
        } else
            console.log("Didn't find the user")


    })


})

//edit user
app.post('/user/:id/edit', function (req, res) {

    var id = parseInt(req.body.numberIdAct);
    console.log(id)
    User.find({ "identification.numberId": id }, (err, user) => {

        if (user[0]) {

            var userById = user;
            //console.log("finded to edit" + userById)
            //userAct.name.firstname
            res.render('pages/form', { userAct: userById })

        } else {
            console.log("did not find")
        }


    });




})

//update user
app.put('/user/:id', function (req, res) {



    //numberId without change
    var numberIdWOchange = parseInt(req.params.id);

    var firstn = req.body.firstnameAct;
    var lastn = req.body.lastnameAct;
    var typeId = req.body.typeIdAct;
    var numberId = req.body.numberIdAct;

    var username = req.body.usernameAct;
    var password = req.body.passwordAct;
    var photo = req.body.photoAct;
    var active = req.body.member;


    //console.log("last id:"+password+" : "+numberIdWOchange)
console.log("id1:"+numberId+"-id2:"+numberIdWOchange)
    if (numberId != numberIdWOchange) {

        User.find({ "identification.numberId":numberId}, (err, user) => {

            if (user[0]) {
                console.log(user)
                console.log("An user with the same Id already exists")
                res.redirect('/user')
            } else {



                if (password) {
                   // console.log("finded to update pass:" + password)
                    User.updateOne({ "identification.numberId": numberIdWOchange }, {

                        $set: {
                            "password": password
                        }
                    }, (err, user) => {


                        if (user) {
                            console.log("finded to update pass")

                        } else {
                            console.log("didn't find to update pass")
                        }
                    })
                }

                User.updateOne({ "identification.numberId": numberIdWOchange }, {

                    $set: {
                        "name.firstname": firstn,
                        "name.lastname": lastn,
                        "identification.numberId": numberId,
                        "identification.typeId": typeId,
                        "username": username,
                        "photo": photo,
                        "active": active
                    }

                }, (err, user) => {


                    if (user) {
                        console.log("finded to update")

                        res.redirect("/user");
                    } else {
                        console.log("didn't finded to update")
                    }

                })
            }
        })

    }else{


        if (password) {
        //    console.log("finded to update pass:" + password)
            User.updateOne({ "identification.numberId": numberIdWOchange }, {

                $set: {
                    "password": password
                }
            }, (err, user) => {


                if (user) {
                    console.log("finded to update pass")

                } else {
                    console.log("didn't finded to update pass")
                }
            })
        }

        User.updateOne({ "identification.numberId": numberIdWOchange }, {

            $set: {
                "name.firstname": firstn,
                "name.lastname": lastn,
                "identification.numberId": numberId,
                "identification.typeId": typeId,
                "username": username,
                "photo": photo,
                "active": active
            }

        }, (err, user) => {


            if (user) {
                console.log("finded to update")

                res.redirect("/user");
            } else {
                console.log("didn't finded to update")
            }

        })


    }
})

//delete user
app.delete('/user/:id', function (req, res) {

    var id = req.body.numberIdAct;
    //console.log("value to delete:" + id)
    //console.log(req.body.idAct)
    User.deleteOne({ "identification.numberId": id }, (err, any) => {
        if (err)
            console.log("error:" + err)
        else {

            console.log("deleted successfully")
            res.redirect("/user");
        }
    })



})



app.listen(port, function () {

    console.log('listening on port 4000');
});
