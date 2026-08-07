const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "أنت Nexus AI، مساعد ذكي ومفيد."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        res.json({
            reply: data.choices[0].message.content
        });

    catch (error) {
    console.log(error);

    res.json({
        reply: "خطأ: " + error.message
    });
}
});

app.listen(3000, () => {
    console.log("Nexus AI running");
});