// =====================================================
// DISASTRACK COMMAND CENTER
// =====================================================


// =====================================================
// HIVEMQ
// =====================================================

const MQTT_HOST =
    "7cee59f1cead4a3b83376113afc76d13.s1.eu.hivemq.cloud";

const MQTT_PORT =
    8884;

const MQTT_PATH =
    "/mqtt";

const MQTT_USERNAME =
    "disastrack";

// PAKAI PASSWORD MQTT LU YANG SEKARANG
const MQTT_PASSWORD =
    "GANTI_DENGAN_PASSWORD_MQTT_LU";


// =====================================================
// TOPICS
// =====================================================

const TOPIC_ALL =
    "trackerdisastrack/#";

const TOPIC_GPS =
    "trackerdisastrack/gps";

const TOPIC_TRACKER =
    "trackerdisastrack/tracker";

const TOPIC_STATION =
    "trackerdisastrack/station";

const TOPIC_VICTIM =
    "trackerdisastrack/victim";

const TOPIC_STATUS =
    "trackerdisastrack/status";


// =====================================================
// DATA STORAGE
// =====================================================

const trackers = {};

const stations = {};

const victims = {};


// =====================================================
// MAP TRACKER
// =====================================================

const trackerMap =
    L.map(
        "trackerMap"
    ).setView(
        [-2.967179, 104.707932],
        15
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"

    }
).addTo(
    trackerMap
);


// =====================================================
// MAP STATION
// =====================================================

const stationMap =
    L.map(
        "stationMap"
    ).setView(
        [-2.967179, 104.707932],
        15
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"

    }
).addTo(
    stationMap
);


// =====================================================
// MARKERS
// =====================================================

const trackerMarkers = {};

const stationMarkers = {};


// =====================================================
// TRACKER MARKER ICON
// =====================================================

function createTrackerIcon(
    status
) {

    let color =
        "tracker-red";


    if (
        status === "YELLOW"
    ) {

        color =
            "tracker-yellow";

    }


    if (
        status === "GREEN"
    ) {

        color =
            "tracker-green";

    }


    return L.divIcon({

        className:
            "",

        html:
            `<div class="tracker-marker ${color}"></div>`,

        iconSize:
            [20, 20],

        iconAnchor:
            [10, 10]

    });

}


// =====================================================
// STATION ICON
// =====================================================

const stationIcon =
    L.divIcon({

        className:
            "",

        html:
            `<div style="
                width:20px;
                height:20px;
                background:#344a3f;
                border:3px solid white;
                border-radius:5px;
                box-shadow:0 2px 8px rgba(0,0,0,.35);
            "></div>`,

        iconSize:
            [20, 20],

        iconAnchor:
            [10, 10]

    });


// =====================================================
// MQTT
// =====================================================

const mqttURL =
    `wss://${MQTT_HOST}:${MQTT_PORT}${MQTT_PATH}`;


console.log(
    "Connecting:",
    mqttURL
);


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
// CONNECT
// =====================================================

client.on(
    "connect",
    function() {

        console.log(
            "HiveMQ CONNECTED"
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
            TOPIC_ALL,
            function(error) {

                if (error) {

                    console.error(
                        "Subscribe Error:",
                        error
                    );

                    return;

                }


                console.log(
                    "Subscribed:",
                    TOPIC_ALL
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
    function(
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


            processMQTT(
                topic,
                data
            );

        }

        catch(error) {

            console.error(
                "JSON ERROR:",
                error
            );

        }

    }
);


// =====================================================
// PROCESS MQTT
// =====================================================

function processMQTT(
    topic,
    data
) {

    // =============================================
    // GPS LAMA
    // =============================================

    if (
        topic === TOPIC_GPS
    ) {

        updateGPS(
            data
        );

        return;

    }


    // =============================================
    // TRACKER
    // =============================================

    if (
        topic === TOPIC_TRACKER
    ) {

        updateTracker(
            data
        );

        return;

    }


    // =============================================
    // STATION
    // =============================================

    if (
        topic === TOPIC_STATION
    ) {

        updateStation(
            data
        );

        return;

    }


    // =============================================
    // VICTIM
    // =============================================

    if (
        topic === TOPIC_VICTIM
    ) {

        updateVictim(
            data
        );

        return;

    }


    // =============================================
    // STATUS
    // =============================================

    if (
        topic === TOPIC_STATUS
    ) {

        processStatus(
            data
        );

        return;

    }

}


// =====================================================
// OLD GPS DATA
// =====================================================

function updateGPS(
    data
) {

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
        "latitude"
    ).innerText =
        lat.toFixed(6);


    document.getElementById(
        "longitude"
    ).innerText =
        lon.toFixed(6);


    document.getElementById(
        "satellites"
    ).innerText =
        data.satellites ?? "--";


    document.getElementById(
        "speed"
    ).innerText =
        Number(
            data.speed ?? 0
        ).toFixed(2);


    document.getElementById(
        "altitude"
    ).innerText =
        Number(
            data.altitude ?? 0
        ).toFixed(2);


    document.getElementById(
        "lastUpdate"
    ).innerText =
        new Date().toLocaleTimeString(
            "id-ID"
        );


    document.getElementById(
        "currentTracker"
    ).innerText =
        data.tracker ??
        "TRK01";

}


// =====================================================
// UPDATE TRACKER
// =====================================================

function updateTracker(
    data
) {

    const trackerID =
        data.tracker ??
        data.trackerID ??
        "TRK01";


    const lat =
        Number(
            data.latitude ??
            data.lat
        );


    const lon =
        Number(
            data.longitude ??
            data.lng ??
            data.lon
        );


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {

        return;

    }


    let status =
        String(
            data.status ??
            data.color ??
            "RED"
        ).toUpperCase();


    if (
        status !== "RED" &&
        status !== "YELLOW" &&
        status !== "GREEN"
    ) {

        status = "RED";

    }


    trackers[
        trackerID
    ] = {

        id:
            trackerID,

        latitude:
            lat,

        longitude:
            lon,

        status:
            status,

        satellites:
            data.satellites ??
            0,

        speed:
            data.speed ??
            0,

        altitude:
            data.altitude ??
            0,

        lastUpdate:
            new Date()

    };


    updateTrackerMarker(
        trackerID
    );


    updateTrackerCounters();


    updateGPS(
        {

            tracker:
                trackerID,

            latitude:
                lat,

            longitude:
                lon,

            satellites:
                data.satellites,

            speed:
                data.speed,

            altitude:
                data.altitude

        }
    );

}


// =====================================================
// TRACKER MARKER
// =====================================================

function updateTrackerMarker(
    trackerID
) {

    const tracker =
        trackers[
            trackerID
        ];


    const position = [

        tracker.latitude,

        tracker.longitude

    ];


    if (
        !trackerMarkers[
            trackerID
        ]
    ) {

        trackerMarkers[
            trackerID
        ] =
            L.marker(
                position,
                {

                    icon:
                        createTrackerIcon(
                            tracker.status
                        )

                }
            ).addTo(
                trackerMap
            );

    }

    else {

        trackerMarkers[
            trackerID
        ].setLatLng(
            position
        );


        trackerMarkers[
            trackerID
        ].setIcon(
            createTrackerIcon(
                tracker.status
            )
        );

    }


    trackerMarkers[
        trackerID
    ].bindPopup(`

        <b>${trackerID}</b>

        <br><br>

        Status:
        <b>${tracker.status}</b>

        <br>

        Latitude:
        ${tracker.latitude.toFixed(6)}

        <br>

        Longitude:
        ${tracker.longitude.toFixed(6)}

        <br>

        Satellites:
        ${tracker.satellites}

    `);


    trackerMarkers[
        trackerID
    ].openPopup();

}


// =====================================================
// TRACKER COUNTERS
// =====================================================

function updateTrackerCounters() {

    let red = 0;

    let yellow = 0;

    let green = 0;


    Object.values(
        trackers
    ).forEach(
        tracker => {

            if (
                tracker.status ===
                "RED"
            ) {

                red++;

            }

            else if (
                tracker.status ===
                "YELLOW"
            ) {

                yellow++;

            }

            else if (
                tracker.status ===
                "GREEN"
            ) {

                green++;

            }

        }
    );


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


    document.getElementById(
        "trackerCount"
    ).innerText =
        `${Object.keys(trackers).length} Tracker`;

}


// =====================================================
// UPDATE STATION
// =====================================================

function updateStation(
    data
) {

    const stationID =
        data.station ??
        data.stationID ??
        "STA01";


    const lat =
        Number(
            data.latitude ??
            data.lat
        );


    const lon =
        Number(
            data.longitude ??
            data.lng ??
            data.lon
        );


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {

        return;

    }


    stations[
        stationID
    ] = {

        id:
            stationID,

        latitude:
            lat,

        longitude:
            lon,

        lastUpdate:
            new Date()

    };


    const position = [

        lat,

        lon

    ];


    if (
        !stationMarkers[
            stationID
        ]
    ) {

        stationMarkers[
            stationID
        ] =
            L.marker(
                position,
                {

                    icon:
                        stationIcon

                }
            ).addTo(
                stationMap
            );

    }

    else {

        stationMarkers[
            stationID
        ].setLatLng(
            position
        );

    }


    stationMarkers[
        stationID
    ].bindPopup(`

        <b>${stationID}</b>

        <br><br>

        Station Evakuasi

        <br>

        Latitude:
        ${lat.toFixed(6)}

        <br>

        Longitude:
        ${lon.toFixed(6)}

    `);


    document.getElementById(
        "stationCount"
    ).innerText =
        `${Object.keys(stations).length} Station`;

}


// =====================================================
// UPDATE VICTIM
// =====================================================

function updateVictim(
    data
) {

    const victimID =
        data.victim ??
        data.victimID ??
        data.id;


    if (
        !victimID
    ) {

        return;

    }


    victims[
        victimID
    ] = {

        id:
            victimID,

        type:
            String(
                data.type ??
                "HUMAN"
            ).toUpperCase(),

        status:
            String(
                data.status ??
                "REPORTED"
            ).toUpperCase(),

        tracker:
            data.tracker ??
            data.trackerID ??
            "-",

        station:
            data.station ??
            data.stationID ??
            "-",

        latitude:
            Number(
                data.latitude ??
                data.lat ??
                0
            ),

        longitude:
            Number(
                data.longitude ??
                data.lng ??
                data.lon ??
                0
            ),

        time:
            data.time ??
            new Date().toLocaleTimeString(
                "id-ID"
            )

    };


    renderVictimTable();

}


// =====================================================
// STATUS MESSAGE
// =====================================================

function processStatus(
    data
) {

    // Kalau status packet
    // membawa data korban

    if (
        data.victim ||
        data.victimID
    ) {

        updateVictim(
            data
        );

    }


    // Kalau status tracker

    if (
        data.tracker ||
        data.trackerID
    ) {

        updateTracker(
            data
        );

    }

}


// =====================================================
// VICTIM TABLE
// =====================================================

function renderVictimTable() {

    const table =
        document.getElementById(
            "victimTable"
        );


    const list =
        Object.values(
            victims
        );


    if (
        list.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty"
                >
                    Belum ada data korban
                </td>

            </tr>

        `;

        updateVictimSummary();

        return;

    }


    table.innerHTML = "";


    list.forEach(
        victim => {

            const row =
                document.createElement(
                    "tr"
                );


            const type =
                victim.type ===
                "ANIMAL"

                    ? "badge-animal"

                    : "badge-human";


            let statusClass =
                "badge-reported";


            if (
                victim.status ===
                "EVACUATING"
            ) {

                statusClass =
                    "badge-evacuating";

            }


            if (
                victim.status ===
                "EVACUATED"
            ) {

                statusClass =
                    "badge-evacuated";

            }


            row.innerHTML = `

                <td>
                    <b>${victim.id}</b>
                </td>

                <td>

                    <span
                        class="badge ${type}"
                    >
                        ${victim.type}
                    </span>

                </td>

                <td>

                    <span
                        class="badge ${statusClass}"
                    >
                        ${victim.status}
                    </span>

                </td>

                <td>
                    ${victim.tracker}
                </td>

                <td>
                    ${victim.station}
                </td>

                <td>

                    ${Number(
                        victim.latitude
                    ).toFixed(5)}

                    ,

                    ${Number(
                        victim.longitude
                    ).toFixed(5)}

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


    updateVictimSummary();

}


// =====================================================
// VICTIM SUMMARY
// =====================================================

function updateVictimSummary() {

    const list =
        Object.values(
            victims
        );


    let human = 0;

    let animal = 0;

    let evacuated = 0;


    list.forEach(
        victim => {

            if (
                victim.type ===
                "HUMAN"
            ) {

                human++;

            }


            if (
                victim.type ===
                "ANIMAL"
            ) {

                animal++;

            }


            if (
                victim.status ===
                "EVACUATED"
            ) {

                evacuated++;

            }

        }
    );


    document.getElementById(
        "totalVictims"
    ).innerText =
        list.length;


    document.getElementById(
        "humanCount"
    ).innerText =
        human;


    document.getElementById(
        "animalCount"
    ).innerText =
        animal;


    document.getElementById(
        "evacuatedCount"
    ).innerText =
        evacuated;

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


// =====================================================
// MQTT RECONNECT
// =====================================================

client.on(
    "reconnect",
    function() {

        document.getElementById(
            "statusText"
        ).innerText =
            "MQTT Reconnecting...";

    }
);