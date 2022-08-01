const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');
const ObjectId = require('mongoose').Types.ObjectId;

const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false;
    if (typeof val === "string" && val.trim().length === 0) return false;

    return true;
};
const isValidBody = function (val) {
    return Object.keys(val).length > 0;
};

const createCart = async function (req, res) {

    let userId = req.params.userId;
    let data = req.body;

    let { cartId, productId, quantity } = data;

    if(!isValidBody(data)) return res.status(400).send({status: false, message: "Invalid Request Parameter, Please Provide Another Details"})

    //if(!isValid(productId)) return res.status(400).send({ status: false, message: "productId is required" });
    if (!ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Please enter a valid prductId" });

    if (quantity) {
        if (!isValid(quantity)) return res.status(400).send({ status: false, message: "quantity is required" });
        quantity = Number(quantity);
        if (quantity < 1) return res.status(400).send({ status: false, message: "quantity must be greater than one" });
    } else {
        quantity = 1;
    }
    let getProduct = await productModel.findOne({ _id: productId, isDeleted: false });
    if (!getProduct) return res.status(404).send({ status: false, message: "Product not found" });

    let cartData = await cartModel.findOne({ userId: userId });
    if (cartData) {
        //if(!isValid(cartId)) return res.status(400).send({ status: false, message: "cartId is required" });
        if (!ObjectId.isValid(cartId)) return res.status(400).send({ status: false, message: "Please enter a valid cartId" });
        if (cartData._id != cartId) return res.status(400).send({ status: false, message: "cart does not belong to this user" });

        let index = -1;
        for (let i = 0; i < cartData.items.length; i++) {
            if (cartData.items[i].productId == productId) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            cartData.items[index].quantity += quantity;
        } else {
            cartData.items.push({ productId, quantity })
        }

        let total = cartData.totalPrice + (getProduct.price * quantity);
        cartData.totalPrice = total;

        cartData.totalItems = cartData.items.length;

        await cartData.save();
        //return success(res, 201, cartData, '✅ Item added successfully and Cart updated!')
        return res.status(201).send({ status: true, message: "Cart updated successfully", data: cartData });
    }

    let total = getProduct.price * quantity

    const object = {
        userId: userId,
        items: [{ productId: productId, quantity: quantity }],
        totalPrice: total,
        totalItems: 1
    }

    let newCart = await cartModel.create(object);
    return res.status(201).send({ status: true, data: newCart });

}


module.exports = { createCart };