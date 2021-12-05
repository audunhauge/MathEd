// @ts-check


import {
    thingsWithId, updateMyProperties,
    wrap, $, getLocalJSON, setLocalJSON
} from './Minos.js';
const web = updateMyProperties();
// @ts-ignore
const { mathView, ed } = thingsWithId();

const sessionID = "mathEd";
const oldSession = getLocalJSON(sessionID);  // previous contents

// set starting font size to 50/50 rem
web.fs = 50;   // math region font size
web.efs = 50;  // editor font size
ed.value = oldSession || "";



// @ts-ignore
const md = new remarkable.Remarkable("full", { html: true });

const seplist = {
    ">": "\\gt",
    "<": "\\lt",
    "=": "=",
    ">=": "\\ge",
    "<=": "\\le",
}


// @ts-ignore
const katx = (s, mode) => katex.renderToString(String(s), {
    throwOnError: false,
    displayMode: mode,
});

function cleanUpMathLex(code) {
    if (code === "") return "";
    return code
        .replace(/_/gm, "&_")
        .replace(/\*\*/gm, "^")
        .replace(/\)\(/gm, ")*(") // (x+a)(x-2) => (x+a)*(x-2)
        .replace(/([0-9])\(/gm, (m, a, b) => a + "*(")
        .replace(/([0-9])([a-z])/gm, (m, a, b) => a + "*" + b);
}

const makeLatex = (txt, { mode, klass }) => {
    const clean = cleanUpMathLex(txt);
    try {
        // @ts-ignore
        const m = MathLex.parse(clean);
        // @ts-ignore
        const tex = MathLex.render(m, "latex");
        return katx(String(tex), mode);
    } catch (e) {
        console.log(e);
        return katx(String(clean), mode);
        return clean;
    }
}

const renderSimple = (line, { mode, klass }) => {
    const latex = makeLatex(line, { mode, klass });
    return `<div>${latex}</div>`;
}

const renderLikning = (line, { mode, klass }) => {
    const [sep] = line.match(/>=|<=|>|<|=/);
    const [left = "", right = ""] = line.split(sep);
    const leftLatex = makeLatex(left, { mode, klass });
    const rightLatex = makeLatex(right, { mode, klass });
    const sepLatex = katx(seplist[sep], mode);
    return `<div class="eq"><span>${leftLatex}</span>
    <span> ${sepLatex} </span>
    <span>${rightLatex}</span></div>`;
}

function renderMath(id, math, size = "") {
    const newMath = [];
    const mode = size.includes("senter");
    const likning = size.includes("likning");
    const klass = size;
    const lines = math.split('\n').filter(e => e != "");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (likning) {
            newMath[i] = renderLikning(line, { mode, klass });
        } else {
            newMath[i] = renderSimple(line, { mode, klass });
        }
    }
    $(id).innerHTML = wrap(newMath, 'div');
}

const renderAll = () => {
    const graphs = [];
    const maths = [];
    let nr = 1;
    const txt = ed.value
        .replace(/@plot\[(.+?)\]/gm, (_, fu, ofs) => {
            graphs.push({ fu, id: `#gr${ofs}` });
            return `<div class="graf" id="gr${ofs}"></div>\n`;
        })
        .replace(/^@math( .+)?$([^€]+?)^$^/gm, (_, size, math, ofs) => {
            maths.push({ math, id: `ma${ofs}`, size });
            return `<div class="math ${size}" id="ma${ofs}"></div>\n`;
        })
        .replace(/^@opp( .+)?$/gm, (_, txt) => {
            return `<div data-nr="${nr++}" class="oppgave">${txt || ""}</div>\n`;
        })
    const plainHTML = md.render(txt).replace(/\$([^$]+)\$/gm, (_, m) =>
        makeLatex(m, { mode: false, klass: "" }));
    mathView.innerHTML = plainHTML;
    maths.forEach(({ math, id, size }) => {
        renderMath(id, math, size);
    });
    setLocalJSON(sessionID, ed.value);
}

if (oldSession) {
    renderAll();
}

ed.onkeyup = (e) => {
    const k = e.key;
    const render = k === "Enter" || k.includes("Arrow");
    if (render) {
        renderAll();
    }
}