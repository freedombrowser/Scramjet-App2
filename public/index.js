"use strict";

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
    files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
    },
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

async function launchScramjet() {
    // 1. Hardcoded URL
    const targetUrl = "https://freedombrowser.org";

    try {
        await registerSW();
    } catch (err) {
        console.error("Failed to register service worker.", err);
        return;
    }

    // 2. Setup Wisp Connection
    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    
    if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
        await connection.setTransport("/libcurl/index.mjs", [
            { websocket: wispUrl },
        ]);
    }

    // 3. Create and launch the frame automatically
    const frame = scramjet.createFrame();
    frame.frame.id = "sj-frame";
    document.body.appendChild(frame.frame);
    frame.go(targetUrl);
};

// 4. Trigger the function immediately on page load
window.addEventListener("load", launchScramjet);