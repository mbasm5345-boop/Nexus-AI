const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        const result = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "أنت Nexus AI، مساعد ذكي يجيب بشكل مرتب ومفيد."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({
            reply: result.choices[0].message.content
        });

    } catch (error) {
        console.log(error);

        res.json({
            reply: "حدث خطأ في الاتصال بالذكاء الاصطناعي."
        });
    }
});

app.listen(3000, () => {
    console.log("Nexus AI running");
});