// ========================================
// HIVEMQ
// ========================================

const MQTT_HOST =
    "7cee59f1cead4a3b83376113afc76d13.s1.eu.hivemq.cloud";

const MQTT_PORT = 8884;

const MQTT_PATH = "/mqtt";


const MQTT_USERNAME =
    "disastrack";


const MQTT_PASSWORD =
    "dimas123";


const MQTT_TOPIC =
    "trackerdisastrack/gps";


// ========================================
// MAP
// ========================================

const map =
    L.map("map")
     .setView(
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
).addTo(map);


// ========================================
// GPS MARKER
// ========================================

let marker = null;

let firstGPS = true;


// ========================================
// MQTT WEBSOCKET
// ========================================

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


// ========================================
// CONNECT
// ========================================

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
            MQTT_TOPIC,
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
                    MQTT_TOPIC
                );

            }
        );

    }
);


// ========================================
// RECEIVE MESSAGE
// ========================================

client.on(
    "message",
    function(topic, message) {

        console.log(
            "MQTT DATA:",
            message.toString()
        );


        try {

            const data =
                JSON.parse(
                    message.toString()
                );


            updateGPS(data);

        }

        catch(error) {

            console.error(
                "JSON ERROR:",
                error
            );

        }

    }
);


// ========================================
// UPDATE GPS
// ========================================

function updateGPS(data) {

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


    // LATITUDE

    document.getElementById(
        "latitude"
    ).innerText =
        lat.toFixed(6);


    // LONGITUDE

    document.getElementById(
        "longitude"
    ).innerText =
        lon.toFixed(6);


    // SATELLITE

    document.getElementById(
        "satellites"
    ).innerText =
        data.satellites ?? "--";


    // SPEED

    document.getElementById(
        "speed"
    ).innerText =
        Number(
            data.speed ?? 0
        ).toFixed(2);


    // ALTITUDE

    document.getElementById(
        "altitude"
    ).innerText =
        Number(
            data.altitude ?? 0
        ).toFixed(2);


    // COURSE

    document.getElementById(
        "course"
    ).innerText =
        Number(
            data.course ?? 0
        ).toFixed(2);


    // GPS STATUS

    document.getElementById(
        "gpsStatus"
    ).innerText =
        "GPS FIX";


    // LAST UPDATE

    document.getElementById(
        "lastUpdate"
    ).innerText =
        new Date()
        .toLocaleTimeString(
            "id-ID"
        );


    // ====================================
    // MAP
    // ====================================

    const position = [
        lat,
        lon
    ];


    // CREATE MARKER

    if (
        marker === null
    ) {

        marker =
            L.marker(
                position
            ).addTo(map);

    }


    // MOVE MARKER

    else {

        marker.setLatLng(
            position
        );

    }


    // POPUP

    marker.bindPopup(`

        <b>DisasTrack GPS</b>

        <br><br>

        Latitude:
        ${lat.toFixed(6)}

        <br>

        Longitude:
        ${lon.toFixed(6)}

        <br>

        Satellites:
        ${data.satellites ?? "--"}

        <br>

        Speed:
        ${Number(
            data.speed ?? 0
        ).toFixed(2)}
        km/h

    `);


    // CENTER MAP PERTAMA KALI

    if (
        firstGPS
    ) {

        map.setView(
            position,
            17
        );

        firstGPS = false;

    }

}


// ========================================
// MQTT ERROR
// ========================================

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


// ========================================
// OFFLINE
// ========================================

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