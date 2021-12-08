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
    web.savedFiles.push(...savedFiles);
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