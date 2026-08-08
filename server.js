const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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

أجب باللغة العربية عندما يكون السؤال بالعربية.

عند التعامل مع ملف دراسي:

- اقرأ المحتوى بعناية.

- حدد الأسئلة والمطلوب.

- حل الأسئلة بالترتيب.

- اشرح خطوات الحل.

- راجع النتائج قبل تقديمها.

- لا تخترع معلومات غير موجودة.
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
  
  if (data.error) {
  throw new Error(data.error);
  }
  
  if (!data.choices || !data.choices[0]) {
  throw new Error("لم يصل رد من نموذج الذكاء الاصطناعي.");
  }
  
  return data.choices[0].message.content;
  }

/* محادثة عادية */

app.post("/chat", async (req, res) => {

try {

    const message = req.body.message || "";

    const reply = await askNexus(message);

    res.json({
        reply
    });

} catch (error) {

    console.log(error);

    res.status(500).json({
        reply: "خطأ من Nexus AI: " + error.message
    });
}

});

/* قراءة PDF وحله */

app.post("/chat-file", upload.single("file"), async (req, res) => {

try {

    if (!req.file) {

        return res.status(400).json({
            reply: "لم يتم إرسال ملف."
        });

    }

    const pdf = await pdfParse(req.file.buffer);

    const fileText = pdf.text.trim();

    if (!fileText) {

        return res.status(400).json({
            reply: "لم أستطع استخراج النص من الملف."
        });

    }

    const userRequest =
        req.body.message ||
        "حل جميع الأسئلة الموجودة في الملف مع شرح الخطوات.";


    const prompt = `

المستخدم أرسل ملف PDF.

طلب المستخدم:
${userRequest}

محتوى الملف:

${fileText}

---

حل المطلوب كاملًا وبالترتيب.
اكتب الحل بطريقة واضحة ومنظمة.
`;

    const reply = await askNexus(prompt);


    res.json({
        reply,
        fileName: req.file.originalname,
        pages: pdf.numpages
    });


} catch (error) {

    console.log(error);

    res.status(500).json({
        reply: "تعذر معالجة الملف: " + error.message
    });
}

});

/* إنشاء PDF للحل */

app.post("/create-pdf", async (req, res) => {

try {

    const text = req.body.text || "";

    if (!text.trim()) {

        return res.status(400).json({
            error: "لا يوجد محتوى لإنشاء PDF."
        });

    }


    const fileName =
        "nexus-solution-" + Date.now() + ".pdf";

    const filePath =
        path.join("/tmp", fileName);


    const doc = new PDFDocument({
        margin: 50
    });


    const stream =
        fs.createWriteStream(filePath);


    doc.pipe(stream);


    doc.fontSize(18)
        .text("Nexus AI - Solution", {
            align: "center"
        });


    doc.moveDown();


    doc.fontSize(12)
        .text(text, {
            align: "left",
            lineGap: 6
        });


    doc.end();


    stream.on("finish", () => {

        res.json({
            url: "/download/" + fileName
        });

    });


} catch (error) {

    console.log(error);

    res.status(500).json({
        error: error.message
    });

}

});

/* تحميل ملف PDF */

app.get("/download/:file", (req, res) => {

const filePath =
    path.join("/tmp", req.params.file);

if (!fs.existsSync(filePath)) {

    return res.status(404).send("الملف غير موجود.");
}

res.download(filePath);

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