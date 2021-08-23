const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const https = require("https");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const subItem = new Map([
    [1, { priceInUSD: 5, name: "MM Montly Financial Analysis" }],
]);

// send file when user opens web app
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/signup.html"));
});

app.post("/", (req, res) => {
    // read the user entry
    let firstName = req.body.fName;
    let lastName = req.body.lName;
    let email = req.body.email;

    // format data how mailchimp wants it
    var data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                },
            },
        ],
    };

    // convert to json
    const jsonData = JSON.stringify(data);
    const server = "us5";
    const audId = "";
    const url = "https://" + server + ".api.mailchimp.com/3.0/lists/" + audId;
    const options = {
        method: "POST",
        auth: "",
    };
    const request = https.request(url, options, (response) => {
        const status = response.statusCode;
        console.log(status);
        if (status === 200) {
            res.sendFile(path.join(__dirname, "/success.html"));
        } else {
            res.sendFile(path.join(__dirname, "/failure.html"));
        }
    });

    request.write(jsonData);
    request.end();
});

app.post("/failure", (req, res) => {
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
