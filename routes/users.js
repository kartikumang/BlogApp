
var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/realblog');

var userSchema = mongoose.Schema({
  username:String,
  password:String,
  profileImage:{
    type:String,
    default: './images/Uploads/default.png'},
  posts:[
    {type: mongoose.Schema.Types.ObjectId,
    ref: 'posts'}
  ],
  email:String,
  name:String
})
userSchema.plugin(plm);
module.exports = mongoose.model('users',userSchema);