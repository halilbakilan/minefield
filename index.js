const socket = new WebSocket("ws://hometask.eg1236.com/game1/");

socket.addEventListener("open", event => {
  socket.send("help");
  socket.send("new " + level);
});

let status = "new";
let level = 1;

let originalMatrix = [];

let allBomb = {};
let nonAllBombGlobal = {};

socket.addEventListener("message", event => {
  const [type, ...rest] = event.data.split(/\n/);
  if (type === "new: OK") {
    socket.send("map");
  } else if (type === "open: OK") {
    if (status === "calcBomb") {
      socket.send("map");
    } else if (status === "openNonBomb") {
      if (Object.keys(nonAllBombGlobal).length > 0) {
        openNonBomb();
      }
    } else if (type === "lose") {
      socket.send("map");
    }
  } else if (type === "open: You lose") {
    status = "lose";
    socket.send("map");
  } else if (type === "map:") {
    originalMatrix = rest.slice(0, rest.length - 1).map(item => item.split(""));
    if (status === "new") {
      status = "notNew";
      calcBomb();
    } else if (status === "calcBomb") {
      status = "notNew";
      calcBomb();
    } else if (status === "won") {
      if (level < 4) {
        setTimeout(() => {
          level++;
          restart();
        }, 500);
      }
    } else if (status === "lose") {
      setTimeout(() => {
        restart();
      }, 500);
    }
    matrixToHtml();
  } else if (type.indexOf("You win") > -1) {
    status = "won";
    socket.send("map");
  }
});

const restart = () => {
  nonAllBombGlobal = new Object();
  originalMatrix = new Array();
  allBomb = new Object();
  status = "new";
  socket.send("new " + level);
};

const randomOpen = () => {
  let selectableAxis = [],
    xy = 0;
  for (let i = 0; i < originalMatrix.length; i++) {
    for (let j = 0; j < originalMatrix[i].length; j++) {
      if (originalMatrix[i][j] === "□" && !allBomb[i + "_" + j]) {
        selectableAxis.push([j, i]);
      }
    }
  }
  if (selectableAxis.length > 0) {
    xy = Math.floor(Math.random() * selectableAxis.length);
    status = "calcBomb";
    socket.send("open " + selectableAxis[xy][0] + " " + selectableAxis[xy][1]);
  }
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
      if (i < originalMatrix.length - 1 && j > 0 && originalMatrix[i + 1][j - 1] === "□") {
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
      if (i > 0 && j < originalMatrix[i].length - 1 && originalMatrix[i - 1][j + 1] === "□") {
        availableBombTime++;
        bombAxis[i - 1 + "_" + (j + 1)] = true;
      }
      if (j < originalMatrix[i].length - 1 && originalMatrix[i][j + 1] === "□") {
        availableBombTime++;
        bombAxis[i + "_" + (j + 1)] = true;
      }
      if (i < originalMatrix.length - 1 && j < originalMatrix[i].length - 1 && originalMatrix[i + 1][j + 1] === "□") {
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

  if (Object.keys(notAllBomb).length > 0) {
    nonAllBombGlobal = { ...notAllBomb };
    openNonBomb();
  } else {
    randomOpen();
  }
};

const openNonBomb = () => {
  if (Object.keys(nonAllBombGlobal).length > 1) {
    status = "openNonBomb";
  } else {
    status = "calcBomb";
  }
  socket.send("open " + Object.keys(nonAllBombGlobal)[0].split("_")[1] + " " + Object.keys(nonAllBombGlobal)[0].split("_")[0]);
  delete nonAllBombGlobal[Object.keys(nonAllBombGlobal)[0]];
};

const matrixToHtml = () => {
  let data = "<div class='main'>";
  for (let i = 0; i < originalMatrix.length; i++) {
    data += '<div class="row">';
    for (let j = 0; j < originalMatrix[i].length; j++) {
      if (originalMatrix[i][j] == "*") {
        if (status === "won") {
          data += '<div class="col full"><img src="./flag.svg"></div>';
        } else {
          data += '<div class="col"><img src="./bomb.svg"></div>';
        }
      } else if (allBomb[i + "_" + j]) {
        data += '<div class="col full"><img src="./flag.svg"></div>';
      } else if (originalMatrix[i][j] == 0) {
        data += '<div class="col"></div>';
      } else if (originalMatrix[i][j] > 0) {
        data += '<div class="col">' + originalMatrix[i][j] + "</div>";
      } else {
        data += '<div class="col full"></div>';
      }
    }
    data += "</div>";
  }
  document.body.innerHTML = data + "</div>";
};
