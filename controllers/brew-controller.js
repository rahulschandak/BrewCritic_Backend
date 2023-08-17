import jwt from "jsonwebtoken";
import { config } from "dotenv";

import Brewery from "../models/Brewery.js";
import User from "../models/User.js"
import Review from "../models/Review.js" 

config()

export const stats = [
    (req, res, next) => {
        var brewId = req.params['bid']
        if (!brewId) {
            res.status(404).send("Brewery not found")
        }
        
        Brewery.findOne({ bid: brewId })
            .then(brewery => {
                if(!brewery) {
                    return res.send({
                        likes: 0,
                        likedByUser: false
                    })
                }
                res.send({
                    ...brewery._doc,
                    likes: brewery.likedBy.length,
                    dislikes: brewery.dislikedBy.length,
                    visits: brewery.visitedBy.length,
                    reviewsCount: brewery.reviewedBy.length,
                    likedByUser: brewery.likedBy.includes(req.user._id),
                    dislikedByUser: brewery.dislikedBy.includes(req.user._id),
                    visitedByUser: brewery.visitedBy.includes(req.user._id),
                    ownedByUser: brewery.ownedBy.includes(req.user._id),
                    userRole: req.user.role
                })
            })
            .catch((err) => {
                res.send(err)
            })

    }
]

export const like = [
    (req, res, next) => {
        const { bid, liked } = req.body;

        if (!bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        }

        //Like Post
        if (!liked) {
            Brewery.updateOne(
                { bid },
                { $addToSet: { likedBy: req.user._id } },
                { upsert: true }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { likes: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, liked: true });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        } else {
            // Unlike
            Brewery.updateOne(
                { bid },
                { $pull: { likedBy: req.user._id } },
                { upsert: false }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { likes: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, liked: false });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        }
    }
]

export const dislike = [
    (req, res, next) => {
        const { bid, disliked } = req.body;

        if (!bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        }

        //Dislike Post
        if (!disliked) {
            Brewery.updateOne(
                { bid },
                { $addToSet: { dislikedBy: req.user._id } },
                { upsert: true }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { dislikes: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, disliked: true });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        } else {
            // Undo dislike
            Brewery.updateOne(
                { bid },
                { $pull: { dislikedBy: req.user._id } },
                { upsert: false }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { dislikes: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, disliked: true });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        }
    }
]

export const visit = [
    (req, res, next) => {
        const { bid, visited } = req.body;
    
        if (!bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        }
        if (!visited) {
            Brewery.updateOne(
                { bid },
                { $addToSet: { visitedBy: req.user._id } },
                { upsert: true }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { visits: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, visited: true });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        } else {
            // Unvisit
            Brewery.updateOne(
                { bid },
                { $pull: { visitedBy: req.user._id } },
                { upsert: false }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { visits: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, visited: false });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        }
    }
]

export const own = [
    (req, res, next) => {
        const { bid, owned } = req.body;
    
        if (!bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        } 
        if (req.user.role !== 'admin') {
            return res.status(401).send({
                name: "owner",
                message: "Have to be Admin to do this!",
            });
        }
        //Place under ownership
        if (!owned) {
            Brewery.updateOne(
                { bid },
                { $addToSet: { ownedBy: req.user._id } },
                { upsert: true }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { owns: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, owned: true });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        } else {
            // Sell
            Brewery.updateOne(
                { bid },
                { $pull: { ownedBy: req.user._id } },
                { upsert: false }
            )
                .then(updatedBrewery => {
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { owns: bid } },
                        { upsert: false }
                    )
                        .then(updatedUser => {
                            res.send({ success: updatedUser.acknowledged, owned: false });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        }
    }    
]

export const createReview = [
    (req, res, next) => {
        const { bid, title, review, rating } = req.body;
    
        // Verify that bid is not empty
        if (!bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        }

        Review.updateOne(
            { bid, username: req.user.username },
            { $set: { title, review, rating } },
            { upsert: true }
        )
            .then(result => {
                Brewery.updateOne(
                    { bid },
                    { $addToSet: { reviewedBy: req.user._id } },
                    { upsert: true }
                )
                    .then(result => {
                        return res.send({ success: result.acknowledged });
                    })
                    .catch(err => {
                        return res.status(500).send(err)
                    });
            })
            .catch(err => {
                return res.status(500).send(err)
            });
    }
]

export const getReview = [
    (req, res, next) => {
        const bid = req.params.bid;
    
        // Verify that bid is not empty
        if (!bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        }
        let reviewsList = [];
        Review.find({ bid })
            .then(reviews => {
                if (reviews.length > 0) {
                    const promises = reviews.map(element =>
                        User.findOne({ username: element.username }).then(user => {
                            reviewsList.push({
                                ...element._doc,
                                photo: user.photo,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                role: user.role
                            });
                        })
                    );

                    Promise.all(promises).then(() => {
                        res.send(reviewsList);
                    });
                } else {
                    return res.status(404).send({
                        success: false
                    });
                }
            })
            .catch(err => {
                res.send(err);
            });
    }
]

export const deleteReview = [
    (req, res, next) => {
        // Verify that bid and username are not empty
        if (!req.body.username || !req.body.bid) {
            return res.status(500).send({
                name: "bid",
                message: "Require Brewery ID",
            });
        } else if (req.user.role !== 'admin') {
            return res.status(401).send({
                name: "admin",
                message: "Must be Admin",
            });
        } else {
            Review.deleteOne({ bid: req.body.bid, username: req.body.username })
                .then(_ => {
                    //Delete for Brewery as well
                    Brewery.updateOne(
                        { bid: req.body.bid },
                        { $pull: { "reviewedBy": req.user._id } },
                        { upsert: false }
                    )
                        .then(() => {
                            res.send({ success: true });
                        })
                        .catch(err => {
                            return res.status(500).send(err)
                        });
                })
                .catch(err => {
                    return res.status(500).send(err)
                });
        }
    }
]