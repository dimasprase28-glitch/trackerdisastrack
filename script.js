// =====================================================
// MQTT CONFIG
// =====================================================

const MQTT_HOST =
    "7cee59f1cead4a3b83376113afc76d13.s1.eu.hivemq.cloud";

const MQTT_PORT = 8884;

const MQTT_PATH = "/mqtt";

const MQTT_USERNAME =
    "disastrack";

const MQTT_PASSWORD =
    "dimas123";


// =====================================================
// TOPICS
// =====================================================

const TOPIC_TRACKER =
    "trackerdisastrack/tracker";

const TOPIC_STATION =
    "trackerdisastrack/station";

const TOPIC_VICTIM =
    "trackerdisastrack/victim";


// =====================================================
// DEFAULT LOCATION
// =====================================================

const DEFAULT_LOCATION = [
    -2.967179,
    104.707932
];


// =====================================================
// TRACKER MAP
// =====================================================

const trackerMap =
    L.map("trackerMap")
     .setView(
         DEFAULT_LOCATION,
         15
     );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"

    }
).addTo(trackerMap);


// =====================================================
// STATION MAP
// =====================================================

const stationMap =
    L.map("stationMap")
     .setView(
         DEFAULT_LOCATION,
         15
     );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"

    }
).addTo(stationMap);


// =====================================================
// MARKERS
// =====================================================

let trackerMarker = null;

let stationMarker = null;

let trackerFirstGPS = true;

let stationFirstGPS = true;


// =====================================================
// VICTIM DATABASE
// =====================================================

const victims = {};


// =====================================================
// MQTT
// =====================================================

const mqttURL =
    `wss://${MQTT_HOST}:${MQTT_PORT}${MQTT_PATH}`;


const client =
    mqtt.connect(
        mqttURL,
        {

            username:
                MQTT_USERNAME,

            password:
                MQTT_PASSWORD,

            reconnectPeriod:
                3000,

            connectTimeout:
                10000

        }
    );


// =====================================================
// MQTT CONNECT
// =====================================================

client.on(
    "connect",
    function () {

        console.log(
            "MQTT CONNECTED"
        );


        document.getElementById(
            "statusText"
        ).innerText =
            "MQTT Connected";


        document.getElementById(
            "statusDot"
        ).classList.add(
            "connected"
        );


        client.subscribe(
            [

                TOPIC_TRACKER,

                TOPIC_STATION,

                TOPIC_VICTIM

            ],

            function (error) {

                if (error) {

                    console.error(
                        "Subscribe error:",
                        error
                    );

                    return;

                }


                console.log(
                    "Subscribed to all topics"
                );

            }

        );

    }
);


// =====================================================
// MQTT MESSAGE
// =====================================================

client.on(
    "message",
    function (
        topic,
        message
    ) {

        console.log(
            "MQTT:",
            topic,
            message.toString()
        );


        try {

            const data =
                JSON.parse(
                    message.toString()
                );


            // -----------------------------
            // TRACKER
            // -----------------------------

            if (
                topic ===
                TOPIC_TRACKER
            ) {

                updateTracker(
                    data
                );

            }


            // -----------------------------
            // STATION
            // -----------------------------

            else if (
                topic ===
                TOPIC_STATION
            ) {

                updateStation(
                    data
                );

            }


            // -----------------------------
            // VICTIM
            // -----------------------------

            else if (
                topic ===
                TOPIC_VICTIM
            ) {

                updateVictim(
                    data
                );

            }

        }

        catch (error) {

            console.error(
                "JSON ERROR:",
                error
            );

        }

    }
);


// =====================================================
// UPDATE TRACKER
// =====================================================

function updateTracker(data) {

    const lat =
        Number(
            data.latitude
        );

    const lon =
        Number(
            data.longitude
        );


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {

        return;

    }


    document.getElementById(
        "trackerID"
    ).innerText =
        data.device ??
        data.tracker ??
        "TRK01";


    document.getElementById(
        "trackerLat"
    ).innerText =
        lat.toFixed(6);


    document.getElementById(
        "trackerLon"
    ).innerText =
        lon.toFixed(6);


    document.getElementById(
        "trackerSat"
    ).innerText =
        data.satellites ??
        "--";


    document.getElementById(
        "trackerAlt"
    ).innerText =
        Number(
            data.altitude ??
            0
        ).toFixed(1);


    document.getElementById(
        "trackerUpdate"
    ).innerText =
        new Date()
        .toLocaleTimeString(
            "id-ID"
        );


    // =================================================
    // SIGNAL BADGE
    // =================================================

    setSignalBadge(
        "trackerSignal",
        data.color
    );


    // =================================================
    // MAP MARKER
    // =================================================

    const position = [
        lat,
        lon
    ];


    if (
        trackerMarker === null
    ) {

        trackerMarker =
            L.marker(
                position
            )
            .addTo(
                trackerMap
            );

    }

    else {

        trackerMarker.setLatLng(
            position
        );

    }


    trackerMarker.bindPopup(`

        <b>TRACKER</b>

        <br><br>

        ID:
        ${data.device ?? "TRK01"}

        <br>

        Latitude:
        ${lat.toFixed(6)}

        <br>

        Longitude:
        ${lon.toFixed(6)}

        <br>

        Signal:
        ${data.color ?? "NONE"}

        <br>

        Victim:
        ${data.victim ?? "--"}

    `);


    if (
        trackerFirstGPS
    ) {

        trackerMap.setView(
            position,
            17
        );

        trackerFirstGPS =
            false;

    }


    // =================================================
    // VICTIM
    // =================================================

    if (
        data.victim
    ) {

        updateVictim(
            data
        );

    }

}


// =====================================================
// UPDATE STATION
// =====================================================

function updateStation(data) {

    const lat =
        Number(
            data.latitude
        );

    const lon =
        Number(
            data.longitude
        );


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {

        return;

    }


    document.getElementById(
        "stationStatus"
    ).innerText =
        "ONLINE";


    document.getElementById(
        "stationStatus"
    ).className =
        "badge green";


    const position = [
        lat,
        lon
    ];


    if (
        stationMarker === null
    ) {

        stationMarker =
            L.marker(
                position
            )
            .addTo(
                stationMap
            );

    }

    else {

        stationMarker.setLatLng(
            position
        );

    }


    stationMarker.bindPopup(`

        <b>COMMAND STATION</b>

        <br><br>

        Latitude:
        ${lat.toFixed(6)}

        <br>

        Longitude:
        ${lon.toFixed(6)}

    `);


    if (
        stationFirstGPS
    ) {

        stationMap.setView(
            position,
            17
        );

        stationFirstGPS =
            false;

    }

}


// =====================================================
// UPDATE VICTIM
// =====================================================

function updateVictim(data) {

    const id =
        data.victim ??
        data.id;


    if (!id) {

        return;

    }


    victims[id] = {

        id: id,

        tracker:
            data.tracker ??
            data.device ??
            "--",

        color:
            String(
                data.color ??
                "NONE"
            ).toUpperCase(),

        type:
            String(
                data.type ??
                data.category ??
                "UNKNOWN"
            ).toUpperCase(),

        status:
            String(
                data.status ??
                "REPORTED"
            ).toUpperCase(),

        latitude:
            data.latitude,

        longitude:
            data.longitude,

        time:
            new Date()
            .toLocaleTimeString(
                "id-ID"
            )

    };


    renderVictims();

}


// =====================================================
// RENDER TABLE
// =====================================================

function renderVictims() {

    const table =
        document.getElementById(
            "victimTable"
        );


    table.innerHTML = "";


    let total = 0;

    let red = 0;

    let yellow = 0;

    let green = 0;


    Object.values(
        victims
    ).forEach(
        victim => {

            total++;


            if (
                victim.color ===
                "RED"
            )
                red++;


            if (
                victim.color ===
                "YELLOW"
            )
                yellow++;


            if (
                victim.color ===
                "GREEN"
            )
                green++;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <b>${victim.id}</b>
                </td>

                <td>
                    ${victim.tracker}
                </td>

                <td>

                    <span
                        class="signal ${victim.color}"
                    >
                        ${victim.color}
                    </span>

                </td>

                <td>
                    ${victim.type}
                </td>

                <td>

                    <span
                        class="status ${victim.status}"
                    >
                        ${victim.status}
                    </span>

                </td>

                <td>

                    ${
                        Number.isFinite(
                            Number(victim.latitude)
                        )
                        ?
                        Number(
                            victim.latitude
                        ).toFixed(5)
                        +
                        ", " +
                        Number(
                            victim.longitude
                        ).toFixed(5)
                        :
                        "--"
                    }

                </td>

                <td>
                    ${victim.time}
                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    document.getElementById(
        "totalVictim"
    ).innerText =
        total;


    document.getElementById(
        "redCount"
    ).innerText =
        red;


    document.getElementById(
        "yellowCount"
    ).innerText =
        yellow;


    document.getElementById(
        "greenCount"
    ).innerText =
        green;

}


// =====================================================
// SIGNAL BADGE
// =====================================================

function setSignalBadge(
    id,
    signal
) {

    const element =
        document.getElementById(
            id
        );


    if (!signal) {

        element.innerText =
            "NONE";

        element.className =
            "badge gray";

        return;

    }


    const value =
        String(
            signal
        ).toUpperCase();


    element.innerText =
        value;


    if (
        value === "RED"
    ) {

        element.className =
            "badge red";

    }

    else if (
        value === "YELLOW"
    ) {

        element.className =
            "badge yellow";

    }

    else if (
        value === "GREEN"
    ) {

        element.className =
            "badge green";

    }

    else {

        element.className =
            "badge gray";

    }

}


// =====================================================
// MQTT ERROR
// =====================================================

client.on(
    "error",
    function(error) {

        console.error(
            "MQTT ERROR:",
            error
        );


        document.getElementById(
            "statusText"
        ).innerText =
            "MQTT Error";


        document.getElementById(
            "statusDot"
        ).classList.remove(
            "connected"
        );

    }
);


// =====================================================
// MQTT OFFLINE
// =====================================================

client.on(
    "offline",
    function() {

        document.getElementById(
            "statusText"
        ).innerText =
            "MQTT Offline";


        document.getElementById(
            "statusDot"
        ).classList.remove(
            "connected"
        );

    }
);