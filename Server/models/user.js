const mongoose = require('mongoose');

const Details=new mongoose.Schema({
    Name:String,
    PhoneNumber:String,
    Age:String,
    Weight:String,
    Sex:String,
    Pincode:String,
    BloodGroup:String,
    AadharCard:String,
    DateOfRecovery:String,
    DischargeReport:String,
    TestDate:String,
    Pregnant:String,
    Date:{
        type:Date,
        default:new Date()
    }
});

const User=new mongoose.Schema({
    Email:String,
    Password:String,
    Date: {
        type:Date,
        default: new Date()
    },
    detailes:[Details]
});

module.exports = mongoose.model('User', User);