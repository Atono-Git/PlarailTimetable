let selectedButton = null;
document
    .getElementById("clearDataButton")
    .addEventListener("click", function() {

        if (
            confirm(
                "保存データを削除しますか？"
            )
        ) {

            localStorage.removeItem(
                "diagramToolData"
            );

            alert(
                "保存データを削除しました"
            );

        }

    });
    let direction;
    
    
document.getElementById("jsonFile").addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        const data = JSON.parse(e.target.result);

window.data = data;

        document.getElementById("status").textContent =
            "駅数: " + data.stations.length;

        const stationList =
            document.getElementById("stationList");

        stationList.innerHTML = "";

        for (const station of data.stations) {

            const button =
                document.createElement("button");

            button.textContent = station;

            button.addEventListener("click", function() {

                showStation(station, data);

            });

            stationList.appendChild(button);

        }

    };

    reader.readAsText(file);

});

function showStation(station, data) {

    const stationList =
        document.getElementById("stationList");

    const stationView =
        document.getElementById("stationView");

    stationList.style.display = "none";

    let html =
        "<button id='backButton'>← 戻る</button>" +
        "<h2>" + station + "駅</h2>";
  
    const timetable = {
    up: {},
    down: {}
};
    for (const trainData of data.trainDatasets) {

        const validStops =
            trainData.data.filter(stop => stop.x);

        if (validStops.length === 0) {
            continue;
        }

        const firstTime =
            new Date(validStops[0].x);

        const lastTime =
            new Date(
                validStops[validStops.length - 1].x
            );

        const cycleTime =
            lastTime - firstTime;

        const repeatCount =
    trainData.repeat || 1;
    

        for (let repeat = 0; repeat < repeatCount; repeat++) {

            for (const stop of validStops) {

                if (
                    stop.y !== station ||
                    !stop.key.includes("発")
                ) {
                    continue;
                }
                console.log(
    trainData.train,
    stop.x,
    stop.key
);

                const time =
                    new Date(stop.x);

                if (cycleTime > 0) {

                    time.setTime(
                        time.getTime() +
                        cycleTime * repeat
                    );

                }

                const hour =
                    String(time.getHours())
                    .padStart(2, "0");

                const minute =
                    String(time.getMinutes())
                    .padStart(2, "0");
                    if (stop.key.startsWith("↑")) {

    direction = "up";

} else {

    direction = "down";

}
console.log(
    direction,
    trainData.train,
    stop.key
);
             if (!timetable[direction][hour]) {

    timetable[direction][hour] = [];

}

timetable[direction][hour].push({

    minute: minute,
    train: trainData.train,
    color: trainData.color,
    id:
        direction + "_" +
        hour + "_" +
        minute + "_" +
        trainData.train

});

            }

        }

    }

const firstStation = data.stations[0];
const lastStation =
    data.stations[data.stations.length - 1];

const upLabel =
    firstStation + "方面";

const downLabel =
    lastStation + "方面";

html +=
    "<div class='directionButtons'>";

if (station !== firstStation) {

    html +=
        "<button id='upButton'>" +
        upLabel +
        "</button>";

}

if (station !== lastStation) {

    html +=
        "<button id='downButton'>" +
        downLabel +
        "</button>";

}

html += "</div>";

html +=
    "<div id='directionContent'></div>";
    stationView.innerHTML = html;
    if (station === firstStation) {

    showDirection("down");

} else {

    showDirection("up");

}
    function showDirection(dir) {

    let content = "";

   
    const upButton =
        document.getElementById("upButton");

    const downButton =
        document.getElementById("downButton");

    if (upButton) {

        upButton.classList.remove(
            "activeDirection"
        );

    }

    if (downButton) {

        downButton.classList.remove(
            "activeDirection"
        );

    }

    if (
        dir === "up" &&
        upButton
    ) {

        upButton.classList.add(
            "activeDirection"
        );

    }

    if (
        dir === "down" &&
        downButton
    ) {

        downButton.classList.add(
            "activeDirection"
        );

    }

    const hours =
        Object.keys(timetable[dir])
            .sort((a, b) =>
                Number(a) - Number(b)
            );

    for (const hour of hours) {

        timetable[dir][hour]
            .sort((a, b) =>
                Number(a.minute) -
                Number(b.minute)
            );

        content +=
            "<div class='hourBlock'>";

        content +=
            "<h3>" + hour + "時</h3>";

        content +=
            "<div class='minuteContainer'>";

        for (const item of timetable[dir][hour]) {

            const color =
                "rgba(" +
                item.color.r + "," +
                item.color.g + "," +
                item.color.b + "," +
                item.color.a + ")";

            content +=
    "<button " +
    "class='trainButton' " +
    "data-id='" + item.id + "' " +
    "data-train='" + item.train + "' " +
"data-station='" + station + "' " +
    "style='background:" + color + "'>" +

    "<div class='statusText'></div>" +

    "<div class='minuteText'>" +
    item.minute +
    "</div>" +

    "</button>";

        }

        content += "</div>";
        content += "</div>";

    }

    document.getElementById(
        "directionContent"
    ).innerHTML = content;
    setupTrainButtons();

}
if (
    station !== firstStation &&
    document.getElementById("upButton")
) {

    document
        .getElementById("upButton")
        .addEventListener(
            "click",
            () => showDirection("up")
        );

}

if (
    station !== lastStation &&
    document.getElementById("downButton")
) {

    document
        .getElementById("downButton")
        .addEventListener(
            "click",
            () => showDirection("down")
        );

}
    function setupTrainButtons() {

    const savedData =
        JSON.parse(
            localStorage.getItem(
                "diagramToolData"
            ) || "[]"
        );

    document
        .querySelectorAll(".trainButton")
        .forEach(button => {

            if (
                savedData.includes(
                    button.dataset.id
                )
            ) {

                button.classList.add(
                    "done"
                );

            }

        });

    document
        .querySelectorAll(".trainButton")
        .forEach(button => {

            let pressTimer;

button.addEventListener(
    "mousedown",
    function() {

        pressTimer =
            setTimeout(
                function() {

                    showTrainInfo(
                        button.dataset.train,
                        button.dataset.station
                    );

                },
                1000
            );

    }
);

button.addEventListener(
    "mouseup",
    function() {

        clearTimeout(
            pressTimer
        );

    }
);

button.addEventListener(
    "mouseleave",
    function() {

        clearTimeout(
            pressTimer
        );

    }
);

button.addEventListener(
    "click",
    function() {

        selectedButton =
            button;

        document
            .getElementById(
                "actionModal"
            )
            .style.display =
            "block";

    }
);



        });

}



    document
        .getElementById("backButton")
        .addEventListener("click", function() {

            stationList.style.display = "block";
            stationView.innerHTML = "";

        });

}
document
    .getElementById(
        "closeModal"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "statusModal"
                )
                .style.display =
                "none";

        }
    );

document
    .getElementById(
        "closeTrainInfo"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "trainInfoModal"
                )
                .style.display =
                "none";

        }
    );

    document
    .getElementById(
        "closeTrainInfo"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "trainInfoModal"
                )
                .style.display =
                "none";

        }
    );


// ↓↓↓ここから追加↓↓↓

document
    .getElementById(
        "closeAction"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "actionModal"
                )
                .style.display =
                "none";

        }
    );

document
    .getElementById(
        "openStatus"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "actionModal"
                )
                .style.display =
                "none";

            document
                .getElementById(
                    "statusModal"
                )
                .style.display =
                "block";

        }
    );

document
    .getElementById(
        "openTrainInfo"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "actionModal"
                )
                .style.display =
                "none";

            showTrainInfo(
                selectedButton.dataset.train,
                selectedButton.dataset.station
            );

        }
    );

document
    .getElementById(
        "applyStatus"
    )
    .addEventListener(
        "click",
        function() {

            const selected =
                document.querySelector(
                    "input[name='trainStatus']:checked"
                );

            if (!selected) {

                alert(
                    "状態を選択してください"
                );

                return;

            }

            if (selectedButton) {

    selectedButton.classList.remove(
        "done",
        "delay",
        "cancel"
    );

    if (
        selected.value !== "normal"
    ) {

        selectedButton.classList.add(
            selected.value
        );

    }
    const statusText =
    selectedButton.querySelector(
        ".statusText"
    );

if (selected.value === "delay") {

    statusText.textContent =
        "遅延";

}
else if (
    selected.value === "cancel"
) {

    statusText.textContent =
        "運休";

}
else {

    statusText.textContent =
        "";

}
    selectedButton.dataset.status =
    selected.value;

}
            document
                .getElementById(
                    "statusModal"
                )
                .style.display =
                "none";

        }
    );
    function showTrainInfo(
    trainName,
    currentStation
) {

    const trainData =
        window.data.trainDatasets.find(
            t =>
                t.train === trainName
        );

    if (!trainData) {
        return;
    }

    let html = "";

    let started = false;

    for (
        const stop of trainData.data
    ) {

        if (
            stop.y === currentStation
        ) {

            started = true;

        }

        if (!started) {
            continue;
        }

        let time = "--:--";

        if (
            stop.x &&
            !stop.isPass
        ) {

            const d =
                new Date(stop.x);

            time =
                String(
                    d.getHours()
                ).padStart(2,"0")
                +
                ":" +
                String(
                    d.getMinutes()
                ).padStart(2,"0");

        }
const type =
    stop.key.includes("着")
    ? "着"
    : "発";

html +=
    stop.y +
    "　" +
    time +
    type +
    "<br>";

        if (
            stop.key.includes("着")
        ) {

            const stationName =
                stop.y;

            const laterStops =
                trainData.data.slice(
                    trainData.data.indexOf(stop)+1
                );

            const hasNextDeparture =
                laterStops.some(
                    s =>
                        s.y === stationName &&
                        s.key.includes("発")
                );

            if (
                !hasNextDeparture
            ) {

                break;

            }

        }

    }

    document
        .getElementById(
            "trainInfoTitle"
        )
        .textContent =
        trainName;

    document
        .getElementById(
            "trainInfoBody"
        )
        .innerHTML =
        html;

    document
        .getElementById(
            "trainInfoModal"
        )
        .style.display =
        "block";

}
function saveState() {

    const doneButtons = [];

    document
        .querySelectorAll(
            ".trainButton.done"
        )
        .forEach(button => {

            doneButtons.push(
                button.dataset.id
            );

        });

    localStorage.setItem(
        "diagramToolData",
        JSON.stringify(doneButtons)
    );

}
