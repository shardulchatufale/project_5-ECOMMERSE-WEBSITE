const express = require('express');
const { createUser, loginUser, getUser, updateUser } = require('../controllers/userController');
const { authentication, authorization } = require('../middleWare/auth');
const { createProduct, getProduct, getProductById, updateProductDetails, deleteProducts } = require('../controllers/productController');
const {createCart,updateCart,getCart,deleteCart} = require('../controllers/cartController');
const { orderCreate,updateOrder } = require('../controllers/orderController');


const router = express.Router();

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, authorization, getUser);
router.put('/user/:userId/profile', authentication, authorization, updateUser);

/*************PRODUCT ROUTES👍*************/
router.post('/products', createProduct)
router.get('/products', getProduct)
router.get('/products/:productId', getProductById)
router.put('/products/:productId', updateProductDetails)
router.delete('/products/:productId', deleteProducts)


/**************CART ROUTES **************/
router.post('/users/:userId/cart', authentication,authorization, createCart)
router.put('/users/:userId/cart',authentication,authorization, updateCart)
router.get('/users/:userId/cart',authentication,authorization, getCart)
router.delete('/users/:userId/cart',authentication,authorization, deleteCart)

/**************ORDER ROUTES*************/
router.post('/users/:userId/orders', authentication,authorization,orderCreate)
router.put("/users/:userId/orders", authentication,authorization,updateOrder)


//FOR WRONG URL
router.all('/**', (req, res) => {
    return res.status(404).send({ msg: 'This url is invalid' })
})

module.exports = router;