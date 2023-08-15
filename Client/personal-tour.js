const backwardBtn = document.getElementById('backwardBtn');
const forwardBtn = document.getElementById('forwardBtn');
const content = document.querySelector('.museum');

let scrollIntervals = []; // List to store interval IDs
let activeButtons = {backward: false, forward: false}; // Object to track active buttons and their directions

fixOrientation();

function scrollContent(direction) {
    if (activeButtons.backward && activeButtons.forward) {
        stopScrolling();
        return;
    }

    const scrollInterval = setInterval(() => {
        content.scrollLeft += direction * 5; // Adjust the scroll speed as needed
    }, 50); // Adjust the interval time as needed

    scrollIntervals.push(scrollInterval);
}

function stopScrolling() {
    scrollIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
    });

    scrollIntervals = [];
    backwardBtn.src = "98/icon/button-left.png";
    forwardBtn.src = "98/icon/button-right.png";
    activeButtons = {};
    fixOrientation();
}

function fixOrientation() {
    forwardBtn.style.transform = "rotate(0deg)";
    backwardBtn.style.transform = "rotate(0deg)";
}

function handleScrollStart(direction) {
    return function () {
        activeButtons[direction > 0 ? 'forward' : 'backward'] = true;
        scrollContent(direction);
        if (direction < 0) {
            backwardBtn.src = "98/icon/button-left-active.png";
        } else if (direction > 0) {
            forwardBtn.src = "98/icon/button-right-active.png";
        }
    };
}

function handleScrollEnd(direction) {
    return function () {
        activeButtons[direction > 0 ? 'forward' : 'backward'] = false;
        if (!activeButtons.backward && !activeButtons.forward) {
            stopScrolling();
        }
    };
}

backwardBtn.addEventListener('mousedown', handleScrollStart(-2)); // Scroll backward on mouse press
forwardBtn.addEventListener('mousedown', handleScrollStart(2)); // Scroll forward on mouse press

// For mobile touch events
backwardBtn.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleScrollStart(-2)();
});
forwardBtn.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleScrollStart(2)();
});

backwardBtn.addEventListener('mouseup', handleScrollEnd(-2));
forwardBtn.addEventListener('mouseup', handleScrollEnd(2));
backwardBtn.addEventListener('mouseout', handleScrollEnd(-2));
forwardBtn.addEventListener('mouseout', handleScrollEnd(2));

// For mobile touch events
backwardBtn.addEventListener('touchend', handleScrollEnd(-2));
forwardBtn.addEventListener('touchend', handleScrollEnd(2));
backwardBtn.addEventListener('touchcancel', handleScrollEnd(-2));
forwardBtn.addEventListener('touchcancel', handleScrollEnd(2));

function StartTour(){
    document.getElementById("personal-tour-pre").style.display= "none";
    document.getElementById("tour").style.display= "block";
}

