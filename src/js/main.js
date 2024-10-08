const form = document.querySelector("form");
const displayAllFloors = document.getElementById("displayAllFloors");

let floors = [];
let liftsInfo = [];
let queue = [];
let intervalId;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const lifts = Number(document.getElementById("no-of-lifts").value);
  const floors = Number(document.getElementById("no-of-floors").value);

  if (!lifts || !floors || lifts <= 0 || floors <= 0) {
    alert("Enter  number of lifts >=1 and floors >1");
    return;
  }
  displayFloorsAndLifts(lifts, floors);
  form.style.display = "none";
});

const displayFloorsAndLifts = (liftsCount, floorsCount) => {
  displayFloors(floorsCount, liftsCount);
  displayLifts(liftsCount);
};

const displayFloors = (floorsCount, liftsCount) => {
  const viewportWidth = window.innerWidth;
  // console.log(viewportWidth);
  const requiredWidth = 70 * liftsCount + 80;
  for (let i = 0; i < floorsCount; i++) {
    //CREATING FLOORS
    const floor = document.createElement("div");
    floor.classList.add("floor");
    floor.id = `floor${floorsCount - i - 1}`;
    floor.style.width =
      viewportWidth > requiredWidth
        ? `${viewportWidth}px`
        : `${requiredWidth}px`;

    //UP BUTTON
    const upButton = document.createElement("button");
    upButton.innerText = "Up";
    upButton.id = `up${floorsCount - i - 1}`;
    upButton.classList.add("up");
    upButton.addEventListener("click", buttonClickHandler);

    //DOWN BUTTON
    const downButton = document.createElement("button");
    downButton.innerText = "Down";
    downButton.id = `down${floorsCount - i - 1}`;
    downButton.classList.add("down");
    downButton.addEventListener("click", buttonClickHandler);

    //CREATING SPAN OF FLOOR NUMBERS
    const floorNumber = document.createElement("span");
    floorNumber.classList.add("floor-number");
    floorNumber.innerText = `Floor ${floorsCount - i - 1}`;
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-box");
    if (i > 0) buttonsContainer.appendChild(upButton);
    buttonsContainer.appendChild(floorNumber);
    if (i < floorsCount - 1) buttonsContainer.appendChild(downButton);

    floor.appendChild(buttonsContainer);

    displayAllFloors.appendChild(floor);

    floors.push(floor);
  }
};

const displayLifts = (liftCount) => {
  for (let i = 0; i < liftCount; i++) {
    const floor0 = document.querySelector("#floor0");
    const lift = document.createElement("div");
    const leftDoor = document.createElement("div");
    const rightDoor = document.createElement("div");

    leftDoor.classList.add("door");
    rightDoor.classList.add("door");
    leftDoor.classList.add("left-door");
    rightDoor.classList.add("right-door");

    leftDoor.id = `left-door${i}`;
    rightDoor.id = `right-door${i}`;

    lift.appendChild(leftDoor);
    lift.appendChild(rightDoor);
    lift.classList.add("lift");

    lift.id = `lift${i}`;
    lift.style.left = `${100 + i * 100}px`;
    const currLiftState = {
      id: i,
      currentFloor: 0,
      domElement: lift,
      isActive: false,
      isMoving: false,
      movingTo: null,
      isDoorInMotion :false
    };
    floor0.appendChild(lift);
    liftsInfo.push(currLiftState);
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      scheduleLift();
    }, 100);
  }
};

const buttonClickHandler = (event) => {
  const buttonId = event.target.id;
  //   console.log(buttonId);

  const floorNumber = parseInt(buttonId.replace("up", "").replace("down", ""));
  //   console.log(floorNumber);

  const notMovingLift = liftsInfo.find(
    (lift) => lift.currentFloor === floorNumber && lift.isMoving === false
  );
  //   console.log(notMovingLift);

  if (notMovingLift) {
    openLiftDoors(notMovingLift.id);
    return;
  }

  const liftGoingToFloor = liftsInfo.find(
    (lift) => lift.movingTo === floorNumber && lift.isMoving
  );
  if (liftGoingToFloor) {
    console.log("Lift is coming to your desired floor");
    return;
  }
  queue.push(floorNumber);
};
// console.log(queue);

const openLiftDoors = (liftId) => {
  const lift = liftsInfo.find((lift) => lift.id === liftId);
  //   lift.isBusy = true;
  // console.log("Open Door",lift);
  // lift.doorReopen.push(1);
  if (lift.isDoorInMotion || lift.isActive) {
    console.log(
      "Lift door is in motion or lift is active, cannot reopen doors."
    );
    return;
  }
  lift.isDoorInMotion = true;
  const leftDoor = document.querySelector(`#left-door${liftId}`);
  const rightDoor = document.querySelector(`#right-door${liftId}`);
  setTimeout(() => {
    leftDoor.style.transform = `translateX(-100%)`;
    leftDoor.style.transition = `transform 2.5s`;
    rightDoor.style.transform = `translateX(100%)`;
    rightDoor.style.transition = `transform 2.5s`;
  }, 0);
  lift.isActive = true;
  setTimeout(() => {
    leftDoor.style.transform = `translateX(0)`;
    leftDoor.style.transition = `transform 2.5s`;
    rightDoor.style.transform = `translateX(0)`;
    rightDoor.style.transition = `transform 2.5s`;
  }, 2500);
  setTimeout(() => {
    // lift.doorReopen.pop();
    lift.isActive = false;
    lift.isDoorInMotion = false;
    // if(lift.doorReopen.length === 0) lift.isActive = false;
  }, 5001);
};

const scheduleLift = () => {
  if (queue.length === 0) return;
  const pendingFloor = queue.shift();
  const nearestLiftId = findNearestLift(pendingFloor);
  const nearestLift = liftsInfo.find((lift) => lift.id === nearestLiftId);
  if (!nearestLift || nearestLift.isActive) {
    queue.unshift(pendingFloor);
    console.log("No Lift is currently Available");
    return;
  }
  moveLift(nearestLift.currentFloor, pendingFloor, nearestLiftId);
};

const findNearestLift = (floorNumber) => {
  let nearestLiftDistance = floors.length;
  let nearestLiftId = null;
  for (let i = 0; i < liftsInfo.length; i++) {
    const lift = liftsInfo[i];
    if (
      Math.abs(lift.currentFloor - floorNumber) < nearestLiftDistance &&
      lift.isActive === false
    ) {
      nearestLiftDistance = Math.abs(lift.currentFloor - floorNumber);
      nearestLiftId = lift.id;
    }
  }
  return nearestLiftId;
};

const moveLift = (source, destination, liftId) => {
  const liftInAction = liftsInfo.find((lift) => lift.id === liftId);
  const time = Math.abs(source - destination) * 2;
  const leftDoor = document.querySelector(`#left-door${liftId}`);
  const rightDoor = document.querySelector(`#right-door${liftId}`);
  setTimeout(() => {
    leftDoor.style.transform = `translateX(-100%)`;
    leftDoor.style.transition = `transform 2.5s`;
    rightDoor.style.transform = `translateX(100%)`;
    rightDoor.style.transition = `transform 2.5s`;
    liftInAction.currentFloor = destination;
    liftInAction.isMoving = false;
    liftInAction.movingTo = null;
  }, time * 1000);

  liftInAction.isActive = true;

  setTimeout(() => {
    leftDoor.style.transform = `translateX(0)`;
    leftDoor.style.transition = `transform 2.5s`;
    rightDoor.style.transform = `translateX(0)`;
    rightDoor.style.transition = `transform 2.5s`;
  }, time * 1000 + 2500);
  setTimeout(() => {
    liftInAction.isActive = false;
    // if (lift.doorReopen.length === 0) liftInAction.isActive = false;
  }, time * 1000 + 5001);
  liftInAction.isMoving = true;
  liftInAction.movingTo = destination;
  liftInAction.domElement.style.transform = `translateY(-${
    destination * 120
  }px)`;
  liftInAction.domElement.style.transition = `transform ${time}s linear`;
};
