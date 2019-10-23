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
        selectableAxis.push([j, i]);
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

      if (j > 0 && i > 0 && originalMatrix[j - 1][i - 1] === "□") {
        availableBombTime++;
        bombAxis[j - 1 + "_" + (i - 1)] = true;
      }
      if (i > 0 && originalMatrix[j][i - 1] === "□") {
        availableBombTime++;
        bombAxis[j + "_" + (i - 1)] = true;
      }
      if (j < (originalMatrix.length - 1) && i > 0 && originalMatrix[j + 1][i - 1] === "□") {
        availableBombTime++;
        bombAxis[j + 1 + "_" + (i - 1)] = true;
      }
      if (j > 0 && originalMatrix[j - 1][i] === "□") {
        availableBombTime++;
        bombAxis[j - 1 + "_" + i] = true;
      }
      if (j < (originalMatrix.length - 1) && originalMatrix[j + 1][i] === "□") {
        availableBombTime++;
        bombAxis[j + 1 + "_" + i] = true;
      }
      if (j > 0 && i < (originalMatrix.length - 1) && originalMatrix[j - 1][i + 1] === "□") {
        availableBombTime++;
        bombAxis[j - 1 + "_" + (i + 1)] = true;
      }
      
      if (i < (originalMatrix.length - 1) && originalMatrix[j][i + 1] === "□") {
        availableBombTime++;
        bombAxis[j + "_" + (i + 1)] = true;
      }
      if (j < (originalMatrix.length - 1) && i < (originalMatrix.length - 1) && originalMatrix[j + 1][i + 1] === "□") {
        availableBombTime++;
        bombAxis[j + 1 + "_" + (i + 1)] = true;
      }

      if (availableBombTime == originalMatrix[j][i]) {
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

      if (originalMatrix[j][i] > 0) {
        if (j > 0 && i > 0) {
          if (originalMatrix[j - 1][i - 1] === "□") {
            availableBomb++;
            bombAxis[j - 1 + "_" + (i - 1)] = true;
          }
        }

        if (i > 0) {
          if (originalMatrix[j][i - 1] === "□") {
            availableBomb++;
            bombAxis[j + "_" + (i - 1)] = true;
          }
        }

        if (j < (originalMatrix.length - 1) && i > 0) {
          if (originalMatrix[j + 1][i - 1] === "□") {
            availableBomb++;
            bombAxis[j + 1 + "_" + (i - 1)] = true;
          }
        }

        if (j > 0) {
          if (originalMatrix[j - 1][i] === "□") {
            availableBomb++;
            bombAxis[j - 1 + "_" + i] = true;
          }
        }

        if (j < (originalMatrix.length - 1)) {
          if (originalMatrix[j + 1][i] === "□") {
            availableBomb++;
            bombAxis[j + 1 + "_" + i] = true;
          }
        }

        if (j > 0 && i < (originalMatrix.length - 1)) {
          if (originalMatrix[j - 1][i + 1] === "□") {
            availableBomb++;
            bombAxis[j - 1 + "_" + (i + 1)] = true;
          }
        }

        if (i < (originalMatrix.length - 1)) {
          if (originalMatrix[j][i + 1] === "□") {
            availableBomb++;
            bombAxis[j + "_" + (i + 1)] = true;
          }
        }

        if (j < (originalMatrix.length - 1) && i < (originalMatrix.length - 1)) {
          if (originalMatrix[j + 1][i + 1] === "□") {
            availableBomb++;
            bombAxis[j + 1 + "_" + (i + 1)] = true;
          }
        }

        if (availableBomb == originalMatrix[j][i]) {
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

      if (originalMatrix[j][i] > 0) {
        if (j > 0 && i > 0) {
          if (originalMatrix[j - 1][i - 1] === "□") {
            if(allBomb[j - 1 + "_" + (i - 1)]){
              availableBombTime++;
            } else {
              notBombAxis[j - 1 + "_" + (i - 1)] = true;
            }
          }
        }

        if (i > 0) {
          if (originalMatrix[j][i - 1] === "□") {
            if(allBomb[j + "_" + (i - 1)]){
              availableBombTime++;
            } else{
              notBombAxis[j + "_" + (i - 1)] = true;
            }
          }
        }

        if (j < (originalMatrix.length - 1) && i > 0) {
          if (originalMatrix[j + 1][i - 1] === "□") {
            if(allBomb[j + 1 + "_" + (i - 1)]){
              availableBombTime++;
            } else {
              notBombAxis[j + 1 + "_" + (i - 1)] = true;
            }
          }
        }

        if (j > 0) {
          if (originalMatrix[j - 1][i] === "□") {
            if(allBomb[j - 1 + "_" + i]){
              availableBombTime++;
            } else {
              notBombAxis[j - 1 + "_" + i] = true;
            }
          }
        }

        if (j < (originalMatrix.length - 1)) {
          if (originalMatrix[j + 1][i] === "□") {
            if(allBomb[j + 1 + "_" + i]){
              availableBombTime++;
            } else {
              notBombAxis[j + 1 + "_" + i] = true;
            }
          }
        }

        if (j > 0 && i < (originalMatrix.length - 1)) {
          if (originalMatrix[j - 1][i + 1] === "□") {
            if(allBomb[j - 1 + "_" + (i + 1)]){
              availableBombTime++;
            } else {
              notBombAxis[j - 1 + "_" + (i + 1)] = true;
            }
          }
        }

        if (i < (originalMatrix.length - 1)) {
          if (originalMatrix[j][i + 1] === "□") {
            if(allBomb[j + "_" + (i + 1)]){
              availableBombTime++;
            }
            else {
              notBombAxis[j + "_" + (i + 1)] = true;
            }
          }
        }

        if (j < (originalMatrix.length - 1) && i < (originalMatrix.length - 1)) {
          if (originalMatrix[j + 1][i + 1] === "□") {
            if(allBomb[j + 1 + "_" + (i + 1)]){
              availableBombTime++;
            }
            else{
              notBombAxis[j + 1 + "_" + (i + 1)] = true;
            }
          }
        }

        if (availableBombTime == originalMatrix[j][i]) {
          notAllBomb = { ...notAllBomb, ...notBombAxis };
        }

      }
    }
  }

  
  socket.send("open " + Object.keys(notAllBomb)[0].split('_')[1] + " " + Object.keys(notAllBomb)[0].split('_')[0]);
  socket.send("map");
    
}



const matrixToHtml = () => {
  document.body.innerHTML = "";
  let data = "";
  for (let i = 0; i < originalMatrix.length; i++) {
    data += '<div class="row">';
    for (let j = 0; j < originalMatrix[i].length; j++) {
      if (allBomb[i + "_" + j]) {
        data += '<div class="col red"></div>';
      } else {
        data += '<div class="col">' + originalMatrix[i][j] + "</div>";
      }
    }
    data += "</div>";
  }
  document.body.innerHTML += data;
};
