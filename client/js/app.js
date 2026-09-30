const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const userInfo = document.getElementById("userInfo");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const username = document.getElementById("username");
const userEmail = document.getElementById("userEmail");
const findUserForm = document.getElementById("findUserForm");
const userId = document.getElementById("userId");
const findUserMessage = document.getElementById("findUserMessage");
const foundUser = document.getElementById("foundUser");
const foundUsername = document.getElementById("foundUsername");
const foundUserId = document.getElementById("foundUserId");
const currentUserId = document.getElementById("currentUserId");
const copyUserId = document.getElementById("copyUserId");
const copyMessage = document.getElementById("copyMessage");
const friendRequests =
    document.getElementById("friendRequests");
const friendsList =
    document.getElementById("friendsList");
const conversationsList =
    document.getElementById("conversationsList");
const chatSection =
    document.getElementById("chatSection");
const chatUser =
    document.getElementById("chatUser");
const messagesList =
    document.getElementById("messagesList");
const messageStatus =
    document.getElementById("messageStatus");
const messageForm =
    document.getElementById("messageForm");
const messageInput =
    document.getElementById("messageInput");
let currentConversationId = null;
let currentConversationUserId = null;
let sessionPassword = null;
const userCache = {};
async function loadFriendRequests() {
    const response = await fetch("/api/friendships/requests");
    if (!response.ok) {
        return;
    }
    const data = await response.json();
    friendRequests.innerHTML = "";
    data.requests.forEach((request) => {
        const requestElement = document.createElement("div");
        requestElement.innerHTML = `
        <p>${request.username}</p>
        <p>${request.user_id}</p>
        <button type="button" class="acceptFriend">
            Accept
        </button>
        <button type="button" class="rejectFriend">
            Reject
        </button>
    `;
        requestElement
            .querySelector(".acceptFriend")
            .addEventListener("click", () => {
                handleFriendRequest(request.id, "accept");
            });
        requestElement
            .querySelector(".rejectFriend")
            .addEventListener("click", () => {
                handleFriendRequest(request.id, "reject");
            });
        friendRequests.appendChild(requestElement);
    });
}
async function loadFriends() {
    const response = await fetch("/api/friendships");
    if (!response.ok) {
        return;
    }
    const data = await response.json();
    friendsList.innerHTML = "";
    data.friends.forEach((friend) => {
        const friendElement = document.createElement("div");
        friendElement.innerHTML = `
            <p>Username: ${friend.username}</p>
            <p>User ID: ${friend.id}</p>
        `;
        friendsList.appendChild(friendElement);
    });
}
async function loadConversations() {
    const response = await fetch("/api/conversations");
    if (!response.ok) {
        return;
    }
    const data = await response.json();
    conversationsList.innerHTML = "";
    data.forEach((conversation) => {
        const conversationElement =
            document.createElement("div");
        conversationElement.innerHTML = `
            <p>Conversation ID: ${conversation.conversation_id}</p>
            <p>User ID: ${conversation.user_id}</p>
            <button type="button" class="openConversation">
                Open Chat
            </button>
        `;
        conversationElement
            .querySelector(".openConversation")
            .addEventListener("click", () => {
                openConversation(
                    conversation.conversation_id,
                    conversation.user_id
                );
            });
        conversationsList.appendChild(conversationElement);
    });
}
async function openConversation(
    conversationId,
    userId
) {
    currentConversationId = conversationId;
    currentConversationUserId = userId;
    chatSection.hidden = false;
    chatUser.textContent =
        `User ID: ${userId}`;
    messagesList.innerHTML = "";
    messageStatus.textContent =
        "Loading messages...";
    try {
        // 1. Lấy thông tin user hiện tại
        const meResponse =
            await fetch("/api/auth/me");
        const meData =
            await meResponse.json();
        if (!meResponse.ok) {
            throw new Error(
                "Failed to get current user"
            );
        }
        const myUserId =
            meData.user.id;
        // 2. Lấy key pair của chính mình
        console.log("KEY SETUP START");
        console.log("User ID:", meData.user.id);
        console.log("Password exists:", !!sessionPassword);
        const myKeyPair =
            await getOrCreateKeyPair(
                myUserId,
                sessionPassword
            );
        console.log("KEY SETUP DONE");
        // 3. Lấy messages
        const response =
            await fetch(
                `/api/messages/${conversationId}`
            );
        if (!response.ok) {
            const data =
                await response.json();
            throw new Error(
                data.message ||
                "Failed to load messages"
            );
        }
        const messages =
            await response.json();
        // 4. Giải mã từng message
        for (const message of messages) {
            const messageElement =
                document.createElement("div");
            try {
                let plaintext;
                // Message do chính mình gửi
                if (
                    message.sender_id ===
                    myUserId
                ) {
                    plaintext =
                        await decryptOwnMessage(
                            message,
                            myKeyPair.privateKey
                        );
                }
                // Message do người khác gửi
                else {
                    plaintext =
                        await decryptMessage(
                            message,
                            myKeyPair.privateKey
                        );
                }
                // 5. Hiển thị plaintext
                let senderUsername = message.sender_id;
                if (!userCache[message.sender_id]) {
                    const userResponse =
                        await fetch(
                            `/api/users/${message.sender_id}`
                        );
                    if (userResponse.ok) {
                        const userData =
                            await userResponse.json();
                        userCache[message.sender_id] =
                            userData.user.username;
                    }
                }
                senderUsername = userCache[message.sender_id] || message.sender_id;
                messageElement.textContent =
                    `${senderUsername}: ${plaintext}`;
            } catch (error) {
                console.error(
                    "Message decryption error:",
                    error
                );
                messageElement.innerHTML = `
                    <p>
                        Sender: ${message.sender_id}
                    </p>
                    <p>
                        Unable to decrypt message
                    </p>
                `;
            }
            messagesList.appendChild(
                messageElement
            );
        }
        messageStatus.textContent = "";
    } catch (error) {
        console.error(
            "Open conversation error:",
            error
        );
        messageStatus.textContent =
            error.message;
    }
}
async function handleFriendRequest(id, action) {
    const response = await fetch(
        `/api/friendships/${id}/${action}`,
        {
            method: "POST"
        }
    );
    const data = await response.json();
    if (!response.ok) {
        alert(data.message);
        return;
    }
    await loadFriendRequests();
    await loadFriends();
}
showRegister.addEventListener("click", () => {
    loginSection.hidden = true;
    registerSection.hidden = false;
    loginMessage.textContent = "";
});
showLogin.addEventListener("click", () => {
    registerSection.hidden = true;
    loginSection.hidden = false;
    registerMessage.textContent = "";
});
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const usernameValue =
        document.getElementById("registerUsername").value;
    const email =
        document.getElementById("registerEmail").value;
    const password =
        document.getElementById("registerPassword").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
        registerMessage.textContent =
            "Passwords do not match";
        return;
    }
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: usernameValue,
            email,
            password
        })
    });
    const data = await response.json();
    if (!response.ok) {
        registerMessage.textContent = data.message;
        return;
    }
    registerMessage.textContent =
        "Account created successfully";
    registerForm.reset();
    setTimeout(() => {
        registerSection.hidden = true;
        loginSection.hidden = false;
        loginMessage.textContent =
            "Account created. You can now log in.";
    }, 1000);
});
findUserForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = userId.value.trim();
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    if (!response.ok) {
        foundUser.hidden = true;
        findUserMessage.textContent = data.message;
        return;
    }
    findUserMessage.textContent = "";
    foundUsername.textContent = data.user.username;
    foundUserId.textContent = data.user.id;
    foundUser.hidden = false;
});
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email =
        document.getElementById("loginEmail").value;
    const password =
        document.getElementById("loginPassword").value;
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    const data = await response.json();
    if (!response.ok) {
        loginMessage.textContent = data.message;
        return;
    }
    sessionPassword = password;
    const meResponse =
        await fetch("/api/auth/me");
    const meData =
        await meResponse.json();
    loginSection.hidden = true;
    registerSection.hidden = true;
    userInfo.hidden = false;
    username.textContent =
        `Username: ${meData.user.username}`;
    userEmail.textContent =
        `Email: ${meData.user.email}`;
    currentUserId.textContent =
        meData.user.id;
    await getOrCreateKeyPair(
        meData.user.id,
        sessionPassword
    );
    await loadFriendRequests();
    await loadFriends();
    await loadConversations();
});
copyUserId.addEventListener("click", async () => {
    await navigator.clipboard.writeText(
        currentUserId.textContent
    );
    copyMessage.textContent =
        "User ID copied";
});
const addFriend = document.getElementById("addFriend");
const friendMessage = document.getElementById("friendMessage");
addFriend.addEventListener("click", async () => {
    const targetUserId = foundUserId.textContent;
    const response = await fetch("/api/friendships/request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            targetUserId
        })
    });
    const data = await response.json();
    friendMessage.textContent = data.message;
});
const logout = document.getElementById("logout");
const logoutMessage = document.getElementById("logoutMessage");
logout.addEventListener("click", async () => {
    const response = await fetch("/api/auth/logout", {
        method: "POST"
    });
    const data = await response.json();
    if (!response.ok) {
        logoutMessage.textContent = data.message;
        return;
    }
    sessionPassword = null;
    userInfo.hidden = true;
    loginSection.hidden = false;
    loginMessage.textContent =
        "You have been logged out.";
});
async function checkSession() {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
        return;
    }
    const data = await response.json();
    loginSection.hidden = true;
    registerSection.hidden = true;
    userInfo.hidden = false;
    username.textContent =
        `Username: ${data.user.username}`;
    userEmail.textContent =
        `Email: ${data.user.email}`;
    currentUserId.textContent =
        data.user.id;
    await loadFriendRequests();
    await loadFriends();
    await loadConversations();
}
messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message) {
        return;
    }
    if (!currentConversationId) {
        messageStatus.textContent =
            "Please open a conversation first.";
        return;
    }
    try {
        messageStatus.textContent =
            "Sending message...";
        const result =
            await sendEncryptedMessage(
                currentConversationId,
                currentConversationUserId,
                message
            );
        console.log("Message sent:", result);
        messageInput.value = "";
        messageStatus.textContent =
            "Message sent.";
        await openConversation(
            currentConversationId,
            currentConversationUserId
        );
    } catch (error) {
        console.error(
            "Send message error:",
            error
        );
        messageStatus.textContent =
            error.message;
    }
});
checkSession();
