// @ts-check
const sessionID = "mathEd";

import {
    thingsWithId, updateMyProperties,
    wrap, $, create, getLocalJSON, setLocalJSON
} from './Minos.js';

const { min, max } = Math;

const web = updateMyProperties();
const { files } = thingsWithId();

async function setup() {
    let examples = getLocalJSON("examples");
    if (!examples) {
        // no examples - fetch them
        const url = "examples.json";
        const response = await fetch(url);
        examples = await response.json();
    }
    web.files.push(...examples);
}

setup();

files.onclick = async (e) => {
    const t = e.target;
    if (t.className === "file") {
        const url = '/media/' + t.dataset.name;
        const response = await fetch(url);
        const txt = await response.text();
        setLocalJSON(sessionID,txt);
        window.location.href = "./editor.html";
    }
}