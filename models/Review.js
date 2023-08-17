import mongoose from "mongoose";
const { Schema } = mongoose;
import passportLocalMongoose from "passport-local-mongoose";

const BreweryReviewSchema = new Schema({
  bid: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  review: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 1,
  },
});

BreweryReviewSchema.plugin(passportLocalMongoose);

const BreweryReviewModel = mongoose.model("BreweryReview", BreweryReviewSchema);

export default BreweryReviewModel;
