const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const authenticateUser = require("./middlewares/authenticateUser");
const app = express();
const controller = require('./app/controller');

app.set('views', './views');
app.set('view engine', 'pug');
app.set("view engine", "ejs");


mongoose
  .connect("mongodb://localhost/user", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to mongodb cloud! :)");
  })
  .catch((err) => {
    console.log(err);
  });


app.use(bodyparser.urlencoded({ extended: true })); 
app.use(express.static("public"));
app.use('/scripts', express.static(path.join(__dirname, './node_modules')));
app.use(
  cookieSession({
    keys: ["randadsmkllkmsaomStringASyoulikehjasdjojsadudfsajk"],
  })
);

// route for serving frontend files

  

app
  .get("/", (req, res) => {
    res.render("index.ejs");
  })
  .get("/login", (req, res) => {
    res.render("login");
  })
  .get("/register", (req, res) => {
    res.render("register");
  })
  .get("/home.pug", authenticateUser, controller.loadHome)

  .post('/upload', controller.uploadFile);

///////

// mongdb cloud connection is here


// middlewares


// cookie session


// route for handling post requirests
app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExits = await User.findOne({ email });

    if (!doesUserExits) {
      res.send("invalid username or password");
      return;
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      res.send("invalid useranme or password");
      return;
    }

    // else he\s logged in
    req.session.user = {
      email,
    };

    res.redirect("/home.pug");
  })
  .post("/register", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
      res.send("A user with that email already exits please try another one!");
      return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword });

    latestUser
      .save()
      .then(() => {
        res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  });

//logout
app.get("/logout", authenticateUser, (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});
app.post('/getfile', (req, res) =>{ 
  return controller.getFile(req, res);
})

// server config
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
