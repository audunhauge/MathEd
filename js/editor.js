// @ts-check


import { thingsWithId, updateMyProperties } from './Minos.js';
const web = updateMyProperties();
// @ts-ignore
const { math, ed } = thingsWithId();
// @ts-ignore
var md = new remarkable.Remarkable();
const oldLines = [];
const oldMath = [];
const newMath = [];

function cleanUpMathLex(code) {
    if (code === "") return "";
    return code
        .replace(/_/gm, "&_")
        .replace(/\)\(/gm, ")*(") // (x+a)(x-2) => (x+a)*(x-2)
        // @ts-ignore
        .replace(/([0-9])\(/gm, (m, a, b) => a + "*(")
        // @ts-ignore
        .replace(/([0-9])([a-z])/gm, (m, a, b) => a + "*" + b);
}

ed.onkeyup = (e) => {
    const k = e.key;
    const render = k === "Enter" || k.includes("Arrow");
    if (render) {
        const lines = ed.value.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (oldLines[i] === line) continue;
            oldLines[i] = line;
            let latex;
            if (line === '') {
                latex = '';
            } else {
                const clean = cleanUpMathLex(line);
                try {
                    // @ts-ignore
                    const m = MathLex.parse(clean);
                    // @ts-ignore
                    const tex = MathLex.render(m, "latex");
                    // @ts-ignore
                    latex = katex.renderToString(tex, {
                        throwOnError: false,
                        displayMode: true,
                    });
                } catch {
                    latex = md.render(clean);
                }
            }
            newMath[i] = latex;
        };
        for (let i = 0; i < lines.length; i++) {
            const oldlatex = oldMath[i];
            const newlatex = newMath[i];
            if (oldlatex !== newlatex) {
                web.math[i] = ({latex:newlatex});
                oldMath[i] = newlatex;
            }
        }
        web.math.length = lines.length;
        
    }
}