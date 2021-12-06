// @ts-check

import {$} from './util.js'

/**
 * Adds eventlistener to a button
 * for selecting from directory listing
 * @param {string} id element id for button
 * @param {function} cb handle the list of files
 */
export const showDirButton = (id,cb) => {
    const butDir = $(id);
    butDir.addEventListener('click', async () => {
        const files = [];
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        for await (const entry of dirHandle.values()) {
            files.push(entry);
        }
        cb(files);
    });
}