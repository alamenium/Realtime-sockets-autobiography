const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let x1 = 0;
let y1 = 0;
let penColor = 8; // Default pen color (assigned to white)
const penThickness = 5; // Default pen thickness

const canvasHeight = 200;
canvas.height = canvasHeight;

// Function to update the canvas width based on its container's width
function updateCanvasWidth() {
    const canvasContainer = document.querySelector('#canvas-container');
    const containerWidth = canvasContainer.offsetWidth;
    canvas.width = containerWidth * 0.98;
    socket.emit('reload');
}

// Call the function initially and on window resize
updateCanvasWidth();

socket.on("clear", updateCanvasWidth);
const startDrawing = (e) => {
    isDrawing = true;
    const { x, y } = getCanvasCoordinates(e);
    x1 = x;
    y1 = y;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', (e) => {

    e.preventDefault();
    startDrawing(e);
});

const draw = (e) => {
    if (!isDrawing) return;

    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    const x2 = x;
    const y2 = y;

    // Send drawing data to the server
    socket.emit('draw', { x1, y1, x2, y2, c: penColor });
    drawLine(x1, y1, x2, y2, penColor, penThickness);
    x1 = x2;
    y1 = y2;
}

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});


// Function to calculate mouse coordinates relative to the canvas
function getCanvasCoordinates(e) {
    const canvasRect = canvas.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    let mouseX, mouseY;

    if (e instanceof MouseEvent) {
        // Mouse event
        mouseX = e.pageX - (canvasRect.left + scrollX);
        mouseY = e.pageY - (canvasRect.top + scrollY);
    } else if (e instanceof TouchEvent) {
        // Touch event
        mouseX = e.touches[0].clientX - canvasRect.left;
        mouseY = e.touches[0].clientY - canvasRect.top;
    } else {
        // Unsupported event type
        console.error("Unsupported event type");
        return null;
    }

    return { x: mouseX, y: mouseY };
}

const stopDrawing = () => {
    socket.emit('stop-drawing');
    isDrawing = false;
}

canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchend', stopDrawing);

function drawLine(x1, y1, x2, y2, c, thickness) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = getColorFromCode(c);
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.closePath();
}
// Function to load existing drawing data from the server and draw it on the canvas
function loadDrawing(existingDrawingData) {
    existingDrawingData.forEach((data) => {
        drawLine(data.x1, data.y1, data.x2, data.y2, data.c, penThickness);
    });
}

// Listen for the 'loadDrawing' event from the server
socket.on('loadDrawing', (existingDrawingData) => {
    loadDrawing(existingDrawingData);
});

// Listen for drawing data from the server and draw on the canvas
socket.on('draw', (data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2, data.c, penThickness);
});

// Function to set the pen color when the button is clicked
function setColor(colorCode) {
    penColor = getCodeFromColor(colorCode);
}

// Function to convert color code to single-digit code
function getCodeFromColor(colorCode) {
    switch (colorCode) {
        case '#000000': return 0; // Black
        case '#ff0000': return 1; // Red
        case '#00ff00': return 2; // Green
        case '#0000ff': return 3; // Blue
        case '#ffff00': return 4; // Yellow
        case '#ff00ff': return 5; // Magenta
        case '#00ffff': return 6; // Cyan
        case '#ffa500': return 7; // Orange
        case '#ffffff': return 8; // White
        default: return 0; // Default to Black
    }
}

// Function to convert color code to color name
function getColorFromCode(code) {
    switch (code) {
        case 0: return '#000000'; // Black
        case 1: return '#ff0000'; // Red
        case 2: return '#00ff00'; // Green
        case 3: return '#0000ff'; // Blue
        case 4: return '#ffff00'; // Yellow
        case 5: return '#ff00ff'; // Magenta
        case 6: return '#00ffff'; // Cyan
        case 7: return '#ffa500'; // Orange
        case 8: return '#ffffff'; // White
        default: return '#000000'; // Default to Black
    }
}


socket.on("connect", displayConnected);
socket.on("disconnect", displayDisConnected);

function displayConnected() {
    const status2 = document.getElementById("draw-status");
    status2.src = "media/images/drawings/connect.png";
}

function displayDisConnected() {
    const status2 = document.getElementById("draw-status");
    status2.src = "media/images/drawings/disconnect.png";
}
