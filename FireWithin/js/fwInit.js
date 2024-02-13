//*-----------------------------------------------------------------------------
//* fwInit.js: Initialize Firebase application
//*
//*   - This initialization is critical in providing access to Firebase
//*     functionality in all modules
//*   - It is run in module-scope
//*     * consequently, this module should be imported EARLY in the process
//*       ... via: import './fwInit.js';
//*     * this can be done:
//*       - one time - within the mainline module
//*       - or multiple times - in various support modules
//*         ... again insuring it is the FIRST import (within each module)
//*-----------------------------------------------------------------------------

import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {getFBAC} from './fbac.js';
import {doodle}  from './util/dd.js';

import logger from './util/logger/index.js';
const  logPrefix = 'fw:init';
const  log = logger(`${logPrefix}`);

// initialize Firebase
// NOTES:
//   - initializeApp() is synchronous (it used to be async)
const app = initializeApp(doodle(getFBAC()));
log(`Firebase Initialized: `, {app});
