const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.post("/chat", (req, res) => {

    const message = req.body.message;

    res.json({
        reply: "🤖 استلمت طلبك: " + message
    });

});

app.listen(3000, () => {
    console.log("Nexus AI running");
});
