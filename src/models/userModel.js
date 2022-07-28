const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, "fname is required"],
        trim : true
    },
    lname: {
        type: String,
        required: [true, "lname is required"],
        trim : true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        trim : true
    },
    profileImage: {
        type: String,
        required: [true, "profileImage is required"],
        trim : true
    }, // s3 link
    phone: {
        type: String,
        required: [true, "phone is required"],
        unique: true,
        trim : true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        trim : true
        // minLen: 8, 
        // maxLen: 15
    }, // encrypted password
    address: {
        shipping: {
            street: {
                type: String,
                required: [true, "street is required"],
                trim : true
            },
            city: {
                type: String,
                required: [true, "city is required"],
                trim : true
            },
            pincode: {
                type: Number,
                required: [true, "pincode is required"],
                trim : true
            }
        },
        billing: {
            street: {
                type: String,
                required: [true, "street is required"],
                trim : true
            },
            city: {
                type: String,
                required: [true, "city is required"],
                trim : true
            },
            pincode: {
                type: Number,
                required: [true, "pincode is required"],
                trim : true
            }
        }
    }
}, { timestamps: true }
);

module.exports = mongoose.model("User", userSchema)
