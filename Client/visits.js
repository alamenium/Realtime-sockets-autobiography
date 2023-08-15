const sockettt = io();

sockettt.on('connect', ()=>{
    sockettt.emit("new-user");
})

sockettt.on("user-count", (visits)=>{
    document.getElementById("visit-counter-main").innerHTML=`Total visits ${visits}`;
})
sockettt.on("online-count", (online)=>{
    console.log("sex2")
    document.getElementById("online-count").innerHTML=`Online: ${online}`;
})
