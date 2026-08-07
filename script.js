const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

sendBtn.addEventListener("click", async function () {

    let message = userInput.value;

    if (message.trim() === "") return;

    chatBox.innerHTML += `
    <p>👤 أنت: ${message}</p>
    `;

    userInput.value = "";

    let response = await fetch("https://nexus-ai-server-ro8a.onrender.com/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message
        })
    });

    let data = await response.json();

    chatBox.innerHTML += `
    <p>🤖 Nexus AI: ${data.reply}</p>
    `;

});