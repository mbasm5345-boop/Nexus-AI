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

/* إضافة رسالة للمحادثة */

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

/* إرسال الرسالة */

async function sendMessage() {

const message = userInput.value.trim();

if (!message && selectedFiles.length === 0) {
    return;
}

if (message) {
    addMessage(message, "user");
}

userInput.value = "";

const thinking = document.createElement("div");

thinking.className = "message ai";

thinking.innerHTML = `
    <div class="message-content">
        🤖 Nexus AI يفكر...
    </div>
`;

chatBox.appendChild(thinking);

chatBox.scrollTop = chatBox.scrollHeight;


try {

    const response = await fetch("/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: message
        })

    });


    const data = await response.json();

    thinking.remove();

    addMessage(
        data.reply || "لم يصل رد من Nexus AI.",
        "ai"
    );


} catch (error) {

    thinking.remove();

    addMessage(
        "❌ حدث خطأ في الاتصال بالسيرفر.",
        "ai"
    );
}


selectedFiles = [];

fileUpload.value = "";

filePreview.innerHTML = "";

}

/* زر الإرسال */

sendBtn.addEventListener("click", sendMessage);

/* Ctrl + Enter للإرسال */

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

    alert("✅ تم نسخ المحادثة. يمكنك مشاركتها الآن.");

} catch {

    alert("تعذر نسخ المحادثة.");
}

});