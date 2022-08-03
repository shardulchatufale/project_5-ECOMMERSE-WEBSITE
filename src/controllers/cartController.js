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

    if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Request Parameter, Please Provide Another Details" })

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
    return res.status(201).send({ status: true, message: 'Success', data: newCart });

}

const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body

        let { cartId, productId, removeProduct, ...rest } = data

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "Please enter only valid keys" });

        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Request Parameter, Please Provide Another Details" })

        if (!ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Please enter a valid prductId" });

        if (!ObjectId.isValid(cartId)) return res.status(400).send({ status: false, message: "Please enter a valid cartId" });

        if (!isValid(removeProduct)) return res.status(400).send({ status: false, message: "removeProduct is required" });

        removeProduct = Number(removeProduct)
        if (removeProduct < 0 || removeProduct > 1) return res.status(400).send({ status: false, message: 'please enter 0 or 1 in removeProduct' })

        let cart = await cartModel.findOne({ userId: userId })
        if (!cart) return res.status(404).send({ status: false, message: 'This user has no cart' })
        if (cart._id.toString() !== cartId) return res.status(400).send({ status: false, message: 'This cartId is not for the user who logged in' })

        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: 'product not found' })

        //using loop
        let index = 0
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {
                index = i;
            }
        }

        //removeProduct == 0
        if (removeProduct == 0) {
            let total = cart.totalPrice - (product.price * cart.items[index].quantity)
            cart.totalPrice = total
            cart.items.splice(index, 1)
        }

        //removeProduct == 1
        if (removeProduct == 1) {
            if (cart.items[index].quantity == 1) {
                cart.items.splice(index, 1)
                cart.totalItems = cart.totalItems - 1
                let total = cart.totalPrice - product.price
                cart.totalPrice = total
            } else {
                cart.items[index].quantity = cart.items[index].quantity - 1
                let total = cart.totalPrice - product.price
                cart.totalPrice = total
            }
        }
        cart.totalItems = cart.items.length
        await cart.save()
        return res.status(200).send({ status: true, message: 'Success', data: cart })

    } catch (err) {
        console.log(err)
        return res.status(500).send(err.message)
    }
}

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let cartData = await cartModel.findOne({ userId: userId })
        if(!cartData) return res.status(404).send({status:false,message:'cart not found for this user'})
        return res.status(200).send({status:false,message:'Success',data:cartData})

    } catch (err) {
        console.log(err)
        return res.status(500).send(err.message)
    }

}

const deleteCart= async function(req,res){
    try{
        let userId = req.params.userId
        let cartData = await cartModel.findOneAndUpdate({userId : userId},{$set:{items:[],totalItems : 0,totalPrice : 0}},{new : true})
        if(!cartData) return res.status(404).send({status:false,message:'cart not found for the user'})
        return res.status(204).send({status:true,message:'Success',data:cartData})

    }catch(err){
        console.log(err)
        return res.status(500).send(err.message)
    }
}

module.exports = { createCart, updateCart, getCart,deleteCart };