let carVX = 0;
let carVY = 0;

let posX = 0;
let posY = 0;
let offX = -2100 * 0.6;
let offY = -700 * 0.6;

let carX = 480 / 2;
let carY = 720 / 1.5;
let carDir = 0;

let drag = 0.925;
let speed = 0.6; // will need to be tuned depending on the map size
let turnSpeed = 0.4; // ^
let moving = false;
let left = false;
let right = false;
let reverse = false;
let car;

let background;
let hasNpc = false;


let npcs = [
    /* {loc: [2100 * 0.6, 700 * 0.6]} */
];
let landmarks = [
    {loc: [1000, 1200], name: "{{NAME}}", description: "{{DESC}}"}
];

let input = [];

const init = () => {
    for (let i = 0; i < 15; i++) {
        npcs[i] = {loc: [Math.floor((Math.random() * 2000) + 1), Math.floor((Math.random() * 2000) + 1)]};
        landmarks[i] = {loc: [Math.floor((Math.random() * 2000) + 1), Math.floor((Math.random() * 2000) + 1)], name: "{{NAME}}", description: "{{DESC}}"};
    }

    document.getElementById("pre-game").style.transform = "translateY(0)";
    setTimeout(() => {
        document.getElementById("logo").style.transform = "translateY(0)";
        setTimeout(() => {
            document.getElementById("logo").style.transform = "translateY(-854px)";
            document.getElementById("intro").style.opacity = "0";
            setTimeout(() => {
                document.getElementById("instructions").style.transform = "translateY(0)";
                setTimeout(() => {
                    document.getElementById("skip").style.transform = "translateY(0)";
                }, 1000);
            }, 500);
        }, 2000);
    }, 300);
};

const act = (action, active) => {
    if (action === 'accelerate') {
        moving = active;
    } else if (action === 'left') {
        document.getElementById("left").classList.toggle("active");
        left = active;
    } else if (action === 'right') {
        if (active) {
            document.getElementById("right").classList.toggle("active");
        }
        right = active;
    }
};

const start = () => {
    document.getElementById("hideable").style.opacity = "1";
    document.getElementById("hideable").style.pointerEvents = "all";

    document.getElementById("pre-game").style.transform = "translateY(-854px)";

    car = document.getElementById("car");
    background = document.getElementById("map");

    // I indented this so I could collapse it in my IDE
    {
        document.getElementById("accelerate").addEventListener('touchstart', () => {
            act('accelerate', true);
        });
        document.getElementById("accelerate").addEventListener('touchend', () => {
            act('accelerate', false);
        });
        document.getElementById("accelerate").addEventListener('mousedown', () => {
            act('accelerate', true);
        });
        document.getElementById("accelerate").addEventListener('mouseup', () => {
            act('accelerate', false);
        });

        document.getElementById("left").addEventListener('touchstart', () => {
            act('left', true);
        });
        document.getElementById("left").addEventListener('touchend', () => {
            act('left', false);
        });
        document.getElementById("left").addEventListener('mousedown', () => {
            act('left', true);
        });
        document.getElementById("left").addEventListener('mouseup', () => {
            act('left', false);
        });

        document.getElementById("right").addEventListener('touchstart', () => {
            act('right', true);
        });
        document.getElementById("right").addEventListener('touchend', () => {
            act('right', false);
        });
        document.getElementById("right").addEventListener('mousedown', () => {
            act('right', true);
        });
        document.getElementById("right").addEventListener('mouseup', () => {
            act('right', false);
        });
    }

    for (let i = 0; i < npcs.length; i++) {
        let npc = npcs[i];
        let div = document.createElement("div");
        div.setAttribute("class", "npc");
        div.setAttribute("data-x", npc.loc[0]);
        div.setAttribute("data-y", npc.loc[1]);
        document.getElementById("hideable").appendChild(div);
    }

    for (let i = 0; i < landmarks.length; i++) {
        let landmark = landmarks[i];
        let div = document.createElement("div");
        div.setAttribute("class", "landmark");
        div.setAttribute("data-x", landmark.loc[0]);
        div.setAttribute("data-y", landmark.loc[1]);
        div.setAttribute("data-name", landmark.name);
        div.setAttribute("data-description", landmark.description);
        document.getElementById("hideable").appendChild(div);
    }

    document.addEventListener("keydown", (event) => input[event.keyCode] = true);
    document.addEventListener("keyup", (event) => input[event.keyCode] = false);

    setInterval(updatePos, 1000 / 60);
};

const updatePos = () => {

    if (moving || input[38]) {
        carVY += 0.5;
    }
    if (reverse || input[40]) {
        carVY -= 0.5;
    }

    if (left || input[37]) {
        carDir -= turnSpeed * carVY;
    }
    if (right || input[39]) {
        carDir += turnSpeed * carVY;
    }

    carX += carVY * speed * Math.sin(radians(carDir));
    carY += carVY * -speed * Math.cos(radians(carDir));

    posX = carX;
    posY = carY;

    carVX *= drag;
    carVY *= drag;

    car.style.transform = "translateX(" + (480 / 2) + "px) translateY(" + (720 / 1.5) + "px) rotate(" + (carDir) + "deg)";
    background.style.transform = "translateX(" + (-posX + offX) + "px) translateY(" + (-posY + offY) + "px)";

    let npcDivs = document.getElementsByClassName("npc");
    let landmarkDivs = document.getElementsByClassName("landmark");

    for (let i = 0; i < npcDivs.length; i++) {
        let npc = npcDivs[i];
        npc.style.transform = "translateX(" + (-posX + offX + parseInt(npc.getAttribute("data-x"))) + "px) translateY(" + (-posY + offY + parseInt(npc.getAttribute("data-y"))) + "px)";
    }

    if (hasNpc) {
        for (let i = 0; i < landmarkDivs.length; i++) {
            let landmark = landmarkDivs[i];
            landmark.style.transform = "translateX(" + (-posX + offX + parseInt(landmark.getAttribute("data-x"))) + "px) translateY(" + (-posY + offY + parseInt(landmark.getAttribute("data-y"))) + "px)";
            landmark.style.opacity = "1";
        }
    } else {
        for (let i = 0; i < landmarkDivs.length; i++) {
            let landmark = landmarkDivs[i];
            landmark.style.opacity = "0";
        }
    }

};

const radians = (degrees) => {
    return degrees * Math.PI / 180;
};

const showLandmark = (name, img) => {
    if (name && img) {
        document.getElementById("landmarkName").innerHTML = name;
        document.getElementById("landmarkImg").src = img;
    }

    document.getElementById("showLandmark").style.transform = "translateX(0)";
    setTimeout(() => {
        document.getElementById("showLandmark").style.transform = "";
    }, 4000);
};

const showLocalGuideThing = () => {
    let container = document.getElementById("local-guide-container");
    container.style.transform = "translateX(0)";
};

let loggedInUser;

const signIn = () => {
    loggedInUser = document.getElementById("inputEmail").value;
    console.log("Signing in as " + document.getElementById("inputEmail").value + ", " + document.getElementById("inputPassword").value);

    document.getElementById("sign-in-form").style.transform = "translateX(-480px)";
    setTimeout(() => {
        document.getElementById("question-form").style.transform = "translateX(0)";
        document.getElementById("sign-in-form").parentNode.removeChild(document.getElementById("sign-in-form"));
    }, 500);
};
