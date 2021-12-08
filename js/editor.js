// @ts-check

import {
    thingsWithId, updateMyProperties,
    wrap, $, create, getLocalJSON, setLocalJSON
} from './Minos.js';

const { min, max } = Math;

import { saveFileButton, readFileButton } from './filehandling.js';

const web = updateMyProperties();
// @ts-ignore
const { mathView, ed } = thingsWithId();

const sessionID = "mathEd";
const oldSession = getLocalJSON(sessionID);  // previous contents
const filename = getLocalJSON("filename") || "test.mtx"; // filename

// set starting font size to 50/50 rem
web.fs = 50;   // math region font size
web.efs = 50;  // editor font size
ed.value = oldSession || "";
web.filename = filename;


// @ts-ignore
const simplify = exp => Algebrite.simplify(exp);
// @ts-ignore
const roots = exp => Algebrite.root(exp);
// algebrite to latex
const alg2tex = alg => alg.toLatexString();


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
        //return clean;
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

function renderAlgebra(id, txt, size = "") {
    //const clean = cleanUpMathLex(txt);
    //const math = alg2tex(simplify(clean));
    //renderMath(id, math);
    const newMath = [];
    const mode = size.includes("senter");
    const klass = size;
    const lines = txt.split('\n').filter(e => e != "");
    const gives = renderSimple("\\rightarrow", { mode, klass });
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const clean = cleanUpMathLex(line);
        const math = alg2tex(simplify(clean));
        newMath[i] = `<span>${line}</span>
        <span>${gives}</span>
        <span>${renderSimple(math, { mode, klass })}</span>`;
    }
    $(id).innerHTML = wrap(newMath, 'div');
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

function plotGraph(parent, fu, size, colors) {
    const div = create('div');
    div.id = "plot" + Date.now();
    parent.append(div);
    try {
        const optdObj = plot(fu, size, colors);
        optdObj.target = "#" + div.id;
        // @ts-ignore
        functionPlot(optdObj);
    } catch (e) {
        console.log("Failed plot:", fu, e);
    }
}

function renderPlot(id, plot, klass="") {
    const parent = $(id);
    const [_, width = 350] = (klass.match(/ (\d+)$/)) || [];
    parent.style.setProperty("--min", String(width) + "px");
    const lines = plot.split('\n').filter(e => e != "");
    for (let i = 0; i < lines.length; i++) {
        const pickApart = lines[i].match(/([^ ]+)( \d+)?( [0-9a-z#,]+)?/);
        const [_, fu, size = 500, colors] = pickApart;
        plotGraph(parent, cleanUpMathLex(fu), min(size, width), colors);
    }
}

const renderAll = () => {
    const plots = [];
    const maths = [];
    const algebra = [];
    const txt = ed.value
        .replace(/@plot( .+)?$([^€]+?)^$^/gm, (_, klass, plot, ofs) => {
            plots.push({ plot, id: `graf${ofs}`, klass });
            return `<div class="plots ${klass}" id="graf${ofs}"></div>\n`;
        })
        .replace(/^@math( .+)?$([^€]+?)^$^/gm, (_, size, math, ofs) => {
            maths.push({ math, id: `ma${ofs}`, size });
            return `<div class="math ${size}" id="ma${ofs}"></div>\n`;
        })
        .replace(/^@alg( .+)?$([^€]+?)^$^/gm, (_, size, math, ofs) => {
            algebra.push({ math, id: `alg${ofs}`, size });
            return `<div class="algebra ${size}" id="alg${ofs}"></div>\n`;
        })
        .replace(/^@opp( .+)?$/gm, (_, txt) => {
            return `<div class="oppgave">${txt || ""}</div>\n`;
        })
        .replace(/^@fasit( .+)?$/gm, (_, txt) => {
            return `<div class="fasit">${txt || ""}</div>\n`;
        })
    const plainHTML = md.render(txt)
        .replace(/\$([^$]+)\$/gm, (_, m) => makeLatex(m, { mode: false, klass: "" }));
    mathView.innerHTML = plainHTML;
    maths.forEach(({ math, id, size }) => {
        renderMath(id, math, size);
    });
    algebra.forEach(({ math, id, size }) => {
        renderAlgebra(id, math, size)
    });
    plots.forEach(({ plot, id, klass }) => {
        renderPlot(id, plot, klass);
    });
    setLocalJSON(sessionID, ed.value);
}

if (oldSession) {
    renderAll();
}


readFileButton("load", (file, text) => {
    ed.value = text;
    renderAll();
    web.filename = file.name;
});

saveFileButton("save", filename, (newName) => {
    setLocalJSON("filename",newName);
    web.filename = newName;
    const savedFiles = getLocalJSON("savedfiles") || [];
    savedFiles.push(newName);
    const uniq = new Set(savedFiles);
    setLocalJSON("savedfiles",Array.from(uniq));
    setLocalJSON("saved:"+newName,ed.value);
    return ed.value;
});

ed.onkeyup = (e) => {
    const k = e.key;
    const render = k === "Enter" || k.includes("Arrow");
    if (render) {
        renderAll();
    }
}

export function plot(str, size = 500, colors) {
    let [o, ...rest] = str.split(",");
    if (str.startsWith("{") || str.startsWith("[")) {
        o = str;
        rest = [];
    }
    let obj;
    try {
        obj = JSON.parse(o);
    } catch (er) {
        obj = o;
    }
    // Exaples:
    // a plot(x)
    // b plot(x,-5,5) 200
    // c plot(x^2;x,-5,5,-25,25) 300 red,green,blue
    // d plot([[1,2],[3,4],[5,6]])
    // e plot([[1,2,4,8,16,32])
    // f plot( {yAxis: {domain: [-1.897959183, 1.897959183]},xAxis: {domain: [-3, 3]},data: [{r: '2 * sin(4 theta)',fnType: 'polar',graphType: 'polyline' }] } )
    // f plot({target: '#multiple',data: [ { fn: 'x', color: 'pink' }, { fn: '-x' }, { fn: 'x * x' }, { fn: 'x * x * x' }, { fn: 'x * x * x * x' } ] } )
    let xmin = -5,
        xmax = 5,
        ymin,
        ymax;
    let width = max(70, +size),
        height = max(70, +size);
    const colorList = colors ? colors.trim().split(",") : [];
    if (rest.length > 0) {
        // type b,c
        [xmin = -5, xmax = 5, ymin, ymax] = rest;
    }
    const optobj = {
        width,
        height,
        xAxis: { domain: [+xmin, +xmax] },
    };
    if (ymin !== undefined && ymax !== undefined) {
        optobj.yAxis = { domain: [+ymin, +ymax] };
    }
    if (Array.isArray(obj)) {
        // type d,e
        if (Array.isArray(obj[0])) {
            ymax = obj.reduce((s, v) => Math.max(v[1], s), obj[0][1]);
            ymin = obj.reduce((s, v) => Math.min(v[1], s), obj[0][1]);
            xmax = obj.reduce((s, v) => Math.max(v[0], s), obj[0][0]);
            xmin = obj.reduce((s, v) => Math.min(v[0], s), obj[0][0]);
            optobj.yAxis = { domain: [ymin - 2, ymax + 2] };
            optobj.xAxis = { domain: [xmin, xmax] };
            // type d
            // data: [{ points: [  [1, 1],  [2, 1], [2, 2],  [1, 2],  [1, 1]  ],  fnType: 'points',  graphType: 'scatter'  }]
            optobj.data = [{ points: obj, fnType: "points", graphType: "scatter" }];
            // @ts-ignore
            return optobj;
        } else {
            // type e
            ymax = Math.max(...obj);
            ymin = Math.min(...obj);
            xmin = 0;
            xmax = obj.length;
            optobj.yAxis = { domain: [ymin - 2, ymax + 2] };
            optobj.xAxis = { domain: [xmin, xmax] };
            const points = obj.map((e, i) => [i, e]);
            optobj.data = [{ points, fnType: "points", graphType: "scatter" }];
            // @ts-ignore
            return optobj;
        }
    } else if (typeof o === "string") {
        // type a,b,c
        optobj.data = obj.split(";").map((fu, i) => {
            const obj = { fn: fu, graphType: "polyline" };
            if (colorList[i]) obj.color = colorList[i];
            return obj;
        });
        // @ts-ignore
        return optobj;
    } else if (typeof obj === "object") {
        // type f
        // @ts-ignore
        return o;
    } else {
        console.log("plot() given invalid params");
        return {};
    }
}