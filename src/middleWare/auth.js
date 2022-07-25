const jwt = require('jsonwebtoken')
const objectId = require('mongoose').Types.ObjectId

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['Authorization'];
        if (!token) token = req.headers['authorization']
        if (!token) return res.status(401).send({ status: false, message: "token must be present" });
        token = token.split(' ')[1];
        //console.log(token);
        // console.log(token[1])

        jwt.verify(token, "GroupNo-61", (error, decodedToken) => {
            if (error) {
                const message =
                    error.message == "jwt expired"
                        ? 'Token is expired'
                        : 'Token is invalid'
                return res.status(401).send({ status: false, message })
            }
            req['userId'] = decodedToken['userId'];
            next();
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const authorization = async function (req, res, next) {
    try {
        let userLoggedIn = req['userId'];

        let userWanttoGetData = req.params.userId;
        if (!objectId.isValid(userWanttoGetData)) return res.status(400).send({ status: false, message: "Invalid userId" });

        if (userLoggedIn != userWanttoGetData) return res.status(403).send({ status: false, message: "User not authorized" })
        next();
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

module.exports = {authentication, authorization}