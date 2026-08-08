const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`
                },
                body: JSON.stringify({
                    model: "Qwen/Qwen2.5-7B-Instruct",
                    messages: [
                        {
                            role: "system",
                            content: "أنت Nexus AI، مساعد ذكي ومفيد للطلاب."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (data.error) {
            return res.json({
                reply: "خطأ من Hugging Face: " + data.error
            });
        }

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (error) {
        console.log(error);

        res.json({
            reply: "خطأ في السيرفر: " + error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Nexus AI running");
});