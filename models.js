const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique : true,
        trim: true
    },
    email: {
        type: String,
        required: true,
    },
    friendsCount: {
        type: Number,
        default: 0,
    },
    thoughts: {
        type: Array,
        default: []
    },
    friends: {
        type: Array,
        default: []
    }
});

const ThoughtSchema = new mongoose.Schema({
    thoughtText: {
        type: String,
        required: true,
        maxlength: 280
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reactions: {
        type: Array,
        default: []
    },
    reactionsCount: {
        type: Number,
        default: 0
    }
});

const ReactionSchema = new mongoose.Schema({
    reactionBody: {
        type: String, 
        required: true,
        maxlength: 280
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", UserSchema);
const Thought = mongoose.model("Thought", ThoughtSchema);
const Reaction = mongoose.model("Reaction", ReactionSchema)

module.exports.User = User;
module.exports.Thought = Thought;
module.exports.Reaction = Reaction;