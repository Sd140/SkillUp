const express = require('express');
const path = require('path')
const app = express();
const hbs = require("hbs")
var fs = require('fs');
var bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
var session = require('express-session')
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"public")
const partials_path = path.join(__dirname,"../templates/partials")
const template_path = path.join(__dirname,"../templates/views")
require("./db/conn");
const Register = require("./models/register")
const Course = require("./models/courses")
const { json } = require("express")
const auth = require("./middleware/auth");
const async = require('hbs/lib/async');


app.use(express.static(static_path));
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.set("view engine", "hbs");
app.set("views",template_path)
hbs.registerPartials(partials_path)
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(
  session({
    key:'user_data',
    secret : "random",
    resave: false,
    saveUninitialized:false,
    cookie:{
      expires:500000
    }
  })
)

// Home page
app.get('/',(req,res)=>{
  res.render("index",{buttonname:"Login"})
})

// about page
app.get('/about',(req,res)=>{
  res.render("about")
})

// cart
app.get('/cart',(req,res)=>{
  res.render("cart")
})

app.get('/courses',async(req,res)=>{
  Course.find({}, function(err, data) {
    res.render('courses',{data: data
    });
})

})

// contact
app.get('/contact',(req,res)=>{
  res.render("contact")
})

// course-single
app.get('/course-single',(req,res)=>{
  res.render("course-single")
})

// checkout
app.get('/checkout',(req,res)=>{
  res.render("checkout")
})

// instructor
app.get('/instructor',(req,res)=>{
  res.render("instructor")
})

// my courses on account button
app.get('/mycourse',auth.isLogin,(req,res)=>{
  const user = req.session.user
  res.render("courses",{buttonname:user.firstname})
})


// login
app.get('/login',(req,res)=>{
  res.render("login",{buttonname:"Login"})
})

// login verification
app.post("/login",async(req,res)=>{
    try{
    const username = req.body.username
    const password = req.body.password
    const user_data = await Register.findOne({username:username})
    if(user_data.password==password){
      req.session.user = user_data
      res.status(201).redirect("/")
    }
    else{
      res.send("Invalid login details")
      return
    }
  }
  catch(error){
    res.status(400).send("Invalid login details")
  }
})

// register
app.get('/register',(req,res)=>{
  res.render("register")
})

// register-post
app.post('/register',async(req,res)=>{
  try{
    const password = req.body.password
    const repassword = req.body.repassword
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const username = req.body.username
    const prof = req.body.prof

    if(!firstname){
      res.send("firstname is required")
      return
    }
    if(!lastname){
      res.send("lastname is required")
      return
    }
    if(!email){
      res.send("email is required")
      return
    }
    if(!username){
      res.send("username is required")
      return
    }
    if(!password){
      res.send("password is required")
      return
    }
    if(!prof){
      res.send("profession is required")
    }
 
    else{
      const userdata = new Register({
        firstname:firstname,
        lastname:lastname,
        email:email,
        username:username,
        password : password,
        profession : prof
      })
      const registered = await userdata.save()
      res.status(201).redirect("/");
    }
   
  }
  catch(error){
    res.status(400).send(error)
  }
})


// course-single
app.get('/course-single',(req,res)=>{
  res.render("course-single")
})

// upload-course
app.get('/upload',(req,res)=>{
  res.render("upload")
})

// upload-course
app.post('/upload',async(req,res)=>{
  const user = req.session.user
  if(user.profession=="teacher")
  {try{
    const course_name = req.body.course_name
    const fees = req.body.fees
    const lectures = req.body.lectures
    const language = req.body.language
    const description = req.body.description
    const level = req.body.level
    const category = req.body.category

    const obj = new Course({
     course_name : course_name,
     fees : fees,
     lectures : lectures,
     language : language,
     description : description,
     level : level,
     category : category,
    })
    const courses = await obj.save()
    res.status(201).redirect("/")
  }

  catch(error){
    console.log(error)
    res.status(400).send(error)
  }}
  else{
    res.send("Only teachers can upload courses !")
  }
})

app.listen(port, () => {
  console.log(`skillup listening on port http://localhost:${port}`)
})