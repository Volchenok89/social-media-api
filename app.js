const express = require('express');
const config = require('./config');
const mongoose = require('mongoose');
const { User, Thought } = require("./models");
const { response } = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/users", async (request, response) => {
    const user = new User(request.body);

    try {
      await user.save();
      response.send(user);
    } 
    catch (error) {
      response.status(500).send(error);
    }
});

//FRIENDS//

app.post("/api/users/:userId/friends/:friendId", async (req, res) => {
    const userId = req.params.userId;
    const friendId = req.params.friendId;
    await User.updateOne({ _id: userId }, { $push: { friends: friendId }, $inc: { friendsCount: 1 } } );
    
    const user = await User.findOne({ _id: userId });
    res.send(user);
});

app.delete("/api/users/:userId/friends/:friendId", async (req, res) => {
    const userId = req.params.userId;
    const friendId = req.params.friendId;
    await User.updateOne({ _id: userId }, { $pullAll: {friends: [friendId] }, $inc: { friendsCount: -1 } } );
    
    const user = await User.findOne({ _id: userId });
    res.send(user);
});


//USERS//

app.put("/api/users/:id", async (req, res) => {
    await User.updateOne({ _id: req.params.id }, req.body);
    let user = await User.findOne({ _id: req.params.id });
    res.send(user);
});

app.delete("/api/users/:id", async (req, res) => {
    let user = await User.findOne({ _id: req.params.id });

    if (user != null) {
        await Thought.deleteMany({
            username: user.username
        });
        await User.deleteOne({ _id: req.params.id });

        res.send({
            "message": "User and associated thoughts deleted"
        });
    }
    else {
        res.send({
            "message": "User id not found"
        });
    }
});

app.get("/api/users", async (request, response) => {
    const users = await User.aggregate([{
        $lookup: {
            from: "thoughts",
            localField: "username",
            foreignField: "username",
            as: "thougts"
        }
    }]);

    try {
      response.send(users);
    } 
    catch (error) {
      response.status(500).send(error);
    }
});

app.get("/api/users/:userId", async (req, res) => {
    const users = await User.aggregate([{
        $lookup: {
            from: "thoughts",
            localField: "username",
            foreignField: "username",
            as: "thougts"
        }
    }]);

    for (let i = 0; i < users.length; i++) {
        if (users[i]._id == req.params.userId) {
            res.send(users[i]);
        }
    }
});



//THOUGHTS//

app.post("/api/thoughts", async (req, res) => {
    const thought = new Thought(req.body);

    try {
        await thought.save();
        res.send(thought);
    }
    catch(error) {
        response.status(500).send(error);
    }
});

app.delete("/api/thoughts/:id", async (req, res) => {
    let thought = await Thought.findOne({ _id: req.params.id });

    if (thought != null) {
        await Thought.deleteOne({ _id: req.params.id });

        res.send({
            "message": "Thought deleted"
        });
    }
    else {
        res.send({
            "message": "Thought id not found"
        });
    }
});

app.get("/api/thoughts", async (req, res) => {
    const thoughts = await Thought.find({});
  
    try {
      res.send(thoughts);
    } 
    catch (error) {
      res.status(500).send(error);
    }
});

app.get("/api/thoughts/:thoughtId", async (req, res) => {
    const thought = await Thought.findOne({ _id: req.params.thoughtId });
  
    try {
      res.send(thought);
    } 
    catch (error) {
      res.status(500).send(error);
    }
});


//UPDATED post//


app.post("/api/thoughts/:id", async (req, res) => {
    const thoughtId = req.params.thoughtId;
    
    await Thought.updateOne({ _id: thoughtId }, { $push: { reactions: req.body }, $inc: { reactionsCount: 1 } } );
    
    const thought = await Thought.findOne({ _id: thoughtId });
    res.send(thought);
});

//END UPDATED//


//REACTIONS//

app.post("/api/thoughts/:thoughtId/reactions", async (req, res) => {
    const thoughtId = req.params.thoughtId;
    
    await Thought.updateOne({ _id: thoughtId }, { $push: { reactions: req.body }, $inc: { reactionsCount: 1 } } );
    
    const thought = await Thought.findOne({ _id: thoughtId });
    res.send(thought);
});


app.listen(PORT, async () => {

    await mongoose.connect(config.dbConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
    });
    
    console.log(`App listening on port ${PORT}!`);
});
