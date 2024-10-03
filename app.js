const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const helmet = require("helmet");

const app = express();
dotenv.config();
app.use(helmet());

const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.f2ke8.mongodb.net/registrationFormDB`, {
   useNewUrlParser: true,
   useUnifiedTopology: true, 
}).then(() => {
   console.log("Connected to MongoDB");
}).catch((err) => {
   console.error("Error connecting to MongoDB", err);
});

// registration schema
const registrationSchema = new mongoose.Schema({
    email: String,
    password: String
});

// model of registration schema
const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to serve static files
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
});

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await Registration.findOne({ email });
        // Check for existing user
        if (!existingUser) {
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);

            const registrationData = new Registration({
                email,
                password: hashedPassword
            });

            await registrationData.save();
            res.redirect("/success");
        } else {
            console.log("User already exists");
            res.redirect("/error");
        }
    } catch (error) {
        console.error(error);
        res.redirect("/error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/public/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/public/error.html");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
