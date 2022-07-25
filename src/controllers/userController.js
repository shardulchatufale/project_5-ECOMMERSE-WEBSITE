const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { uploadFile } = require('../middleWare/fileUpload');


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
            res.status(400).send({ msg: "No file found" })
        }
        let body = req.body;
        let { fname, lname, email, phone, address, password } = body;
        

        let profileImage = uploadedFileURL;
        let validUserData = {fname, lname, email, profileImage, phone, address, password}

        validUserData.profileImage = profileImage

        let userdata = await userModel.create(validUserData);
        return res.status(201).send({ status: true, data: userdata });

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message });

    }
}

module.exports = { createUser };