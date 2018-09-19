// this is a hacky mess, don't judge me

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
let speed = 0.65; // will need to be tuned depending on the map size
let turnSpeed = 0.4; // ^
let moving = false;
let left = false;
let right = false;
let reverse = false;
let car;

let background;
let hasNpc = false;
let currentDestination;
let waypoint;

let npcTemp;
let promptingForNpc;

let npcs = [];
let landmarks = [];

let input = [];

const init = () => {

    for (let i = 0; i < 20; i++) {
        npcs[i] = {loc: [Math.floor((Math.random() * 2000) + 1), Math.floor((Math.random() * 2000) + 1)],
            destination: [Math.floor((Math.random() * 2000) + 1), Math.floor((Math.random() * 2000) + 1)]};
        landmarks[i] = {loc: [Math.floor((Math.random() * 2000) + 1), Math.floor((Math.random() * 2000) + 1)],
            name: "{{NAME}}", description: "{{DESC}}"};
    }

    document.getElementById("pre-game").style.transform = "translateY(0)";
    setTimeout(() => {
        document.getElementById("logo").style.transform = "translateY(0)";
        setTimeout(() => {
            document.getElementById("home-screen").style.background = "#F1F2F1";
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
    waypoint = document.getElementById("waypoint");

    for (let i = 0; i < npcs.length; i++) {
        let npc = npcs[i];
        let div = document.createElement("div");
        div.setAttribute("class", "npc");
        div.setAttribute("data-x", npc.loc[0]);
        div.setAttribute("data-y", npc.loc[1]);
        div.setAttribute("data-destination-x", npc.destination[0]);
        div.setAttribute("data-destination-y", npc.destination[1]);
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
    if (currentDestination) {
        waypoint.style.transform = "translateX(" + (-posX + offX + currentDestination[0]) + "px) translateY(" + (-posY + offY + currentDestination[1]) + "px)";
    }

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

    checkNpc();

};

const checkNpc = () => {
    if (!hasNpc && !promptingForNpc) {
        let npcs = document.getElementsByClassName("npc");
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            let transform = window.getComputedStyle(npc).getPropertyValue("transform");
            let coords = transform.replace("matrix(1, 0, 0, 1, ", "").replace(")", "").split(", ");

            if (coords[0] >= 225 && coords[0] <= 275) {
                if (coords[1] >= 450 && coords[1] <= 500) {
                    promptForNpc(npc);
                    promptingForNpc = true;
                }
            }
        }
    }

    if (hasNpc && !promptingForNpc) {
        // (-posX + offX + currentDestination[0]) to 240
        // (-posY + offY + currentDestination[1]) to 480
        let distance = Math.sqrt(Math.pow((-posX + offX + currentDestination[0]) - 240, 2) + Math.pow((-posY + offY + currentDestination[1]) - 480, 2));
        if (distance < 40) {
            document.getElementById("distance").innerHTML = "Passenger delivered!";
            /* setTimeout(() => {
             document.getElementById("npc-prompt").style.transform = "";
             document.getElementById("npc-prompt").style.height = "";
             document.getElementById("ask").style.opacity = "";
             document.getElementById("ask").style.height = "";
             document.getElementById("show").style.height = "";
             document.getElementById("show").style.opacity = "";
             document.getElementById("waypoint").style.transform = "";
             }, 3000);
             hasNpc = false; */
        } else {
            document.getElementById("distance").innerHTML = Math.floor(distance * 10) / 10 + " metres away from your destination.";
        }
    }
};

const promptForNpc = (npc) => {
    npcTemp = npc;
    document.getElementById("npc-prompt").style.transform = "translateX(0)";
};

const acceptNpc = () => {

    let destination = [parseInt(npcTemp.getAttribute("data-destination-x")), parseInt(npcTemp.getAttribute("data-destination-y"))];
    hasNpc = true;
    npcTemp.parentNode.removeChild(npcTemp);
    currentDestination = destination;
    document.getElementById("npc-prompt").style.transform = "translateY(570px)";
    document.getElementById("npc-prompt").style.height = "150px";
    document.getElementById("ask").style.opacity = "0";
    document.getElementById("ask").style.height = "150px";
    document.getElementById("show").style.height = "150px";
    document.getElementById("show").style.opacity = "1";
    promptingForNpc = false;
};

const denyNpc = () => {
    document.getElementById("npc-prompt").style.transform = "";
    promptingForNpc = false;
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
