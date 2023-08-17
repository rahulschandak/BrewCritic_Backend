import jwt from "jsonwebtoken";
import { config } from "dotenv";

import User from '../models/User.js';

config()


const COOKIE_OPTION = {
    sameSite: "none",
    signed: true,
    secure: true,
    maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
    httpOnly: true,
};

const getToken = (userToBeSigned) =>
    jwt.sign(userToBeSigned, process.env.JWT_SECRET, {
        expiresIn: eval(process.env.SESSION_EXPIRY),
});

const getRefreshToken = (userToBeSigned) =>
    jwt.sign(userToBeSigned, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
});



export const getUser = [
    (req, res, next) => {
        const { signedCookies = {} } = req
        const { refreshToken } = signedCookies
        
        //return if token not found
        if (!refreshToken){
            return res.status(401).send("Unauthorized")
        }

        const pload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        User.findOne({ _id: pload._id })
            .then(user => {
                if (user) {
                    const tknIndx = user.refreshToken.findIndex(tkn => tkn.refreshToken === refreshToken)
                    if (tknIndx === -1) {
                        return res.status(401).send("Unauthorized")
                    }
                    const token = jwt.sign({ _id: pload._id}, process.env.JWT_SECRET, {
                        expiresIn: eval(process.env.SESSION_EXPIRY)
                    })

                    const newRefreshToken = jwt.sign({ _id: pload._id }, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY)
                    })
                    user.refreshToken[tknIndx] = { refreshToken: newRefreshToken }
                    user.save((err, user) => {
                        if (err) {
                            return res.status(500).send("Error updating user")
                        } else {
                            res.cookie("refreshToken", newRefreshToken, COOKIE_OPTION)
                            res.send({ success: true, token })
                        }
                    })
                }

            })
            .catch(err => next(err))
    }
]

export const register = [
    (req, res, next) => {
        const { firstName, lastName, username, password, email, city, role, photo } = req.body;

        if (!firstName) {
            return res.status(500).send({
                error: "The first name is required"
            });
        } else if (!role) {
            return res.status(500).send({
                error: "The role is required"
            });
        }


        // Register the user and update tokens
        User.register(
            new User({ username: username }),
            password,
            (err, user) => {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    user.firstName = firstName;
                    user.lastName = lastName || "";
                    user.email = email || "";
                    user.city = city || "Boston";
                    user.role = role || "user";
                    user.bio = "";
                    user.photo = photo;
                    
                    const newToken = getToken({ _id: user._id })
                    const newRefTkn = getRefreshToken({ _id: user._id })
                    user.refreshToken.push({ refreshToken: newRefTkn })
                    user.save((err, user) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            res.cookie("refreshToken", newRefTkn, COOKIE_OPTION)
                            res.send({ success: true, token: newToken })
                        }
                    })
                }
            }
        )
    }
]

export const login = [
    (req, res, next) => {
        const token = getToken({ _id: req.user._id })
        const refreshToken = getRefreshToken({ _id: req.user._id })

        //Check if User already exists
        User.findById(req.user._id).then(
            user => {
                user.refreshToken.push({ refreshToken })
                user.save((err, user) => {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        res.cookie("refreshToken", refreshToken, COOKIE_OPTION)
                        res.send({ success: true, token })
                    }
                })
            },
            err => next(err)
        )
        }
]

export const logout = [
    (req, res, next) => {
        const { signedCookie: { refreshToken } = {} } = req;
      
        User.findById(req.user._id)
          .then((user) => {
            const tknIndx = user.refreshToken.findIndex(
              (tkn) => tkn.refreshToken === refreshToken
            );
      
            if (tknIndx !== -1) {
              user.refreshToken.id(user.refreshToken[tknIndx]._id).remove();
            }
      
            return user.save();
          })
          .then((user) => {
            res.clearCookie("refreshToken", COOKIE_OPTION);
            res.send({ success: true });
          })
          .catch((err) => {
            return res.status(500).send(err);
          });
    }  
]

export const getProfile = [
    (req, res, next) => {
        var userId = req.params['uid']
        if (!userId) {
            return res.send(req.user)
        }

        User.findOne({ username: userId })
            .then(user => {
                if (user) {
                    return res.send(user)
                }
                res.status(404).send("User not found")
            })
            .catch((err) => {
                res.send(err)
            })
    
    }
]

export const updateUser = [
    (req, res, next) => {
        const { username, firstName, lastName, email, phone, role, city, bio } = req.body;

        if (!username) {
            return res.status(500).send({
                error: "The username is required"
            });
        }

        User.updateOne(
        { username: username },
        {
            firstName,
            lastName,
            email,
            phone,
            role,
            city,
            bio,
        }
        )
        .then((result) => {
            res.send({ success: true });
        })
        .catch((err) => {
            res.send(err);
        });
      }
      
]