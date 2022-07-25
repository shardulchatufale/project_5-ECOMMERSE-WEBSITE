const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { uploadFile } = require('../middleWare/fileUpload');

const isValid = function(x) {
    if (typeof x === "undefined" || x === null) return false;
    if (typeof x === "string" && x.trim().length === 0) return false;

    return true;
};

const isValidBody = function(x) {
    return Object.keys(x).length > 0;
};


const createUser = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            var uploadedFileURL = await uploadFile(files[0])
            //res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
           
        }
        else {
            return res.status(400).send({ msg: "No file found" })
        }
        let body = req.body;

        if (!isValidBody(body)) {
            return res.status(400).send({ status: false, message: "Invalid Request Parameter, Please Provide Another Details" });
        }

        let { fname, lname, email, phone, address, password } = body;

        //validations
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "First name is Required" })
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Last name is Required" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is Required" })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Phone number is Required" })
        }
        let {shipping, billing}= address
        if (!isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Address is Required" })
        }
        // if(address){
        //     //let add = JSON.stringify(address)
        //     let obj= JSON.parse(address)
        //     console.log(obj.shipping)
        // }
        //console.log(address)



        let profileImage = uploadedFileURL;
        let validUserData = {fname, lname, email, profileImage, phone, address, password}

        if(!isValid(profileImage)) return res.status(400).send({ status: false, message: "Profile image is required" })


        validUserData.profileImage = profileImage

        let userdata = await userModel.create(validUserData);
        return res.status(201).send({ status: true, data: userdata });

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message });

    }
}

module.exports = { createUser };