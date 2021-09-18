require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const https = require("https");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const YOUR_DOMAIN = window.location.origin;

const storeItems = new Map([
    [1, { priceInCents: 500, name: "MM Monthly Financial Analysis" }],
    [2, { priceInCents: 100, name: "MM Weekly Financial Analysis" }],
]);

// send file when user opens web app
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/signup.html"));
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
    const server = "";
    const audId = "";
    const url = "https://" + server + ".api.mailchimp.com/3.0/lists/" + audId;
    const options = {
        method: "POST",
        auth: "markom:-us5",
    };
    const request = https.request(url, options, (response) => {
        const status = response.statusCode;
        console.log(status);
        if (status === 200) {
            res.sendFile(path.join(__dirname, "public/success.html"));
        } else {
            res.sendFile(path.join(__dirname, "public/failure.html"));
        }
    });

    request.write(jsonData);
    request.end();
});

app.post("/create-checkout-session", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "MM Finance NewsLetter Test Product",
                    },
                    unit_amount: 1000,
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.SERVER_URL}/sucess.html`,
        cancel_url: `${process.env.SERVER_URL}/failure.html`,
    });
    res.redirect(303, session.url);
});

app.post("/failure", (req, res) => {
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
