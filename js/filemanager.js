// @ts-check
const sessionID = "mathEd";

import {
    thingsWithId, updateMyProperties,
    wrap, $, create, getLocalJSON, setLocalJSON
} from './Minos.js';

const { min, max } = Math;

const web = updateMyProperties();
const { examples, savedFiles } = thingsWithId();

async function setup() {
    let examples = getLocalJSON("examples");  // NOT CONST
    if (!examples) {
        // no examples - fetch them
        const url = "examples.json";
        const response = await fetch(url);
        examples = await response.json();
    }
    web.examples.push(...examples);
    // saved files may be none
    const savedFiles = getLocalJSON("savedfiles") || [];
    web.savedFiles.push(...savedFiles.slice(0, 5));
}

setup();

examples.onclick = async (e) => {
    const t = e.target;
    if (t.className === "file") {
        const name = t.dataset.name;
        const url = '/media/' + name;
        const response = await fetch(url);
        const txt = (response.ok)
            ? await response.text()
            : "Missing example";
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        window.location.href = "./editor.html";
    }
}


savedFiles.onclick = async (e) => {
    const t = e.target;
    if (t.className === "file") {
        const name = t.dataset.name;
        const txt = getLocalJSON("saved:" + name);
        setLocalJSON(sessionID, txt);
        setLocalJSON("filename", name);
        window.location.href = "./editor.html";
    }
}

// @ts-ignore
if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
    // @ts-ignore
    launchQueue.setConsumer((launchParams) => {
        // Nothing to do when the queue is empty.
        if (!launchParams.files.length) {
            return;
        }
        for (const fileHandle of launchParams.files) {
            console.log(fileHandle);
        }
    });
}



self.addEventListener('fetch', event => {
    // @ts-ignore
    const url = new URL(event.request.url);
    // If this is an incoming POST request for the
    // registered "action" URL, respond to it.
    // @ts-ignore
    if (event.request.method === 'POST' &&
        url.pathname === '/bookmark') {
        event.respondWith((async () => {
            const formData = await event.request.formData();
            const link = formData.get('link') || '';
            const responseUrl = await saveBookmark(link);
            return Response.redirect(responseUrl, 303);
        })());
    }
});