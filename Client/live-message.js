const socket = io();

socket.on("connect", ()=>{
    messages.innerHTML= null;
    socket.emit("join-room");
    socket.emit("user-join");
    displayConnected1();
    // room.value=""
    // room.placeholder="public"
})

socket.on("disconnect", ()=> displayDisConnected1() );

socket.on("receive-message", (usernameValue,messageValue,date)=> displayMessage(usernameValue, messageValue,  new Date(date)));

socket.on("loadMessages", (messagePack)=> {
    messages.innerHTML = "";
    messagePack.forEach(m=>displayMessage(m.username, m.message, new Date(m.date)));
});


const message = document.getElementById("message");
// const room = document.getElementById("room");
const username = document.getElementById("username");

const form = document.getElementById("message-form");
// const roomSubmit = document.getElementById("send-room");

const messages = document.getElementById("messages");

form.addEventListener("submit", e=>{
    e.preventDefault();
    const messageValue =  message.value;
    const usernameValue =  username.value;
// const roomValue = room.value;
if(messageValue!=="") {
    displayMessage(usernameValue, messageValue, new Date());
    console.log("calling with message "+messageValue)
    socket.emit('send-message', usernameValue, messageValue, new Date());
    message.value = "";
}
})

setInterval(updateDate, 1000);

function updateDate(){
    document.querySelectorAll(".message-instance").forEach(instance=>{
        const hiddenDate = instance.querySelector(".hidden-date").innerText;
        instance.querySelector(".visible-date").innerText = getTimeAgoString(new Date(hiddenDate))
    })
}

function displayMessage(username, message, date){
    if(username == null || username === "" || username ===" "){
        username="anonymous";
    }
    let messageElement;
    if((message === "/clear_image")) {
        messageElement = `<div class="window message-instance">
                        <div class="flexer" >
                        <p style="padding-right: 0">&lt${username}&gt:</p>
                        <p class="message-content" style="padding-left: 0; color: green">${message}</p></div>
                        <p class="visible-date" style="font-size: 1rem; text-align: right; line-height: 0; position: relative; bottom: 0.8rem; padding: 0; margin: 0.5rem 0.5rem 0; color: rgba(0,0,0,0.5)">${getTimeAgoString(date)}</p>
                        <p style="display: none" class="hidden-date">${date}</p>
                        </div>`;
    }else{
        messageElement = `<div class="window message-instance">
                        <div class="flexer" >
                        <p style="padding-right: 0">&lt${username}&gt:</p>
                        <p class="message-content" style="padding-left: 0;">${message}</p></div>
                        <p class="visible-date" style="font-size: 1rem; text-align: right; line-height: 0; position: relative; bottom: 0.8rem; padding: 0; margin: 0.5rem 0.5rem 0; color: rgba(0,0,0,0.5)">${getTimeAgoString(date)}</p>
                        <p style="display: none" class="hidden-date">${date}</p>
                        </div>`;
    }

    messages.innerHTML += messageElement;
    messages.scrollTop = messages.scrollHeight
}

function displayConnected1(){
    console.log("status1")
    const status = document.getElementById("message-status");
    status.src = "media/images/drawings/connect.png";
}

function getTimeAgoString(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // Difference in seconds
    const current = Math.floor(date/1000);
    if (diff < 60) {
        return `${diff} sec ago`;
    } else if (diff < 3600) {
        const mins = Math.floor(diff / 60);
        return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // Convert hours to 12-hour format and determine if it's AM or PM
        const period = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight

        // Pad minutes with leading zero if necessary
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        // Return the formatted time
        return `${formattedHours}:${formattedMinutes} ${period}`;
    } else {
        const days = Math.floor(diff / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

function displayDisConnected1(){
    socket.emit("user-leave");
    const status = document.getElementById("message-status");
    status.src = "media/images/drawings/disconnect.png";
}




