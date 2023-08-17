import mongoose from "mongoose";
const { Schema } = mongoose;
import passportLocalMongoose from "passport-local-mongoose";

const SessionSchema = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
});

const UserSchema = new Schema({
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "user",
  },
  bio: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    default: "",
  },
  likes: {
    type: Array,
    default: [],
  },
  dislikes: {
    type: Array,
    default: [],
  },
  visits: {
    type: Array,
    default: [],
  },
  owns: {
    type: Array,
    default: [],
  },
  authStrategy: {
    type: String,
    default: "local",
  },
  points: {
    type: Number,
    default: 50,
  },
  refreshToken: {
    type: [SessionSchema],
  },
});

// Remove refreshToken from the response
UserSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refreshToken;
    return ret;
  },
});

UserSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
