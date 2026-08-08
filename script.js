const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const attachBtn = document.getElementById("attachBtn");
const fileUpload = document.getElementById("fileUpload");
const filePreview = document.getElementById("filePreview");
const newChatBtn = document.getElementById("newChatBtn");
const shareBtn = document.getElementById("shareBtn");

let selectedFiles = [];

/* زر إرفاق الملفات */

attachBtn.addEventListener("click", () => {
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

function addMessage(text, type) {

const message = document.createElement("div");

message.className = "message " + type;

const content = document.createElement("div");

content.className = "message-content";

content.textContent = text;

message.appendChild(content);

chatBox.appendChild(message);

chatBox.scrollTop = chatBox.scrollHeight;

}

/* رسالة التفكير */

function showThinking() {

const thinking = document.createElement("div");

thinking.className = "message ai";

thinking.id = "thinkingMessage";

thinking.innerHTML = `
    <div class="message-content">
        🤖 Nexus AI يقرأ الملف ويحل الأسئلة...
    </div>
`;

chatBox.appendChild(thinking);

chatBox.scrollTop = chatBox.scrollHeight;

}

/* إزالة التفكير */

function removeThinking() {

const thinking = document.getElementById("thinkingMessage");

if (thinking) {
    thinking.remove();
}

}

/* إرسال رسالة أو ملف */

async function sendMessage() {

const message = userInput.value.trim();

if (!message && selectedFiles.length === 0) {
    return;
}


/* إظهار رسالة المستخدم */

if (message) {
    addMessage(message, "user");
}


/* إذا كان هناك ملف */

if (selectedFiles.length > 0) {

    selectedFiles.forEach(file => {

        addMessage(
            "📎 تم إرفاق الملف: " + file.name,
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

        const file = selectedFiles[0];

        const formData = new FormData();

        formData.append("file", file);

        formData.append(
            "message",
            message || "اقرأ الملف وحل جميع الأسئلة الموجودة فيه مع شرح خطوات الحل."
        );


        response = await fetch("/chat-file", {

            method: "POST",

            body: formData

        });

    }


    /* محادثة عادية */

    else {

        response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

    }


    const data = await response.json();

    removeThinking();


    if (!response.ok) {

        addMessage(
            data.reply || "حدث خطأ أثناء معالجة الطلب.",
            "ai"
        );

    } else {

        addMessage(
            data.reply || "لم يصل رد من Nexus AI.",
            "ai"
        );

    }


} catch (error) {

    console.error(error);

    removeThinking();

    addMessage(
        "❌ حدث خطأ أثناء الاتصال بالسيرفر.",
        "ai"
    );

}


/* تنظيف الملفات */

selectedFiles = [];

fileUpload.value = "";

filePreview.innerHTML = "";

}

/* زر الإرسال */

sendBtn.addEventListener("click", sendMessage);

/* Ctrl + Enter */

userInput.addEventListener("keydown", (event) => {

if (event.key === "Enter" && event.ctrlKey) {

    event.preventDefault();

    sendMessage();

}

});

/* محادثة جديدة */

newChatBtn.addEventListener("click", () => {

chatBox.innerHTML = `
    <div class="welcome">

        <div class="welcome-icon">🤖</div>

        <h2>أهلًا بك في Nexus AI</h2>

        <p>كيف يمكنني مساعدتك اليوم؟</p>

        <div class="quick-actions">

            <button>📚 حل واجب</button>

            <button>📝 كتابة تقرير</button>

            <button>📄 تحليل ملف</button>

            <button>💡 شرح درس</button>

        </div>

    </div>
`;

selectedFiles = [];

fileUpload.value = "";

filePreview.innerHTML = "";

});

/* مشاركة المحادثة */

shareBtn.addEventListener("click", async () => {

const text = chatBox.innerText;

try {

    await navigator.clipboard.writeText(text);

    alert("✅ تم نسخ المحادثة.");

} catch {

    alert("تعذر نسخ المحادثة.");

}

});