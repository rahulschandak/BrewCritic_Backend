import mongoose from "mongoose";
const { Schema } = mongoose;
import passportLocalMongoose from "passport-local-mongoose";

const BrewerySchema = new Schema({
  bid: {
    type: String,
    required: true,
    index: true,
  },
  likedBy: {
    type: Array,
    default: [],
  },
  dislikedBy: {
    type: Array,
    default: [],
  },
  visitedBy: {
    type: Array,
    default: [],
  },
  reviewedBy: {
    type: Array,
    default: [],
  },
  ownedBy: {
    type: Array,
    default: [],
  },
});

BrewerySchema.plugin(passportLocalMongoose);

const Brewery = mongoose.model("Brewery", BrewerySchema);

export default Brewery;
