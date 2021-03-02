var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local');
var multer = require('multer');
var postModel = require('./post');
var userModel = require('./users');
passport.use(new localStrategy(userModel.authenticate()));


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/Uploads')
  },
  filename: function (req, file, cb) {
    var date = new Date();
    var filename = date.getTime() + file.originalname;
    cb(null, filename)
  }
})
 
var upload = multer({ storage: storage })

router.post('/postblog',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      autor:foundUser._id,
      post:req.body.post
    })
    .then(function(createdPost){
      foundUser.posts.push(createdPost);
      foundUser.save()
      .then(function(){
        res.redirect('/profile');
      })
    })
  })
});
router.post('/upload',upload.single('image'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    foundUser.profileImage = `../images/Uploads/${req.file.filename}`;
    foundUser.save()
    .then(function(){
      req.flash('status','Image Sucessfully Uploaded !');
      res.redirect('/profile');
    });
  });
});

router.get('/', function(req, res, next){
  if(req.isAuthenticated()){
    postModel.findRandom({},{},{limit: 3, populate: 'author'},function(err, results){
      if(!err){
        res.render('index',{loggedIn: true, results:results});
      }
    });
  }
  else{
    postModel.findRandom({},{},{limit: 3, populate: 'author'}, function(err, results){
      if(!err){
        res.render('index',{loggedIn:false, results:results});
      }
    });
  }
});
router.get('/login',function(req,res){
  res.render('login');
});

router.get('/register',function(req,res){
  res.render('register');
});

router.get('/blogs',function(req,res){
  postModel.find()
  .then(function(posts){
     res.send(posts);
  })
});
router.get('/profile',isLoggedIn,function(req,res){
  userModel.findOne({username: req.session.passport.user}) 
  .populate('posts')
  .exec(function(err,data){
     res.render('profile', {details: data})
  });
});
router.get('/update',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    res.render('update',{details: foundUser});
  })
})

router.post('/update',function(req,res){
  userModel.findOneAndUpdate({username: req.session.passport.user},{
    name: req.body.name,
    username: req.body.username,
    email: req.body.email
  }, {new:true})
  .then(function(updatedUser){
    res.redirect('/profile');
  })
})

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res){});


router.post('/register',function(req,res){
  var userData = new userModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  })
  userModel.register(userData,req.body.password)
   .then(function(registeredUser){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/profile');
      })
   })
});
router.get('/logout',function(req,res){
  req.logOut();
  res.redirect('/')
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('error','You need to Login First !');
    res.redirect('/login');
  }
}
module.exports = router;
