// @ts-check
const sessionID = "mathEd";

import {
    thingsWithId, updateMyProperties,
    wrap, $, create, getLocalJSON, setLocalJSON
} from './Minos.js';


const web = updateMyProperties();
const { examples, savedFiles } = thingsWithId();
