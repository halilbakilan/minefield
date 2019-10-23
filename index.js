const socket = new WebSocket("ws://hometask.eg1236.com/game1/");

socket.addEventListener("open", event => {
  socket.send("help");
  socket.send("new 1");
  socket.send("map");
});

let firstPlay = true;
let originalMatrix = [];
let allBomb = {};

socket.addEventListener("message", event => {
  const [type, ...rest] = event.data.split(/\n/);
  if (type === "map:") {
    originalMatrix = rest.slice(0, rest.length - 1).map(item => item.split(""));
    matrixToHtml();
    if (firstPlay) {
      randomOpen();
      firstPlay = false;
    } else {
      calcBomb();
    }
  } else {
  }
});

const randomOpen = () => {
  let selectableAxis = [],
    xy = 0;
  for (let i = 0; i < originalMatrix.length; i++) {
    for (let j = 0; j < originalMatrix[i].length; j++) {
      if (originalMatrix[i][j] === "□") {
        selectableAxis.push([i, j]);
      }
    }
  }
  xy = Math.floor(Math.random() * selectableAxis.length);
  socket.send("open " + selectableAxis[xy][0] + " " + selectableAxis[xy][1]);
  socket.send("map");
};

const calcBomb = () => {
  let currentBombSize = Object.keys(allBomb).length;
  let newAllBomb = {};

  for (let i = 0; i < originalMatrix.length; i++) {
    for (let j = 0; j < originalMatrix[i].length; j++) {
      let availableBombTime = 0;
      let bombAxis = [];

      if (j > 0 && i > 0 && originalMatrix[i - 1][j - 1] === "□") {
        availableBombTime++;
        bombAxis[i - 1 + "_" + (j - 1)] = true;
      }
      if (j > 0 && originalMatrix[i][j - 1] === "□") {
        availableBombTime++;
        bombAxis[i + "_" + (j - 1)] = true;
      }
      if (
        i < originalMatrix.length - 1 &&
        j > 0 &&
        originalMatrix[i + 1][j - 1] === "□"
      ) {
        availableBombTime++;
        bombAxis[i + 1 + "_" + (j - 1)] = true;
      }
      if (i > 0 && originalMatrix[i - 1][j] === "□") {
        availableBombTime++;
        bombAxis[i - 1 + "_" + j] = true;
      }
      if (i < originalMatrix.length - 1 && originalMatrix[i + 1][j] === "□") {
        availableBombTime++;
        bombAxis[i + 1 + "_" + j] = true;
      }
      if (
        i > 0 &&
        j < originalMatrix[i].length - 1 &&
        originalMatrix[i - 1][j + 1] === "□"
      ) {
        availableBombTime++;
        bombAxis[i - 1 + "_" + (j + 1)] = true;
      }
      if (
        j < originalMatrix[i].length - 1 &&
        originalMatrix[i][j + 1] === "□"
      ) {
        availableBombTime++;
        bombAxis[i + "_" + (j + 1)] = true;
      }
      if (
        i < originalMatrix.length - 1 &&
        j < originalMatrix[i].length - 1 &&
        originalMatrix[i + 1][j + 1] === "□"
      ) {
        availableBombTime++;
        bombAxis[i + 1 + "_" + (j + 1)] = true;
      }

      if (availableBombTime == originalMatrix[i][j]) {
        newAllBomb = { ...newAllBomb, ...bombAxis };
      }
    }
  }
  allBomb = { ...newAllBomb };
  if (currentBombSize < Object.keys(newAllBomb).length) {
    matrixToHtml();
    addBomb();
  } else {
    setNonBomb();
  }
};

const addBomb = () => {
  let currentBombSize = Object.keys(allBomb).length;
  let newAllBomb = {};

  for (let i = 0; i < originalMatrix.length; i++) {
    for (let j = 0; j < originalMatrix[i].length; j++) {
      let availableBomb = 0;
      let bombAxis = [];

      if (originalMatrix[i][j] > 0) {
        if (i > 0 && j > 0) {
          if (originalMatrix[i - 1][j - 1] === "□") {
            availableBomb++;
            bombAxis[i - 1 + "_" + (j - 1)] = true;
          }
        }

        if (j > 0) {
          if (originalMatrix[i][j - 1] === "□") {
            availableBomb++;
            bombAxis[i + "_" + (j - 1)] = true;
          }
        }

        if (i < originalMatrix.length - 1 && j > 0) {
          if (originalMatrix[i + 1][j - 1] === "□") {
            availableBomb++;
            bombAxis[i + 1 + "_" + (j - 1)] = true;
          }
        }

        if (i > 0) {
          if (originalMatrix[i - 1][j] === "□") {
            availableBomb++;
            bombAxis[i - 1 + "_" + j] = true;
          }
        }

        if (i < originalMatrix.length - 1) {
          if (originalMatrix[i + 1][j] === "□") {
            availableBomb++;
            bombAxis[i + 1 + "_" + j] = true;
          }
        }

        if (i > 0 && j < originalMatrix[i].length - 1) {
          if (originalMatrix[i - 1][j + 1] === "□") {
            availableBomb++;
            bombAxis[i - 1 + "_" + (j + 1)] = true;
          }
        }

        if (j < originalMatrix[i].length - 1) {
          if (originalMatrix[i][j + 1] === "□") {
            availableBomb++;
            bombAxis[i + "_" + (j + 1)] = true;
          }
        }

        if (i < originalMatrix.length - 1 && j < originalMatrix[i].length - 1) {
          if (originalMatrix[i + 1][j + 1] === "□") {
            availableBomb++;
            bombAxis[i + 1 + "_" + (j + 1)] = true;
          }
        }

        if (availableBomb == originalMatrix[i][j]) {
          newAllBomb = { ...newAllBomb, ...bombAxis };
        }
      }
    }
  }

  allBomb = { ...allBomb, ...newAllBomb };

  if (currentBombSize < Object.keys(allBomb).length) {
    matrixToHtml();
    addBomb();
  } else {
    setNonBomb();
  }
};

const setNonBomb = () => {
  let notAllBomb = {};

  for (let i = 0; i < originalMatrix.length; i++) {
    for (let j = 0; j < originalMatrix[i].length; j++) {
      let availableBombTime = 0;
      let notBombAxis = {};

      if (originalMatrix[i][j] > 0) {
        if (i > 0 && j > 0) {
          if (originalMatrix[i - 1][j - 1] === "□") {
            if (allBomb[i - 1 + "_" + (j - 1)]) {
              availableBombTime++;
            } else {
              notBombAxis[i - 1 + "_" + (j - 1)] = true;
            }
          }
        }

        if (j > 0) {
          if (originalMatrix[i][j - 1] === "□") {
            if (allBomb[i + "_" + (j - 1)]) {
              availableBombTime++;
            } else {
              notBombAxis[i + "_" + (j - 1)] = true;
            }
          }
        }

        if (i < originalMatrix.length - 1 && j > 0) {
          if (originalMatrix[i + 1][j - 1] === "□") {
            if (allBomb[i + 1 + "_" + (j - 1)]) {
              availableBombTime++;
            } else {
              notBombAxis[i + 1 + "_" + (j - 1)] = true;
            }
          }
        }

        if (i > 0) {
          if (originalMatrix[i - 1][j] === "□") {
            if (allBomb[i - 1 + "_" + j]) {
              availableBombTime++;
            } else {
              notBombAxis[i - 1 + "_" + j] = true;
            }
          }
        }

        if (i < originalMatrix.length - 1) {
          if (originalMatrix[i + 1][j] === "□") {
            if (allBomb[i + 1 + "_" + j]) {
              availableBombTime++;
            } else {
              notBombAxis[i + 1 + "_" + j] = true;
            }
          }
        }

        if (i > 0 && j < originalMatrix[i].length - 1) {
          if (originalMatrix[i - 1][j + 1] === "□") {
            if (allBomb[i - 1 + "_" + (j + 1)]) {
              availableBombTime++;
            } else {
              notBombAxis[i - 1 + "_" + (j + 1)] = true;
            }
          }
        }

        if (j < originalMatrix[i].length - 1) {
          if (originalMatrix[i][j + 1] === "□") {
            if (allBomb[i + "_" + (j + 1)]) {
              availableBombTime++;
            } else {
              notBombAxis[i + "_" + (j + 1)] = true;
            }
          }
        }

        if (i < originalMatrix.length - 1 && j < originalMatrix[i].length - 1) {
          if (originalMatrix[i + 1][j + 1] === "□") {
            if (allBomb[i + 1 + "_" + (j + 1)]) {
              availableBombTime++;
            } else {
              notBombAxis[i + 1 + "_" + (j + 1)] = true;
            }
          }
        }

        if (availableBombTime == originalMatrix[i][j]) {
          notAllBomb = { ...notAllBomb, ...notBombAxis };
        }
      }
    }
  }

  socket.send("open " + Object.keys(notAllBomb)[0].split("_")[1] + " " + Object.keys(notAllBomb)[0].split("_")[0]);
  socket.send("map");
};

const matrixToHtml = () => {
  let data = "<div class='main'>";
  for (let i = 0; i < originalMatrix.length; i++) {
    data += '<div class="row">';
    for (let j = 0; j < originalMatrix[i].length; j++) {
      if (allBomb[i + "_" + j]) {
        data += '<div class="col full"><img src="./flag.svg"></div>';
      } else if (originalMatrix[i][j] == 0) {
        data += '<div class="col"></div>';
      } else if (originalMatrix[i][j] > 0) {
        data += '<div class="col">' + originalMatrix[i][j] + "</div>";
      } else if (originalMatrix[i][j] == "*") {
        data += '<div class="col"><img src="./bomb.svg"></div>';
      } else {
        data += '<div class="col full"></div>';
      }
    }
    data += "</div>";
  }
  document.body.innerHTML = data + "</div>";
};
