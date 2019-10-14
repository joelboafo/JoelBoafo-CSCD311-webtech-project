const express = require('express');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set ('views', path.join(__dirname));
app.engine ( 'handle', expressHandlebars ({ extname :  'handle' , defaultLayout : '',
 layoutsDir:__dirname + ''}));
app.set('view engine', 'handle');

app.get('/login', (req, res) => res.sendFile('login.html', { root : __dirname}));
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


app.get('/success', (req, res) => res.sendFile('hallRegistration.html', { root : __dirname}));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
})


mongoose.connect('mongodb://localhost/students', (err)=>{
   if(!err){
       console.log("Database connected");
   }else{
       console.log(err);
   }
});


const Schema= mongoose.Schema;
//STUDENT SCHEMA
const studentSchema = new Schema({
    firstName: String,
    lastName: String, 
    studentId: Number,
    pin: Number,
    level: Number,
    gender:String
});
const Student = mongoose.model('Student', studentSchema);

//HALL SCHEMA
let hallSchema = new mongoose.Schema({
        hall : {type : String},
        block : {type : String},
    });    

const Hall = mongoose.model('Hall', hallSchema);
/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

app.post('/student-details', (req,res)=>{
  const newStudent = new Student({
      firstName: req.body.firstName,
      lastName: req.body.lastName, 
      studentId: req.body.studentId,
      pin: req.body.pin,
      level: req.body.level,
      gender:req.body.gender});
  newStudent.save((err,res)=>{
      if(err){
          return console.log(err);
      }
      console.log(res);
  })
  res.send(newStudent);
});

passport.use(new LocalStrategy(
  (studentId, pin, done) => {
      newStudent.findOne({
        studentId: studentId 
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user.studentId != studentId) {
          return done(null, false);
        }

        if (user.pin != pin) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.post('/login', passport.authenticate('local', { failureRedirect: '/error' }),(req, res)=> {
    res.redirect('/success?studentId='+req.user.studentId);
  });

app.post('/hallRegistration', (req, res) => {
    let hall = req.body.hall,
        block = req.body.block

    let hallData = {hall : hall, block : block}

    Hall.create(hallData, (err, hall) => {
        if(!err){
            console.log(hall);
        }else{
            res.json({ 
            message : "Error during data creation" + err });
        }
    });

    res.redirect('/student');
});  

app.get('/student', (req, res) => {
    Hall.find((err, docs) => {
        if(!err){
            res.render('profile',{
                list : docs
            });
        } else {
            res.json({'message' : 'Error showing hall data' + err});
        }
    });
  });



app.listen(3000, () => {
     console.log("Server Connected")
});