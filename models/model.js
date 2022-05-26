const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    payerId:String,
    paymentId:String,
    token:String
});

const User = mongoose.model('user',userSchema);
module.exports=User;