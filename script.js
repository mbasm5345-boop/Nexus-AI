const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const attachBtn = document.getElementById("attachBtn");
const fileUpload = document.getElementById("fileUpload");
const filePreview = document.getElementById("filePreview");
const newChatBtn = document.getElementById("newChatBtn");
const shareBtn = document.getElementById("shareBtn");

let selectedFiles = [];

/* إرفاق ملف */

attachBtn.addEventListener("click", () => {

fileUpload.value = "";

fileUpload.click();

});

/* اختيار الملفات */

fileUpload.addEventListener("change", () => {

selectedFiles = Array.from(fileUpload.files);

filePreview.innerHTML = "";

selectedFiles.forEach(file => {

    const item = document.createElement("div");

    item.className = "file-item";

    item.textContent = "📎 " + file.name;

    filePreview.appendChild(item);

});

});

/* إضافة رسالة */

function addMessage(text, type, showPDF = false) {

const message = document.createElement("div");

message.className = "message " + type;


const content = document.createElement("div");

content.className = "message-content";

content.textContent = text;

message.appendChild(content);


/* زر إنشاء PDF */

if (showPDF && type === "ai") {

    const pdfButton = document.createElement("button");

    pdfButton.textContent = "📥 تحميل الحل PDF";

    pdfButton.className = "pdf-download-btn";


    pdfButton.addEventListener("click", async () => {

        pdfButton.disabled = true;

        pdfButton.textContent = "⏳ تجهيز PDF...";


        try {

            const response = await fetch("/create-pdf", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: text
                })

            });


            const data = await response.json();


            if (!response.ok || !data.url) {

                throw new Error(
                    data.error || "تعذر إنشاء الملف."
                );

            }


            const link =
                document.createElement("a");

            link.href = data.url;

            link.download = "Nexus-Solution.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();


            pdfButton.textContent =
                "✅ تم تجهيز PDF";


        } catch (error) {

            console.error(error);

            pdfButton.disabled = false;

            pdfButton.textContent =
                "❌ حاول مرة أخرى";

        }

    });


    message.appendChild(pdfButton);

}


chatBox.appendChild(message);

chatBox.scrollTop =
    chatBox.scrollHeight;

}

/* التفكير */

function showThinking() {

const thinking =
    document.createElement("div");

thinking.className =
    "message ai";

thinking.id =
    "thinkingMessage";

thinking.innerHTML = `
    <div class="message-content">
        🤖 Nexus AI يقرأ ويحل...
    </div>
`;

chatBox.appendChild(thinking);

chatBox.scrollTop =
    chatBox.scrollHeight;

}

function removeThinking() {

const thinking =
    document.getElementById(
        "thinkingMessage"
    );

if (thinking) {
    thinking.remove();
}

}

/* إرسال */

async function sendMessage() {

const message =
    userInput.value.trim();


if (
    !message &&
    selectedFiles.length === 0
) {
    return;
}


if (message) {

    addMessage(
        message,
        "user"
    );

}


if (selectedFiles.length > 0) {

    selectedFiles.forEach(file => {

        addMessage(
            "📎 " + file.name,
            "user"
        );

    });

}


userInput.value = "";

showThinking();


try {

    let response;


    /* PDF */

    if (selectedFiles.length > 0) {

        const formData =
            new FormData();


        formData.append(
            "file",
            selectedFiles[0]
        );


        formData.append(
            "message",
            message ||
            "حل جميع الأسئلة الموجودة في الملف مع شرح خطوات الحل."
        );


        response = await fetch(
            "/chat-file",
            {
                method: "POST",
                body: formData
            }
        );

    }


    /* رسالة عادية */

    else {

        response = await fetch(
            "/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message
                })
            }
        );

    }


    const data =
        await response.json();


    removeThinking();


    if (!response.ok) {

        addMessage(
            data.reply ||
            "حدث خطأ.",
            "ai"
        );

    } else {

        addMessage(
            data.reply ||
            "لم يصل رد.",
            "ai",
            selectedFiles.length > 0
        );

    }


} catch (error) {

    console.error(error);

    removeThinking();

    addMessage(
        "❌ حدث خطأ في الاتصال بالسيرفر.",
        "ai"
    );

}


selectedFiles = [];

fileUpload.value = "";

filePreview.innerHTML = "";

}

/* إرسال */

sendBtn.addEventListener(
"click",
sendMessage
);

/* Ctrl + Enter */

userInput.addEventListener(
"keydown",
event => {

    if (
        event.key === "Enter" &&
        event.ctrlKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}

);

/* محادثة جديدة */

newChatBtn.addEventListener(
"click",
() => {

    chatBox.innerHTML = `
        <div class="welcome">

            <div class="welcome-icon">
                🤖
            </div>

            <h2>
                أهلًا بك في Nexus AI
            </h2>

            <p>
                كيف يمكنني مساعدتك اليوم؟
            </p>

            <div class="quick-actions">

                <button>
                    📚 حل واجب
                </button>

                <button>
                    📝 كتابة تقرير
                </button>

                <button>
                    📄 تحليل ملف
                </button>

                <button>
                    💡 شرح درس
                </button>

            </div>

        </div>
    `;

    selectedFiles = [];

    fileUpload.value = "";

    filePreview.innerHTML = "";

}

);

/* مشاركة المحادثة */

shareBtn.addEventListener(
"click",
async () => {

    const text =
        chatBox.innerText;

    try {

        await navigator.clipboard
            .writeText(text);

        alert(
            "✅ تم نسخ المحادثة."
        );

    } catch {

        alert(
            "تعذر نسخ المحادثة."
        );

    }

}

);