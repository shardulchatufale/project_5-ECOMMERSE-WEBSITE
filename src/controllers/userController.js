const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const objectId = require('mongoose').Types.ObjectId
const { uploadFile } = require('../middleWare/fileUpload');

const saltRounds = 10;

let phoneRegex = /^[6-9]\d{9}$/;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
let pincodeRegex = /^[1-9]{1}[0-9]{5}$/; 

const isValid = function (x) {
    if (typeof x === "undefined" || x === null) return false;
    if (typeof x === "string" && x.trim().length === 0) return false;

    return true;
};

const isValidBody = function (x) {
    return Object.keys(x).length > 0;
};

// Create User ------>
const createUser = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
            var uploadedFileURL = await uploadFile(files[0])
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
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is Required" })
        }

        if(!phoneRegex.test(phone)) return res.status(400).send({ status: false, message: "Phone is not valid, enter a valid phone number" })

        if(!emailRegex.test(email)) return res.status(400).send({ status: false, message: "Email is not valid" })

        if(!passwordRegex.test(password)) return res.status(400).send({ status: false, message: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & # ] and length should be min of 8-15 charachaters" })


        //address
        if (!isValid(address)) {
            return res.status(400).send({ status: false, message: "Address is Required" })
        }

        let { shipping, billing } = address

        //shipping
        if (!isValid(address.shipping)) {
            return res.status(400).send({ status: false, message: "Shipping is Required" })
        }
        if (!isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: "Street is Required" })
        }
        if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "Address is Required" })
        }
        if (!isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Address is Required" })
        }
        if(!pincodeRegex.test(shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode is not valid, it should be number and of 6 digits only" })

        //billing
        if (!isValid(address.billing)) {
            return res.status(400).send({ status: false, message: "Billing is Required" })
        }
        if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: "Street is Required" })
        }
        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "Address is Required" })
        }
        if (!isValid(billing.pincode)) {
            return res.status(400).send({ status: false, message: "Address is Required" })
        }
        if(!pincodeRegex.test(billing.pincode)) return res.status(400).send({ status: false, message: "Pincode is not valid, it should be number and of 6 digits only" })



        let profileImage = uploadedFileURL;

        let encryptedPassword = await bcrypt.hash(password, saltRounds)

        let validUserData = { fname, lname, email, profileImage: profileImage, phone, address, password: encryptedPassword }

        if (!isValid(profileImage)) return res.status(400).send({ status: false, message: "Profile image is required" })

        //validUserData.profileImage = profileImage

        let userdata = await userModel.create(validUserData);
        return res.status(201).send({ status: true, data: userdata });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


// Login User-------->
const loginUser = async function (req, res) {
    try {
        let email = req.body.email 
        let password = req.body.password  

        
        // Email validation 
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is Required" })
        }
        if(!emailRegex.test(email)) return res.status(400).send({ status: false, message: "Email is not valid" })



        // Password validation 
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is Required" })
        }
        if(!passwordRegex.test(password)) return res.status(400).send({ status: false, message: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & # ] and length should be min of 8-15 charachaters" })


        let findUser = await userModel.findOne({ email: email })
        if (!findUser) return res.status(404).send({ status: false, msg: 'invalid emailId' })

        let verifiedPassword = await bcrypt.compare(password, findUser.password)
        console.log(verifiedPassword);
        if (!verifiedPassword) return res.status(400).send({ status: false, message: "Invalid credentials" })

        let token = jwt.sign({
            userId: findUser._id.toString(),
            batch: "radon",
            organization: "functionUp"
        }, "GroupNo-61", { expiresIn: '1h' })
        //console.log(token)

        return res.status(200).send({ status: true, UserId: findUser._id, token: token })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}
//* ********* * /
//req.headers['authorization']

// Get User ------->
const getUser = async function (req, res) {
    try {
        userId = req.params.userId;
        //if (!objectId.isValid(userId)) return res.status(400).send({ status: false, message: "Invalid userId" });

        let userData = await userModel.findById(userId);

        if (!userData) return res.status(404).send({ status: false, message: "User data not found" });

        return res.status(200).send({ status: true, message: "User profile details", data: userData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


// Update User --------> 
const updateUser = async function (req, res) {
    let userId = req.params.userId
    if (!objectId.isValid(userId)) return res.status(400).send({ status: false, message: "Invalid userId" });

    let body = req.body
    if (!isValidBody(body)) {
        return res.status(400).send({ status: false, message: "Invalid Request Parameter, Please Provide Another Details" });
    }

    let { fname, lname, email, phone, address, password } = body;

    //validations======>

    if ("fname" in body && !isValid(fname)) {
        return res.status(400).send({ status: false, message: "First name is Required" })
    }
    if ("lname" in body && !isValid(lname)) {
        return res.status(400).send({ status: false, message: "Last name is Required" })
    }
    if ("email" in body && !isValid(email)) {
        return res.status(400).send({ status: false, message: "Email is Required" })
    }
    if ("phone" in body && !isValid(phone)) {
        return res.status(400).send({ status: false, message: "Phone number is Required" })
    }
    if ("password" in body && !isValid(password)) {
        return res.status(400).send({ status: false, message: "Password is Required" })
    }

    // //address validation ======>
    if ("address" in body && !isValid(address)) {
        return res.status(400).send({ status: false, message: "Address is Required" })
    }

    let { shipping, billing } = address

    //shipping validation =======>

    // [if(shipping.street) {
    //     let updatedShippingStreet = shipping.street
    // }]
    // if ("shipping" in body.address && !isValid(address.shipping)) {
    //     return res.status(400).send({ status: false, message: "Shipping is Required" })
    // }
    // if ("street" in body.address.shipping && !isValid(shipping.street)) {
    //     return res.status(400).send({ status: false, message: "Street is Required" })
    // }
    // if (!isValid(shipping.city)) {
    //     return res.status(400).send({ status: false, message: "Address is Required" })
    // }
    // if (!isValid(shipping.pincode)) {
    //     return res.status(400).send({ status: false, message: "Address is Required" })
    // }

    // //billing validation========>
    // if (!isValid(address.billing)) {
    //     return res.status(400).send({ status: false, message: "Billing is Required" })
    // }
    // if (!isValid(billing.street)) {
    //     return res.status(400).send({ status: false, message: "Street is Required" })
    // }
    // if (!isValid(billing.city)) {
    //     return res.status(400).send({ status: false, message: "Address is Required" })
    // }
    // if (!isValid(billing.pincode)) {
    //     return res.status(400).send({ status: false, message: "Address is Required" })
    // }

    //let validUserData = { fname, lname, email, profileImage: profileImage, phone, address, password: encryptedPassword }

    let updatedData = await userModel.findByIdAndUpdate(
        { _id: userId },
        {
            fname,
            lname,
            email,
            phone,
            address,
            password
        },
        { new: true });
    if(!updatedData) return res.status(404).send({ status: false, message: "User not found" }); 

    return res.status(200).send({status: false, message: "User profile updated", data: updatedData})

}

module.exports = { createUser, loginUser, getUser, updateUser };