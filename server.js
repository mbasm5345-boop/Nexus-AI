const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

const upload = multer({
storage: multer.memoryStorage(),
limits: {
fileSize: 20 * 1024 * 1024
}
});

async function askNexus(message) {

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
                    content: `

أنت Nexus AI، مساعد ذكي للطلاب.

أجب باللغة العربية عندما يكتب المستخدم بالعربية.

إذا أرسل المستخدم ملفًا دراسيًا:

- اقرأ محتوى الملف بعناية.

- حدد الأسئلة والمطلوب.

- حل الأسئلة خطوة بخطوة.

- اشرح طريقة الحل بوضوح.

- لا تخترع معلومات غير موجودة في الملف.

- إذا كان جزء من الملف غير واضح، أخبر المستخدم بذلك بدل التخمين.

- راجع الحسابات والنتائج قبل تقديمها.
  `
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
  throw new Error(data.error);
  }
  
  if (!data.choices || !data.choices[0]) {
  throw new Error("لم يصل رد من نموذج الذكاء الاصطناعي.");
  }
  
  return data.choices[0].message.content;
  }

/* المحادثة العادية */

app.post("/chat", async (req, res) => {

try {

    const message = req.body.message || "";

    if (!message.trim()) {
        return res.json({
            reply: "اكتب رسالتك أولًا."
        });
    }

    const reply = await askNexus(message);

    res.json({
        reply: reply
    });

} catch (error) {

    console.log(error);

    res.status(500).json({
        reply: "خطأ من Nexus AI: " + error.message
    });
}

});

/* رفع وقراءة ملفات PDF */

app.post("/chat-file", upload.single("file"), async (req, res) => {

try {

    if (!req.file) {
        return res.status(400).json({
            reply: "لم يتم إرسال ملف."
        });
    }

    const isPDF =
        req.file.mimetype === "application/pdf" ||
        req.file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
        return res.status(400).json({
            reply: "حاليًا Nexus AI يدعم ملفات PDF فقط."
        });
    }


    const pdf = await pdfParse(req.file.buffer);

    const fileText = pdf.text.trim();

    if (!fileText) {
        return res.status(400).json({
            reply: "لم أستطع استخراج نص من هذا الملف. قد يكون ملف PDF عبارة عن صور."
        });
    }


    const userRequest =
        req.body.message ||
        "اقرأ هذا الملف وحل الأسئلة الموجودة فيه مع شرح خطوات الحل.";


    const fullPrompt = `

المستخدم أرسل ملف PDF ويريد مساعدتك فيه.

طلب المستخدم:
${userRequest}

محتوى ملف PDF:

${fileText}

اقرأ المحتوى كاملًا، ثم نفذ طلب المستخدم.
إذا كان الملف يحتوي على أسئلة أو تمارين، حلها بالترتيب مع توضيح الخطوات.
`;

    const reply = await askNexus(fullPrompt);


    res.json({
        reply: reply,
        fileName: req.file.originalname,
        pages: pdf.numpages
    });


} catch (error) {

    console.log(error);

    res.status(500).json({
        reply: "تعذر قراءة الملف أو معالجته: " + error.message
    });
}

});

app.get("/health", (req, res) => {
res.json({
status: "ok",
service: "Nexus AI"
});
});

app.listen(3000, () => {
console.log("Nexus AI running");
});