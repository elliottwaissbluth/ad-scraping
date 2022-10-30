/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./feature.js/callstack-instrument.js":
/*!********************************************!*\
  !*** ./feature.js/callstack-instrument.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CallstackInstrument": () => (/* binding */ CallstackInstrument)
/* harmony export */ });
/*
  We capture the JS callstack when we detect a dynamically created http request
  and bubble it up via a WebExtension Experiment API stackDump.
  This instrumentation captures those and saves them to the "callstacks" table.
*/
class CallstackInstrument {
  constructor(dataReceiver) {
    this.dataReceiver = dataReceiver;
  }
  run(browser_id) {
    browser.stackDump.onStackAvailable.addListener((request_id, call_stack) => {
      const record = {
        browser_id,
        request_id,
        call_stack
      };
      this.dataReceiver.saveRecord("callstacks", record);
    });
  }
}

/***/ }),

/***/ "./feature.js/loggingdb.js":
/*!*********************************!*\
  !*** ./feature.js/loggingdb.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "boolToInt": () => (/* binding */ boolToInt),
/* harmony export */   "close": () => (/* binding */ close),
/* harmony export */   "dataReceiver": () => (/* binding */ dataReceiver),
/* harmony export */   "escapeString": () => (/* binding */ escapeString),
/* harmony export */   "logCritical": () => (/* binding */ logCritical),
/* harmony export */   "logDebug": () => (/* binding */ logDebug),
/* harmony export */   "logError": () => (/* binding */ logError),
/* harmony export */   "logInfo": () => (/* binding */ logInfo),
/* harmony export */   "logWarn": () => (/* binding */ logWarn),
/* harmony export */   "open": () => (/* binding */ open),
/* harmony export */   "saveContent": () => (/* binding */ saveContent),
/* harmony export */   "saveRecord": () => (/* binding */ saveRecord)
/* harmony export */ });
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket.js */ "./feature.js/socket.js");


let crawlID = null;
let visitID = null;
let debugging = false;
let storageController = null;
let logAggregator = null;
let listeningSocket = null;


let listeningSocketCallback =  async (data) => {
    //This works even if data is an int
    let action = data["action"];
    let _visitID = data["visit_id"]
    switch (action) {
        case "Initialize":
            if (visitID) {
                logWarn("Set visit_id while another visit_id was set")
            }
            visitID = _visitID;
            data["browser_id"] = crawlID;
            storageController.send(JSON.stringify(["meta_information", data]));
            break;
        case "Finalize":
            if (!visitID) {
                logWarn("Received Finalize while no visit_id was set")
            }
            if (_visitID !== visitID ) {
                logError("Received Finalize but visit_id didn't match. " +
                `Current visit_id ${_visitID}, received visit_id ${visitID}.`);
            }
            data["browser_id"] = crawlID;
            data["success"] = true;
            storageController.send(JSON.stringify(["meta_information", data]));
            visitID = null;
            break;
        default:
            // Just making sure that it's a valid number before logging
            _visitID = parseInt(data, 10);
            logDebug("Setting visit_id the legacy way");
            visitID = _visitID

    }

}
let open = async function(storageControllerAddress, logAddress, curr_crawlID) {
    if (storageControllerAddress == null && logAddress == null && curr_crawlID === 0) {
        console.log("Debugging, everything will output to console");
        debugging = true;
        return;
    }
    crawlID = curr_crawlID;

    console.log("Opening socket connections...");

    // Connect to MPLogger for extension info/debug/error logging
    if (logAddress != null) {
        logAggregator = new _socket_js__WEBPACK_IMPORTED_MODULE_0__.SendingSocket();
        let rv = await logAggregator.connect(logAddress[0], logAddress[1]);
        console.log("logSocket started?", rv)
    }

    // Connect to databases for saving data
    if (storageControllerAddress != null) {
        storageController = new _socket_js__WEBPACK_IMPORTED_MODULE_0__.SendingSocket();
        let rv = await storageController.connect(storageControllerAddress[0], storageControllerAddress[1]);
        console.log("StorageController started?",rv);
    }

    // Listen for incoming urls as visit ids
    listeningSocket = new _socket_js__WEBPACK_IMPORTED_MODULE_0__.ListeningSocket(listeningSocketCallback);
    console.log("Starting socket listening for incoming connections.");
    await listeningSocket.startListening().then(() => {
        browser.profileDirIO.writeFile("extension_port.txt", `${listeningSocket.port}`);
    });
};

let close = function() {
    if (storageController != null) {
        storageController.close();
    }
    if (logAggregator != null) {
        logAggregator.close();
    }
};

let makeLogJSON = function(lvl, msg) {
    var log_json = {
        'name': 'Extension-Logger',
        'level': lvl,
        'pathname': 'FirefoxExtension',
        'lineno': 1,
        'msg': escapeString(msg),
        'args': null,
        'exc_info': null,
        'func': null
    }
    return log_json;
}

let logInfo = function(msg) {
    // Always log to browser console
    console.log(msg);

    if (debugging) {
        return;
    }

    // Log level INFO == 20 (https://docs.python.org/2/library/logging.html#logging-levels)
    var log_json = makeLogJSON(20, msg);
    logAggregator.send(JSON.stringify(['EXT', JSON.stringify(log_json)]));
};

let logDebug = function(msg) {
    // Always log to browser console
    console.log(msg);

    if (debugging) {
        return;
    }

    // Log level DEBUG == 10 (https://docs.python.org/2/library/logging.html#logging-levels)
    var log_json = makeLogJSON(10, msg);
    logAggregator.send(JSON.stringify(['EXT', JSON.stringify(log_json)]));
};

let logWarn = function(msg) {
    // Always log to browser console
    console.warn(msg);

    if (debugging) {
        return;
    }

    // Log level WARN == 30 (https://docs.python.org/2/library/logging.html#logging-levels)
    var log_json = makeLogJSON(30, msg);
    logAggregator.send(JSON.stringify(['EXT', JSON.stringify(log_json)]));
};

let logError = function(msg) {
    // Always log to browser console
    console.error(msg);

    if (debugging) {
        return;
    }

    // Log level INFO == 40 (https://docs.python.org/2/library/logging.html#logging-levels)
    var log_json = makeLogJSON(40, msg);
    logAggregator.send(JSON.stringify(['EXT', JSON.stringify(log_json)]));
};

let logCritical = function(msg) {
    // Always log to browser console
    console.error(msg);

    if (debugging) {
        return;
    }

    // Log level CRITICAL == 50 (https://docs.python.org/2/library/logging.html#logging-levels)
    var log_json = makeLogJSON(50, msg);
    logAggregator.send(JSON.stringify(['EXT', JSON.stringify(log_json)]));
};

let dataReceiver = {
    saveRecord(a, b) {
        console.log(b);
    },
};

let saveRecord = function(instrument, record) {
    record["visit_id"] = visitID;

    if (!visitID && !debugging) {
        // Navigations to about:blank can be triggered by OpenWPM. We drop those.
        if(instrument === 'navigations' && record['url'] === 'about:blank') {
            logDebug('Extension-' + crawlID + ' : Dropping navigation to about:blank in intermediate period');
            return;
        }
        logWarn(`Extension-${crawlID} : visitID is null while attempting to insert into table ${instrument}\n` +
                    JSON.stringify(record));
        record["visit_id"] = -1;
        
    }

    // send to console if debugging
    if (debugging) {
      console.log("EXTENSION", instrument, record);
      return;
    }
    storageController.send(JSON.stringify([instrument, record]));
};

// Stub for now
let saveContent = async function(content, contentHash) {
  // Send page content to the data aggregator
  // deduplicated by contentHash in a levelDB database
  if (debugging) {
    console.log("LDB contentHash:",contentHash,"with length",content.length);
    return;
  }
  // Since the content might not be a valid utf8 string and it needs to be
  // json encoded later, it is encoded using base64 first.
  const b64 = Uint8ToBase64(content);
  storageController.send(JSON.stringify(['page_content', [b64, contentHash]]));
};

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

// Base64 encoding, found on:
// https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/25644409#25644409
function Uint8ToBase64(u8Arr){
  var CHUNK_SIZE = 0x8000; //arbitrary number
  var index = 0;
  var length = u8Arr.length;
  var result = '';
  var slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

let escapeString = function(string) {
    // Convert to string if necessary
    if(typeof string != "string")
        string = "" + string;

    return encode_utf8(string);
};

let boolToInt = function(bool) {
    return bool ? 1 : 0;
};


/***/ }),

/***/ "./feature.js/socket.js":
/*!******************************!*\
  !*** ./feature.js/socket.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListeningSocket": () => (/* binding */ ListeningSocket),
/* harmony export */   "SendingSocket": () => (/* binding */ SendingSocket)
/* harmony export */ });
let DataReceiver = {
  callbacks: new Map(),
  onDataReceived: (aSocketId, aData, aJSON) => {
    if (!DataReceiver.callbacks.has(aSocketId)) {
      return;
    }
    if (aJSON) {
      aData = JSON.parse(aData);
    }
    DataReceiver.callbacks.get(aSocketId)(aData);
  },
};

browser.sockets.onDataReceived.addListener(DataReceiver.onDataReceived);

let ListeningSockets = new Map();

class ListeningSocket {
  constructor(callback) {
    this.callback = callback
  }

  async startListening() {
    this.port = await browser.sockets.createServerSocket();
    DataReceiver.callbacks.set(this.port, this.callback);
    browser.sockets.startListening(this.port);
    console.log('Listening on port ' + this.port);
  }
}

class SendingSocket {
  constructor() {
  }

  async connect(host, port) {
    this.id = await browser.sockets.createSendingSocket();
    browser.sockets.connect(this.id, host, port);
    console.log(`Connected to ${host}:${port}`);
  }

  send(aData, aJSON=true) {
    try {
      browser.sockets.sendData(this.id, aData, !!aJSON);
      return true;
    } catch (err) {
      console.error(err,err.message);
      return false;
    }
  }

  close() {
    browser.sockets.close(this.id);
  }
}



/***/ }),

/***/ "../webext-instrumentation/build/module/background/cookie-instrument.js":
/*!******************************************************************************!*\
  !*** ../webext-instrumentation/build/module/background/cookie-instrument.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CookieInstrument": () => (/* binding */ CookieInstrument),
/* harmony export */   "transformCookieObjectToMatchOpenWPMSchema": () => (/* binding */ transformCookieObjectToMatchOpenWPMSchema)
/* harmony export */ });
/* harmony import */ var _lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/extension-session-event-ordinal */ "../webext-instrumentation/build/module/lib/extension-session-event-ordinal.js");
/* harmony import */ var _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/extension-session-uuid */ "../webext-instrumentation/build/module/lib/extension-session-uuid.js");
/* harmony import */ var _lib_string_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/string-utils */ "../webext-instrumentation/build/module/lib/string-utils.js");



const transformCookieObjectToMatchOpenWPMSchema = (cookie) => {
    const javascriptCookie = {};
    // Expiry time (in seconds)
    // May return ~Max(int64). I believe this is a session
    // cookie which doesn't expire. Sessions cookies with
    // non-max expiry time expire after session or at expiry.
    const expiryTime = cookie.expirationDate; // returns seconds
    let expiryTimeString;
    const maxInt64 = 9223372036854776000;
    if (!cookie.expirationDate || expiryTime === maxInt64) {
        expiryTimeString = "9999-12-31T21:59:59.000Z";
    }
    else {
        const expiryTimeDate = new Date(expiryTime * 1000); // requires milliseconds
        expiryTimeString = expiryTimeDate.toISOString();
    }
    javascriptCookie.expiry = expiryTimeString;
    javascriptCookie.is_http_only = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.boolToInt)(cookie.httpOnly);
    javascriptCookie.is_host_only = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.boolToInt)(cookie.hostOnly);
    javascriptCookie.is_session = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.boolToInt)(cookie.session);
    javascriptCookie.host = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.domain);
    javascriptCookie.is_secure = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.boolToInt)(cookie.secure);
    javascriptCookie.name = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.name);
    javascriptCookie.path = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.path);
    javascriptCookie.value = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.value);
    javascriptCookie.same_site = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.sameSite);
    javascriptCookie.first_party_domain = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.firstPartyDomain);
    javascriptCookie.store_id = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(cookie.storeId);
    javascriptCookie.time_stamp = new Date().toISOString();
    return javascriptCookie;
};
class CookieInstrument {
    dataReceiver;
    onChangedListener;
    constructor(dataReceiver) {
        this.dataReceiver = dataReceiver;
    }
    run(crawlID) {
        // Instrument cookie changes
        this.onChangedListener = async (changeInfo) => {
            const eventType = changeInfo.removed ? "deleted" : "added-or-changed";
            const update = {
                record_type: eventType,
                change_cause: changeInfo.cause,
                browser_id: crawlID,
                extension_session_uuid: _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid,
                event_ordinal: (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)(),
                ...transformCookieObjectToMatchOpenWPMSchema(changeInfo.cookie),
            };
            this.dataReceiver.saveRecord("javascript_cookies", update);
        };
        browser.cookies.onChanged.addListener(this.onChangedListener);
    }
    async saveAllCookies(crawlID) {
        const allCookies = await browser.cookies.getAll({});
        await Promise.all(allCookies.map((cookie) => {
            const update = {
                record_type: "manual-export",
                browser_id: crawlID,
                extension_session_uuid: _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid,
                ...transformCookieObjectToMatchOpenWPMSchema(cookie),
            };
            return this.dataReceiver.saveRecord("javascript_cookies", update);
        }));
    }
    cleanup() {
        if (this.onChangedListener) {
            browser.cookies.onChanged.removeListener(this.onChangedListener);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLWluc3RydW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmFja2dyb3VuZC9jb29raWUtaW5zdHJ1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNyRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBSzlELE1BQU0sQ0FBQyxNQUFNLHlDQUF5QyxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7SUFDMUUsTUFBTSxnQkFBZ0IsR0FBRyxFQUFzQixDQUFDO0lBRWhELDJCQUEyQjtJQUMzQixzREFBc0Q7SUFDdEQscURBQXFEO0lBQ3JELHlEQUF5RDtJQUN6RCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsa0JBQWtCO0lBQzVELElBQUksZ0JBQWdCLENBQUM7SUFDckIsTUFBTSxRQUFRLEdBQUcsbUJBQW1CLENBQUM7SUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLElBQUksVUFBVSxLQUFLLFFBQVEsRUFBRTtRQUNyRCxnQkFBZ0IsR0FBRywwQkFBMEIsQ0FBQztLQUMvQztTQUFNO1FBQ0wsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsd0JBQXdCO1FBQzVFLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNqRDtJQUNELGdCQUFnQixDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQztJQUMzQyxnQkFBZ0IsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzRCxnQkFBZ0IsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxR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

/***/ }),

/***/ "../webext-instrumentation/build/module/background/dns-instrument.js":
/*!***************************************************************************!*\
  !*** ../webext-instrumentation/build/module/background/dns-instrument.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DnsInstrument": () => (/* binding */ DnsInstrument)
/* harmony export */ });
/* harmony import */ var _lib_pending_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/pending-response */ "../webext-instrumentation/build/module/lib/pending-response.js");
/* harmony import */ var _http_instrument__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./http-instrument */ "../webext-instrumentation/build/module/background/http-instrument.js");


class DnsInstrument {
    dataReceiver;
    onCompleteListener;
    pendingResponses = {};
    constructor(dataReceiver) {
        this.dataReceiver = dataReceiver;
    }
    run(crawlID) {
        const filter = { urls: ["<all_urls>"], types: _http_instrument__WEBPACK_IMPORTED_MODULE_1__.allTypes };
        const requestStemsFromExtension = (details) => {
            return (details.originUrl &&
                details.originUrl.indexOf("moz-extension://") > -1 &&
                details.originUrl.includes("fakeRequest"));
        };
        /*
         * Attach handlers to event listeners
         */
        this.onCompleteListener = (details) => {
            // Ignore requests made by extensions
            if (requestStemsFromExtension(details)) {
                return;
            }
            const pendingResponse = this.getPendingResponse(details.requestId);
            pendingResponse.resolveOnCompletedEventDetails(details);
            this.onCompleteDnsHandler(details, crawlID);
        };
        browser.webRequest.onCompleted.addListener(this.onCompleteListener, filter);
    }
    cleanup() {
        if (this.onCompleteListener) {
            browser.webRequest.onCompleted.removeListener(this.onCompleteListener);
        }
    }
    getPendingResponse(requestId) {
        if (!this.pendingResponses[requestId]) {
            this.pendingResponses[requestId] = new _lib_pending_response__WEBPACK_IMPORTED_MODULE_0__.PendingResponse();
        }
        return this.pendingResponses[requestId];
    }
    handleResolvedDnsData(dnsRecordObj, dataReceiver) {
        // Curring the data returned by API call.
        return function (record) {
            // Get data from API call
            dnsRecordObj.addresses = record.addresses.toString();
            dnsRecordObj.canonical_name = record.canonicalName;
            dnsRecordObj.is_TRR = record.isTRR;
            // Send data to main OpenWPM data aggregator.
            dataReceiver.saveRecord("dns_responses", dnsRecordObj);
        };
    }
    async onCompleteDnsHandler(details, crawlID) {
        // Create and populate DnsResolve object
        const dnsRecord = {};
        dnsRecord.browser_id = crawlID;
        dnsRecord.request_id = Number(details.requestId);
        dnsRecord.used_address = details.ip;
        const currentTime = new Date(details.timeStamp);
        dnsRecord.time_stamp = currentTime.toISOString();
        // Query DNS API
        const url = new URL(details.url);
        dnsRecord.hostname = url.hostname;
        const dnsResolve = browser.dns.resolve(dnsRecord.hostname, [
            "canonical_name",
        ]);
        dnsResolve.then(this.handleResolvedDnsData(dnsRecord, this.dataReceiver));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5zLWluc3RydW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmFja2dyb3VuZC9kbnMtaW5zdHJ1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHMUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzdDLE1BQU0sT0FBTyxhQUFhO0lBQ1AsWUFBWSxDQUFDO0lBQ3RCLGtCQUFrQixDQUFDO0lBQ25CLGdCQUFnQixHQUVwQixFQUFFLENBQUM7SUFFUCxZQUFZLFlBQVk7UUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7SUFDbkMsQ0FBQztJQUVNLEdBQUcsQ0FBQyxPQUFPO1FBQ2hCLE1BQU0sTUFBTSxHQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUV4RSxNQUFNLHlCQUF5QixHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDNUMsT0FBTyxDQUNMLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQzFDLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRjs7V0FFRztRQUNILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQTBDLEVBQUUsRUFBRTtZQUN2RSxxQ0FBcUM7WUFDckMsSUFBSSx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEMsT0FBTzthQUNSO1lBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRSxlQUFlLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFeEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUM7UUFFRixPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFTSxPQUFPO1FBQ1osSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3hFO0lBQ0gsQ0FBQztJQUVPLGtCQUFrQixDQUFDLFNBQVM7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztTQUMxRDtRQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsWUFBWTtRQUN0RCx5Q0FBeUM7UUFDekMsT0FBTyxVQUFVLE1BQU07WUFDckIseUJBQXlCO1lBQ3pCLFlBQVksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyRCxZQUFZLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDbkQsWUFBWSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBRW5DLDZDQUE2QztZQUM3QyxZQUFZLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUNoQyxPQUEwQyxFQUMxQyxPQUFPO1FBRVAsd0NBQXdDO1FBQ3hDLE1BQU0sU0FBUyxHQUFHLEVBQWlCLENBQUM7UUFDcEMsU0FBUyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7UUFDL0IsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELFNBQVMsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNwQyxNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsU0FBUyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFakQsZ0JBQWdCO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxTQUFTLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDbEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUN6RCxnQkFBZ0I7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDRiJ9

/***/ }),

/***/ "../webext-instrumentation/build/module/background/http-instrument.js":
/*!****************************************************************************!*\
  !*** ../webext-instrumentation/build/module/background/http-instrument.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HttpInstrument": () => (/* binding */ HttpInstrument),
/* harmony export */   "allTypes": () => (/* binding */ allTypes)
/* harmony export */ });
/* harmony import */ var _lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/extension-session-event-ordinal */ "../webext-instrumentation/build/module/lib/extension-session-event-ordinal.js");
/* harmony import */ var _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/extension-session-uuid */ "../webext-instrumentation/build/module/lib/extension-session-uuid.js");
/* harmony import */ var _lib_http_post_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/http-post-parser */ "../webext-instrumentation/build/module/lib/http-post-parser.js");
/* harmony import */ var _lib_pending_request__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/pending-request */ "../webext-instrumentation/build/module/lib/pending-request.js");
/* harmony import */ var _lib_pending_response__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/pending-response */ "../webext-instrumentation/build/module/lib/pending-response.js");
/* harmony import */ var _lib_string_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/string-utils */ "../webext-instrumentation/build/module/lib/string-utils.js");






/**
 * Note: Different parts of the desired information arrives in different events as per below:
 * request = headers in onBeforeSendHeaders + body in onBeforeRequest
 * response = headers in onCompleted + body via a onBeforeRequest filter
 * redirect = original request headers+body, followed by a onBeforeRedirect and then a new set of request headers+body and response headers+body
 * Docs: https://developer.mozilla.org/en-US/docs/User:wbamberg/webRequest.RequestDetails
 */
const allTypes = [
    "beacon",
    "csp_report",
    "font",
    "image",
    "imageset",
    "main_frame",
    "media",
    "object",
    "object_subrequest",
    "ping",
    "script",
    "speculative",
    "stylesheet",
    "sub_frame",
    "web_manifest",
    "websocket",
    "xml_dtd",
    "xmlhttprequest",
    "xslt",
    "other",
];

class HttpInstrument {
    dataReceiver;
    pendingRequests = {};
    pendingResponses = {};
    onBeforeRequestListener;
    onBeforeSendHeadersListener;
    onBeforeRedirectListener;
    onCompletedListener;
    constructor(dataReceiver) {
        this.dataReceiver = dataReceiver;
    }
    run(crawlID, saveContentOption) {
        const filter = { urls: ["<all_urls>"], types: allTypes };
        const requestStemsFromExtension = (details) => {
            return (details.originUrl && details.originUrl.indexOf("moz-extension://") > -1);
        };
        /*
         * Attach handlers to event listeners
         */
        this.onBeforeRequestListener = (details) => {
            const blockingResponseThatDoesNothing = {};
            // Ignore requests made by extensions
            if (requestStemsFromExtension(details)) {
                return blockingResponseThatDoesNothing;
            }
            const pendingRequest = this.getPendingRequest(details.requestId);
            pendingRequest.resolveOnBeforeRequestEventDetails(details);
            const pendingResponse = this.getPendingResponse(details.requestId);
            pendingResponse.resolveOnBeforeRequestEventDetails(details);
            if (this.shouldSaveContent(saveContentOption, details.type)) {
                pendingResponse.addResponseResponseBodyListener(details);
            }
            return blockingResponseThatDoesNothing;
        };
        browser.webRequest.onBeforeRequest.addListener(this.onBeforeRequestListener, filter, this.isContentSavingEnabled(saveContentOption)
            ? ["requestBody", "blocking"]
            : ["requestBody"]);
        this.onBeforeSendHeadersListener = (details) => {
            // Ignore requests made by extensions
            if (requestStemsFromExtension(details)) {
                return;
            }
            const pendingRequest = this.getPendingRequest(details.requestId);
            pendingRequest.resolveOnBeforeSendHeadersEventDetails(details);
            this.onBeforeSendHeadersHandler(details, crawlID, (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)());
        };
        browser.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeadersListener, filter, ["requestHeaders"]);
        this.onBeforeRedirectListener = (details) => {
            // Ignore requests made by extensions
            if (requestStemsFromExtension(details)) {
                return;
            }
            this.onBeforeRedirectHandler(details, crawlID, (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)());
        };
        browser.webRequest.onBeforeRedirect.addListener(this.onBeforeRedirectListener, filter, ["responseHeaders"]);
        this.onCompletedListener = (details) => {
            // Ignore requests made by extensions
            if (requestStemsFromExtension(details)) {
                return;
            }
            const pendingResponse = this.getPendingResponse(details.requestId);
            pendingResponse.resolveOnCompletedEventDetails(details);
            this.onCompletedHandler(details, crawlID, (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)(), saveContentOption);
        };
        browser.webRequest.onCompleted.addListener(this.onCompletedListener, filter, ["responseHeaders"]);
    }
    cleanup() {
        if (this.onBeforeRequestListener) {
            browser.webRequest.onBeforeRequest.removeListener(this.onBeforeRequestListener);
        }
        if (this.onBeforeSendHeadersListener) {
            browser.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeadersListener);
        }
        if (this.onBeforeRedirectListener) {
            browser.webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirectListener);
        }
        if (this.onCompletedListener) {
            browser.webRequest.onCompleted.removeListener(this.onCompletedListener);
        }
    }
    isContentSavingEnabled(saveContentOption) {
        if (saveContentOption === true) {
            return true;
        }
        if (saveContentOption === false) {
            return false;
        }
        return this.saveContentResourceTypes(saveContentOption).length > 0;
    }
    saveContentResourceTypes(saveContentOption) {
        return saveContentOption.split(",");
    }
    /**
     * We rely on the resource type to filter responses
     * See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType
     *
     * @param saveContentOption
     * @param resourceType
     */
    shouldSaveContent(saveContentOption, resourceType) {
        if (saveContentOption === true) {
            return true;
        }
        if (saveContentOption === false) {
            return false;
        }
        return this.saveContentResourceTypes(saveContentOption).includes(resourceType);
    }
    getPendingRequest(requestId) {
        if (!this.pendingRequests[requestId]) {
            this.pendingRequests[requestId] = new _lib_pending_request__WEBPACK_IMPORTED_MODULE_3__.PendingRequest();
        }
        return this.pendingRequests[requestId];
    }
    getPendingResponse(requestId) {
        if (!this.pendingResponses[requestId]) {
            this.pendingResponses[requestId] = new _lib_pending_response__WEBPACK_IMPORTED_MODULE_4__.PendingResponse();
        }
        return this.pendingResponses[requestId];
    }
    /*
     * HTTP Request Handler and Helper Functions
     */
    async onBeforeSendHeadersHandler(details, crawlID, eventOrdinal) {
        const tab = details.tabId > -1
            ? await browser.tabs.get(details.tabId)
            : { windowId: undefined, incognito: undefined, url: undefined };
        const update = {};
        update.incognito = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.boolToInt)(tab.incognito);
        update.browser_id = crawlID;
        update.extension_session_uuid = _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid;
        update.event_ordinal = eventOrdinal;
        update.window_id = tab.windowId;
        update.tab_id = details.tabId;
        update.frame_id = details.frameId;
        // requestId is a unique identifier that can be used to link requests and responses
        update.request_id = Number(details.requestId);
        const url = details.url;
        update.url = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeUrl)(url);
        const requestMethod = details.method;
        update.method = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(requestMethod);
        const current_time = new Date(details.timeStamp);
        update.time_stamp = current_time.toISOString();
        let encodingType = "";
        let referrer = "";
        const headers = [];
        let isOcsp = false;
        if (details.requestHeaders) {
            details.requestHeaders.map((requestHeader) => {
                const { name, value } = requestHeader;
                const header_pair = [];
                header_pair.push((0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(name));
                header_pair.push((0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(value));
                headers.push(header_pair);
                if (name === "Content-Type") {
                    encodingType = value;
                    if (encodingType.indexOf("application/ocsp-request") !== -1) {
                        isOcsp = true;
                    }
                }
                if (name === "Referer") {
                    referrer = value;
                }
            });
        }
        update.referrer = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(referrer);
        if (requestMethod === "POST" && !isOcsp /* don't process OCSP requests */) {
            const pendingRequest = this.getPendingRequest(details.requestId);
            const resolved = await pendingRequest.resolvedWithinTimeout(1000);
            if (!resolved) {
                this.dataReceiver.logError("Pending request timed out waiting for data from both onBeforeRequest and onBeforeSendHeaders events");
            }
            else {
                const onBeforeRequestEventDetails = await pendingRequest.onBeforeRequestEventDetails;
                const requestBody = onBeforeRequestEventDetails.requestBody;
                if (requestBody) {
                    const postParser = new _lib_http_post_parser__WEBPACK_IMPORTED_MODULE_2__.HttpPostParser(onBeforeRequestEventDetails, this.dataReceiver);
                    const postObj = postParser.parsePostRequest();
                    // Add (POST) request headers from upload stream
                    if ("post_headers" in postObj) {
                        // Only store POST headers that we know and need. We may misinterpret POST data as headers
                        // as detection is based on "key:value" format (non-header POST data can be in this format as well)
                        const contentHeaders = [
                            "Content-Type",
                            "Content-Disposition",
                            "Content-Length",
                        ];
                        for (const name in postObj.post_headers) {
                            if (contentHeaders.includes(name)) {
                                const header_pair = [];
                                header_pair.push((0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(name));
                                header_pair.push((0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(postObj.post_headers[name]));
                                headers.push(header_pair);
                            }
                        }
                    }
                    // we store POST body in JSON format, except when it's a string without a (key-value) structure
                    if ("post_body" in postObj) {
                        update.post_body = postObj.post_body;
                    }
                    if ("post_body_raw" in postObj) {
                        update.post_body_raw = postObj.post_body_raw;
                    }
                }
            }
        }
        update.headers = JSON.stringify(headers);
        // Check if xhr
        const isXHR = details.type === "xmlhttprequest";
        update.is_XHR = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.boolToInt)(isXHR);
        // Grab the triggering and loading Principals
        let triggeringOrigin;
        let loadingOrigin;
        if (details.originUrl) {
            const parsedOriginUrl = new URL(details.originUrl);
            triggeringOrigin = parsedOriginUrl.origin;
        }
        if (details.documentUrl) {
            const parsedDocumentUrl = new URL(details.documentUrl);
            loadingOrigin = parsedDocumentUrl.origin;
        }
        update.triggering_origin = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(triggeringOrigin);
        update.loading_origin = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(loadingOrigin);
        // loadingDocument's href
        // The loadingDocument is the document the element resides, regardless of
        // how the load was triggered.
        const loadingHref = details.documentUrl;
        update.loading_href = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(loadingHref);
        // resourceType of the requesting node. This is set by the type of
        // node making the request (i.e. an <img src=...> node will set to type "image").
        // Documentation:
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType
        update.resource_type = details.type;
        /*
        // TODO: Refactor to corresponding webext logic or discard
        const ThirdPartyUtil = Cc["@mozilla.org/thirdpartyutil;1"].getService(
                               Ci.mozIThirdPartyUtil);
        // Do third-party checks
        // These specific checks are done because it's what's used in Tracking Protection
        // See: http://searchfox.org/mozilla-central/source/netwerk/base/nsChannelClassifier.cpp#107
        try {
          const isThirdPartyChannel = ThirdPartyUtil.isThirdPartyChannel(details);
          const topWindow = ThirdPartyUtil.getTopWindowForChannel(details);
          const topURI = ThirdPartyUtil.getURIFromWindow(topWindow);
          if (topURI) {
            const topUrl = topURI.spec;
            const channelURI = details.URI;
            const isThirdPartyToTopWindow = ThirdPartyUtil.isThirdPartyURI(
              channelURI,
              topURI,
            );
            update.is_third_party_to_top_window = isThirdPartyToTopWindow;
            update.is_third_party_channel = isThirdPartyChannel;
          }
        } catch (anError) {
          // Exceptions expected for channels triggered or loading in a
          // NullPrincipal or SystemPrincipal. They are also expected for favicon
          // loads, which we attempt to filter. Depending on the naming, some favicons
          // may continue to lead to error logs.
          if (
            update.triggering_origin !== "[System Principal]" &&
            update.triggering_origin !== undefined &&
            update.loading_origin !== "[System Principal]" &&
            update.loading_origin !== undefined &&
            !update.url.endsWith("ico")
          ) {
            this.dataReceiver.logError(
              "Error while retrieving additional channel information for URL: " +
              "\n" +
              update.url +
              "\n Error text:" +
              JSON.stringify(anError),
            );
          }
        }
        */
        update.top_level_url = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeUrl)(this.getDocumentUrlForRequest(details));
        update.parent_frame_id = details.parentFrameId;
        update.frame_ancestors = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(JSON.stringify(details.frameAncestors));
        this.dataReceiver.saveRecord("http_requests", update);
    }
    /**
     * Code taken and adapted from
     * https://github.com/EFForg/privacybadger/pull/2198/files
     *
     * Gets the URL for a given request's top-level document.
     *
     * The request's document may be different from the current top-level document
     * loaded in tab as requests can come out of order:
     *
     * @param {WebRequestOnBeforeSendHeadersEventDetails} details
     *
     * @return {?String} the URL for the request's top-level document
     */
    getDocumentUrlForRequest(details) {
        let url = "";
        if (details.type === "main_frame") {
            // Url of the top-level document itself.
            url = details.url;
        }
        else if (details.hasOwnProperty("frameAncestors")) {
            // In case of nested frames, retrieve url from top-most ancestor.
            // If frameAncestors == [], request comes from the top-level-document.
            url = details.frameAncestors.length
                ? details.frameAncestors[details.frameAncestors.length - 1].url
                : details.documentUrl;
        }
        else {
            // type != 'main_frame' and frameAncestors == undefined
            // For example service workers: https://bugzilla.mozilla.org/show_bug.cgi?id=1470537#c13
            url = details.documentUrl;
        }
        return url;
    }
    async onBeforeRedirectHandler(details, crawlID, eventOrdinal) {
        /*
        console.log(
          "onBeforeRedirectHandler (previously httpRequestHandler)",
          details,
          crawlID,
        );
        */
        // Save HTTP redirect events
        // Events are saved to the `http_redirects` table
        /*
        // TODO: Refactor to corresponding webext logic or discard
        // Events are saved to the `http_redirects` table, and map the old
        // request/response channel id to the new request/response channel id.
        // Implementation based on: https://stackoverflow.com/a/11240627
        const oldNotifications = details.notificationCallbacks;
        let oldEventSink = null;
        details.notificationCallbacks = {
          QueryInterface: XPCOMUtils.generateQI([
            Ci.nsIInterfaceRequestor,
            Ci.nsIChannelEventSink,
          ]),
    
          getInterface(iid) {
            // We are only interested in nsIChannelEventSink,
            // return the old callbacks for any other interface requests.
            if (iid.equals(Ci.nsIChannelEventSink)) {
              try {
                oldEventSink = oldNotifications.QueryInterface(iid);
              } catch (anError) {
                this.dataReceiver.logError(
                  "Error during call to custom notificationCallbacks::getInterface." +
                    JSON.stringify(anError),
                );
              }
              return this;
            }
    
            if (oldNotifications) {
              return oldNotifications.getInterface(iid);
            } else {
              throw Cr.NS_ERROR_NO_INTERFACE;
            }
          },
    
          asyncOnChannelRedirect(oldChannel, newChannel, flags, callback) {
    
            newChannel.QueryInterface(Ci.nsIHttpChannel);
    
            const httpRedirect: HttpRedirect = {
              browser_id: crawlID,
              old_request_id: oldChannel.channelId,
              new_request_id: newChannel.channelId,
              time_stamp: new Date().toISOString(),
            };
            this.dataReceiver.saveRecord("http_redirects", httpRedirect);
    
            if (oldEventSink) {
              oldEventSink.asyncOnChannelRedirect(
                oldChannel,
                newChannel,
                flags,
                callback,
              );
            } else {
              callback.onRedirectVerifyCallback(Cr.NS_OK);
            }
          },
        };
        */
        const responseStatus = details.statusCode;
        const responseStatusText = details.statusLine;
        const tab = details.tabId > -1
            ? await browser.tabs.get(details.tabId)
            : { windowId: undefined, incognito: undefined };
        const httpRedirect = {
            incognito: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.boolToInt)(tab.incognito),
            browser_id: crawlID,
            old_request_url: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeUrl)(details.url),
            old_request_id: details.requestId,
            new_request_url: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeUrl)(details.redirectUrl),
            new_request_id: null,
            extension_session_uuid: _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid,
            event_ordinal: eventOrdinal,
            window_id: tab.windowId,
            tab_id: details.tabId,
            frame_id: details.frameId,
            response_status: responseStatus,
            response_status_text: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(responseStatusText),
            headers: this.jsonifyHeaders(details.responseHeaders).headers,
            time_stamp: new Date(details.timeStamp).toISOString(),
        };
        this.dataReceiver.saveRecord("http_redirects", httpRedirect);
    }
    /*
     * HTTP Response Handlers and Helper Functions
     */
    async logWithResponseBody(details, update) {
        const pendingResponse = this.getPendingResponse(details.requestId);
        try {
            const responseBodyListener = pendingResponse.responseBodyListener;
            const respBody = await responseBodyListener.getResponseBody();
            const contentHash = await responseBodyListener.getContentHash();
            this.dataReceiver.saveContent(respBody, (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(contentHash));
            update.content_hash = contentHash;
            this.dataReceiver.saveRecord("http_responses", update);
        }
        catch (err) {
            /*
            // TODO: Refactor to corresponding webext logic or discard
            dataReceiver.logError(
              "Unable to retrieve response body." + JSON.stringify(aReason),
            );
            update.content_hash = "<error>";
            dataReceiver.saveRecord("http_responses", update);
            */
            this.dataReceiver.logError("Unable to retrieve response body." +
                "Likely caused by a programming error. Error Message:" +
                err.name +
                err.message +
                "\n" +
                err.stack);
            update.content_hash = "<error>";
            this.dataReceiver.saveRecord("http_responses", update);
        }
    }
    // Instrument HTTP responses
    async onCompletedHandler(details, crawlID, eventOrdinal, saveContent) {
        /*
        console.log(
          "onCompletedHandler (previously httpRequestHandler)",
          details,
          crawlID,
          saveContent,
        );
        */
        const tab = details.tabId > -1
            ? await browser.tabs.get(details.tabId)
            : { windowId: undefined, incognito: undefined };
        const update = {};
        update.incognito = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.boolToInt)(tab.incognito);
        update.browser_id = crawlID;
        update.extension_session_uuid = _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid;
        update.event_ordinal = eventOrdinal;
        update.window_id = tab.windowId;
        update.tab_id = details.tabId;
        update.frame_id = details.frameId;
        // requestId is a unique identifier that can be used to link requests and responses
        update.request_id = Number(details.requestId);
        const isCached = details.fromCache;
        update.is_cached = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.boolToInt)(isCached);
        const url = details.url;
        update.url = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeUrl)(url);
        const requestMethod = details.method;
        update.method = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(requestMethod);
        // TODO: Refactor to corresponding webext logic or discard
        // (request headers are not available in http response event listener object,
        // but the referrer property of the corresponding request could be queried)
        //
        // let referrer = "";
        // if (details.referrer) {
        //   referrer = details.referrer.spec;
        // }
        // update.referrer = escapeString(referrer);
        const responseStatus = details.statusCode;
        update.response_status = responseStatus;
        const responseStatusText = details.statusLine;
        update.response_status_text = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(responseStatusText);
        const current_time = new Date(details.timeStamp);
        update.time_stamp = current_time.toISOString();
        const parsedHeaders = this.jsonifyHeaders(details.responseHeaders);
        update.headers = parsedHeaders.headers;
        update.location = parsedHeaders.location;
        if (this.shouldSaveContent(saveContent, details.type)) {
            this.logWithResponseBody(details, update);
        }
        else {
            this.dataReceiver.saveRecord("http_responses", update);
        }
    }
    jsonifyHeaders(headers) {
        const resultHeaders = [];
        let location = "";
        if (headers) {
            headers.map((responseHeader) => {
                const { name, value } = responseHeader;
                const header_pair = [];
                header_pair.push((0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(name));
                header_pair.push((0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(value));
                resultHeaders.push(header_pair);
                if (name.toLowerCase() === "location") {
                    location = value;
                }
            });
        }
        return {
            headers: JSON.stringify(resultHeaders),
            location: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_5__.escapeString)(location),
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1pbnN0cnVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvaHR0cC1pbnN0cnVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxjQUFjLEVBQXFCLE1BQU0seUJBQXlCLENBQUM7QUFDNUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQWV6RTs7Ozs7O0dBTUc7QUFFSCxNQUFNLFFBQVEsR0FBbUI7SUFDL0IsUUFBUTtJQUNSLFlBQVk7SUFDWixNQUFNO0lBQ04sT0FBTztJQUNQLFVBQVU7SUFDVixZQUFZO0lBQ1osT0FBTztJQUNQLFFBQVE7SUFDUixtQkFBbUI7SUFDbkIsTUFBTTtJQUNOLFFBQVE7SUFDUixhQUFhO0lBQ2IsWUFBWTtJQUNaLFdBQVc7SUFDWCxjQUFjO0lBQ2QsV0FBVztJQUNYLFNBQVM7SUFDVCxnQkFBZ0I7SUFDaEIsTUFBTTtJQUNOLE9BQU87Q0FDUixDQUFDO0FBRUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBRXBCLE1BQU0sT0FBTyxjQUFjO0lBQ1IsWUFBWSxDQUFDO0lBQ3RCLGVBQWUsR0FFbkIsRUFBRSxDQUFDO0lBQ0MsZ0JBQWdCLEdBRXBCLEVBQUUsQ0FBQztJQUNDLHVCQUF1QixDQUFDO0lBQ3hCLDJCQUEyQixDQUFDO0lBQzVCLHdCQUF3QixDQUFDO0lBQ3pCLG1CQUFtQixDQUFDO0lBRTVCLFlBQVksWUFBWTtRQUN0QixJQUFJLENBQUMsWUFB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

/***/ }),

/***/ "../webext-instrumentation/build/module/background/javascript-instrument.js":
/*!**********************************************************************************!*\
  !*** ../webext-instrumentation/build/module/background/javascript-instrument.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JavascriptInstrument": () => (/* binding */ JavascriptInstrument)
/* harmony export */ });
/* harmony import */ var _lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/extension-session-event-ordinal */ "../webext-instrumentation/build/module/lib/extension-session-event-ordinal.js");
/* harmony import */ var _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/extension-session-uuid */ "../webext-instrumentation/build/module/lib/extension-session-uuid.js");
/* harmony import */ var _lib_string_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/string-utils */ "../webext-instrumentation/build/module/lib/string-utils.js");



class JavascriptInstrument {
    /**
     * Converts received call and values data from the JS Instrumentation
     * into the format that the schema expects.
     *
     * @param data
     * @param sender
     */
    static processCallsAndValues(data, sender) {
        const update = {};
        update.extension_session_uuid = _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid;
        update.event_ordinal = (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)();
        update.page_scoped_event_ordinal = data.ordinal;
        update.window_id = sender.tab.windowId;
        update.tab_id = sender.tab.id;
        update.frame_id = sender.frameId;
        update.script_url = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeUrl)(data.scriptUrl);
        update.script_line = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.scriptLine);
        update.script_col = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.scriptCol);
        update.func_name = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.funcName);
        update.script_loc_eval = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.scriptLocEval);
        update.call_stack = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.callStack);
        update.symbol = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.symbol);
        update.operation = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.operation);
        update.value = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(data.value);
        update.time_stamp = data.timeStamp;
        update.incognito = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.boolToInt)(sender.tab.incognito);
        // document_url is the current frame's document href
        // top_level_url is the top-level frame's document href
        update.document_url = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeUrl)(sender.url);
        update.top_level_url = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeUrl)(sender.tab.url);
        if (data.operation === "call" && data.args.length > 0) {
            update.arguments = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_2__.escapeString)(JSON.stringify(data.args));
        }
        return update;
    }
    dataReceiver;
    onMessageListener;
    configured = false;
    pendingRecords = [];
    crawlID;
    constructor(dataReceiver) {
        this.dataReceiver = dataReceiver;
    }
    /**
     * Start listening for messages from page/content/background scripts injected to instrument JavaScript APIs
     */
    listen() {
        this.onMessageListener = (message, sender) => {
            if (message.namespace &&
                message.namespace === "javascript-instrumentation") {
                this.handleJsInstrumentationMessage(message, sender);
            }
        };
        browser.runtime.onMessage.addListener(this.onMessageListener);
    }
    /**
     * Either sends the log data to the dataReceiver or store it in memory
     * as a pending record if the JS instrumentation is not yet configured
     *
     * @param message
     * @param sender
     */
    handleJsInstrumentationMessage(message, sender) {
        switch (message.type) {
            case "logCall":
            case "logValue":
                const update = JavascriptInstrument.processCallsAndValues(message.data, sender);
                if (this.configured) {
                    update.browser_id = this.crawlID;
                    this.dataReceiver.saveRecord("javascript", update);
                }
                else {
                    this.pendingRecords.push(update);
                }
                break;
        }
    }
    /**
     * Starts listening if haven't done so already, sets the crawl ID,
     * marks the JS instrumentation as configured and sends any pending
     * records that have been received up until this point.
     *
     * @param crawlID
     */
    run(crawlID) {
        if (!this.onMessageListener) {
            this.listen();
        }
        this.crawlID = crawlID;
        this.configured = true;
        this.pendingRecords.map((update) => {
            update.browser_id = this.crawlID;
            this.dataReceiver.saveRecord("javascript", update);
        });
    }
    async registerContentScript(testing, jsInstrumentationSettings) {
        const contentScriptConfig = {
            testing,
            jsInstrumentationSettings,
        };
        if (contentScriptConfig) {
            // TODO: Avoid using window to pass the content script config
            await browser.contentScripts.register({
                js: [
                    {
                        code: `window.openWpmContentScriptConfig = ${JSON.stringify(contentScriptConfig)};`,
                    },
                ],
                matches: ["<all_urls>"],
                allFrames: true,
                runAt: "document_start",
                matchAboutBlank: true,
            });
        }
        return browser.contentScripts.register({
            js: [{ file: "/content.js" }],
            matches: ["<all_urls>"],
            allFrames: true,
            runAt: "document_start",
            matchAboutBlank: true,
        });
    }
    cleanup() {
        this.pendingRecords = [];
        if (this.onMessageListener) {
            browser.runtime.onMessage.removeListener(this.onMessageListener);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC1pbnN0cnVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvamF2YXNjcmlwdC1pbnN0cnVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBSXpFLE1BQU0sT0FBTyxvQkFBb0I7SUFDL0I7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxNQUFxQjtRQUM5RCxNQUFNLE1BQU0sR0FBRyxFQUF5QixDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxzQkFBc0IsR0FBRyxvQkFBb0IsQ0FBQztRQUNyRCxNQUFNLENBQUMsYUFBYSxHQUFHLHVCQUF1QixFQUFFLENBQUM7UUFDakQsTUFBTSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDaEQsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUN2QyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQyxNQUFNLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxNQUFNLENB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

/***/ }),

/***/ "../webext-instrumentation/build/module/background/navigation-instrument.js":
/*!**********************************************************************************!*\
  !*** ../webext-instrumentation/build/module/background/navigation-instrument.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NavigationInstrument": () => (/* binding */ NavigationInstrument),
/* harmony export */   "transformWebNavigationBaseEventDetailsToOpenWPMSchema": () => (/* binding */ transformWebNavigationBaseEventDetailsToOpenWPMSchema)
/* harmony export */ });
/* harmony import */ var _lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/extension-session-event-ordinal */ "../webext-instrumentation/build/module/lib/extension-session-event-ordinal.js");
/* harmony import */ var _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/extension-session-uuid */ "../webext-instrumentation/build/module/lib/extension-session-uuid.js");
/* harmony import */ var _lib_pending_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/pending-navigation */ "../webext-instrumentation/build/module/lib/pending-navigation.js");
/* harmony import */ var _lib_string_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/string-utils */ "../webext-instrumentation/build/module/lib/string-utils.js");
/* harmony import */ var _lib_uuid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/uuid */ "../webext-instrumentation/build/module/lib/uuid.js");





const transformWebNavigationBaseEventDetailsToOpenWPMSchema = async (crawlID, details) => {
    const tab = details.tabId > -1
        ? await browser.tabs.get(details.tabId)
        : {
            windowId: undefined,
            incognito: undefined,
            cookieStoreId: undefined,
            openerTabId: undefined,
            width: undefined,
            height: undefined,
        };
    const window = tab.windowId
        ? await browser.windows.get(tab.windowId)
        : { width: undefined, height: undefined, type: undefined };
    const navigation = {
        browser_id: crawlID,
        incognito: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_3__.boolToInt)(tab.incognito),
        extension_session_uuid: _lib_extension_session_uuid__WEBPACK_IMPORTED_MODULE_1__.extensionSessionUuid,
        process_id: details.processId,
        window_id: tab.windowId,
        tab_id: details.tabId,
        tab_opener_tab_id: tab.openerTabId,
        frame_id: details.frameId,
        window_width: window.width,
        window_height: window.height,
        window_type: window.type,
        tab_width: tab.width,
        tab_height: tab.height,
        tab_cookie_store_id: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_3__.escapeString)(tab.cookieStoreId),
        uuid: (0,_lib_uuid__WEBPACK_IMPORTED_MODULE_4__.makeUUID)(),
        url: (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_3__.escapeUrl)(details.url),
    };
    return navigation;
};
class NavigationInstrument {
    static navigationId(processId, tabId, frameId) {
        return `${processId}-${tabId}-${frameId}`;
    }
    dataReceiver;
    onBeforeNavigateListener;
    onCommittedListener;
    pendingNavigations = {};
    constructor(dataReceiver) {
        this.dataReceiver = dataReceiver;
    }
    run(crawlID) {
        this.onBeforeNavigateListener = async (details) => {
            const navigationId = NavigationInstrument.navigationId(details.processId, details.tabId, details.frameId);
            const pendingNavigation = this.instantiatePendingNavigation(navigationId);
            const navigation = await transformWebNavigationBaseEventDetailsToOpenWPMSchema(crawlID, details);
            navigation.parent_frame_id = details.parentFrameId;
            navigation.before_navigate_event_ordinal = (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)();
            navigation.before_navigate_time_stamp = new Date(details.timeStamp).toISOString();
            pendingNavigation.resolveOnBeforeNavigateEventNavigation(navigation);
        };
        browser.webNavigation.onBeforeNavigate.addListener(this.onBeforeNavigateListener);
        this.onCommittedListener = async (details) => {
            const navigationId = NavigationInstrument.navigationId(details.processId, details.tabId, details.frameId);
            const navigation = await transformWebNavigationBaseEventDetailsToOpenWPMSchema(crawlID, details);
            navigation.transition_qualifiers = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_3__.escapeString)(JSON.stringify(details.transitionQualifiers));
            navigation.transition_type = (0,_lib_string_utils__WEBPACK_IMPORTED_MODULE_3__.escapeString)(details.transitionType);
            navigation.committed_event_ordinal = (0,_lib_extension_session_event_ordinal__WEBPACK_IMPORTED_MODULE_0__.incrementedEventOrdinal)();
            navigation.committed_time_stamp = new Date(details.timeStamp).toISOString();
            // include attributes from the corresponding onBeforeNavigation event
            const pendingNavigation = this.getPendingNavigation(navigationId);
            if (pendingNavigation) {
                pendingNavigation.resolveOnCommittedEventNavigation(navigation);
                const resolved = await pendingNavigation.resolvedWithinTimeout(1000);
                if (resolved) {
                    const onBeforeNavigateEventNavigation = await pendingNavigation.onBeforeNavigateEventNavigation;
                    navigation.parent_frame_id =
                        onBeforeNavigateEventNavigation.parent_frame_id;
                    navigation.before_navigate_event_ordinal =
                        onBeforeNavigateEventNavigation.before_navigate_event_ordinal;
                    navigation.before_navigate_time_stamp =
                        onBeforeNavigateEventNavigation.before_navigate_time_stamp;
                }
            }
            this.dataReceiver.saveRecord("navigations", navigation);
        };
        browser.webNavigation.onCommitted.addListener(this.onCommittedListener);
    }
    cleanup() {
        if (this.onBeforeNavigateListener) {
            browser.webNavigation.onBeforeNavigate.removeListener(this.onBeforeNavigateListener);
        }
        if (this.onCommittedListener) {
            browser.webNavigation.onCommitted.removeListener(this.onCommittedListener);
        }
    }
    instantiatePendingNavigation(navigationId) {
        this.pendingNavigations[navigationId] = new _lib_pending_navigation__WEBPACK_IMPORTED_MODULE_2__.PendingNavigation();
        return this.pendingNavigations[navigationId];
    }
    getPendingNavigation(navigationId) {
        return this.pendingNavigations[navigationId];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi1pbnN0cnVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JhY2tncm91bmQvbmF2aWdhdGlvbi1pbnN0cnVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzlELE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFRdkMsTUFBTSxDQUFDLE1BQU0scURBQXFELEdBQUcsS0FBSyxFQUN4RSxPQUFPLEVBQ1AsT0FBc0MsRUFDakIsRUFBRTtJQUN2QixNQUFNLEdBQUcsR0FDUCxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQztZQUNFLFFBQVEsRUFBRSxTQUFTO1lBQ25CLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRSxTQUFTO1lBQ2hCLE1BQU0sRUFBRSxTQUFTO1NBQ2xCLENBQUM7SUFDUixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUTtRQUN6QixDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxJ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

/***/ }),

/***/ "../webext-instrumentation/build/module/content/javascript-instrument-content-scope.js":
/*!*********************************************************************************************!*\
  !*** ../webext-instrumentation/build/module/content/javascript-instrument-content-scope.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "injectJavascriptInstrumentPageScript": () => (/* binding */ injectJavascriptInstrumentPageScript)
/* harmony export */ });
/* harmony import */ var _lib_js_instruments__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/js-instruments */ "../webext-instrumentation/build/module/lib/js-instruments.js");
/* harmony import */ var _javascript_instrument_page_scope__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./javascript-instrument-page-scope */ "../webext-instrumentation/build/module/content/javascript-instrument-page-scope.js");


function getPageScriptAsString(jsInstrumentationSettings) {
    // The JS Instrument Requests are setup and validated python side
    // including setting defaults for logSettings. See JSInstrumentation.py
    const pageScriptString = `
// Start of js-instruments.
${_lib_js_instruments__WEBPACK_IMPORTED_MODULE_0__.getInstrumentJS}
// End of js-instruments.

// Start of custom instrumentRequests.
const jsInstrumentationSettings = ${JSON.stringify(jsInstrumentationSettings)};
// End of custom instrumentRequests.

// Start of anonymous function from javascript-instrument-page-scope.ts
(${_javascript_instrument_page_scope__WEBPACK_IMPORTED_MODULE_1__.pageScript}(getInstrumentJS, jsInstrumentationSettings));
// End.
  `;
    return pageScriptString;
}
;
function insertScript(pageScriptString, eventId, testing = false) {
    const parent = document.documentElement;
    const script = document.createElement("script");
    script.text = pageScriptString;
    script.async = false;
    script.setAttribute("data-event-id", eventId);
    script.setAttribute("data-testing", `${testing}`);
    parent.insertBefore(script, parent.firstChild);
    parent.removeChild(script);
}
;
function emitMsg(type, msg) {
    msg.timeStamp = new Date().toISOString();
    browser.runtime.sendMessage({
        namespace: "javascript-instrumentation",
        type,
        data: msg,
    });
}
;
const eventId = Math.random().toString();
// listen for messages from the script we are about to insert
document.addEventListener(eventId, (e) => {
    // pass these on to the background page
    const msgs = e.detail;
    if (Array.isArray(msgs)) {
        msgs.forEach((msg) => {
            emitMsg(msg.type, msg.content);
        });
    }
    else {
        emitMsg(msgs.type, msgs.content);
    }
});
const injectJavascriptInstrumentPageScript = (contentScriptConfig) => {
    insertScript(getPageScriptAsString(contentScriptConfig.jsInstrumentationSettings), eventId, contentScriptConfig.testing);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC1pbnN0cnVtZW50LWNvbnRlbnQtc2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGVudC9qYXZhc2NyaXB0LWluc3RydW1lbnQtY29udGVudC1zY29wZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUF1QixNQUFNLHVCQUF1QixDQUFDO0FBQzdFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUdoRSxTQUFTLHFCQUFxQixDQUM1Qix5QkFBZ0Q7SUFFaEQsaUVBQWlFO0lBQ2pFLHVFQUF1RTtJQUN2RSxNQUFNLGdCQUFnQixHQUFHOztFQUV6QixlQUFlOzs7O29DQUltQixJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDOzs7O0dBSTFFLFVBQVU7O0dBRVYsQ0FBQztJQUNGLE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQztBQUFBLENBQUM7QUFFRixTQUFTLFlBQVksQ0FDbkIsZ0JBQXdCLEVBQ3hCLE9BQWUsRUFDZixVQUFtQixLQUFLO0lBRXhCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUM7SUFDeEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxNQUFNLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0lBQy9CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNsRCxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBQUEsQ0FBQztBQUVGLFNBQVMsT0FBTyxDQUFFLElBQUksRUFBRSxHQUFHO0lBQ3pCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUMxQixTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDLElBQUk7UUFDSixJQUFJLEVBQUUsR0FBRztLQUNWLENBQUMsQ0FBQztBQUNMLENBQUM7QUFBQSxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBRXpDLDZEQUE2RDtBQUM3RCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBYyxFQUFFLEVBQUU7SUFDcEQsdUNBQXVDO0lBQ3ZDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdEIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7S0FDSjtTQUFNO1FBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2xDO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsTUFBTSxvQ0FBb0MsR0FBRyxDQUFDLG1CQUErQyxFQUFFLEVBQUU7SUFDdEcsWUFBWSxDQUNWLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLHlCQUF5QixDQUFDLEVBQ3BFLE9BQU8sRUFDUCxtQkFBbUIsQ0FBQyxPQUFPLENBQzVCLENBQUM7QUFDSixDQUFDLENBQUEifQ==

/***/ }),

/***/ "../webext-instrumentation/build/module/content/javascript-instrument-page-scope.js":
/*!******************************************************************************************!*\
  !*** ../webext-instrumentation/build/module/content/javascript-instrument-page-scope.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pageScript": () => (/* binding */ pageScript)
/* harmony export */ });
/* eslint-disable no-console */
// Code below is not a content script: no Firefox APIs should be used
// Also, no webpack/es6 imports may be used in this file since the script
// is exported as a page script as a string
function pageScript(getInstrumentJS, jsInstrumentationSettings) {
    // messages the injected script
    const sendMessagesToLogger = (eventId, messages) => {
        document.dispatchEvent(new CustomEvent(eventId, {
            detail: messages,
        }));
    };
    const eventId = document.currentScript.getAttribute("data-event-id");
    const testing = document.currentScript.getAttribute("data-testing");
    const instrumentJS = getInstrumentJS(eventId, sendMessagesToLogger);
    let t0;
    if (testing === "true") {
        console.log("OpenWPM: Currently testing");
        t0 = performance.now();
        console.log("Begin loading JS instrumentation.");
    }
    instrumentJS(jsInstrumentationSettings);
    if (testing === "true") {
        const t1 = performance.now();
        console.log(`Call to instrumentJS took ${t1 - t0} milliseconds.`);
        window.instrumentJS = instrumentJS;
        console.log("OpenWPM: Content-side javascript instrumentation started with spec:", jsInstrumentationSettings, new Date().toISOString(), "(if spec is '<unavailable>' check web console.)");
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC1pbnN0cnVtZW50LXBhZ2Utc2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGVudC9qYXZhc2NyaXB0LWluc3RydW1lbnQtcGFnZS1zY29wZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0IscUVBQXFFO0FBQ3JFLHlFQUF5RTtBQUN6RSwyQ0FBMkM7QUFFM0MsTUFBTSxVQUFVLFVBQVUsQ0FBRSxlQUFlLEVBQUUseUJBQXlCO0lBQ3BFLCtCQUErQjtJQUMvQixNQUFNLG9CQUFvQixHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO1FBQ2pELFFBQVEsQ0FBQyxhQUFhLENBQ3BCLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUN2QixNQUFNLEVBQUUsUUFBUTtTQUNqQixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3BFLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUNwRSxJQUFJLEVBQVUsQ0FBQztJQUNmLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDMUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7S0FDbEQ7SUFDRCxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN4QyxJQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7UUFDdEIsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDakUsTUFBYyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FDVCxxRUFBcUUsRUFDckUseUJBQXlCLEVBQ3pCLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQ3hCLGlEQUFpRCxDQUNsRCxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBQUEsQ0FBQyJ9

/***/ }),

/***/ "../webext-instrumentation/build/module/index.js":
/*!*******************************************************!*\
  !*** ../webext-instrumentation/build/module/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CookieInstrument": () => (/* reexport safe */ _background_cookie_instrument__WEBPACK_IMPORTED_MODULE_0__.CookieInstrument),
/* harmony export */   "DnsInstrument": () => (/* reexport safe */ _background_dns_instrument__WEBPACK_IMPORTED_MODULE_1__.DnsInstrument),
/* harmony export */   "HttpInstrument": () => (/* reexport safe */ _background_http_instrument__WEBPACK_IMPORTED_MODULE_2__.HttpInstrument),
/* harmony export */   "HttpPostParser": () => (/* reexport safe */ _lib_http_post_parser__WEBPACK_IMPORTED_MODULE_6__.HttpPostParser),
/* harmony export */   "JavascriptInstrument": () => (/* reexport safe */ _background_javascript_instrument__WEBPACK_IMPORTED_MODULE_3__.JavascriptInstrument),
/* harmony export */   "NavigationInstrument": () => (/* reexport safe */ _background_navigation_instrument__WEBPACK_IMPORTED_MODULE_4__.NavigationInstrument),
/* harmony export */   "Uint8ToBase64": () => (/* reexport safe */ _lib_string_utils__WEBPACK_IMPORTED_MODULE_7__.Uint8ToBase64),
/* harmony export */   "allTypes": () => (/* reexport safe */ _background_http_instrument__WEBPACK_IMPORTED_MODULE_2__.allTypes),
/* harmony export */   "boolToInt": () => (/* reexport safe */ _lib_string_utils__WEBPACK_IMPORTED_MODULE_7__.boolToInt),
/* harmony export */   "dateTimeUnicodeFormatString": () => (/* reexport safe */ _schema__WEBPACK_IMPORTED_MODULE_8__.dateTimeUnicodeFormatString),
/* harmony export */   "encode_utf8": () => (/* reexport safe */ _lib_string_utils__WEBPACK_IMPORTED_MODULE_7__.encode_utf8),
/* harmony export */   "escapeString": () => (/* reexport safe */ _lib_string_utils__WEBPACK_IMPORTED_MODULE_7__.escapeString),
/* harmony export */   "escapeUrl": () => (/* reexport safe */ _lib_string_utils__WEBPACK_IMPORTED_MODULE_7__.escapeUrl),
/* harmony export */   "injectJavascriptInstrumentPageScript": () => (/* reexport safe */ _content_javascript_instrument_content_scope__WEBPACK_IMPORTED_MODULE_5__.injectJavascriptInstrumentPageScript),
/* harmony export */   "transformCookieObjectToMatchOpenWPMSchema": () => (/* reexport safe */ _background_cookie_instrument__WEBPACK_IMPORTED_MODULE_0__.transformCookieObjectToMatchOpenWPMSchema),
/* harmony export */   "transformWebNavigationBaseEventDetailsToOpenWPMSchema": () => (/* reexport safe */ _background_navigation_instrument__WEBPACK_IMPORTED_MODULE_4__.transformWebNavigationBaseEventDetailsToOpenWPMSchema)
/* harmony export */ });
/* harmony import */ var _background_cookie_instrument__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./background/cookie-instrument */ "../webext-instrumentation/build/module/background/cookie-instrument.js");
/* harmony import */ var _background_dns_instrument__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./background/dns-instrument */ "../webext-instrumentation/build/module/background/dns-instrument.js");
/* harmony import */ var _background_http_instrument__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./background/http-instrument */ "../webext-instrumentation/build/module/background/http-instrument.js");
/* harmony import */ var _background_javascript_instrument__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./background/javascript-instrument */ "../webext-instrumentation/build/module/background/javascript-instrument.js");
/* harmony import */ var _background_navigation_instrument__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./background/navigation-instrument */ "../webext-instrumentation/build/module/background/navigation-instrument.js");
/* harmony import */ var _content_javascript_instrument_content_scope__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./content/javascript-instrument-content-scope */ "../webext-instrumentation/build/module/content/javascript-instrument-content-scope.js");
/* harmony import */ var _lib_http_post_parser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lib/http-post-parser */ "../webext-instrumentation/build/module/lib/http-post-parser.js");
/* harmony import */ var _lib_string_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./lib/string-utils */ "../webext-instrumentation/build/module/lib/string-utils.js");
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./schema */ "../webext-instrumentation/build/module/schema.js");









//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsY0FBYyxnQ0FBZ0MsQ0FBQztBQUMvQyxjQUFjLDZCQUE2QixDQUFDO0FBQzVDLGNBQWMsOEJBQThCLENBQUM7QUFDN0MsY0FBYyxvQ0FBb0MsQ0FBQztBQUNuRCxjQUFjLG9DQUFvQyxDQUFDO0FBQ25ELGNBQWMsK0NBQStDLENBQUM7QUFDOUQsY0FBYyx3QkFBd0IsQ0FBQztBQUN2QyxjQUFjLG9CQUFvQixDQUFDO0FBQ25DLGNBQWMsVUFBVSxDQUFDIn0=

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/extension-session-event-ordinal.js":
/*!*************************************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/extension-session-event-ordinal.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "incrementedEventOrdinal": () => (/* binding */ incrementedEventOrdinal)
/* harmony export */ });
/**
 * This enables us to keep information about the original order
 * in which events arrived to our event listeners.
 */
let eventOrdinal = 0;
const incrementedEventOrdinal = () => {
    return eventOrdinal++;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLXNlc3Npb24tZXZlbnQtb3JkaW5hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvZXh0ZW5zaW9uLXNlc3Npb24tZXZlbnQtb3JkaW5hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFFckIsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsR0FBRyxFQUFFO0lBQzFDLE9BQU8sWUFBWSxFQUFFLENBQUM7QUFDeEIsQ0FBQyxDQUFDIn0=

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/extension-session-uuid.js":
/*!****************************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/extension-session-uuid.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "extensionSessionUuid": () => (/* binding */ extensionSessionUuid)
/* harmony export */ });
/* harmony import */ var _uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./uuid */ "../webext-instrumentation/build/module/lib/uuid.js");

/**
 * This enables us to access a unique reference to this browser
 * session - regenerated any time the background process gets
 * restarted (which should only be on browser restarts)
 */
const extensionSessionUuid = (0,_uuid__WEBPACK_IMPORTED_MODULE_0__.makeUUID)();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLXNlc3Npb24tdXVpZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvZXh0ZW5zaW9uLXNlc3Npb24tdXVpZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRWxDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLEVBQUUsQ0FBQyJ9

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/http-post-parser.js":
/*!**********************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/http-post-parser.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HttpPostParser": () => (/* binding */ HttpPostParser)
/* harmony export */ });
/* harmony import */ var _string_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./string-utils */ "../webext-instrumentation/build/module/lib/string-utils.js");

class HttpPostParser {
    onBeforeRequestEventDetails;
    dataReceiver;
    constructor(onBeforeRequestEventDetails, dataReceiver) {
        this.onBeforeRequestEventDetails = onBeforeRequestEventDetails;
        this.dataReceiver = dataReceiver;
    }
    parsePostRequest() {
        const requestBody = this.onBeforeRequestEventDetails.requestBody;
        if (requestBody.error) {
            this.dataReceiver.logError("Exception: Upstream failed to parse POST: " + requestBody.error);
        }
        if (requestBody.formData) {
            return {
                post_body: (0,_string_utils__WEBPACK_IMPORTED_MODULE_0__.escapeString)(JSON.stringify(requestBody.formData)),
            };
        }
        if (requestBody.raw) {
            return {
                post_body_raw: JSON.stringify(requestBody.raw.map((x) => [
                    x.file,
                    (0,_string_utils__WEBPACK_IMPORTED_MODULE_0__.Uint8ToBase64)(new Uint8Array(x.bytes)),
                ])),
            };
        }
        return {};
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1wb3N0LXBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvaHR0cC1wb3N0LXBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBUTdELE1BQU0sT0FBTyxjQUFjO0lBQ1IsMkJBQTJCLENBQXdDO0lBQ25FLFlBQVksQ0FBQztJQUU5QixZQUNFLDJCQUFrRSxFQUNsRSxZQUFZO1FBRVosSUFBSSxDQUFDLDJCQUEyQixHQUFHLDJCQUEyQixDQUFDO1FBQy9ELElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ25DLENBQUM7SUFFTSxnQkFBZ0I7UUFDckIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQztRQUNqRSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7WUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQ3hCLDRDQUE0QyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQ2pFLENBQUM7U0FDSDtRQUNELElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUN4QixPQUFPO2dCQUNMLFNBQVMsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUQsQ0FBQztTQUNIO1FBQ0QsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ25CLE9BQU87Z0JBQ0wsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQzNCLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLElBQUk7b0JBQ04sYUFBYSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDdkMsQ0FBQyxDQUNIO2FBQ0YsQ0FBQztTQUNIO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0YifQ==

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/js-instruments.js":
/*!********************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/js-instruments.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getInstrumentJS": () => (/* binding */ getInstrumentJS)
/* harmony export */ });
// Intrumentation injection code is based on privacybadgerfirefox
// https://github.com/EFForg/privacybadgerfirefox/blob/master/data/fingerprinting.js
function getInstrumentJS(eventId, sendMessagesToLogger) {
    /*
     * Instrumentation helpers
     * (Inlined in order for jsInstruments to be easily exportable as a string)
     */
    // Counter to cap # of calls logged for each script/api combination
    const maxLogCount = 500;
    // logCounter
    const logCounter = new Object();
    // Prevent logging of gets arising from logging
    let inLog = false;
    // To keep track of the original order of events
    let ordinal = 0;
    // Options for JSOperation
    const JSOperation = {
        call: "call",
        get: "get",
        get_failed: "get(failed)",
        get_function: "get(function)",
        set: "set",
        set_failed: "set(failed)",
        set_prevented: "set(prevented)",
    };
    // Rough implementations of Object.getPropertyDescriptor and Object.getPropertyNames
    // See http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
    Object.getPropertyDescriptor = function (subject, name) {
        if (subject === undefined) {
            throw new Error("Can't get property descriptor for undefined");
        }
        let pd = Object.getOwnPropertyDescriptor(subject, name);
        let proto = Object.getPrototypeOf(subject);
        while (pd === undefined && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    };
    Object.getPropertyNames = function (subject) {
        if (subject === undefined) {
            throw new Error("Can't get property names for undefined");
        }
        let props = Object.getOwnPropertyNames(subject);
        let proto = Object.getPrototypeOf(subject);
        while (proto !== null) {
            props = props.concat(Object.getOwnPropertyNames(proto));
            proto = Object.getPrototypeOf(proto);
        }
        // FIXME: remove duplicate property names from props
        return props;
    };
    // debounce - from Underscore v1.6.0
    function debounce(func, wait, immediate = false) {
        let timeout;
        let args;
        let context;
        let timestamp;
        let result;
        const later = function () {
            const last = Date.now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            }
            else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };
        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            const callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    }
    // Recursively generates a path for an element
    function getPathToDomElement(element, visibilityAttr = false) {
        if (element === document.body) {
            return element.tagName;
        }
        if (element.parentNode === null) {
            return "NULL/" + element.tagName;
        }
        let siblingIndex = 1;
        const siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) {
                let path = getPathToDomElement(element.parentNode, visibilityAttr);
                path += "/" + element.tagName + "[" + siblingIndex;
                path += "," + element.id;
                path += "," + element.className;
                if (visibilityAttr) {
                    path += "," + element.hidden;
                    path += "," + element.style.display;
                    path += "," + element.style.visibility;
                }
                if (element.tagName === "A") {
                    path += "," + element.href;
                }
                path += "]";
                return path;
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                siblingIndex++;
            }
        }
    }
    // Helper for JSONifying objects
    function serializeObject(object, stringifyFunctions = false) {
        // Handle permissions errors
        try {
            if (object === null) {
                return "null";
            }
            if (typeof object === "function") {
                return stringifyFunctions ? object.toString() : "FUNCTION";
            }
            if (typeof object !== "object") {
                return object;
            }
            const seenObjects = [];
            return JSON.stringify(object, function (key, value) {
                if (value === null) {
                    return "null";
                }
                if (typeof value === "function") {
                    return stringifyFunctions ? value.toString() : "FUNCTION";
                }
                if (typeof value === "object") {
                    // Remove wrapping on content objects
                    if ("wrappedJSObject" in value) {
                        value = value.wrappedJSObject;
                    }
                    // Serialize DOM elements
                    if (value instanceof HTMLElement) {
                        return getPathToDomElement(value);
                    }
                    // Prevent serialization cycles
                    if (key === "" || seenObjects.indexOf(value) < 0) {
                        seenObjects.push(value);
                        return value;
                    }
                    else {
                        return typeof value;
                    }
                }
                return value;
            });
        }
        catch (error) {
            console.log("OpenWPM: SERIALIZATION ERROR: " + error);
            return "SERIALIZATION ERROR: " + error;
        }
    }
    function updateCounterAndCheckIfOver(scriptUrl, symbol) {
        const key = scriptUrl + "|" + symbol;
        if (key in logCounter && logCounter[key] >= maxLogCount) {
            return true;
        }
        else if (!(key in logCounter)) {
            logCounter[key] = 1;
        }
        else {
            logCounter[key] += 1;
        }
        return false;
    }
    // For gets, sets, etc. on a single value
    function logValue(instrumentedVariableName, value, operation, // from JSOperation object please
    callContext, logSettings) {
        if (inLog) {
            return;
        }
        inLog = true;
        const overLimit = updateCounterAndCheckIfOver(callContext.scriptUrl, instrumentedVariableName);
        if (overLimit) {
            inLog = false;
            return;
        }
        const msg = {
            operation,
            symbol: instrumentedVariableName,
            value: serializeObject(value, logSettings.logFunctionsAsStrings),
            scriptUrl: callContext.scriptUrl,
            scriptLine: callContext.scriptLine,
            scriptCol: callContext.scriptCol,
            funcName: callContext.funcName,
            scriptLocEval: callContext.scriptLocEval,
            callStack: callContext.callStack,
            ordinal: ordinal++,
        };
        try {
            send("logValue", msg);
        }
        catch (error) {
            console.log("OpenWPM: Unsuccessful value log!");
            logErrorToConsole(error);
        }
        inLog = false;
    }
    // For functions
    function logCall(instrumentedFunctionName, args, callContext, logSettings) {
        if (inLog) {
            return;
        }
        inLog = true;
        const overLimit = updateCounterAndCheckIfOver(callContext.scriptUrl, instrumentedFunctionName);
        if (overLimit) {
            inLog = false;
            return;
        }
        try {
            // Convert special arguments array to a standard array for JSONifying
            const serialArgs = [];
            for (const arg of args) {
                serialArgs.push(serializeObject(arg, logSettings.logFunctionsAsStrings));
            }
            const msg = {
                operation: JSOperation.call,
                symbol: instrumentedFunctionName,
                args: serialArgs,
                value: "",
                scriptUrl: callContext.scriptUrl,
                scriptLine: callContext.scriptLine,
                scriptCol: callContext.scriptCol,
                funcName: callContext.funcName,
                scriptLocEval: callContext.scriptLocEval,
                callStack: callContext.callStack,
                ordinal: ordinal++,
            };
            send("logCall", msg);
        }
        catch (error) {
            console.log("OpenWPM: Unsuccessful call log: " + instrumentedFunctionName);
            logErrorToConsole(error);
        }
        inLog = false;
    }
    function logErrorToConsole(error, context = false) {
        console.error("OpenWPM: Error name: " + error.name);
        console.error("OpenWPM: Error message: " + error.message);
        console.error("OpenWPM: Error filename: " + error.fileName);
        console.error("OpenWPM: Error line number: " + error.lineNumber);
        console.error("OpenWPM: Error stack: " + error.stack);
        if (context) {
            console.error("OpenWPM: Error context: " + JSON.stringify(context));
        }
    }
    // Helper to get originating script urls
    function getStackTrace() {
        let stack;
        try {
            throw new Error();
        }
        catch (err) {
            stack = err.stack;
        }
        return stack;
    }
    // from http://stackoverflow.com/a/5202185
    const rsplit = function (source, sep, maxsplit) {
        const split = source.split(sep);
        return maxsplit
            ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
            : split;
    };
    function getOriginatingScriptContext(getCallStack = false) {
        const trace = getStackTrace().trim().split("\n");
        // return a context object even if there is an error
        const empty_context = {
            scriptUrl: "",
            scriptLine: "",
            scriptCol: "",
            funcName: "",
            scriptLocEval: "",
            callStack: "",
        };
        if (trace.length < 4) {
            return empty_context;
        }
        // 0, 1 and 2 are OpenWPM's own functions (e.g. getStackTrace), skip them.
        const callSite = trace[3];
        if (!callSite) {
            return empty_context;
        }
        /*
         * Stack frame format is simply: FUNC_NAME@FILENAME:LINE_NO:COLUMN_NO
         *
         * If eval or Function is involved we have an additional part after the FILENAME, e.g.:
         * FUNC_NAME@FILENAME line 123 > eval line 1 > eval:LINE_NO:COLUMN_NO
         * or FUNC_NAME@FILENAME line 234 > Function:LINE_NO:COLUMN_NO
         *
         * We store the part between the FILENAME and the LINE_NO in scriptLocEval
         */
        try {
            let scriptUrl = "";
            let scriptLocEval = ""; // for eval or Function calls
            const callSiteParts = callSite.split("@");
            const funcName = callSiteParts[0] || "";
            const items = rsplit(callSiteParts[1], ":", 2);
            const columnNo = items[items.length - 1];
            const lineNo = items[items.length - 2];
            const scriptFileName = items[items.length - 3] || "";
            const lineNoIdx = scriptFileName.indexOf(" line "); // line in the URL means eval or Function
            if (lineNoIdx === -1) {
                scriptUrl = scriptFileName; // TODO: sometimes we have filename only, e.g. XX.js
            }
            else {
                scriptUrl = scriptFileName.slice(0, lineNoIdx);
                scriptLocEval = scriptFileName.slice(lineNoIdx + 1, scriptFileName.length);
            }
            const callContext = {
                scriptUrl,
                scriptLine: lineNo,
                scriptCol: columnNo,
                funcName,
                scriptLocEval,
                callStack: getCallStack ? trace.slice(3).join("\n").trim() : "",
            };
            return callContext;
        }
        catch (e) {
            console.log("OpenWPM: Error parsing the script context", e.toString(), callSite);
            return empty_context;
        }
    }
    function isObject(object, propertyName) {
        let property;
        try {
            property = object[propertyName];
        }
        catch (error) {
            return false;
        }
        if (property === null) {
            // null is type "object"
            return false;
        }
        return typeof property === "object";
    }
    // Log calls to a given function
    // This helper function returns a wrapper around `func` which logs calls
    // to `func`. `objectName` and `methodName` are used strictly to identify
    // which object method `func` is coming from in the logs
    function instrumentFunction(objectName, methodName, func, logSettings) {
        return function () {
            const callContext = getOriginatingScriptContext(logSettings.logCallStack);
            logCall(objectName + "." + methodName, arguments, callContext, logSettings);
            return func.apply(this, arguments);
        };
    }
    // Log properties of prototypes and objects
    function instrumentObjectProperty(object, objectName, propertyName, logSettings) {
        if (!object ||
            !objectName ||
            !propertyName ||
            propertyName === "undefined") {
            throw new Error(`Invalid request to instrumentObjectProperty.
        Object: ${object}
        objectName: ${objectName}
        propertyName: ${propertyName}
        `);
        }
        // Store original descriptor in closure
        const propDesc = Object.getPropertyDescriptor(object, propertyName);
        // Property descriptor must exist unless we are instrumenting a nonExisting property
        if (!propDesc &&
            !logSettings.nonExistingPropertiesToInstrument.includes(propertyName)) {
            console.error("Property descriptor not found for", objectName, propertyName, object);
            return;
        }
        // Property descriptor for undefined properties
        let undefinedPropValue;
        const undefinedPropDesc = {
            get: () => {
                return undefinedPropValue;
            },
            set: (value) => {
                undefinedPropValue = value;
            },
            enumerable: false,
        };
        // Instrument data or accessor property descriptors
        const originalGetter = propDesc ? propDesc.get : undefinedPropDesc.get;
        const originalSetter = propDesc ? propDesc.set : undefinedPropDesc.set;
        let originalValue = propDesc ? propDesc.value : undefinedPropValue;
        // We overwrite both data and accessor properties as an instrumented
        // accessor property
        Object.defineProperty(object, propertyName, {
            configurable: true,
            get: (function () {
                return function () {
                    let origProperty;
                    const callContext = getOriginatingScriptContext(logSettings.logCallStack);
                    const instrumentedVariableName = `${objectName}.${propertyName}`;
                    // get original value
                    if (!propDesc) {
                        // if undefined property
                        origProperty = undefinedPropValue;
                    }
                    else if (originalGetter) {
                        // if accessor property
                        origProperty = originalGetter.call(this);
                    }
                    else if ("value" in propDesc) {
                        // if data property
                        origProperty = originalValue;
                    }
                    else {
                        console.error(`Property descriptor for ${instrumentedVariableName} doesn't have getter or value?`);
                        logValue(instrumentedVariableName, "", JSOperation.get_failed, callContext, logSettings);
                        return;
                    }
                    // Log `gets` except those that have instrumented return values
                    // * All returned functions are instrumented with a wrapper
                    // * Returned objects may be instrumented if recursive
                    //   instrumentation is enabled and this isn't at the depth limit.
                    if (typeof origProperty === "function") {
                        if (logSettings.logFunctionGets) {
                            logValue(instrumentedVariableName, origProperty, JSOperation.get_function, callContext, logSettings);
                        }
                        const instrumentedFunctionWrapper = instrumentFunction(objectName, propertyName, origProperty, logSettings);
                        // Restore the original prototype and constructor so that instrumented classes remain intact
                        // TODO: This may have introduced prototype pollution as per https://github.com/openwpm/OpenWPM/issues/471
                        if (origProperty.prototype) {
                            instrumentedFunctionWrapper.prototype = origProperty.prototype;
                            if (origProperty.prototype.constructor) {
                                instrumentedFunctionWrapper.prototype.constructor =
                                    origProperty.prototype.constructor;
                            }
                        }
                        return instrumentedFunctionWrapper;
                    }
                    else if (typeof origProperty === "object" &&
                        logSettings.recursive &&
                        logSettings.depth > 0) {
                        return origProperty;
                    }
                    else {
                        logValue(instrumentedVariableName, origProperty, JSOperation.get, callContext, logSettings);
                        return origProperty;
                    }
                };
            })(),
            set: (function () {
                return function (value) {
                    const callContext = getOriginatingScriptContext(logSettings.logCallStack);
                    const instrumentedVariableName = `${objectName}.${propertyName}`;
                    let returnValue;
                    // Prevent sets for functions and objects if enabled
                    if (logSettings.preventSets &&
                        (typeof originalValue === "function" ||
                            typeof originalValue === "object")) {
                        logValue(instrumentedVariableName, value, JSOperation.set_prevented, callContext, logSettings);
                        return value;
                    }
                    // set new value to original setter/location
                    if (originalSetter) {
                        // if accessor property
                        returnValue = originalSetter.call(this, value);
                    }
                    else if ("value" in propDesc) {
                        inLog = true;
                        if (object.isPrototypeOf(this)) {
                            Object.defineProperty(this, propertyName, {
                                value,
                            });
                        }
                        else {
                            originalValue = value;
                        }
                        returnValue = value;
                        inLog = false;
                    }
                    else {
                        console.error(`Property descriptor for ${instrumentedVariableName} doesn't have setter or value?`);
                        logValue(instrumentedVariableName, value, JSOperation.set_failed, callContext, logSettings);
                        return value;
                    }
                    logValue(instrumentedVariableName, value, JSOperation.set, callContext, logSettings);
                    return returnValue;
                };
            })(),
        });
    }
    function instrumentObject(object, instrumentedName, logSettings) {
        // Set propertiesToInstrument to null to force no properties to be instrumented.
        // (this is used in testing for example)
        let propertiesToInstrument;
        if (logSettings.propertiesToInstrument === null) {
            propertiesToInstrument = [];
        }
        else if (logSettings.propertiesToInstrument.length === 0) {
            propertiesToInstrument = Object.getPropertyNames(object);
        }
        else {
            propertiesToInstrument = logSettings.propertiesToInstrument;
        }
        for (const propertyName of propertiesToInstrument) {
            if (logSettings.excludedProperties.includes(propertyName)) {
                continue;
            }
            // If `recursive` flag set we want to recursively instrument any
            // object properties that aren't the prototype object.
            if (logSettings.recursive &&
                logSettings.depth > 0 &&
                isObject(object, propertyName) &&
                propertyName !== "__proto__") {
                const newInstrumentedName = `${instrumentedName}.${propertyName}`;
                const newLogSettings = { ...logSettings };
                newLogSettings.depth = logSettings.depth - 1;
                newLogSettings.propertiesToInstrument = [];
                instrumentObject(object[propertyName], newInstrumentedName, newLogSettings);
            }
            try {
                instrumentObjectProperty(object, instrumentedName, propertyName, logSettings);
            }
            catch (error) {
                if (error instanceof TypeError &&
                    error.message.includes("can't redefine non-configurable property")) {
                    console.warn(`Cannot instrument non-configurable property: ${instrumentedName}:${propertyName}`);
                }
                else {
                    logErrorToConsole(error, { instrumentedName, propertyName });
                }
            }
        }
        for (const propertyName of logSettings.nonExistingPropertiesToInstrument) {
            if (logSettings.excludedProperties.includes(propertyName)) {
                continue;
            }
            try {
                instrumentObjectProperty(object, instrumentedName, propertyName, logSettings);
            }
            catch (error) {
                logErrorToConsole(error, { instrumentedName, propertyName });
            }
        }
    }
    const sendFactory = function (eventId, $sendMessagesToLogger) {
        let messages = [];
        // debounce sending queued messages
        const _send = debounce(function () {
            $sendMessagesToLogger(eventId, messages);
            // clear the queue
            messages = [];
        }, 100);
        return function (msgType, msg) {
            // queue the message
            messages.push({ type: msgType, content: msg });
            _send();
        };
    };
    const send = sendFactory(eventId, sendMessagesToLogger);
    function instrumentJS(JSInstrumentRequests) {
        // The JS Instrument Requests are setup and validated python side
        // including setting defaults for logSettings.
        // More details about how this function is invoked are in
        // content/javascript-instrument-content-scope.ts
        JSInstrumentRequests.forEach(function (item) {
            instrumentObject(eval(item.object), item.instrumentedName, item.logSettings);
        });
    }
    // This whole function getInstrumentJS returns just the function `instrumentJS`.
    return instrumentJS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMtaW5zdHJ1bWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2pzLWluc3RydW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlFQUFpRTtBQUNqRSxvRkFBb0Y7QUE4QnBGLE1BQU0sVUFBVSxlQUFlLENBQUMsT0FBZSxFQUFFLG9CQUFvQjtJQUNuRTs7O09BR0c7SUFFSCxtRUFBbUU7SUFDbkUsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO0lBQ3hCLGFBQWE7SUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0lBQ2hDLCtDQUErQztJQUMvQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsZ0RBQWdEO0lBQ2hELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztJQUVoQiwwQkFBMEI7SUFDMUIsTUFBTSxXQUFXLEdBQUc7UUFDbEIsSUFBSSxFQUFFLE1BQU07UUFDWixHQUFHLEVBQUUsS0FBSztRQUNWLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFlBQVksRUFBRSxlQUFlO1FBQzdCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsVUFBVSxFQUFFLGFBQWE7UUFDekIsYUFBYSxFQUFFLGdCQUFnQjtLQUNoQyxDQUFDO0lBRUYsb0ZBQW9GO0lBQ3BGLHlFQUF5RTtJQUN6RSxNQUFNLENBQUMscUJBQXFCLEdBQUcsVUFBVSxPQUFPLEVBQUUsSUFBSTtRQUNwRCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1NBQ2hFO1FBQ0QsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sRUFBRSxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUss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

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/pending-navigation.js":
/*!************************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/pending-navigation.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PendingNavigation": () => (/* binding */ PendingNavigation)
/* harmony export */ });
/**
 * Ties together the two separate navigation events that together holds information about both parent frame id and transition-related attributes
 */
class PendingNavigation {
    onBeforeNavigateEventNavigation;
    onCommittedEventNavigation;
    resolveOnBeforeNavigateEventNavigation;
    resolveOnCommittedEventNavigation;
    constructor() {
        this.onBeforeNavigateEventNavigation = new Promise((resolve) => {
            this.resolveOnBeforeNavigateEventNavigation = resolve;
        });
        this.onCommittedEventNavigation = new Promise((resolve) => {
            this.resolveOnCommittedEventNavigation = resolve;
        });
    }
    resolved() {
        return Promise.all([
            this.onBeforeNavigateEventNavigation,
            this.onCommittedEventNavigation,
        ]);
    }
    /**
     * Either returns or times out and returns undefined or
     * returns the results from resolved() above
     *
     * @param ms
     */
    async resolvedWithinTimeout(ms) {
        const resolved = await Promise.race([
            this.resolved(),
            new Promise((resolve) => setTimeout(resolve, ms)),
        ]);
        return resolved;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy1uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9wZW5kaW5nLW5hdmlnYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSCxNQUFNLE9BQU8saUJBQWlCO0lBQ1osK0JBQStCLENBQXNCO0lBQ3JELDBCQUEwQixDQUFzQjtJQUN6RCxzQ0FBc0MsQ0FBZ0M7SUFDdEUsaUNBQWlDLENBQWdDO0lBQ3hFO1FBQ0UsSUFBSSxDQUFDLCtCQUErQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLHNDQUFzQyxHQUFHLE9BQU8sQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3hELElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxPQUFPLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ00sUUFBUTtRQUNiLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNqQixJQUFJLENBQUMsK0JBQStCO1lBQ3BDLElBQUksQ0FBQywwQkFBMEI7U0FDaEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSyxDQUFDLHFCQUFxQixDQUFDLEVBQUU7UUFDbkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNsRCxDQUFDLENBQUM7UUFDSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0YifQ==

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/pending-request.js":
/*!*********************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/pending-request.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PendingRequest": () => (/* binding */ PendingRequest)
/* harmony export */ });
/**
 * Ties together the two separate events that together holds information about both request headers and body
 */
class PendingRequest {
    onBeforeRequestEventDetails;
    onBeforeSendHeadersEventDetails;
    resolveOnBeforeRequestEventDetails;
    resolveOnBeforeSendHeadersEventDetails;
    constructor() {
        this.onBeforeRequestEventDetails = new Promise((resolve) => {
            this.resolveOnBeforeRequestEventDetails = resolve;
        });
        this.onBeforeSendHeadersEventDetails = new Promise((resolve) => {
            this.resolveOnBeforeSendHeadersEventDetails = resolve;
        });
    }
    resolved() {
        return Promise.all([
            this.onBeforeRequestEventDetails,
            this.onBeforeSendHeadersEventDetails,
        ]);
    }
    /**
     * Either returns or times out and returns undefined or
     * returns the results from resolved() above
     *
     * @param ms
     */
    async resolvedWithinTimeout(ms) {
        const resolved = await Promise.race([
            this.resolved(),
            new Promise((resolve) => setTimeout(resolve, ms)),
        ]);
        return resolved;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9wZW5kaW5nLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0E7O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQUNULDJCQUEyQixDQUFpRDtJQUM1RSwrQkFBK0IsQ0FBcUQ7SUFDN0Ysa0NBQWtDLENBRS9CO0lBQ0gsc0NBQXNDLENBRW5DO0lBQ1Y7UUFDRSxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN6RCxJQUFJLENBQUMsa0NBQWtDLEdBQUcsT0FBTyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLCtCQUErQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLHNDQUFzQyxHQUFHLE9BQU8sQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDTSxRQUFRO1FBQ2IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ2pCLElBQUksQ0FBQywyQkFBMkI7WUFDaEMsSUFBSSxDQUFDLCtCQUErQjtTQUNyQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRTtRQUNuQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ2xELENBQUMsQ0FBQztRQUNILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRiJ9

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/pending-response.js":
/*!**********************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/pending-response.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PendingResponse": () => (/* binding */ PendingResponse)
/* harmony export */ });
/* harmony import */ var _response_body_listener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./response-body-listener */ "../webext-instrumentation/build/module/lib/response-body-listener.js");

/**
 * Ties together the two separate events that together holds information about both response headers and body
 */
class PendingResponse {
    onBeforeRequestEventDetails;
    onCompletedEventDetails;
    responseBodyListener;
    resolveOnBeforeRequestEventDetails;
    resolveOnCompletedEventDetails;
    constructor() {
        this.onBeforeRequestEventDetails = new Promise((resolve) => {
            this.resolveOnBeforeRequestEventDetails = resolve;
        });
        this.onCompletedEventDetails = new Promise((resolve) => {
            this.resolveOnCompletedEventDetails = resolve;
        });
    }
    addResponseResponseBodyListener(details) {
        this.responseBodyListener = new _response_body_listener__WEBPACK_IMPORTED_MODULE_0__.ResponseBodyListener(details);
    }
    resolved() {
        return Promise.all([
            this.onBeforeRequestEventDetails,
            this.onCompletedEventDetails,
        ]);
    }
    /**
     * Either returns or times out and returns undefined or
     * returns the results from resolved() above
     *
     * @param ms
     */
    async resolvedWithinTimeout(ms) {
        const resolved = await Promise.race([
            this.resolved(),
            new Promise((resolve) => setTimeout(resolve, ms)),
        ]);
        return resolved;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvcGVuZGluZy1yZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVoRTs7R0FFRztBQUNILE1BQU0sT0FBTyxlQUFlO0lBQ1YsMkJBQTJCLENBQWlEO0lBQzVFLHVCQUF1QixDQUE2QztJQUM3RSxvQkFBb0IsQ0FBdUI7SUFDM0Msa0NBQWtDLENBRS9CO0lBQ0gsOEJBQThCLENBRTNCO0lBQ1Y7UUFDRSxJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN6RCxJQUFJLENBQUMsa0NBQWtDLEdBQUcsT0FBTyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDckQsSUFBSSxDQUFDLDhCQUE4QixHQUFHLE9BQU8sQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDTSwrQkFBK0IsQ0FDcEMsT0FBOEM7UUFFOUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNNLFFBQVE7UUFDYixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDakIsSUFBSSxDQUFDLDJCQUEyQjtZQUNoQyxJQUFJLENBQUMsdUJBQXVCO1NBQzdCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1FBQ25DLE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDbEQsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztDQUNGIn0=

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/response-body-listener.js":
/*!****************************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/response-body-listener.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResponseBodyListener": () => (/* binding */ ResponseBodyListener)
/* harmony export */ });
/* harmony import */ var _sha256__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sha256 */ "../webext-instrumentation/build/module/lib/sha256.js");

class ResponseBodyListener {
    responseBody;
    contentHash;
    resolveResponseBody;
    resolveContentHash;
    constructor(details) {
        this.responseBody = new Promise((resolve) => {
            this.resolveResponseBody = resolve;
        });
        this.contentHash = new Promise((resolve) => {
            this.resolveContentHash = resolve;
        });
        // Used to parse Response stream
        const filter = browser.webRequest.filterResponseData(details.requestId.toString());
        let responseBody = new Uint8Array();
        filter.ondata = (event) => {
            (0,_sha256__WEBPACK_IMPORTED_MODULE_0__.digestMessage)(event.data).then((digest) => {
                this.resolveContentHash(digest);
            });
            const incoming = new Uint8Array(event.data);
            const tmp = new Uint8Array(responseBody.length + incoming.length);
            tmp.set(responseBody);
            tmp.set(incoming, responseBody.length);
            responseBody = tmp;
            filter.write(event.data);
        };
        filter.onstop = (_event) => {
            this.resolveResponseBody(responseBody);
            filter.disconnect();
        };
    }
    async getResponseBody() {
        return this.responseBody;
    }
    async getContentHash() {
        return this.contentHash;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtYm9keS1saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvcmVzcG9uc2UtYm9keS1saXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXpDLE1BQU0sT0FBTyxvQkFBb0I7SUFDZCxZQUFZLENBQXNCO0lBQ2xDLFdBQVcsQ0FBa0I7SUFDdEMsbUJBQW1CLENBQXFDO0lBQ3hELGtCQUFrQixDQUFnQztJQUUxRCxZQUFZLE9BQThDO1FBQ3hELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMxQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxnQ0FBZ0M7UUFDaEMsTUFBTSxNQUFNLEdBQVEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FDdkQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FDdEIsQ0FBQztRQUVULElBQUksWUFBWSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3hCLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sUUFBUSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRSxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxZQUFZLEdBQUcsR0FBRyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQztRQUVGLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZTtRQUMxQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxjQUFjO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0NBQ0YifQ==

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/sha256.js":
/*!************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/sha256.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "digestMessage": () => (/* binding */ digestMessage)
/* harmony export */ });
/**
 * Code from the example at
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 */
async function digestMessage(msgUint8) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhMjU2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9zaGEyNTYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsTUFBTSxDQUFDLEtBQUssVUFBVSxhQUFhLENBQUMsUUFBb0I7SUFDdEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxtQkFBbUI7SUFDdkYsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsK0JBQStCO0lBQ3pGLE1BQU0sT0FBTyxHQUFHLFNBQVM7U0FDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDM0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsOEJBQThCO0lBQzNDLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMifQ==

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/string-utils.js":
/*!******************************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/string-utils.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Uint8ToBase64": () => (/* binding */ Uint8ToBase64),
/* harmony export */   "boolToInt": () => (/* binding */ boolToInt),
/* harmony export */   "encode_utf8": () => (/* binding */ encode_utf8),
/* harmony export */   "escapeString": () => (/* binding */ escapeString),
/* harmony export */   "escapeUrl": () => (/* binding */ escapeUrl)
/* harmony export */ });
function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}
const escapeString = function (str) {
    // Convert to string if necessary
    if (typeof str !== "string") {
        str = String(str);
    }
    return encode_utf8(str);
};
const escapeUrl = function (url, stripDataUrlData = true) {
    url = escapeString(url);
    // data:[<mediatype>][;base64],<data>
    if (url.substr(0, 5) === "data:" &&
        stripDataUrlData &&
        url.indexOf(",") > -1) {
        url = url.substr(0, url.indexOf(",") + 1) + "<data-stripped>";
    }
    return url;
};
// Base64 encoding, found on:
// https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/25644409#25644409
const Uint8ToBase64 = function (u8Arr) {
    const CHUNK_SIZE = 0x8000; // arbitrary number
    let index = 0;
    const length = u8Arr.length;
    let result = "";
    let slice;
    while (index < length) {
        slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
    }
    return btoa(result);
};
const boolToInt = function (bool) {
    return bool ? 1 : 0;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9zdHJpbmctdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxVQUFVLFdBQVcsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxVQUFVLEdBQVE7SUFDNUMsaUNBQWlDO0lBQ2pDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQzNCLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbkI7SUFFRCxPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsVUFDdkIsR0FBVyxFQUNYLG1CQUE0QixJQUFJO0lBRWhDLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIscUNBQXFDO0lBQ3JDLElBQ0UsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssT0FBTztRQUM1QixnQkFBZ0I7UUFDaEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDckI7UUFDQSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztLQUMvRDtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyxDQUFDO0FBRUYsNkJBQTZCO0FBQzdCLHFIQUFxSDtBQUNySCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsVUFBVSxLQUFpQjtJQUN0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxtQkFBbUI7SUFDOUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUM1QixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxLQUFpQixDQUFDO0lBQ3RCLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRTtRQUNyQixLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDcEUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRCxLQUFLLElBQUksVUFBVSxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLFVBQVUsSUFBYTtJQUM5QyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDIn0=

/***/ }),

/***/ "../webext-instrumentation/build/module/lib/uuid.js":
/*!**********************************************************!*\
  !*** ../webext-instrumentation/build/module/lib/uuid.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeUUID": () => (/* binding */ makeUUID)
/* harmony export */ });
/* eslint-disable no-bitwise */
// from https://gist.github.com/jed/982883#gistcomment-2403369
const hex = [];
for (let i = 0; i < 256; i++) {
    hex[i] = (i < 16 ? "0" : "") + i.toString(16);
}
const makeUUID = () => {
    const r = crypto.getRandomValues(new Uint8Array(16));
    r[6] = (r[6] & 0x0f) | 0x40;
    r[8] = (r[8] & 0x3f) | 0x80;
    return (hex[r[0]] +
        hex[r[1]] +
        hex[r[2]] +
        hex[r[3]] +
        "-" +
        hex[r[4]] +
        hex[r[5]] +
        "-" +
        hex[r[6]] +
        hex[r[7]] +
        "-" +
        hex[r[8]] +
        hex[r[9]] +
        "-" +
        hex[r[10]] +
        hex[r[11]] +
        hex[r[12]] +
        hex[r[13]] +
        hex[r[14]] +
        hex[r[15]]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXVpZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdXVpZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFFL0IsOERBQThEO0FBQzlELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUVmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQy9DO0FBRUQsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRTtJQUMzQixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztJQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBRTVCLE9BQU8sQ0FDTCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsR0FBRztRQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsR0FBRztRQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsR0FBRztRQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsR0FBRztRQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNYLENBQUM7QUFDSixDQUFDLENBQUMifQ==

/***/ }),

/***/ "../webext-instrumentation/build/module/schema.js":
/*!********************************************************!*\
  !*** ../webext-instrumentation/build/module/schema.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dateTimeUnicodeFormatString": () => (/* binding */ dateTimeUnicodeFormatString)
/* harmony export */ });
// https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
const dateTimeUnicodeFormatString = "yyyy-MM-dd'T'HH:mm:ss.SSSXX";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSwrRUFBK0U7QUFDL0UsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsNkJBQTZCLENBQUMifQ==

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./feature.js/index.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openwpm-webext-instrumentation */ "../webext-instrumentation/build/module/index.js");
/* harmony import */ var _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loggingdb.js */ "./feature.js/loggingdb.js");
/* harmony import */ var _callstack_instrument_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./callstack-instrument.js */ "./feature.js/callstack-instrument.js");





async function main() {
  // Read the browser configuration from file
  let filename = "browser_params.json";
  let config = await browser.profileDirIO.readFile(filename);
  if (config) {
    config = JSON.parse(config);
    console.log("Browser Config:", config);
  } else {
    config = {
      navigation_instrument:true,
      cookie_instrument:true,
      js_instrument:true,
      cleaned_js_instrument_settings:
      [
        {
          object: `window.CanvasRenderingContext2D.prototype`,
          instrumentedName: "CanvasRenderingContext2D",
          logSettings: {
            propertiesToInstrument: [],
            nonExistingPropertiesToInstrument: [],
            excludedProperties: [],
            logCallStack: false,
            logFunctionsAsStrings: false,
            logFunctionGets: false,
            preventSets: false,
            recursive: false,
            depth: 5,
          }
        },
      ],
      http_instrument:true,
      callstack_instrument:true,
      save_content:false,
      testing:true,
      browser_id:0,
      custom_params: {}
    };
    console.log("WARNING: config not found. Assuming this is a test run of",
                "the extension. Outputting all queries to console.", {config});
  }

  await _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.open(config['storage_controller_address'],
                       config['logger_address'],
                       config['browser_id']);

  if (config["custom_params"]["pre_instrumentation_code"]) {
    eval(config["custom_params"]["pre_instrumentation_code"])
  }
  if (config["navigation_instrument"]) {
    _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.logDebug("Navigation instrumentation enabled");
    let navigationInstrument = new openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__.NavigationInstrument(_loggingdb_js__WEBPACK_IMPORTED_MODULE_1__);
    navigationInstrument.run(config["browser_id"]);
  }

  if (config['cookie_instrument']) {
    _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.logDebug("Cookie instrumentation enabled");
    let cookieInstrument = new openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__.CookieInstrument(_loggingdb_js__WEBPACK_IMPORTED_MODULE_1__);
    cookieInstrument.run(config['browser_id']);
  }

  if (config['js_instrument']) {
    _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.logDebug("Javascript instrumentation enabled");
    let jsInstrument = new openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__.JavascriptInstrument(_loggingdb_js__WEBPACK_IMPORTED_MODULE_1__);
    jsInstrument.run(config['browser_id']);
    await jsInstrument.registerContentScript(config['testing'], config['cleaned_js_instrument_settings']);
  }

  if (config['http_instrument']) {
    _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.logDebug("HTTP Instrumentation enabled");
    let httpInstrument = new openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__.HttpInstrument(_loggingdb_js__WEBPACK_IMPORTED_MODULE_1__);
    httpInstrument.run(config['browser_id'],
                       config['save_content']);
  }

  if (config['callstack_instrument']) {
    _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.logDebug("Callstack Instrumentation enabled");
    let callstackInstrument = new _callstack_instrument_js__WEBPACK_IMPORTED_MODULE_2__.CallstackInstrument(_loggingdb_js__WEBPACK_IMPORTED_MODULE_1__);
    callstackInstrument.run(config['browser_id']);
  }
  
  if (config['dns_instrument']) {
    _loggingdb_js__WEBPACK_IMPORTED_MODULE_1__.logDebug("DNS instrumentation enabled");
    let dnsInstrument = new openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__.DnsInstrument(_loggingdb_js__WEBPACK_IMPORTED_MODULE_1__);
    dnsInstrument.run(config['browser_id']);
  }

  await browser.profileDirIO.writeFile("OPENWPM_STARTUP_SUCCESS.txt", "");
}

main();


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IscUJBQXFCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0VBQWdFO0FBQ2hFO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0Qix3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FB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O0FBQ3RCLGtDQUFrQyx5RUFBbUIsQ0FBQywwQ0FBUztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksbURBQWtCO0FBQ3RCLDRCQUE0Qix5RUFBYSxDQUFDLDBDQUFTO0FBQ25EO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4vZmVhdHVyZS5qcy9jYWxsc3RhY2staW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uL2ZlYXR1cmUuanMvbG9nZ2luZ2RiLmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4vZmVhdHVyZS5qcy9zb2NrZXQuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvYmFja2dyb3VuZC9jb29raWUtaW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9iYWNrZ3JvdW5kL2Rucy1pbnN0cnVtZW50LmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2JhY2tncm91bmQvaHR0cC1pbnN0cnVtZW50LmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2JhY2tncm91bmQvamF2YXNjcmlwdC1pbnN0cnVtZW50LmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2JhY2tncm91bmQvbmF2aWdhdGlvbi1pbnN0cnVtZW50LmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2NvbnRlbnQvamF2YXNjcmlwdC1pbnN0cnVtZW50LWNvbnRlbnQtc2NvcGUuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvY29udGVudC9qYXZhc2NyaXB0LWluc3RydW1lbnQtcGFnZS1zY29wZS5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvZXh0ZW5zaW9uLXNlc3Npb24tZXZlbnQtb3JkaW5hbC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvZXh0ZW5zaW9uLXNlc3Npb24tdXVpZC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvaHR0cC1wb3N0LXBhcnNlci5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvanMtaW5zdHJ1bWVudHMuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL3BlbmRpbmctbmF2aWdhdGlvbi5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvcGVuZGluZy1yZXF1ZXN0LmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2xpYi9wZW5kaW5nLXJlc3BvbnNlLmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2xpYi9yZXNwb25zZS1ib2R5LWxpc3RlbmVyLmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2xpYi9zaGEyNTYuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL3N0cmluZy11dGlscy5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvdXVpZC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9zY2hlbWEuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uL2ZlYXR1cmUuanMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgV2UgY2FwdHVyZSB0aGUgSlMgY2FsbHN0YWNrIHdoZW4gd2UgZGV0ZWN0IGEgZHluYW1pY2FsbHkgY3JlYXRlZCBodHRwIHJlcXVlc3RcbiAgYW5kIGJ1YmJsZSBpdCB1cCB2aWEgYSBXZWJFeHRlbnNpb24gRXhwZXJpbWVudCBBUEkgc3RhY2tEdW1wLlxuICBUaGlzIGluc3RydW1lbnRhdGlvbiBjYXB0dXJlcyB0aG9zZSBhbmQgc2F2ZXMgdGhlbSB0byB0aGUgXCJjYWxsc3RhY2tzXCIgdGFibGUuXG4qL1xuZXhwb3J0IGNsYXNzIENhbGxzdGFja0luc3RydW1lbnQge1xuICBjb25zdHJ1Y3RvcihkYXRhUmVjZWl2ZXIpIHtcbiAgICB0aGlzLmRhdGFSZWNlaXZlciA9IGRhdGFSZWNlaXZlcjtcbiAgfVxuICBydW4oYnJvd3Nlcl9pZCkge1xuICAgIGJyb3dzZXIuc3RhY2tEdW1wLm9uU3RhY2tBdmFpbGFibGUuYWRkTGlzdGVuZXIoKHJlcXVlc3RfaWQsIGNhbGxfc3RhY2spID0+IHtcbiAgICAgIGNvbnN0IHJlY29yZCA9IHtcbiAgICAgICAgYnJvd3Nlcl9pZCxcbiAgICAgICAgcmVxdWVzdF9pZCxcbiAgICAgICAgY2FsbF9zdGFja1xuICAgICAgfTtcbiAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJjYWxsc3RhY2tzXCIsIHJlY29yZCk7XG4gICAgfSk7XG4gIH1cbn0iLCJpbXBvcnQgKiBhcyBzb2NrZXQgZnJvbSBcIi4vc29ja2V0LmpzXCI7XG5cbmxldCBjcmF3bElEID0gbnVsbDtcbmxldCB2aXNpdElEID0gbnVsbDtcbmxldCBkZWJ1Z2dpbmcgPSBmYWxzZTtcbmxldCBzdG9yYWdlQ29udHJvbGxlciA9IG51bGw7XG5sZXQgbG9nQWdncmVnYXRvciA9IG51bGw7XG5sZXQgbGlzdGVuaW5nU29ja2V0ID0gbnVsbDtcblxuXG5sZXQgbGlzdGVuaW5nU29ja2V0Q2FsbGJhY2sgPSAgYXN5bmMgKGRhdGEpID0+IHtcbiAgICAvL1RoaXMgd29ya3MgZXZlbiBpZiBkYXRhIGlzIGFuIGludFxuICAgIGxldCBhY3Rpb24gPSBkYXRhW1wiYWN0aW9uXCJdO1xuICAgIGxldCBfdmlzaXRJRCA9IGRhdGFbXCJ2aXNpdF9pZFwiXVxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJJbml0aWFsaXplXCI6XG4gICAgICAgICAgICBpZiAodmlzaXRJRCkge1xuICAgICAgICAgICAgICAgIGxvZ1dhcm4oXCJTZXQgdmlzaXRfaWQgd2hpbGUgYW5vdGhlciB2aXNpdF9pZCB3YXMgc2V0XCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aXNpdElEID0gX3Zpc2l0SUQ7XG4gICAgICAgICAgICBkYXRhW1wiYnJvd3Nlcl9pZFwiXSA9IGNyYXdsSUQ7XG4gICAgICAgICAgICBzdG9yYWdlQ29udHJvbGxlci5zZW5kKEpTT04uc3RyaW5naWZ5KFtcIm1ldGFfaW5mb3JtYXRpb25cIiwgZGF0YV0pKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiRmluYWxpemVcIjpcbiAgICAgICAgICAgIGlmICghdmlzaXRJRCkge1xuICAgICAgICAgICAgICAgIGxvZ1dhcm4oXCJSZWNlaXZlZCBGaW5hbGl6ZSB3aGlsZSBubyB2aXNpdF9pZCB3YXMgc2V0XCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX3Zpc2l0SUQgIT09IHZpc2l0SUQgKSB7XG4gICAgICAgICAgICAgICAgbG9nRXJyb3IoXCJSZWNlaXZlZCBGaW5hbGl6ZSBidXQgdmlzaXRfaWQgZGlkbid0IG1hdGNoLiBcIiArXG4gICAgICAgICAgICAgICAgYEN1cnJlbnQgdmlzaXRfaWQgJHtfdmlzaXRJRH0sIHJlY2VpdmVkIHZpc2l0X2lkICR7dmlzaXRJRH0uYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhW1wiYnJvd3Nlcl9pZFwiXSA9IGNyYXdsSUQ7XG4gICAgICAgICAgICBkYXRhW1wic3VjY2Vzc1wiXSA9IHRydWU7XG4gICAgICAgICAgICBzdG9yYWdlQ29udHJvbGxlci5zZW5kKEpTT04uc3RyaW5naWZ5KFtcIm1ldGFfaW5mb3JtYXRpb25cIiwgZGF0YV0pKTtcbiAgICAgICAgICAgIHZpc2l0SUQgPSBudWxsO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBKdXN0IG1ha2luZyBzdXJlIHRoYXQgaXQncyBhIHZhbGlkIG51bWJlciBiZWZvcmUgbG9nZ2luZ1xuICAgICAgICAgICAgX3Zpc2l0SUQgPSBwYXJzZUludChkYXRhLCAxMCk7XG4gICAgICAgICAgICBsb2dEZWJ1ZyhcIlNldHRpbmcgdmlzaXRfaWQgdGhlIGxlZ2FjeSB3YXlcIik7XG4gICAgICAgICAgICB2aXNpdElEID0gX3Zpc2l0SURcblxuICAgIH1cblxufVxuZXhwb3J0IGxldCBvcGVuID0gYXN5bmMgZnVuY3Rpb24oc3RvcmFnZUNvbnRyb2xsZXJBZGRyZXNzLCBsb2dBZGRyZXNzLCBjdXJyX2NyYXdsSUQpIHtcbiAgICBpZiAoc3RvcmFnZUNvbnRyb2xsZXJBZGRyZXNzID09IG51bGwgJiYgbG9nQWRkcmVzcyA9PSBudWxsICYmIGN1cnJfY3Jhd2xJRCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkRlYnVnZ2luZywgZXZlcnl0aGluZyB3aWxsIG91dHB1dCB0byBjb25zb2xlXCIpO1xuICAgICAgICBkZWJ1Z2dpbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNyYXdsSUQgPSBjdXJyX2NyYXdsSUQ7XG5cbiAgICBjb25zb2xlLmxvZyhcIk9wZW5pbmcgc29ja2V0IGNvbm5lY3Rpb25zLi4uXCIpO1xuXG4gICAgLy8gQ29ubmVjdCB0byBNUExvZ2dlciBmb3IgZXh0ZW5zaW9uIGluZm8vZGVidWcvZXJyb3IgbG9nZ2luZ1xuICAgIGlmIChsb2dBZGRyZXNzICE9IG51bGwpIHtcbiAgICAgICAgbG9nQWdncmVnYXRvciA9IG5ldyBzb2NrZXQuU2VuZGluZ1NvY2tldCgpO1xuICAgICAgICBsZXQgcnYgPSBhd2FpdCBsb2dBZ2dyZWdhdG9yLmNvbm5lY3QobG9nQWRkcmVzc1swXSwgbG9nQWRkcmVzc1sxXSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibG9nU29ja2V0IHN0YXJ0ZWQ/XCIsIHJ2KVxuICAgIH1cblxuICAgIC8vIENvbm5lY3QgdG8gZGF0YWJhc2VzIGZvciBzYXZpbmcgZGF0YVxuICAgIGlmIChzdG9yYWdlQ29udHJvbGxlckFkZHJlc3MgIT0gbnVsbCkge1xuICAgICAgICBzdG9yYWdlQ29udHJvbGxlciA9IG5ldyBzb2NrZXQuU2VuZGluZ1NvY2tldCgpO1xuICAgICAgICBsZXQgcnYgPSBhd2FpdCBzdG9yYWdlQ29udHJvbGxlci5jb25uZWN0KHN0b3JhZ2VDb250cm9sbGVyQWRkcmVzc1swXSwgc3RvcmFnZUNvbnRyb2xsZXJBZGRyZXNzWzFdKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJTdG9yYWdlQ29udHJvbGxlciBzdGFydGVkP1wiLHJ2KTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGluY29taW5nIHVybHMgYXMgdmlzaXQgaWRzXG4gICAgbGlzdGVuaW5nU29ja2V0ID0gbmV3IHNvY2tldC5MaXN0ZW5pbmdTb2NrZXQobGlzdGVuaW5nU29ja2V0Q2FsbGJhY2spO1xuICAgIGNvbnNvbGUubG9nKFwiU3RhcnRpbmcgc29ja2V0IGxpc3RlbmluZyBmb3IgaW5jb21pbmcgY29ubmVjdGlvbnMuXCIpO1xuICAgIGF3YWl0IGxpc3RlbmluZ1NvY2tldC5zdGFydExpc3RlbmluZygpLnRoZW4oKCkgPT4ge1xuICAgICAgICBicm93c2VyLnByb2ZpbGVEaXJJTy53cml0ZUZpbGUoXCJleHRlbnNpb25fcG9ydC50eHRcIiwgYCR7bGlzdGVuaW5nU29ja2V0LnBvcnR9YCk7XG4gICAgfSk7XG59O1xuXG5leHBvcnQgbGV0IGNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHN0b3JhZ2VDb250cm9sbGVyICE9IG51bGwpIHtcbiAgICAgICAgc3RvcmFnZUNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICB9XG4gICAgaWYgKGxvZ0FnZ3JlZ2F0b3IgIT0gbnVsbCkge1xuICAgICAgICBsb2dBZ2dyZWdhdG9yLmNsb3NlKCk7XG4gICAgfVxufTtcblxubGV0IG1ha2VMb2dKU09OID0gZnVuY3Rpb24obHZsLCBtc2cpIHtcbiAgICB2YXIgbG9nX2pzb24gPSB7XG4gICAgICAgICduYW1lJzogJ0V4dGVuc2lvbi1Mb2dnZXInLFxuICAgICAgICAnbGV2ZWwnOiBsdmwsXG4gICAgICAgICdwYXRobmFtZSc6ICdGaXJlZm94RXh0ZW5zaW9uJyxcbiAgICAgICAgJ2xpbmVubyc6IDEsXG4gICAgICAgICdtc2cnOiBlc2NhcGVTdHJpbmcobXNnKSxcbiAgICAgICAgJ2FyZ3MnOiBudWxsLFxuICAgICAgICAnZXhjX2luZm8nOiBudWxsLFxuICAgICAgICAnZnVuYyc6IG51bGxcbiAgICB9XG4gICAgcmV0dXJuIGxvZ19qc29uO1xufVxuXG5leHBvcnQgbGV0IGxvZ0luZm8gPSBmdW5jdGlvbihtc2cpIHtcbiAgICAvLyBBbHdheXMgbG9nIHRvIGJyb3dzZXIgY29uc29sZVxuICAgIGNvbnNvbGUubG9nKG1zZyk7XG5cbiAgICBpZiAoZGVidWdnaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMb2cgbGV2ZWwgSU5GTyA9PSAyMCAoaHR0cHM6Ly9kb2NzLnB5dGhvbi5vcmcvMi9saWJyYXJ5L2xvZ2dpbmcuaHRtbCNsb2dnaW5nLWxldmVscylcbiAgICB2YXIgbG9nX2pzb24gPSBtYWtlTG9nSlNPTigyMCwgbXNnKTtcbiAgICBsb2dBZ2dyZWdhdG9yLnNlbmQoSlNPTi5zdHJpbmdpZnkoWydFWFQnLCBKU09OLnN0cmluZ2lmeShsb2dfanNvbildKSk7XG59O1xuXG5leHBvcnQgbGV0IGxvZ0RlYnVnID0gZnVuY3Rpb24obXNnKSB7XG4gICAgLy8gQWx3YXlzIGxvZyB0byBicm93c2VyIGNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuXG4gICAgaWYgKGRlYnVnZ2luZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTG9nIGxldmVsIERFQlVHID09IDEwIChodHRwczovL2RvY3MucHl0aG9uLm9yZy8yL2xpYnJhcnkvbG9nZ2luZy5odG1sI2xvZ2dpbmctbGV2ZWxzKVxuICAgIHZhciBsb2dfanNvbiA9IG1ha2VMb2dKU09OKDEwLCBtc2cpO1xuICAgIGxvZ0FnZ3JlZ2F0b3Iuc2VuZChKU09OLnN0cmluZ2lmeShbJ0VYVCcsIEpTT04uc3RyaW5naWZ5KGxvZ19qc29uKV0pKTtcbn07XG5cbmV4cG9ydCBsZXQgbG9nV2FybiA9IGZ1bmN0aW9uKG1zZykge1xuICAgIC8vIEFsd2F5cyBsb2cgdG8gYnJvd3NlciBjb25zb2xlXG4gICAgY29uc29sZS53YXJuKG1zZyk7XG5cbiAgICBpZiAoZGVidWdnaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMb2cgbGV2ZWwgV0FSTiA9PSAzMCAoaHR0cHM6Ly9kb2NzLnB5dGhvbi5vcmcvMi9saWJyYXJ5L2xvZ2dpbmcuaHRtbCNsb2dnaW5nLWxldmVscylcbiAgICB2YXIgbG9nX2pzb24gPSBtYWtlTG9nSlNPTigzMCwgbXNnKTtcbiAgICBsb2dBZ2dyZWdhdG9yLnNlbmQoSlNPTi5zdHJpbmdpZnkoWydFWFQnLCBKU09OLnN0cmluZ2lmeShsb2dfanNvbildKSk7XG59O1xuXG5leHBvcnQgbGV0IGxvZ0Vycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gICAgLy8gQWx3YXlzIGxvZyB0byBicm93c2VyIGNvbnNvbGVcbiAgICBjb25zb2xlLmVycm9yKG1zZyk7XG5cbiAgICBpZiAoZGVidWdnaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMb2cgbGV2ZWwgSU5GTyA9PSA0MCAoaHR0cHM6Ly9kb2NzLnB5dGhvbi5vcmcvMi9saWJyYXJ5L2xvZ2dpbmcuaHRtbCNsb2dnaW5nLWxldmVscylcbiAgICB2YXIgbG9nX2pzb24gPSBtYWtlTG9nSlNPTig0MCwgbXNnKTtcbiAgICBsb2dBZ2dyZWdhdG9yLnNlbmQoSlNPTi5zdHJpbmdpZnkoWydFWFQnLCBKU09OLnN0cmluZ2lmeShsb2dfanNvbildKSk7XG59O1xuXG5leHBvcnQgbGV0IGxvZ0NyaXRpY2FsID0gZnVuY3Rpb24obXNnKSB7XG4gICAgLy8gQWx3YXlzIGxvZyB0byBicm93c2VyIGNvbnNvbGVcbiAgICBjb25zb2xlLmVycm9yKG1zZyk7XG5cbiAgICBpZiAoZGVidWdnaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMb2cgbGV2ZWwgQ1JJVElDQUwgPT0gNTAgKGh0dHBzOi8vZG9jcy5weXRob24ub3JnLzIvbGlicmFyeS9sb2dnaW5nLmh0bWwjbG9nZ2luZy1sZXZlbHMpXG4gICAgdmFyIGxvZ19qc29uID0gbWFrZUxvZ0pTT04oNTAsIG1zZyk7XG4gICAgbG9nQWdncmVnYXRvci5zZW5kKEpTT04uc3RyaW5naWZ5KFsnRVhUJywgSlNPTi5zdHJpbmdpZnkobG9nX2pzb24pXSkpO1xufTtcblxuZXhwb3J0IGxldCBkYXRhUmVjZWl2ZXIgPSB7XG4gICAgc2F2ZVJlY29yZChhLCBiKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGIpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgbGV0IHNhdmVSZWNvcmQgPSBmdW5jdGlvbihpbnN0cnVtZW50LCByZWNvcmQpIHtcbiAgICByZWNvcmRbXCJ2aXNpdF9pZFwiXSA9IHZpc2l0SUQ7XG5cbiAgICBpZiAoIXZpc2l0SUQgJiYgIWRlYnVnZ2luZykge1xuICAgICAgICAvLyBOYXZpZ2F0aW9ucyB0byBhYm91dDpibGFuayBjYW4gYmUgdHJpZ2dlcmVkIGJ5IE9wZW5XUE0uIFdlIGRyb3AgdGhvc2UuXG4gICAgICAgIGlmKGluc3RydW1lbnQgPT09ICduYXZpZ2F0aW9ucycgJiYgcmVjb3JkWyd1cmwnXSA9PT0gJ2Fib3V0OmJsYW5rJykge1xuICAgICAgICAgICAgbG9nRGVidWcoJ0V4dGVuc2lvbi0nICsgY3Jhd2xJRCArICcgOiBEcm9wcGluZyBuYXZpZ2F0aW9uIHRvIGFib3V0OmJsYW5rIGluIGludGVybWVkaWF0ZSBwZXJpb2QnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsb2dXYXJuKGBFeHRlbnNpb24tJHtjcmF3bElEfSA6IHZpc2l0SUQgaXMgbnVsbCB3aGlsZSBhdHRlbXB0aW5nIHRvIGluc2VydCBpbnRvIHRhYmxlICR7aW5zdHJ1bWVudH1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocmVjb3JkKSk7XG4gICAgICAgIHJlY29yZFtcInZpc2l0X2lkXCJdID0gLTE7XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIHNlbmQgdG8gY29uc29sZSBpZiBkZWJ1Z2dpbmdcbiAgICBpZiAoZGVidWdnaW5nKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkVYVEVOU0lPTlwiLCBpbnN0cnVtZW50LCByZWNvcmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdG9yYWdlQ29udHJvbGxlci5zZW5kKEpTT04uc3RyaW5naWZ5KFtpbnN0cnVtZW50LCByZWNvcmRdKSk7XG59O1xuXG4vLyBTdHViIGZvciBub3dcbmV4cG9ydCBsZXQgc2F2ZUNvbnRlbnQgPSBhc3luYyBmdW5jdGlvbihjb250ZW50LCBjb250ZW50SGFzaCkge1xuICAvLyBTZW5kIHBhZ2UgY29udGVudCB0byB0aGUgZGF0YSBhZ2dyZWdhdG9yXG4gIC8vIGRlZHVwbGljYXRlZCBieSBjb250ZW50SGFzaCBpbiBhIGxldmVsREIgZGF0YWJhc2VcbiAgaWYgKGRlYnVnZ2luZykge1xuICAgIGNvbnNvbGUubG9nKFwiTERCIGNvbnRlbnRIYXNoOlwiLGNvbnRlbnRIYXNoLFwid2l0aCBsZW5ndGhcIixjb250ZW50Lmxlbmd0aCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIFNpbmNlIHRoZSBjb250ZW50IG1pZ2h0IG5vdCBiZSBhIHZhbGlkIHV0Zjggc3RyaW5nIGFuZCBpdCBuZWVkcyB0byBiZVxuICAvLyBqc29uIGVuY29kZWQgbGF0ZXIsIGl0IGlzIGVuY29kZWQgdXNpbmcgYmFzZTY0IGZpcnN0LlxuICBjb25zdCBiNjQgPSBVaW50OFRvQmFzZTY0KGNvbnRlbnQpO1xuICBzdG9yYWdlQ29udHJvbGxlci5zZW5kKEpTT04uc3RyaW5naWZ5KFsncGFnZV9jb250ZW50JywgW2I2NCwgY29udGVudEhhc2hdXSkpO1xufTtcblxuZnVuY3Rpb24gZW5jb2RlX3V0Zjgocykge1xuICByZXR1cm4gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHMpKTtcbn1cblxuLy8gQmFzZTY0IGVuY29kaW5nLCBmb3VuZCBvbjpcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNzEwMDAxL2hvdy10by1jb252ZXJ0LXVpbnQ4LWFycmF5LXRvLWJhc2U2NC1lbmNvZGVkLXN0cmluZy8yNTY0NDQwOSMyNTY0NDQwOVxuZnVuY3Rpb24gVWludDhUb0Jhc2U2NCh1OEFycil7XG4gIHZhciBDSFVOS19TSVpFID0gMHg4MDAwOyAvL2FyYml0cmFyeSBudW1iZXJcbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxlbmd0aCA9IHU4QXJyLmxlbmd0aDtcbiAgdmFyIHJlc3VsdCA9ICcnO1xuICB2YXIgc2xpY2U7XG4gIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgIHNsaWNlID0gdThBcnIuc3ViYXJyYXkoaW5kZXgsIE1hdGgubWluKGluZGV4ICsgQ0hVTktfU0laRSwgbGVuZ3RoKSk7XG4gICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgc2xpY2UpO1xuICAgIGluZGV4ICs9IENIVU5LX1NJWkU7XG4gIH1cbiAgcmV0dXJuIGJ0b2EocmVzdWx0KTtcbn1cblxuZXhwb3J0IGxldCBlc2NhcGVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBDb252ZXJ0IHRvIHN0cmluZyBpZiBuZWNlc3NhcnlcbiAgICBpZih0eXBlb2Ygc3RyaW5nICE9IFwic3RyaW5nXCIpXG4gICAgICAgIHN0cmluZyA9IFwiXCIgKyBzdHJpbmc7XG5cbiAgICByZXR1cm4gZW5jb2RlX3V0Zjgoc3RyaW5nKTtcbn07XG5cbmV4cG9ydCBsZXQgYm9vbFRvSW50ID0gZnVuY3Rpb24oYm9vbCkge1xuICAgIHJldHVybiBib29sID8gMSA6IDA7XG59O1xuIiwibGV0IERhdGFSZWNlaXZlciA9IHtcbiAgY2FsbGJhY2tzOiBuZXcgTWFwKCksXG4gIG9uRGF0YVJlY2VpdmVkOiAoYVNvY2tldElkLCBhRGF0YSwgYUpTT04pID0+IHtcbiAgICBpZiAoIURhdGFSZWNlaXZlci5jYWxsYmFja3MuaGFzKGFTb2NrZXRJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGFKU09OKSB7XG4gICAgICBhRGF0YSA9IEpTT04ucGFyc2UoYURhdGEpO1xuICAgIH1cbiAgICBEYXRhUmVjZWl2ZXIuY2FsbGJhY2tzLmdldChhU29ja2V0SWQpKGFEYXRhKTtcbiAgfSxcbn07XG5cbmJyb3dzZXIuc29ja2V0cy5vbkRhdGFSZWNlaXZlZC5hZGRMaXN0ZW5lcihEYXRhUmVjZWl2ZXIub25EYXRhUmVjZWl2ZWQpO1xuXG5sZXQgTGlzdGVuaW5nU29ja2V0cyA9IG5ldyBNYXAoKTtcblxuZXhwb3J0IGNsYXNzIExpc3RlbmluZ1NvY2tldCB7XG4gIGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gIH1cblxuICBhc3luYyBzdGFydExpc3RlbmluZygpIHtcbiAgICB0aGlzLnBvcnQgPSBhd2FpdCBicm93c2VyLnNvY2tldHMuY3JlYXRlU2VydmVyU29ja2V0KCk7XG4gICAgRGF0YVJlY2VpdmVyLmNhbGxiYWNrcy5zZXQodGhpcy5wb3J0LCB0aGlzLmNhbGxiYWNrKTtcbiAgICBicm93c2VyLnNvY2tldHMuc3RhcnRMaXN0ZW5pbmcodGhpcy5wb3J0KTtcbiAgICBjb25zb2xlLmxvZygnTGlzdGVuaW5nIG9uIHBvcnQgJyArIHRoaXMucG9ydCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbmRpbmdTb2NrZXQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoaG9zdCwgcG9ydCkge1xuICAgIHRoaXMuaWQgPSBhd2FpdCBicm93c2VyLnNvY2tldHMuY3JlYXRlU2VuZGluZ1NvY2tldCgpO1xuICAgIGJyb3dzZXIuc29ja2V0cy5jb25uZWN0KHRoaXMuaWQsIGhvc3QsIHBvcnQpO1xuICAgIGNvbnNvbGUubG9nKGBDb25uZWN0ZWQgdG8gJHtob3N0fToke3BvcnR9YCk7XG4gIH1cblxuICBzZW5kKGFEYXRhLCBhSlNPTj10cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGJyb3dzZXIuc29ja2V0cy5zZW5kRGF0YSh0aGlzLmlkLCBhRGF0YSwgISFhSlNPTik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLGVyci5tZXNzYWdlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBicm93c2VyLnNvY2tldHMuY2xvc2UodGhpcy5pZCk7XG4gIH1cbn1cblxuIiwiaW1wb3J0IHsgaW5jcmVtZW50ZWRFdmVudE9yZGluYWwgfSBmcm9tIFwiLi4vbGliL2V4dGVuc2lvbi1zZXNzaW9uLWV2ZW50LW9yZGluYWxcIjtcbmltcG9ydCB7IGV4dGVuc2lvblNlc3Npb25VdWlkIH0gZnJvbSBcIi4uL2xpYi9leHRlbnNpb24tc2Vzc2lvbi11dWlkXCI7XG5pbXBvcnQgeyBib29sVG9JbnQsIGVzY2FwZVN0cmluZyB9IGZyb20gXCIuLi9saWIvc3RyaW5nLXV0aWxzXCI7XG5leHBvcnQgY29uc3QgdHJhbnNmb3JtQ29va2llT2JqZWN0VG9NYXRjaE9wZW5XUE1TY2hlbWEgPSAoY29va2llKSA9PiB7XG4gICAgY29uc3QgamF2YXNjcmlwdENvb2tpZSA9IHt9O1xuICAgIC8vIEV4cGlyeSB0aW1lIChpbiBzZWNvbmRzKVxuICAgIC8vIE1heSByZXR1cm4gfk1heChpbnQ2NCkuIEkgYmVsaWV2ZSB0aGlzIGlzIGEgc2Vzc2lvblxuICAgIC8vIGNvb2tpZSB3aGljaCBkb2Vzbid0IGV4cGlyZS4gU2Vzc2lvbnMgY29va2llcyB3aXRoXG4gICAgLy8gbm9uLW1heCBleHBpcnkgdGltZSBleHBpcmUgYWZ0ZXIgc2Vzc2lvbiBvciBhdCBleHBpcnkuXG4gICAgY29uc3QgZXhwaXJ5VGltZSA9IGNvb2tpZS5leHBpcmF0aW9uRGF0ZTsgLy8gcmV0dXJucyBzZWNvbmRzXG4gICAgbGV0IGV4cGlyeVRpbWVTdHJpbmc7XG4gICAgY29uc3QgbWF4SW50NjQgPSA5MjIzMzcyMDM2ODU0Nzc2MDAwO1xuICAgIGlmICghY29va2llLmV4cGlyYXRpb25EYXRlIHx8IGV4cGlyeVRpbWUgPT09IG1heEludDY0KSB7XG4gICAgICAgIGV4cGlyeVRpbWVTdHJpbmcgPSBcIjk5OTktMTItMzFUMjE6NTk6NTkuMDAwWlwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgZXhwaXJ5VGltZURhdGUgPSBuZXcgRGF0ZShleHBpcnlUaW1lICogMTAwMCk7IC8vIHJlcXVpcmVzIG1pbGxpc2Vjb25kc1xuICAgICAgICBleHBpcnlUaW1lU3RyaW5nID0gZXhwaXJ5VGltZURhdGUudG9JU09TdHJpbmcoKTtcbiAgICB9XG4gICAgamF2YXNjcmlwdENvb2tpZS5leHBpcnkgPSBleHBpcnlUaW1lU3RyaW5nO1xuICAgIGphdmFzY3JpcHRDb29raWUuaXNfaHR0cF9vbmx5ID0gYm9vbFRvSW50KGNvb2tpZS5odHRwT25seSk7XG4gICAgamF2YXNjcmlwdENvb2tpZS5pc19ob3N0X29ubHkgPSBib29sVG9JbnQoY29va2llLmhvc3RPbmx5KTtcbiAgICBqYXZhc2NyaXB0Q29va2llLmlzX3Nlc3Npb24gPSBib29sVG9JbnQoY29va2llLnNlc3Npb24pO1xuICAgIGphdmFzY3JpcHRDb29raWUuaG9zdCA9IGVzY2FwZVN0cmluZyhjb29raWUuZG9tYWluKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLmlzX3NlY3VyZSA9IGJvb2xUb0ludChjb29raWUuc2VjdXJlKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLm5hbWUgPSBlc2NhcGVTdHJpbmcoY29va2llLm5hbWUpO1xuICAgIGphdmFzY3JpcHRDb29raWUucGF0aCA9IGVzY2FwZVN0cmluZyhjb29raWUucGF0aCk7XG4gICAgamF2YXNjcmlwdENvb2tpZS52YWx1ZSA9IGVzY2FwZVN0cmluZyhjb29raWUudmFsdWUpO1xuICAgIGphdmFzY3JpcHRDb29raWUuc2FtZV9zaXRlID0gZXNjYXBlU3RyaW5nKGNvb2tpZS5zYW1lU2l0ZSk7XG4gICAgamF2YXNjcmlwdENvb2tpZS5maXJzdF9wYXJ0eV9kb21haW4gPSBlc2NhcGVTdHJpbmcoY29va2llLmZpcnN0UGFydHlEb21haW4pO1xuICAgIGphdmFzY3JpcHRDb29raWUuc3RvcmVfaWQgPSBlc2NhcGVTdHJpbmcoY29va2llLnN0b3JlSWQpO1xuICAgIGphdmFzY3JpcHRDb29raWUudGltZV9zdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICByZXR1cm4gamF2YXNjcmlwdENvb2tpZTtcbn07XG5leHBvcnQgY2xhc3MgQ29va2llSW5zdHJ1bWVudCB7XG4gICAgZGF0YVJlY2VpdmVyO1xuICAgIG9uQ2hhbmdlZExpc3RlbmVyO1xuICAgIGNvbnN0cnVjdG9yKGRhdGFSZWNlaXZlcikge1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlciA9IGRhdGFSZWNlaXZlcjtcbiAgICB9XG4gICAgcnVuKGNyYXdsSUQpIHtcbiAgICAgICAgLy8gSW5zdHJ1bWVudCBjb29raWUgY2hhbmdlc1xuICAgICAgICB0aGlzLm9uQ2hhbmdlZExpc3RlbmVyID0gYXN5bmMgKGNoYW5nZUluZm8pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGNoYW5nZUluZm8ucmVtb3ZlZCA/IFwiZGVsZXRlZFwiIDogXCJhZGRlZC1vci1jaGFuZ2VkXCI7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkX3R5cGU6IGV2ZW50VHlwZSxcbiAgICAgICAgICAgICAgICBjaGFuZ2VfY2F1c2U6IGNoYW5nZUluZm8uY2F1c2UsXG4gICAgICAgICAgICAgICAgYnJvd3Nlcl9pZDogY3Jhd2xJRCxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25fc2Vzc2lvbl91dWlkOiBleHRlbnNpb25TZXNzaW9uVXVpZCxcbiAgICAgICAgICAgICAgICBldmVudF9vcmRpbmFsOiBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCgpLFxuICAgICAgICAgICAgICAgIC4uLnRyYW5zZm9ybUNvb2tpZU9iamVjdFRvTWF0Y2hPcGVuV1BNU2NoZW1hKGNoYW5nZUluZm8uY29va2llKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiamF2YXNjcmlwdF9jb29raWVzXCIsIHVwZGF0ZSk7XG4gICAgICAgIH07XG4gICAgICAgIGJyb3dzZXIuY29va2llcy5vbkNoYW5nZWQuYWRkTGlzdGVuZXIodGhpcy5vbkNoYW5nZWRMaXN0ZW5lcik7XG4gICAgfVxuICAgIGFzeW5jIHNhdmVBbGxDb29raWVzKGNyYXdsSUQpIHtcbiAgICAgICAgY29uc3QgYWxsQ29va2llcyA9IGF3YWl0IGJyb3dzZXIuY29va2llcy5nZXRBbGwoe30pO1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChhbGxDb29raWVzLm1hcCgoY29va2llKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGUgPSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkX3R5cGU6IFwibWFudWFsLWV4cG9ydFwiLFxuICAgICAgICAgICAgICAgIGJyb3dzZXJfaWQ6IGNyYXdsSUQsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZDogZXh0ZW5zaW9uU2Vzc2lvblV1aWQsXG4gICAgICAgICAgICAgICAgLi4udHJhbnNmb3JtQ29va2llT2JqZWN0VG9NYXRjaE9wZW5XUE1TY2hlbWEoY29va2llKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImphdmFzY3JpcHRfY29va2llc1wiLCB1cGRhdGUpO1xuICAgICAgICB9KSk7XG4gICAgfVxuICAgIGNsZWFudXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQ2hhbmdlZExpc3RlbmVyKSB7XG4gICAgICAgICAgICBicm93c2VyLmNvb2tpZXMub25DaGFuZ2VkLnJlbW92ZUxpc3RlbmVyKHRoaXMub25DaGFuZ2VkTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWTI5dmEybGxMV2x1YzNSeWRXMWxiblF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WW1GamEyZHliM1Z1WkM5amIyOXJhV1V0YVc1emRISjFiV1Z1ZEM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hQUVVGUExFVkJRVVVzZFVKQlFYVkNMRVZCUVVVc1RVRkJUU3gzUTBGQmQwTXNRMEZCUXp0QlFVTnFSaXhQUVVGUExFVkJRVVVzYjBKQlFXOUNMRVZCUVVVc1RVRkJUU3dyUWtGQkswSXNRMEZCUXp0QlFVTnlSU3hQUVVGUExFVkJRVVVzVTBGQlV5eEZRVUZGTEZsQlFWa3NSVUZCUlN4TlFVRk5MSEZDUVVGeFFpeERRVUZETzBGQlN6bEVMRTFCUVUwc1EwRkJReXhOUVVGTkxIbERRVUY1UXl4SFFVRkhMRU5CUVVNc1RVRkJZeXhGUVVGRkxFVkJRVVU3U1VGRE1VVXNUVUZCVFN4blFrRkJaMElzUjBGQlJ5eEZRVUZ6UWl4RFFVRkRPMGxCUldoRUxESkNRVUV5UWp0SlFVTXpRaXh6UkVGQmMwUTdTVUZEZEVRc2NVUkJRWEZFTzBsQlEzSkVMSGxFUVVGNVJEdEpRVU42UkN4TlFVRk5MRlZCUVZVc1IwRkJSeXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTXNhMEpCUVd0Q08wbEJRelZFTEVsQlFVa3NaMEpCUVdkQ0xFTkJRVU03U1VGRGNrSXNUVUZCVFN4UlFVRlJMRWRCUVVjc2JVSkJRVzFDTEVOQlFVTTdTVUZEY2tNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eGpRVUZqTEVsQlFVa3NWVUZCVlN4TFFVRkxMRkZCUVZFc1JVRkJSVHRSUVVOeVJDeG5Ra0ZCWjBJc1IwRkJSeXd3UWtGQk1FSXNRMEZCUXp0TFFVTXZRenRUUVVGTk8xRkJRMHdzVFVGQlRTeGpRVUZqTEVkQlFVY3NTVUZCU1N4SlFVRkpMRU5CUVVNc1ZVRkJWU3hIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNkMEpCUVhkQ08xRkJRelZGTEdkQ1FVRm5RaXhIUVVGSExHTkJRV01zUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0TFFVTnFSRHRKUVVORUxHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1IwRkJSeXhuUWtGQlowSXNRMEZCUXp0SlFVTXpReXhuUWtGQlowSXNRMEZCUXl4WlFVRlpMRWRCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0SlFVTXpSQ3huUWtGQlowSXNRMEZCUXl4WlFVRlpMRWRCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0SlFVTXpSQ3huUWtGQlowSXNRMEZCUXl4VlFVRlZMRWRCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0SlFVVjRSQ3huUWtGQlowSXNRMEZCUXl4SlFVRkpMRWRCUVVjc1dVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SlFVTndSQ3huUWtGQlowSXNRMEZCUXl4VFFVRlRMRWRCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SlFVTjBSQ3huUWtGQlowSXNRMEZCUXl4SlFVRkpMRWRCUVVjc1dVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTnNSQ3huUWtGQlowSXNRMEZCUXl4SlFVRkpMRWRCUVVjc1dVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SlFVTnNSQ3huUWtGQlowSXNRMEZCUXl4TFFVRkxMRWRCUVVjc1dVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTndSQ3huUWtGQlowSXNRMEZCUXl4VFFVRlRMRWRCUVVjc1dVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0SlFVTXpSQ3huUWtGQlowSXNRMEZCUXl4clFrRkJhMElzUjBGQlJ5eFpRVUZaTEVOQlFVTXNUVUZCVFN4RFFVRkRMR2RDUVVGblFpeERRVUZETEVOQlFVTTdTVUZETlVVc1owSkJRV2RDTEVOQlFVTXNVVUZCVVN4SFFVRkhMRmxCUVZrc1EwRkJReXhOUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdTVUZGZWtRc1owSkJRV2RDTEVOQlFVTXNWVUZCVlN4SFFVRkhMRWxCUVVrc1NVRkJTU3hGUVVGRkxFTkJRVU1zVjBGQlZ5eEZRVUZGTEVOQlFVTTdTVUZGZGtRc1QwRkJUeXhuUWtGQlowSXNRMEZCUXp0QlFVTXhRaXhEUVVGRExFTkJRVU03UVVGRlJpeE5RVUZOTEU5QlFVOHNaMEpCUVdkQ08wbEJRMVlzV1VGQldTeERRVUZETzBsQlEzUkNMR2xDUVVGcFFpeERRVUZETzBsQlJURkNMRmxCUVZrc1dVRkJXVHRSUVVOMFFpeEpRVUZKTEVOQlFVTXNXVUZCV1N4SFFVRkhMRmxCUVZrc1EwRkJRenRKUVVOdVF5eERRVUZETzBsQlJVMHNSMEZCUnl4RFFVRkRMRTlCUVU4N1VVRkRhRUlzTkVKQlFUUkNPMUZCUXpWQ0xFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1IwRkJSeXhMUVVGTExFVkJRVVVzVlVGUEwwSXNSVUZCUlN4RlFVRkZPMWxCUTBnc1RVRkJUU3hUUVVGVExFZEJRVWNzVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eHJRa0ZCYTBJc1EwRkJRenRaUVVOMFJTeE5RVUZOTEUxQlFVMHNSMEZCTWtJN1owSkJRM0pETEZkQlFWY3NSVUZCUlN4VFFVRlRPMmRDUVVOMFFpeFpRVUZaTEVWQlFVVXNWVUZCVlN4RFFVRkRMRXRCUVVzN1owSkJRemxDTEZWQlFWVXNSVUZCUlN4UFFVRlBPMmRDUVVOdVFpeHpRa0ZCYzBJc1JVRkJSU3h2UWtGQmIwSTdaMEpCUXpWRExHRkJRV0VzUlVGQlJTeDFRa0ZCZFVJc1JVRkJSVHRuUWtGRGVFTXNSMEZCUnl4NVEwRkJlVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRPMkZCUTJoRkxFTkJRVU03V1VGRFJpeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRlZCUVZVc1EwRkJReXh2UWtGQmIwSXNSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenRSUVVNM1JDeERRVUZETEVOQlFVTTdVVUZEUml4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdTVUZEYUVVc1EwRkJRenRKUVVWTkxFdEJRVXNzUTBGQlF5eGpRVUZqTEVOQlFVTXNUMEZCVHp0UlFVTnFReXhOUVVGTkxGVkJRVlVzUjBGQlJ5eE5RVUZOTEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEzQkVMRTFCUVUwc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGRFppeFZRVUZWTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJZeXhGUVVGRkxFVkJRVVU3V1VGRGFFTXNUVUZCVFN4TlFVRk5MRWRCUVRKQ08yZENRVU55UXl4WFFVRlhMRVZCUVVVc1pVRkJaVHRuUWtGRE5VSXNWVUZCVlN4RlFVRkZMRTlCUVU4N1owSkJRMjVDTEhOQ1FVRnpRaXhGUVVGRkxHOUNRVUZ2UWp0blFrRkROVU1zUjBGQlJ5eDVRMEZCZVVNc1EwRkJReXhOUVVGTkxFTkJRVU03WVVGRGNrUXNRMEZCUXp0WlFVTkdMRTlCUVU4c1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNiMEpCUVc5Q0xFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdVVUZEY0VVc1EwRkJReXhEUVVGRExFTkJRMGdzUTBGQlF6dEpRVU5LTEVOQlFVTTdTVUZGVFN4UFFVRlBPMUZCUTFvc1NVRkJTU3hKUVVGSkxFTkJRVU1zYVVKQlFXbENMRVZCUVVVN1dVRkRNVUlzVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhEUVVGRE8xTkJRMnhGTzBsQlEwZ3NRMEZCUXp0RFFVTkdJbjA9IiwiaW1wb3J0IHsgUGVuZGluZ1Jlc3BvbnNlIH0gZnJvbSBcIi4uL2xpYi9wZW5kaW5nLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBhbGxUeXBlcyB9IGZyb20gXCIuL2h0dHAtaW5zdHJ1bWVudFwiO1xuZXhwb3J0IGNsYXNzIERuc0luc3RydW1lbnQge1xuICAgIGRhdGFSZWNlaXZlcjtcbiAgICBvbkNvbXBsZXRlTGlzdGVuZXI7XG4gICAgcGVuZGluZ1Jlc3BvbnNlcyA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKGRhdGFSZWNlaXZlcikge1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlciA9IGRhdGFSZWNlaXZlcjtcbiAgICB9XG4gICAgcnVuKGNyYXdsSUQpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyID0geyB1cmxzOiBbXCI8YWxsX3VybHM+XCJdLCB0eXBlczogYWxsVHlwZXMgfTtcbiAgICAgICAgY29uc3QgcmVxdWVzdFN0ZW1zRnJvbUV4dGVuc2lvbiA9IChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGRldGFpbHMub3JpZ2luVXJsICYmXG4gICAgICAgICAgICAgICAgZGV0YWlscy5vcmlnaW5VcmwuaW5kZXhPZihcIm1vei1leHRlbnNpb246Ly9cIikgPiAtMSAmJlxuICAgICAgICAgICAgICAgIGRldGFpbHMub3JpZ2luVXJsLmluY2x1ZGVzKFwiZmFrZVJlcXVlc3RcIikpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgKiBBdHRhY2ggaGFuZGxlcnMgdG8gZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uQ29tcGxldGVMaXN0ZW5lciA9IChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgcmVxdWVzdHMgbWFkZSBieSBleHRlbnNpb25zXG4gICAgICAgICAgICBpZiAocmVxdWVzdFN0ZW1zRnJvbUV4dGVuc2lvbihkZXRhaWxzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdSZXNwb25zZSA9IHRoaXMuZ2V0UGVuZGluZ1Jlc3BvbnNlKGRldGFpbHMucmVxdWVzdElkKTtcbiAgICAgICAgICAgIHBlbmRpbmdSZXNwb25zZS5yZXNvbHZlT25Db21wbGV0ZWRFdmVudERldGFpbHMoZGV0YWlscyk7XG4gICAgICAgICAgICB0aGlzLm9uQ29tcGxldGVEbnNIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQpO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25Db21wbGV0ZWQuYWRkTGlzdGVuZXIodGhpcy5vbkNvbXBsZXRlTGlzdGVuZXIsIGZpbHRlcik7XG4gICAgfVxuICAgIGNsZWFudXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQ29tcGxldGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQ29tcGxldGVkLnJlbW92ZUxpc3RlbmVyKHRoaXMub25Db21wbGV0ZUxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRQZW5kaW5nUmVzcG9uc2UocmVxdWVzdElkKSB7XG4gICAgICAgIGlmICghdGhpcy5wZW5kaW5nUmVzcG9uc2VzW3JlcXVlc3RJZF0pIHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1Jlc3BvbnNlc1tyZXF1ZXN0SWRdID0gbmV3IFBlbmRpbmdSZXNwb25zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdSZXNwb25zZXNbcmVxdWVzdElkXTtcbiAgICB9XG4gICAgaGFuZGxlUmVzb2x2ZWREbnNEYXRhKGRuc1JlY29yZE9iaiwgZGF0YVJlY2VpdmVyKSB7XG4gICAgICAgIC8vIEN1cnJpbmcgdGhlIGRhdGEgcmV0dXJuZWQgYnkgQVBJIGNhbGwuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgICAgICAgICAvLyBHZXQgZGF0YSBmcm9tIEFQSSBjYWxsXG4gICAgICAgICAgICBkbnNSZWNvcmRPYmouYWRkcmVzc2VzID0gcmVjb3JkLmFkZHJlc3Nlcy50b1N0cmluZygpO1xuICAgICAgICAgICAgZG5zUmVjb3JkT2JqLmNhbm9uaWNhbF9uYW1lID0gcmVjb3JkLmNhbm9uaWNhbE5hbWU7XG4gICAgICAgICAgICBkbnNSZWNvcmRPYmouaXNfVFJSID0gcmVjb3JkLmlzVFJSO1xuICAgICAgICAgICAgLy8gU2VuZCBkYXRhIHRvIG1haW4gT3BlbldQTSBkYXRhIGFnZ3JlZ2F0b3IuXG4gICAgICAgICAgICBkYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImRuc19yZXNwb25zZXNcIiwgZG5zUmVjb3JkT2JqKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgb25Db21wbGV0ZURuc0hhbmRsZXIoZGV0YWlscywgY3Jhd2xJRCkge1xuICAgICAgICAvLyBDcmVhdGUgYW5kIHBvcHVsYXRlIERuc1Jlc29sdmUgb2JqZWN0XG4gICAgICAgIGNvbnN0IGRuc1JlY29yZCA9IHt9O1xuICAgICAgICBkbnNSZWNvcmQuYnJvd3Nlcl9pZCA9IGNyYXdsSUQ7XG4gICAgICAgIGRuc1JlY29yZC5yZXF1ZXN0X2lkID0gTnVtYmVyKGRldGFpbHMucmVxdWVzdElkKTtcbiAgICAgICAgZG5zUmVjb3JkLnVzZWRfYWRkcmVzcyA9IGRldGFpbHMuaXA7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbmV3IERhdGUoZGV0YWlscy50aW1lU3RhbXApO1xuICAgICAgICBkbnNSZWNvcmQudGltZV9zdGFtcCA9IGN1cnJlbnRUaW1lLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIC8vIFF1ZXJ5IEROUyBBUElcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChkZXRhaWxzLnVybCk7XG4gICAgICAgIGRuc1JlY29yZC5ob3N0bmFtZSA9IHVybC5ob3N0bmFtZTtcbiAgICAgICAgY29uc3QgZG5zUmVzb2x2ZSA9IGJyb3dzZXIuZG5zLnJlc29sdmUoZG5zUmVjb3JkLmhvc3RuYW1lLCBbXG4gICAgICAgICAgICBcImNhbm9uaWNhbF9uYW1lXCIsXG4gICAgICAgIF0pO1xuICAgICAgICBkbnNSZXNvbHZlLnRoZW4odGhpcy5oYW5kbGVSZXNvbHZlZERuc0RhdGEoZG5zUmVjb3JkLCB0aGlzLmRhdGFSZWNlaXZlcikpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpHNXpMV2x1YzNSeWRXMWxiblF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WW1GamEyZHliM1Z1WkM5a2JuTXRhVzV6ZEhKMWJXVnVkQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNaVUZCWlN4RlFVRkZMRTFCUVUwc2VVSkJRWGxDTEVOQlFVTTdRVUZITVVRc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeE5RVUZOTEcxQ1FVRnRRaXhEUVVGRE8wRkJSemRETEUxQlFVMHNUMEZCVHl4aFFVRmhPMGxCUTFBc1dVRkJXU3hEUVVGRE8wbEJRM1JDTEd0Q1FVRnJRaXhEUVVGRE8wbEJRMjVDTEdkQ1FVRm5RaXhIUVVWd1FpeEZRVUZGTEVOQlFVTTdTVUZGVUN4WlFVRlpMRmxCUVZrN1VVRkRkRUlzU1VGQlNTeERRVUZETEZsQlFWa3NSMEZCUnl4WlFVRlpMRU5CUVVNN1NVRkRia01zUTBGQlF6dEpRVVZOTEVkQlFVY3NRMEZCUXl4UFFVRlBPMUZCUTJoQ0xFMUJRVTBzVFVGQlRTeEhRVUZyUWl4RlFVRkZMRWxCUVVrc1JVRkJSU3hEUVVGRExGbEJRVmtzUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4UlFVRlJMRVZCUVVVc1EwRkJRenRSUVVWNFJTeE5RVUZOTEhsQ1FVRjVRaXhIUVVGSExFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVTdXVUZETlVNc1QwRkJUeXhEUVVOTUxFOUJRVThzUTBGQlF5eFRRVUZUTzJkQ1FVTnFRaXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEU5QlFVOHNRMEZCUXl4clFrRkJhMElzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blFrRkRiRVFzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRekZETEVOQlFVTTdVVUZEU2l4RFFVRkRMRU5CUVVNN1VVRkZSanM3VjBGRlJ6dFJRVU5JTEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUjBGQlJ5eERRVUZETEU5QlFUQkRMRVZCUVVVc1JVRkJSVHRaUVVOMlJTeHhRMEZCY1VNN1dVRkRja01zU1VGQlNTeDVRa0ZCZVVJc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdG5Ra0ZEZEVNc1QwRkJUenRoUVVOU08xbEJRMFFzVFVGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4RFFVRkRMR3RDUVVGclFpeERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRaUVVOdVJTeGxRVUZsTEVOQlFVTXNPRUpCUVRoQ0xFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdXVUZGZUVRc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRTlCUVU4c1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dFJRVU01UXl4RFFVRkRMRU5CUVVNN1VVRkZSaXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEZkQlFWY3NRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8wbEJRemxGTEVOQlFVTTdTVUZGVFN4UFFVRlBPMUZCUTFvc1NVRkJTU3hKUVVGSkxFTkJRVU1zYTBKQlFXdENMRVZCUVVVN1dVRkRNMElzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4WFFVRlhMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhEUVVGRE8xTkJRM2hGTzBsQlEwZ3NRMEZCUXp0SlFVVlBMR3RDUVVGclFpeERRVUZETEZOQlFWTTdVVUZEYkVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFTkJRVU1zUlVGQlJUdFpRVU55UXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hsUVVGbExFVkJRVVVzUTBGQlF6dFRRVU14UkR0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8wbEJRekZETEVOQlFVTTdTVUZGVHl4eFFrRkJjVUlzUTBGQlF5eFpRVUZaTEVWQlFVVXNXVUZCV1R0UlFVTjBSQ3g1UTBGQmVVTTdVVUZEZWtNc1QwRkJUeXhWUVVGVkxFMUJRVTA3V1VGRGNrSXNlVUpCUVhsQ08xbEJRM3BDTEZsQlFWa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXp0WlFVTnlSQ3haUVVGWkxFTkJRVU1zWTBGQll5eEhRVUZITEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNN1dVRkRia1FzV1VGQldTeERRVUZETEUxQlFVMHNSMEZCUnl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8xbEJSVzVETERaRFFVRTJRenRaUVVNM1F5eFpRVUZaTEVOQlFVTXNWVUZCVlN4RFFVRkRMR1ZCUVdVc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF6dFJRVU42UkN4RFFVRkRMRU5CUVVNN1NVRkRTaXhEUVVGRE8wbEJSVThzUzBGQlN5eERRVUZETEc5Q1FVRnZRaXhEUVVOb1F5eFBRVUV3UXl4RlFVTXhReXhQUVVGUE8xRkJSVkFzZDBOQlFYZERPMUZCUTNoRExFMUJRVTBzVTBGQlV5eEhRVUZITEVWQlFXbENMRU5CUVVNN1VVRkRjRU1zVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUnl4UFFVRlBMRU5CUVVNN1VVRkRMMElzVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFGQlEycEVMRk5CUVZNc1EwRkJReXhaUVVGWkxFZEJRVWNzVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXp0UlFVTndReXhOUVVGTkxGZEJRVmNzUjBGQlJ5eEpRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03VVVGRGFFUXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJSeXhYUVVGWExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVOQlFVTTdVVUZGYWtRc1owSkJRV2RDTzFGQlEyaENMRTFCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOcVF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4SFFVRkhMRWRCUVVjc1EwRkJReXhSUVVGUkxFTkJRVU03VVVGRGJFTXNUVUZCVFN4VlFVRlZMRWRCUVVjc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1JVRkJSVHRaUVVONlJDeG5Ra0ZCWjBJN1UwRkRha0lzUTBGQlF5eERRVUZETzFGQlEwZ3NWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1UwRkJVeXhGUVVGRkxFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpWRkxFTkJRVU03UTBGRFJpSjkiLCJpbXBvcnQgeyBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCB9IGZyb20gXCIuLi9saWIvZXh0ZW5zaW9uLXNlc3Npb24tZXZlbnQtb3JkaW5hbFwiO1xuaW1wb3J0IHsgZXh0ZW5zaW9uU2Vzc2lvblV1aWQgfSBmcm9tIFwiLi4vbGliL2V4dGVuc2lvbi1zZXNzaW9uLXV1aWRcIjtcbmltcG9ydCB7IEh0dHBQb3N0UGFyc2VyIH0gZnJvbSBcIi4uL2xpYi9odHRwLXBvc3QtcGFyc2VyXCI7XG5pbXBvcnQgeyBQZW5kaW5nUmVxdWVzdCB9IGZyb20gXCIuLi9saWIvcGVuZGluZy1yZXF1ZXN0XCI7XG5pbXBvcnQgeyBQZW5kaW5nUmVzcG9uc2UgfSBmcm9tIFwiLi4vbGliL3BlbmRpbmctcmVzcG9uc2VcIjtcbmltcG9ydCB7IGJvb2xUb0ludCwgZXNjYXBlU3RyaW5nLCBlc2NhcGVVcmwgfSBmcm9tIFwiLi4vbGliL3N0cmluZy11dGlsc1wiO1xuLyoqXG4gKiBOb3RlOiBEaWZmZXJlbnQgcGFydHMgb2YgdGhlIGRlc2lyZWQgaW5mb3JtYXRpb24gYXJyaXZlcyBpbiBkaWZmZXJlbnQgZXZlbnRzIGFzIHBlciBiZWxvdzpcbiAqIHJlcXVlc3QgPSBoZWFkZXJzIGluIG9uQmVmb3JlU2VuZEhlYWRlcnMgKyBib2R5IGluIG9uQmVmb3JlUmVxdWVzdFxuICogcmVzcG9uc2UgPSBoZWFkZXJzIGluIG9uQ29tcGxldGVkICsgYm9keSB2aWEgYSBvbkJlZm9yZVJlcXVlc3QgZmlsdGVyXG4gKiByZWRpcmVjdCA9IG9yaWdpbmFsIHJlcXVlc3QgaGVhZGVycytib2R5LCBmb2xsb3dlZCBieSBhIG9uQmVmb3JlUmVkaXJlY3QgYW5kIHRoZW4gYSBuZXcgc2V0IG9mIHJlcXVlc3QgaGVhZGVycytib2R5IGFuZCByZXNwb25zZSBoZWFkZXJzK2JvZHlcbiAqIERvY3M6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVXNlcjp3YmFtYmVyZy93ZWJSZXF1ZXN0LlJlcXVlc3REZXRhaWxzXG4gKi9cbmNvbnN0IGFsbFR5cGVzID0gW1xuICAgIFwiYmVhY29uXCIsXG4gICAgXCJjc3BfcmVwb3J0XCIsXG4gICAgXCJmb250XCIsXG4gICAgXCJpbWFnZVwiLFxuICAgIFwiaW1hZ2VzZXRcIixcbiAgICBcIm1haW5fZnJhbWVcIixcbiAgICBcIm1lZGlhXCIsXG4gICAgXCJvYmplY3RcIixcbiAgICBcIm9iamVjdF9zdWJyZXF1ZXN0XCIsXG4gICAgXCJwaW5nXCIsXG4gICAgXCJzY3JpcHRcIixcbiAgICBcInNwZWN1bGF0aXZlXCIsXG4gICAgXCJzdHlsZXNoZWV0XCIsXG4gICAgXCJzdWJfZnJhbWVcIixcbiAgICBcIndlYl9tYW5pZmVzdFwiLFxuICAgIFwid2Vic29ja2V0XCIsXG4gICAgXCJ4bWxfZHRkXCIsXG4gICAgXCJ4bWxodHRwcmVxdWVzdFwiLFxuICAgIFwieHNsdFwiLFxuICAgIFwib3RoZXJcIixcbl07XG5leHBvcnQgeyBhbGxUeXBlcyB9O1xuZXhwb3J0IGNsYXNzIEh0dHBJbnN0cnVtZW50IHtcbiAgICBkYXRhUmVjZWl2ZXI7XG4gICAgcGVuZGluZ1JlcXVlc3RzID0ge307XG4gICAgcGVuZGluZ1Jlc3BvbnNlcyA9IHt9O1xuICAgIG9uQmVmb3JlUmVxdWVzdExpc3RlbmVyO1xuICAgIG9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lcjtcbiAgICBvbkJlZm9yZVJlZGlyZWN0TGlzdGVuZXI7XG4gICAgb25Db21wbGV0ZWRMaXN0ZW5lcjtcbiAgICBjb25zdHJ1Y3RvcihkYXRhUmVjZWl2ZXIpIHtcbiAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIgPSBkYXRhUmVjZWl2ZXI7XG4gICAgfVxuICAgIHJ1bihjcmF3bElELCBzYXZlQ29udGVudE9wdGlvbikge1xuICAgICAgICBjb25zdCBmaWx0ZXIgPSB7IHVybHM6IFtcIjxhbGxfdXJscz5cIl0sIHR5cGVzOiBhbGxUeXBlcyB9O1xuICAgICAgICBjb25zdCByZXF1ZXN0U3RlbXNGcm9tRXh0ZW5zaW9uID0gKGRldGFpbHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoZGV0YWlscy5vcmlnaW5VcmwgJiYgZGV0YWlscy5vcmlnaW5VcmwuaW5kZXhPZihcIm1vei1leHRlbnNpb246Ly9cIikgPiAtMSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qXG4gICAgICAgICAqIEF0dGFjaCBoYW5kbGVycyB0byBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25CZWZvcmVSZXF1ZXN0TGlzdGVuZXIgPSAoZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYmxvY2tpbmdSZXNwb25zZVRoYXREb2VzTm90aGluZyA9IHt9O1xuICAgICAgICAgICAgLy8gSWdub3JlIHJlcXVlc3RzIG1hZGUgYnkgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RTdGVtc0Zyb21FeHRlbnNpb24oZGV0YWlscykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmxvY2tpbmdSZXNwb25zZVRoYXREb2VzTm90aGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdSZXF1ZXN0ID0gdGhpcy5nZXRQZW5kaW5nUmVxdWVzdChkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgICAgICBwZW5kaW5nUmVxdWVzdC5yZXNvbHZlT25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzKGRldGFpbHMpO1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1Jlc3BvbnNlID0gdGhpcy5nZXRQZW5kaW5nUmVzcG9uc2UoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICAgICAgcGVuZGluZ1Jlc3BvbnNlLnJlc29sdmVPbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMoZGV0YWlscyk7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG91bGRTYXZlQ29udGVudChzYXZlQ29udGVudE9wdGlvbiwgZGV0YWlscy50eXBlKSkge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdSZXNwb25zZS5hZGRSZXNwb25zZVJlc3BvbnNlQm9keUxpc3RlbmVyKGRldGFpbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJsb2NraW5nUmVzcG9uc2VUaGF0RG9lc05vdGhpbmc7XG4gICAgICAgIH07XG4gICAgICAgIGJyb3dzZXIud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIodGhpcy5vbkJlZm9yZVJlcXVlc3RMaXN0ZW5lciwgZmlsdGVyLCB0aGlzLmlzQ29udGVudFNhdmluZ0VuYWJsZWQoc2F2ZUNvbnRlbnRPcHRpb24pXG4gICAgICAgICAgICA/IFtcInJlcXVlc3RCb2R5XCIsIFwiYmxvY2tpbmdcIl1cbiAgICAgICAgICAgIDogW1wicmVxdWVzdEJvZHlcIl0pO1xuICAgICAgICB0aGlzLm9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lciA9IChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgcmVxdWVzdHMgbWFkZSBieSBleHRlbnNpb25zXG4gICAgICAgICAgICBpZiAocmVxdWVzdFN0ZW1zRnJvbUV4dGVuc2lvbihkZXRhaWxzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdSZXF1ZXN0ID0gdGhpcy5nZXRQZW5kaW5nUmVxdWVzdChkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgICAgICBwZW5kaW5nUmVxdWVzdC5yZXNvbHZlT25CZWZvcmVTZW5kSGVhZGVyc0V2ZW50RGV0YWlscyhkZXRhaWxzKTtcbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVTZW5kSGVhZGVyc0hhbmRsZXIoZGV0YWlscywgY3Jhd2xJRCwgaW5jcmVtZW50ZWRFdmVudE9yZGluYWwoKSk7XG4gICAgICAgIH07XG4gICAgICAgIGJyb3dzZXIud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyKHRoaXMub25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyLCBmaWx0ZXIsIFtcInJlcXVlc3RIZWFkZXJzXCJdKTtcbiAgICAgICAgdGhpcy5vbkJlZm9yZVJlZGlyZWN0TGlzdGVuZXIgPSAoZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgLy8gSWdub3JlIHJlcXVlc3RzIG1hZGUgYnkgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RTdGVtc0Zyb21FeHRlbnNpb24oZGV0YWlscykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlUmVkaXJlY3RIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQsIGluY3JlbWVudGVkRXZlbnRPcmRpbmFsKCkpO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25CZWZvcmVSZWRpcmVjdC5hZGRMaXN0ZW5lcih0aGlzLm9uQmVmb3JlUmVkaXJlY3RMaXN0ZW5lciwgZmlsdGVyLCBbXCJyZXNwb25zZUhlYWRlcnNcIl0pO1xuICAgICAgICB0aGlzLm9uQ29tcGxldGVkTGlzdGVuZXIgPSAoZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgLy8gSWdub3JlIHJlcXVlc3RzIG1hZGUgYnkgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RTdGVtc0Zyb21FeHRlbnNpb24oZGV0YWlscykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nUmVzcG9uc2UgPSB0aGlzLmdldFBlbmRpbmdSZXNwb25zZShkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgICAgICBwZW5kaW5nUmVzcG9uc2UucmVzb2x2ZU9uQ29tcGxldGVkRXZlbnREZXRhaWxzKGRldGFpbHMpO1xuICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlZEhhbmRsZXIoZGV0YWlscywgY3Jhd2xJRCwgaW5jcmVtZW50ZWRFdmVudE9yZGluYWwoKSwgc2F2ZUNvbnRlbnRPcHRpb24pO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25Db21wbGV0ZWQuYWRkTGlzdGVuZXIodGhpcy5vbkNvbXBsZXRlZExpc3RlbmVyLCBmaWx0ZXIsIFtcInJlc3BvbnNlSGVhZGVyc1wiXSk7XG4gICAgfVxuICAgIGNsZWFudXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlUmVxdWVzdExpc3RlbmVyKSB7XG4gICAgICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyKHRoaXMub25CZWZvcmVSZXF1ZXN0TGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lcikge1xuICAgICAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQmVmb3JlU2VuZEhlYWRlcnMucmVtb3ZlTGlzdGVuZXIodGhpcy5vbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlUmVkaXJlY3RMaXN0ZW5lcikge1xuICAgICAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVkaXJlY3QucmVtb3ZlTGlzdGVuZXIodGhpcy5vbkJlZm9yZVJlZGlyZWN0TGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uQ29tcGxldGVkTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIud2ViUmVxdWVzdC5vbkNvbXBsZXRlZC5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uQ29tcGxldGVkTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlzQ29udGVudFNhdmluZ0VuYWJsZWQoc2F2ZUNvbnRlbnRPcHRpb24pIHtcbiAgICAgICAgaWYgKHNhdmVDb250ZW50T3B0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZUNvbnRlbnRPcHRpb24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2F2ZUNvbnRlbnRSZXNvdXJjZVR5cGVzKHNhdmVDb250ZW50T3B0aW9uKS5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBzYXZlQ29udGVudFJlc291cmNlVHlwZXMoc2F2ZUNvbnRlbnRPcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIHNhdmVDb250ZW50T3B0aW9uLnNwbGl0KFwiLFwiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogV2UgcmVseSBvbiB0aGUgcmVzb3VyY2UgdHlwZSB0byBmaWx0ZXIgcmVzcG9uc2VzXG4gICAgICogU2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL01vemlsbGEvQWRkLW9ucy9XZWJFeHRlbnNpb25zL0FQSS93ZWJSZXF1ZXN0L1Jlc291cmNlVHlwZVxuICAgICAqXG4gICAgICogQHBhcmFtIHNhdmVDb250ZW50T3B0aW9uXG4gICAgICogQHBhcmFtIHJlc291cmNlVHlwZVxuICAgICAqL1xuICAgIHNob3VsZFNhdmVDb250ZW50KHNhdmVDb250ZW50T3B0aW9uLCByZXNvdXJjZVR5cGUpIHtcbiAgICAgICAgaWYgKHNhdmVDb250ZW50T3B0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZUNvbnRlbnRPcHRpb24gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2F2ZUNvbnRlbnRSZXNvdXJjZVR5cGVzKHNhdmVDb250ZW50T3B0aW9uKS5pbmNsdWRlcyhyZXNvdXJjZVR5cGUpO1xuICAgIH1cbiAgICBnZXRQZW5kaW5nUmVxdWVzdChyZXF1ZXN0SWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmdSZXF1ZXN0c1tyZXF1ZXN0SWRdKSB7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0c1tyZXF1ZXN0SWRdID0gbmV3IFBlbmRpbmdSZXF1ZXN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ1JlcXVlc3RzW3JlcXVlc3RJZF07XG4gICAgfVxuICAgIGdldFBlbmRpbmdSZXNwb25zZShyZXF1ZXN0SWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmdSZXNwb25zZXNbcmVxdWVzdElkXSkge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVzcG9uc2VzW3JlcXVlc3RJZF0gPSBuZXcgUGVuZGluZ1Jlc3BvbnNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ1Jlc3BvbnNlc1tyZXF1ZXN0SWRdO1xuICAgIH1cbiAgICAvKlxuICAgICAqIEhUVFAgUmVxdWVzdCBIYW5kbGVyIGFuZCBIZWxwZXIgRnVuY3Rpb25zXG4gICAgICovXG4gICAgYXN5bmMgb25CZWZvcmVTZW5kSGVhZGVyc0hhbmRsZXIoZGV0YWlscywgY3Jhd2xJRCwgZXZlbnRPcmRpbmFsKSB7XG4gICAgICAgIGNvbnN0IHRhYiA9IGRldGFpbHMudGFiSWQgPiAtMVxuICAgICAgICAgICAgPyBhd2FpdCBicm93c2VyLnRhYnMuZ2V0KGRldGFpbHMudGFiSWQpXG4gICAgICAgICAgICA6IHsgd2luZG93SWQ6IHVuZGVmaW5lZCwgaW5jb2duaXRvOiB1bmRlZmluZWQsIHVybDogdW5kZWZpbmVkIH07XG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9IHt9O1xuICAgICAgICB1cGRhdGUuaW5jb2duaXRvID0gYm9vbFRvSW50KHRhYi5pbmNvZ25pdG8pO1xuICAgICAgICB1cGRhdGUuYnJvd3Nlcl9pZCA9IGNyYXdsSUQ7XG4gICAgICAgIHVwZGF0ZS5leHRlbnNpb25fc2Vzc2lvbl91dWlkID0gZXh0ZW5zaW9uU2Vzc2lvblV1aWQ7XG4gICAgICAgIHVwZGF0ZS5ldmVudF9vcmRpbmFsID0gZXZlbnRPcmRpbmFsO1xuICAgICAgICB1cGRhdGUud2luZG93X2lkID0gdGFiLndpbmRvd0lkO1xuICAgICAgICB1cGRhdGUudGFiX2lkID0gZGV0YWlscy50YWJJZDtcbiAgICAgICAgdXBkYXRlLmZyYW1lX2lkID0gZGV0YWlscy5mcmFtZUlkO1xuICAgICAgICAvLyByZXF1ZXN0SWQgaXMgYSB1bmlxdWUgaWRlbnRpZmllciB0aGF0IGNhbiBiZSB1c2VkIHRvIGxpbmsgcmVxdWVzdHMgYW5kIHJlc3BvbnNlc1xuICAgICAgICB1cGRhdGUucmVxdWVzdF9pZCA9IE51bWJlcihkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgIGNvbnN0IHVybCA9IGRldGFpbHMudXJsO1xuICAgICAgICB1cGRhdGUudXJsID0gZXNjYXBlVXJsKHVybCk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RNZXRob2QgPSBkZXRhaWxzLm1ldGhvZDtcbiAgICAgICAgdXBkYXRlLm1ldGhvZCA9IGVzY2FwZVN0cmluZyhyZXF1ZXN0TWV0aG9kKTtcbiAgICAgICAgY29uc3QgY3VycmVudF90aW1lID0gbmV3IERhdGUoZGV0YWlscy50aW1lU3RhbXApO1xuICAgICAgICB1cGRhdGUudGltZV9zdGFtcCA9IGN1cnJlbnRfdGltZS50b0lTT1N0cmluZygpO1xuICAgICAgICBsZXQgZW5jb2RpbmdUeXBlID0gXCJcIjtcbiAgICAgICAgbGV0IHJlZmVycmVyID0gXCJcIjtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IFtdO1xuICAgICAgICBsZXQgaXNPY3NwID0gZmFsc2U7XG4gICAgICAgIGlmIChkZXRhaWxzLnJlcXVlc3RIZWFkZXJzKSB7XG4gICAgICAgICAgICBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzLm1hcCgocmVxdWVzdEhlYWRlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUgfSA9IHJlcXVlc3RIZWFkZXI7XG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyX3BhaXIgPSBbXTtcbiAgICAgICAgICAgICAgICBoZWFkZXJfcGFpci5wdXNoKGVzY2FwZVN0cmluZyhuYW1lKSk7XG4gICAgICAgICAgICAgICAgaGVhZGVyX3BhaXIucHVzaChlc2NhcGVTdHJpbmcodmFsdWUpKTtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLnB1c2goaGVhZGVyX3BhaXIpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lID09PSBcIkNvbnRlbnQtVHlwZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nVHlwZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5jb2RpbmdUeXBlLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9vY3NwLXJlcXVlc3RcIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc09jc3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuYW1lID09PSBcIlJlZmVyZXJcIikge1xuICAgICAgICAgICAgICAgICAgICByZWZlcnJlciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZS5yZWZlcnJlciA9IGVzY2FwZVN0cmluZyhyZWZlcnJlcik7XG4gICAgICAgIGlmIChyZXF1ZXN0TWV0aG9kID09PSBcIlBPU1RcIiAmJiAhaXNPY3NwIC8qIGRvbid0IHByb2Nlc3MgT0NTUCByZXF1ZXN0cyAqLykge1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1JlcXVlc3QgPSB0aGlzLmdldFBlbmRpbmdSZXF1ZXN0KGRldGFpbHMucmVxdWVzdElkKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcGVuZGluZ1JlcXVlc3QucmVzb2x2ZWRXaXRoaW5UaW1lb3V0KDEwMDApO1xuICAgICAgICAgICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLmxvZ0Vycm9yKFwiUGVuZGluZyByZXF1ZXN0IHRpbWVkIG91dCB3YWl0aW5nIGZvciBkYXRhIGZyb20gYm90aCBvbkJlZm9yZVJlcXVlc3QgYW5kIG9uQmVmb3JlU2VuZEhlYWRlcnMgZXZlbnRzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzID0gYXdhaXQgcGVuZGluZ1JlcXVlc3Qub25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5ID0gb25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzLnJlcXVlc3RCb2R5O1xuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0Qm9keSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0UGFyc2VyID0gbmV3IEh0dHBQb3N0UGFyc2VyKG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscywgdGhpcy5kYXRhUmVjZWl2ZXIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0T2JqID0gcG9zdFBhcnNlci5wYXJzZVBvc3RSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCAoUE9TVCkgcmVxdWVzdCBoZWFkZXJzIGZyb20gdXBsb2FkIHN0cmVhbVxuICAgICAgICAgICAgICAgICAgICBpZiAoXCJwb3N0X2hlYWRlcnNcIiBpbiBwb3N0T2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHN0b3JlIFBPU1QgaGVhZGVycyB0aGF0IHdlIGtub3cgYW5kIG5lZWQuIFdlIG1heSBtaXNpbnRlcnByZXQgUE9TVCBkYXRhIGFzIGhlYWRlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzIGRldGVjdGlvbiBpcyBiYXNlZCBvbiBcImtleTp2YWx1ZVwiIGZvcm1hdCAobm9uLWhlYWRlciBQT1NUIGRhdGEgY2FuIGJlIGluIHRoaXMgZm9ybWF0IGFzIHdlbGwpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50SGVhZGVycyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1EaXNwb3NpdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1MZW5ndGhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcG9zdE9iai5wb3N0X2hlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGVudEhlYWRlcnMuaW5jbHVkZXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyX3BhaXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyX3BhaXIucHVzaChlc2NhcGVTdHJpbmcobmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJfcGFpci5wdXNoKGVzY2FwZVN0cmluZyhwb3N0T2JqLnBvc3RfaGVhZGVyc1tuYW1lXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzLnB1c2goaGVhZGVyX3BhaXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBzdG9yZSBQT1NUIGJvZHkgaW4gSlNPTiBmb3JtYXQsIGV4Y2VwdCB3aGVuIGl0J3MgYSBzdHJpbmcgd2l0aG91dCBhIChrZXktdmFsdWUpIHN0cnVjdHVyZVxuICAgICAgICAgICAgICAgICAgICBpZiAoXCJwb3N0X2JvZHlcIiBpbiBwb3N0T2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUucG9zdF9ib2R5ID0gcG9zdE9iai5wb3N0X2JvZHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKFwicG9zdF9ib2R5X3Jhd1wiIGluIHBvc3RPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZS5wb3N0X2JvZHlfcmF3ID0gcG9zdE9iai5wb3N0X2JvZHlfcmF3O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZS5oZWFkZXJzID0gSlNPTi5zdHJpbmdpZnkoaGVhZGVycyk7XG4gICAgICAgIC8vIENoZWNrIGlmIHhoclxuICAgICAgICBjb25zdCBpc1hIUiA9IGRldGFpbHMudHlwZSA9PT0gXCJ4bWxodHRwcmVxdWVzdFwiO1xuICAgICAgICB1cGRhdGUuaXNfWEhSID0gYm9vbFRvSW50KGlzWEhSKTtcbiAgICAgICAgLy8gR3JhYiB0aGUgdHJpZ2dlcmluZyBhbmQgbG9hZGluZyBQcmluY2lwYWxzXG4gICAgICAgIGxldCB0cmlnZ2VyaW5nT3JpZ2luO1xuICAgICAgICBsZXQgbG9hZGluZ09yaWdpbjtcbiAgICAgICAgaWYgKGRldGFpbHMub3JpZ2luVXJsKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRPcmlnaW5VcmwgPSBuZXcgVVJMKGRldGFpbHMub3JpZ2luVXJsKTtcbiAgICAgICAgICAgIHRyaWdnZXJpbmdPcmlnaW4gPSBwYXJzZWRPcmlnaW5Vcmwub3JpZ2luO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZXRhaWxzLmRvY3VtZW50VXJsKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWREb2N1bWVudFVybCA9IG5ldyBVUkwoZGV0YWlscy5kb2N1bWVudFVybCk7XG4gICAgICAgICAgICBsb2FkaW5nT3JpZ2luID0gcGFyc2VkRG9jdW1lbnRVcmwub3JpZ2luO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZS50cmlnZ2VyaW5nX29yaWdpbiA9IGVzY2FwZVN0cmluZyh0cmlnZ2VyaW5nT3JpZ2luKTtcbiAgICAgICAgdXBkYXRlLmxvYWRpbmdfb3JpZ2luID0gZXNjYXBlU3RyaW5nKGxvYWRpbmdPcmlnaW4pO1xuICAgICAgICAvLyBsb2FkaW5nRG9jdW1lbnQncyBocmVmXG4gICAgICAgIC8vIFRoZSBsb2FkaW5nRG9jdW1lbnQgaXMgdGhlIGRvY3VtZW50IHRoZSBlbGVtZW50IHJlc2lkZXMsIHJlZ2FyZGxlc3Mgb2ZcbiAgICAgICAgLy8gaG93IHRoZSBsb2FkIHdhcyB0cmlnZ2VyZWQuXG4gICAgICAgIGNvbnN0IGxvYWRpbmdIcmVmID0gZGV0YWlscy5kb2N1bWVudFVybDtcbiAgICAgICAgdXBkYXRlLmxvYWRpbmdfaHJlZiA9IGVzY2FwZVN0cmluZyhsb2FkaW5nSHJlZik7XG4gICAgICAgIC8vIHJlc291cmNlVHlwZSBvZiB0aGUgcmVxdWVzdGluZyBub2RlLiBUaGlzIGlzIHNldCBieSB0aGUgdHlwZSBvZlxuICAgICAgICAvLyBub2RlIG1ha2luZyB0aGUgcmVxdWVzdCAoaS5lLiBhbiA8aW1nIHNyYz0uLi4+IG5vZGUgd2lsbCBzZXQgdG8gdHlwZSBcImltYWdlXCIpLlxuICAgICAgICAvLyBEb2N1bWVudGF0aW9uOlxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL01vemlsbGEvQWRkLW9ucy9XZWJFeHRlbnNpb25zL0FQSS93ZWJSZXF1ZXN0L1Jlc291cmNlVHlwZVxuICAgICAgICB1cGRhdGUucmVzb3VyY2VfdHlwZSA9IGRldGFpbHMudHlwZTtcbiAgICAgICAgLypcbiAgICAgICAgLy8gVE9ETzogUmVmYWN0b3IgdG8gY29ycmVzcG9uZGluZyB3ZWJleHQgbG9naWMgb3IgZGlzY2FyZFxuICAgICAgICBjb25zdCBUaGlyZFBhcnR5VXRpbCA9IENjW1wiQG1vemlsbGEub3JnL3RoaXJkcGFydHl1dGlsOzFcIl0uZ2V0U2VydmljZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDaS5tb3pJVGhpcmRQYXJ0eVV0aWwpO1xuICAgICAgICAvLyBEbyB0aGlyZC1wYXJ0eSBjaGVja3NcbiAgICAgICAgLy8gVGhlc2Ugc3BlY2lmaWMgY2hlY2tzIGFyZSBkb25lIGJlY2F1c2UgaXQncyB3aGF0J3MgdXNlZCBpbiBUcmFja2luZyBQcm90ZWN0aW9uXG4gICAgICAgIC8vIFNlZTogaHR0cDovL3NlYXJjaGZveC5vcmcvbW96aWxsYS1jZW50cmFsL3NvdXJjZS9uZXR3ZXJrL2Jhc2UvbnNDaGFubmVsQ2xhc3NpZmllci5jcHAjMTA3XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgaXNUaGlyZFBhcnR5Q2hhbm5lbCA9IFRoaXJkUGFydHlVdGlsLmlzVGhpcmRQYXJ0eUNoYW5uZWwoZGV0YWlscyk7XG4gICAgICAgICAgY29uc3QgdG9wV2luZG93ID0gVGhpcmRQYXJ0eVV0aWwuZ2V0VG9wV2luZG93Rm9yQ2hhbm5lbChkZXRhaWxzKTtcbiAgICAgICAgICBjb25zdCB0b3BVUkkgPSBUaGlyZFBhcnR5VXRpbC5nZXRVUklGcm9tV2luZG93KHRvcFdpbmRvdyk7XG4gICAgICAgICAgaWYgKHRvcFVSSSkge1xuICAgICAgICAgICAgY29uc3QgdG9wVXJsID0gdG9wVVJJLnNwZWM7XG4gICAgICAgICAgICBjb25zdCBjaGFubmVsVVJJID0gZGV0YWlscy5VUkk7XG4gICAgICAgICAgICBjb25zdCBpc1RoaXJkUGFydHlUb1RvcFdpbmRvdyA9IFRoaXJkUGFydHlVdGlsLmlzVGhpcmRQYXJ0eVVSSShcbiAgICAgICAgICAgICAgY2hhbm5lbFVSSSxcbiAgICAgICAgICAgICAgdG9wVVJJLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHVwZGF0ZS5pc190aGlyZF9wYXJ0eV90b190b3Bfd2luZG93ID0gaXNUaGlyZFBhcnR5VG9Ub3BXaW5kb3c7XG4gICAgICAgICAgICB1cGRhdGUuaXNfdGhpcmRfcGFydHlfY2hhbm5lbCA9IGlzVGhpcmRQYXJ0eUNoYW5uZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChhbkVycm9yKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9ucyBleHBlY3RlZCBmb3IgY2hhbm5lbHMgdHJpZ2dlcmVkIG9yIGxvYWRpbmcgaW4gYVxuICAgICAgICAgIC8vIE51bGxQcmluY2lwYWwgb3IgU3lzdGVtUHJpbmNpcGFsLiBUaGV5IGFyZSBhbHNvIGV4cGVjdGVkIGZvciBmYXZpY29uXG4gICAgICAgICAgLy8gbG9hZHMsIHdoaWNoIHdlIGF0dGVtcHQgdG8gZmlsdGVyLiBEZXBlbmRpbmcgb24gdGhlIG5hbWluZywgc29tZSBmYXZpY29uc1xuICAgICAgICAgIC8vIG1heSBjb250aW51ZSB0byBsZWFkIHRvIGVycm9yIGxvZ3MuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdXBkYXRlLnRyaWdnZXJpbmdfb3JpZ2luICE9PSBcIltTeXN0ZW0gUHJpbmNpcGFsXVwiICYmXG4gICAgICAgICAgICB1cGRhdGUudHJpZ2dlcmluZ19vcmlnaW4gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgdXBkYXRlLmxvYWRpbmdfb3JpZ2luICE9PSBcIltTeXN0ZW0gUHJpbmNpcGFsXVwiICYmXG4gICAgICAgICAgICB1cGRhdGUubG9hZGluZ19vcmlnaW4gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgIXVwZGF0ZS51cmwuZW5kc1dpdGgoXCJpY29cIilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLmxvZ0Vycm9yKFxuICAgICAgICAgICAgICBcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgYWRkaXRpb25hbCBjaGFubmVsIGluZm9ybWF0aW9uIGZvciBVUkw6IFwiICtcbiAgICAgICAgICAgICAgXCJcXG5cIiArXG4gICAgICAgICAgICAgIHVwZGF0ZS51cmwgK1xuICAgICAgICAgICAgICBcIlxcbiBFcnJvciB0ZXh0OlwiICtcbiAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoYW5FcnJvciksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAqL1xuICAgICAgICB1cGRhdGUudG9wX2xldmVsX3VybCA9IGVzY2FwZVVybCh0aGlzLmdldERvY3VtZW50VXJsRm9yUmVxdWVzdChkZXRhaWxzKSk7XG4gICAgICAgIHVwZGF0ZS5wYXJlbnRfZnJhbWVfaWQgPSBkZXRhaWxzLnBhcmVudEZyYW1lSWQ7XG4gICAgICAgIHVwZGF0ZS5mcmFtZV9hbmNlc3RvcnMgPSBlc2NhcGVTdHJpbmcoSlNPTi5zdHJpbmdpZnkoZGV0YWlscy5mcmFtZUFuY2VzdG9ycykpO1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiaHR0cF9yZXF1ZXN0c1wiLCB1cGRhdGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb2RlIHRha2VuIGFuZCBhZGFwdGVkIGZyb21cbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vRUZGb3JnL3ByaXZhY3liYWRnZXIvcHVsbC8yMTk4L2ZpbGVzXG4gICAgICpcbiAgICAgKiBHZXRzIHRoZSBVUkwgZm9yIGEgZ2l2ZW4gcmVxdWVzdCdzIHRvcC1sZXZlbCBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIFRoZSByZXF1ZXN0J3MgZG9jdW1lbnQgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBjdXJyZW50IHRvcC1sZXZlbCBkb2N1bWVudFxuICAgICAqIGxvYWRlZCBpbiB0YWIgYXMgcmVxdWVzdHMgY2FuIGNvbWUgb3V0IG9mIG9yZGVyOlxuICAgICAqXG4gICAgICogQHBhcmFtIHtXZWJSZXF1ZXN0T25CZWZvcmVTZW5kSGVhZGVyc0V2ZW50RGV0YWlsc30gZGV0YWlsc1xuICAgICAqXG4gICAgICogQHJldHVybiB7P1N0cmluZ30gdGhlIFVSTCBmb3IgdGhlIHJlcXVlc3QncyB0b3AtbGV2ZWwgZG9jdW1lbnRcbiAgICAgKi9cbiAgICBnZXREb2N1bWVudFVybEZvclJlcXVlc3QoZGV0YWlscykge1xuICAgICAgICBsZXQgdXJsID0gXCJcIjtcbiAgICAgICAgaWYgKGRldGFpbHMudHlwZSA9PT0gXCJtYWluX2ZyYW1lXCIpIHtcbiAgICAgICAgICAgIC8vIFVybCBvZiB0aGUgdG9wLWxldmVsIGRvY3VtZW50IGl0c2VsZi5cbiAgICAgICAgICAgIHVybCA9IGRldGFpbHMudXJsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRldGFpbHMuaGFzT3duUHJvcGVydHkoXCJmcmFtZUFuY2VzdG9yc1wiKSkge1xuICAgICAgICAgICAgLy8gSW4gY2FzZSBvZiBuZXN0ZWQgZnJhbWVzLCByZXRyaWV2ZSB1cmwgZnJvbSB0b3AtbW9zdCBhbmNlc3Rvci5cbiAgICAgICAgICAgIC8vIElmIGZyYW1lQW5jZXN0b3JzID09IFtdLCByZXF1ZXN0IGNvbWVzIGZyb20gdGhlIHRvcC1sZXZlbC1kb2N1bWVudC5cbiAgICAgICAgICAgIHVybCA9IGRldGFpbHMuZnJhbWVBbmNlc3RvcnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyBkZXRhaWxzLmZyYW1lQW5jZXN0b3JzW2RldGFpbHMuZnJhbWVBbmNlc3RvcnMubGVuZ3RoIC0gMV0udXJsXG4gICAgICAgICAgICAgICAgOiBkZXRhaWxzLmRvY3VtZW50VXJsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gdHlwZSAhPSAnbWFpbl9mcmFtZScgYW5kIGZyYW1lQW5jZXN0b3JzID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGUgc2VydmljZSB3b3JrZXJzOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xNDcwNTM3I2MxM1xuICAgICAgICAgICAgdXJsID0gZGV0YWlscy5kb2N1bWVudFVybDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICBhc3luYyBvbkJlZm9yZVJlZGlyZWN0SGFuZGxlcihkZXRhaWxzLCBjcmF3bElELCBldmVudE9yZGluYWwpIHtcbiAgICAgICAgLypcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJvbkJlZm9yZVJlZGlyZWN0SGFuZGxlciAocHJldmlvdXNseSBodHRwUmVxdWVzdEhhbmRsZXIpXCIsXG4gICAgICAgICAgZGV0YWlscyxcbiAgICAgICAgICBjcmF3bElELFxuICAgICAgICApO1xuICAgICAgICAqL1xuICAgICAgICAvLyBTYXZlIEhUVFAgcmVkaXJlY3QgZXZlbnRzXG4gICAgICAgIC8vIEV2ZW50cyBhcmUgc2F2ZWQgdG8gdGhlIGBodHRwX3JlZGlyZWN0c2AgdGFibGVcbiAgICAgICAgLypcbiAgICAgICAgLy8gVE9ETzogUmVmYWN0b3IgdG8gY29ycmVzcG9uZGluZyB3ZWJleHQgbG9naWMgb3IgZGlzY2FyZFxuICAgICAgICAvLyBFdmVudHMgYXJlIHNhdmVkIHRvIHRoZSBgaHR0cF9yZWRpcmVjdHNgIHRhYmxlLCBhbmQgbWFwIHRoZSBvbGRcbiAgICAgICAgLy8gcmVxdWVzdC9yZXNwb25zZSBjaGFubmVsIGlkIHRvIHRoZSBuZXcgcmVxdWVzdC9yZXNwb25zZSBjaGFubmVsIGlkLlxuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBiYXNlZCBvbjogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzExMjQwNjI3XG4gICAgICAgIGNvbnN0IG9sZE5vdGlmaWNhdGlvbnMgPSBkZXRhaWxzLm5vdGlmaWNhdGlvbkNhbGxiYWNrcztcbiAgICAgICAgbGV0IG9sZEV2ZW50U2luayA9IG51bGw7XG4gICAgICAgIGRldGFpbHMubm90aWZpY2F0aW9uQ2FsbGJhY2tzID0ge1xuICAgICAgICAgIFF1ZXJ5SW50ZXJmYWNlOiBYUENPTVV0aWxzLmdlbmVyYXRlUUkoW1xuICAgICAgICAgICAgQ2kubnNJSW50ZXJmYWNlUmVxdWVzdG9yLFxuICAgICAgICAgICAgQ2kubnNJQ2hhbm5lbEV2ZW50U2luayxcbiAgICAgICAgICBdKSxcbiAgICBcbiAgICAgICAgICBnZXRJbnRlcmZhY2UoaWlkKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgb25seSBpbnRlcmVzdGVkIGluIG5zSUNoYW5uZWxFdmVudFNpbmssXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIG9sZCBjYWxsYmFja3MgZm9yIGFueSBvdGhlciBpbnRlcmZhY2UgcmVxdWVzdHMuXG4gICAgICAgICAgICBpZiAoaWlkLmVxdWFscyhDaS5uc0lDaGFubmVsRXZlbnRTaW5rKSkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9sZEV2ZW50U2luayA9IG9sZE5vdGlmaWNhdGlvbnMuUXVlcnlJbnRlcmZhY2UoaWlkKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoYW5FcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLmxvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICAgXCJFcnJvciBkdXJpbmcgY2FsbCB0byBjdXN0b20gbm90aWZpY2F0aW9uQ2FsbGJhY2tzOjpnZXRJbnRlcmZhY2UuXCIgK1xuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShhbkVycm9yKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKG9sZE5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9sZE5vdGlmaWNhdGlvbnMuZ2V0SW50ZXJmYWNlKGlpZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBDci5OU19FUlJPUl9OT19JTlRFUkZBQ0U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICBcbiAgICAgICAgICBhc3luY09uQ2hhbm5lbFJlZGlyZWN0KG9sZENoYW5uZWwsIG5ld0NoYW5uZWwsIGZsYWdzLCBjYWxsYmFjaykge1xuICAgIFxuICAgICAgICAgICAgbmV3Q2hhbm5lbC5RdWVyeUludGVyZmFjZShDaS5uc0lIdHRwQ2hhbm5lbCk7XG4gICAgXG4gICAgICAgICAgICBjb25zdCBodHRwUmVkaXJlY3Q6IEh0dHBSZWRpcmVjdCA9IHtcbiAgICAgICAgICAgICAgYnJvd3Nlcl9pZDogY3Jhd2xJRCxcbiAgICAgICAgICAgICAgb2xkX3JlcXVlc3RfaWQ6IG9sZENoYW5uZWwuY2hhbm5lbElkLFxuICAgICAgICAgICAgICBuZXdfcmVxdWVzdF9pZDogbmV3Q2hhbm5lbC5jaGFubmVsSWQsXG4gICAgICAgICAgICAgIHRpbWVfc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiaHR0cF9yZWRpcmVjdHNcIiwgaHR0cFJlZGlyZWN0KTtcbiAgICBcbiAgICAgICAgICAgIGlmIChvbGRFdmVudFNpbmspIHtcbiAgICAgICAgICAgICAgb2xkRXZlbnRTaW5rLmFzeW5jT25DaGFubmVsUmVkaXJlY3QoXG4gICAgICAgICAgICAgICAgb2xkQ2hhbm5lbCxcbiAgICAgICAgICAgICAgICBuZXdDaGFubmVsLFxuICAgICAgICAgICAgICAgIGZsYWdzLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2sub25SZWRpcmVjdFZlcmlmeUNhbGxiYWNrKENyLk5TX09LKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICAqL1xuICAgICAgICBjb25zdCByZXNwb25zZVN0YXR1cyA9IGRldGFpbHMuc3RhdHVzQ29kZTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2VTdGF0dXNUZXh0ID0gZGV0YWlscy5zdGF0dXNMaW5lO1xuICAgICAgICBjb25zdCB0YWIgPSBkZXRhaWxzLnRhYklkID4gLTFcbiAgICAgICAgICAgID8gYXdhaXQgYnJvd3Nlci50YWJzLmdldChkZXRhaWxzLnRhYklkKVxuICAgICAgICAgICAgOiB7IHdpbmRvd0lkOiB1bmRlZmluZWQsIGluY29nbml0bzogdW5kZWZpbmVkIH07XG4gICAgICAgIGNvbnN0IGh0dHBSZWRpcmVjdCA9IHtcbiAgICAgICAgICAgIGluY29nbml0bzogYm9vbFRvSW50KHRhYi5pbmNvZ25pdG8pLFxuICAgICAgICAgICAgYnJvd3Nlcl9pZDogY3Jhd2xJRCxcbiAgICAgICAgICAgIG9sZF9yZXF1ZXN0X3VybDogZXNjYXBlVXJsKGRldGFpbHMudXJsKSxcbiAgICAgICAgICAgIG9sZF9yZXF1ZXN0X2lkOiBkZXRhaWxzLnJlcXVlc3RJZCxcbiAgICAgICAgICAgIG5ld19yZXF1ZXN0X3VybDogZXNjYXBlVXJsKGRldGFpbHMucmVkaXJlY3RVcmwpLFxuICAgICAgICAgICAgbmV3X3JlcXVlc3RfaWQ6IG51bGwsXG4gICAgICAgICAgICBleHRlbnNpb25fc2Vzc2lvbl91dWlkOiBleHRlbnNpb25TZXNzaW9uVXVpZCxcbiAgICAgICAgICAgIGV2ZW50X29yZGluYWw6IGV2ZW50T3JkaW5hbCxcbiAgICAgICAgICAgIHdpbmRvd19pZDogdGFiLndpbmRvd0lkLFxuICAgICAgICAgICAgdGFiX2lkOiBkZXRhaWxzLnRhYklkLFxuICAgICAgICAgICAgZnJhbWVfaWQ6IGRldGFpbHMuZnJhbWVJZCxcbiAgICAgICAgICAgIHJlc3BvbnNlX3N0YXR1czogcmVzcG9uc2VTdGF0dXMsXG4gICAgICAgICAgICByZXNwb25zZV9zdGF0dXNfdGV4dDogZXNjYXBlU3RyaW5nKHJlc3BvbnNlU3RhdHVzVGV4dCksXG4gICAgICAgICAgICBoZWFkZXJzOiB0aGlzLmpzb25pZnlIZWFkZXJzKGRldGFpbHMucmVzcG9uc2VIZWFkZXJzKS5oZWFkZXJzLFxuICAgICAgICAgICAgdGltZV9zdGFtcDogbmV3IERhdGUoZGV0YWlscy50aW1lU3RhbXApLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJodHRwX3JlZGlyZWN0c1wiLCBodHRwUmVkaXJlY3QpO1xuICAgIH1cbiAgICAvKlxuICAgICAqIEhUVFAgUmVzcG9uc2UgSGFuZGxlcnMgYW5kIEhlbHBlciBGdW5jdGlvbnNcbiAgICAgKi9cbiAgICBhc3luYyBsb2dXaXRoUmVzcG9uc2VCb2R5KGRldGFpbHMsIHVwZGF0ZSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nUmVzcG9uc2UgPSB0aGlzLmdldFBlbmRpbmdSZXNwb25zZShkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUJvZHlMaXN0ZW5lciA9IHBlbmRpbmdSZXNwb25zZS5yZXNwb25zZUJvZHlMaXN0ZW5lcjtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BCb2R5ID0gYXdhaXQgcmVzcG9uc2VCb2R5TGlzdGVuZXIuZ2V0UmVzcG9uc2VCb2R5KCk7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50SGFzaCA9IGF3YWl0IHJlc3BvbnNlQm9keUxpc3RlbmVyLmdldENvbnRlbnRIYXNoKCk7XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlQ29udGVudChyZXNwQm9keSwgZXNjYXBlU3RyaW5nKGNvbnRlbnRIYXNoKSk7XG4gICAgICAgICAgICB1cGRhdGUuY29udGVudF9oYXNoID0gY29udGVudEhhc2g7XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiaHR0cF9yZXNwb25zZXNcIiwgdXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgLy8gVE9ETzogUmVmYWN0b3IgdG8gY29ycmVzcG9uZGluZyB3ZWJleHQgbG9naWMgb3IgZGlzY2FyZFxuICAgICAgICAgICAgZGF0YVJlY2VpdmVyLmxvZ0Vycm9yKFxuICAgICAgICAgICAgICBcIlVuYWJsZSB0byByZXRyaWV2ZSByZXNwb25zZSBib2R5LlwiICsgSlNPTi5zdHJpbmdpZnkoYVJlYXNvbiksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdXBkYXRlLmNvbnRlbnRfaGFzaCA9IFwiPGVycm9yPlwiO1xuICAgICAgICAgICAgZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJodHRwX3Jlc3BvbnNlc1wiLCB1cGRhdGUpO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLmxvZ0Vycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIHJlc3BvbnNlIGJvZHkuXCIgK1xuICAgICAgICAgICAgICAgIFwiTGlrZWx5IGNhdXNlZCBieSBhIHByb2dyYW1taW5nIGVycm9yLiBFcnJvciBNZXNzYWdlOlwiICtcbiAgICAgICAgICAgICAgICBlcnIubmFtZSArXG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgK1xuICAgICAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgICAgIGVyci5zdGFjayk7XG4gICAgICAgICAgICB1cGRhdGUuY29udGVudF9oYXNoID0gXCI8ZXJyb3I+XCI7XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiaHR0cF9yZXNwb25zZXNcIiwgdXBkYXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBJbnN0cnVtZW50IEhUVFAgcmVzcG9uc2VzXG4gICAgYXN5bmMgb25Db21wbGV0ZWRIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQsIGV2ZW50T3JkaW5hbCwgc2F2ZUNvbnRlbnQpIHtcbiAgICAgICAgLypcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJvbkNvbXBsZXRlZEhhbmRsZXIgKHByZXZpb3VzbHkgaHR0cFJlcXVlc3RIYW5kbGVyKVwiLFxuICAgICAgICAgIGRldGFpbHMsXG4gICAgICAgICAgY3Jhd2xJRCxcbiAgICAgICAgICBzYXZlQ29udGVudCxcbiAgICAgICAgKTtcbiAgICAgICAgKi9cbiAgICAgICAgY29uc3QgdGFiID0gZGV0YWlscy50YWJJZCA+IC0xXG4gICAgICAgICAgICA/IGF3YWl0IGJyb3dzZXIudGFicy5nZXQoZGV0YWlscy50YWJJZClcbiAgICAgICAgICAgIDogeyB3aW5kb3dJZDogdW5kZWZpbmVkLCBpbmNvZ25pdG86IHVuZGVmaW5lZCB9O1xuICAgICAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICAgICAgdXBkYXRlLmluY29nbml0byA9IGJvb2xUb0ludCh0YWIuaW5jb2duaXRvKTtcbiAgICAgICAgdXBkYXRlLmJyb3dzZXJfaWQgPSBjcmF3bElEO1xuICAgICAgICB1cGRhdGUuZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZCA9IGV4dGVuc2lvblNlc3Npb25VdWlkO1xuICAgICAgICB1cGRhdGUuZXZlbnRfb3JkaW5hbCA9IGV2ZW50T3JkaW5hbDtcbiAgICAgICAgdXBkYXRlLndpbmRvd19pZCA9IHRhYi53aW5kb3dJZDtcbiAgICAgICAgdXBkYXRlLnRhYl9pZCA9IGRldGFpbHMudGFiSWQ7XG4gICAgICAgIHVwZGF0ZS5mcmFtZV9pZCA9IGRldGFpbHMuZnJhbWVJZDtcbiAgICAgICAgLy8gcmVxdWVzdElkIGlzIGEgdW5pcXVlIGlkZW50aWZpZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBsaW5rIHJlcXVlc3RzIGFuZCByZXNwb25zZXNcbiAgICAgICAgdXBkYXRlLnJlcXVlc3RfaWQgPSBOdW1iZXIoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICBjb25zdCBpc0NhY2hlZCA9IGRldGFpbHMuZnJvbUNhY2hlO1xuICAgICAgICB1cGRhdGUuaXNfY2FjaGVkID0gYm9vbFRvSW50KGlzQ2FjaGVkKTtcbiAgICAgICAgY29uc3QgdXJsID0gZGV0YWlscy51cmw7XG4gICAgICAgIHVwZGF0ZS51cmwgPSBlc2NhcGVVcmwodXJsKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdE1ldGhvZCA9IGRldGFpbHMubWV0aG9kO1xuICAgICAgICB1cGRhdGUubWV0aG9kID0gZXNjYXBlU3RyaW5nKHJlcXVlc3RNZXRob2QpO1xuICAgICAgICAvLyBUT0RPOiBSZWZhY3RvciB0byBjb3JyZXNwb25kaW5nIHdlYmV4dCBsb2dpYyBvciBkaXNjYXJkXG4gICAgICAgIC8vIChyZXF1ZXN0IGhlYWRlcnMgYXJlIG5vdCBhdmFpbGFibGUgaW4gaHR0cCByZXNwb25zZSBldmVudCBsaXN0ZW5lciBvYmplY3QsXG4gICAgICAgIC8vIGJ1dCB0aGUgcmVmZXJyZXIgcHJvcGVydHkgb2YgdGhlIGNvcnJlc3BvbmRpbmcgcmVxdWVzdCBjb3VsZCBiZSBxdWVyaWVkKVxuICAgICAgICAvL1xuICAgICAgICAvLyBsZXQgcmVmZXJyZXIgPSBcIlwiO1xuICAgICAgICAvLyBpZiAoZGV0YWlscy5yZWZlcnJlcikge1xuICAgICAgICAvLyAgIHJlZmVycmVyID0gZGV0YWlscy5yZWZlcnJlci5zcGVjO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIHVwZGF0ZS5yZWZlcnJlciA9IGVzY2FwZVN0cmluZyhyZWZlcnJlcik7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlU3RhdHVzID0gZGV0YWlscy5zdGF0dXNDb2RlO1xuICAgICAgICB1cGRhdGUucmVzcG9uc2Vfc3RhdHVzID0gcmVzcG9uc2VTdGF0dXM7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlU3RhdHVzVGV4dCA9IGRldGFpbHMuc3RhdHVzTGluZTtcbiAgICAgICAgdXBkYXRlLnJlc3BvbnNlX3N0YXR1c190ZXh0ID0gZXNjYXBlU3RyaW5nKHJlc3BvbnNlU3RhdHVzVGV4dCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5ldyBEYXRlKGRldGFpbHMudGltZVN0YW1wKTtcbiAgICAgICAgdXBkYXRlLnRpbWVfc3RhbXAgPSBjdXJyZW50X3RpbWUudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgcGFyc2VkSGVhZGVycyA9IHRoaXMuanNvbmlmeUhlYWRlcnMoZGV0YWlscy5yZXNwb25zZUhlYWRlcnMpO1xuICAgICAgICB1cGRhdGUuaGVhZGVycyA9IHBhcnNlZEhlYWRlcnMuaGVhZGVycztcbiAgICAgICAgdXBkYXRlLmxvY2F0aW9uID0gcGFyc2VkSGVhZGVycy5sb2NhdGlvbjtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2F2ZUNvbnRlbnQoc2F2ZUNvbnRlbnQsIGRldGFpbHMudHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nV2l0aFJlc3BvbnNlQm9keShkZXRhaWxzLCB1cGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImh0dHBfcmVzcG9uc2VzXCIsIHVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAganNvbmlmeUhlYWRlcnMoaGVhZGVycykge1xuICAgICAgICBjb25zdCByZXN1bHRIZWFkZXJzID0gW107XG4gICAgICAgIGxldCBsb2NhdGlvbiA9IFwiXCI7XG4gICAgICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICAgICAgICBoZWFkZXJzLm1hcCgocmVzcG9uc2VIZWFkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IG5hbWUsIHZhbHVlIH0gPSByZXNwb25zZUhlYWRlcjtcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJfcGFpciA9IFtdO1xuICAgICAgICAgICAgICAgIGhlYWRlcl9wYWlyLnB1c2goZXNjYXBlU3RyaW5nKG5hbWUpKTtcbiAgICAgICAgICAgICAgICBoZWFkZXJfcGFpci5wdXNoKGVzY2FwZVN0cmluZyh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdEhlYWRlcnMucHVzaChoZWFkZXJfcGFpcik7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJsb2NhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IEpTT04uc3RyaW5naWZ5KHJlc3VsdEhlYWRlcnMpLFxuICAgICAgICAgICAgbG9jYXRpb246IGVzY2FwZVN0cmluZyhsb2NhdGlvbiksXG4gICAgICAgIH07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYUhSMGNDMXBibk4wY25WdFpXNTBMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMMkpoWTJ0bmNtOTFibVF2YUhSMGNDMXBibk4wY25WdFpXNTBMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFOUJRVThzUlVGQlJTeDFRa0ZCZFVJc1JVRkJSU3hOUVVGTkxIZERRVUYzUXl4RFFVRkRPMEZCUTJwR0xFOUJRVThzUlVGQlJTeHZRa0ZCYjBJc1JVRkJSU3hOUVVGTkxDdENRVUVyUWl4RFFVRkRPMEZCUTNKRkxFOUJRVThzUlVGQlJTeGpRVUZqTEVWQlFYRkNMRTFCUVUwc2VVSkJRWGxDTEVOQlFVTTdRVUZETlVVc1QwRkJUeXhGUVVGRkxHTkJRV01zUlVGQlJTeE5RVUZOTEhkQ1FVRjNRaXhEUVVGRE8wRkJRM2hFTEU5QlFVOHNSVUZCUlN4bFFVRmxMRVZCUVVVc1RVRkJUU3g1UWtGQmVVSXNRMEZCUXp0QlFVTXhSQ3hQUVVGUExFVkJRVVVzVTBGQlV5eEZRVUZGTEZsQlFWa3NSVUZCUlN4VFFVRlRMRVZCUVVVc1RVRkJUU3h4UWtGQmNVSXNRMEZCUXp0QlFXVjZSVHM3T3pzN08wZEJUVWM3UVVGRlNDeE5RVUZOTEZGQlFWRXNSMEZCYlVJN1NVRkRMMElzVVVGQlVUdEpRVU5TTEZsQlFWazdTVUZEV2l4TlFVRk5PMGxCUTA0c1QwRkJUenRKUVVOUUxGVkJRVlU3U1VGRFZpeFpRVUZaTzBsQlExb3NUMEZCVHp0SlFVTlFMRkZCUVZFN1NVRkRVaXh0UWtGQmJVSTdTVUZEYmtJc1RVRkJUVHRKUVVOT0xGRkJRVkU3U1VGRFVpeGhRVUZoTzBsQlEySXNXVUZCV1R0SlFVTmFMRmRCUVZjN1NVRkRXQ3hqUVVGak8wbEJRMlFzVjBGQlZ6dEpRVU5ZTEZOQlFWTTdTVUZEVkN4blFrRkJaMEk3U1VGRGFFSXNUVUZCVFR0SlFVTk9MRTlCUVU4N1EwRkRVaXhEUVVGRE8wRkJSVVlzVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4RFFVRkRPMEZCUlhCQ0xFMUJRVTBzVDBGQlR5eGpRVUZqTzBsQlExSXNXVUZCV1N4RFFVRkRPMGxCUTNSQ0xHVkJRV1VzUjBGRmJrSXNSVUZCUlN4RFFVRkRPMGxCUTBNc1owSkJRV2RDTEVkQlJYQkNMRVZCUVVVc1EwRkJRenRKUVVORExIVkNRVUYxUWl4RFFVRkRPMGxCUTNoQ0xESkNRVUV5UWl4RFFVRkRPMGxCUXpWQ0xIZENRVUYzUWl4RFFVRkRPMGxCUTNwQ0xHMUNRVUZ0UWl4RFFVRkRPMGxCUlRWQ0xGbEJRVmtzV1VGQldUdFJRVU4wUWl4SlFVRkpMRU5CUVVNc1dVRkJXU3hIUVVGSExGbEJRVmtzUTBGQlF6dEpRVU51UXl4RFFVRkRPMGxCUlUwc1IwRkJSeXhEUVVGRExFOUJRVThzUlVGQlJTeHBRa0ZCYjBNN1VVRkRkRVFzVFVGQlRTeE5RVUZOTEVkQlFXdENMRVZCUVVVc1NVRkJTU3hGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEVWQlFVVXNTMEZCU3l4RlFVRkZMRkZCUVZFc1JVRkJSU3hEUVVGRE8xRkJSWGhGTEUxQlFVMHNlVUpCUVhsQ0xFZEJRVWNzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlR0WlFVTTFReXhQUVVGUExFTkJRMHdzVDBGQlR5eERRVUZETEZOQlFWTXNTVUZCU1N4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVU40UlN4RFFVRkRPMUZCUTBvc1EwRkJReXhEUVVGRE8xRkJSVVk3TzFkQlJVYzdVVUZGU0N4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTEVkQlFVY3NRMEZETjBJc1QwRkJPRU1zUlVGRE9VTXNSVUZCUlR0WlFVTkdMRTFCUVUwc0swSkJRU3RDTEVkQlFYRkNMRVZCUVVVc1EwRkJRenRaUVVNM1JDeHhRMEZCY1VNN1dVRkRja01zU1VGQlNTeDVRa0ZCZVVJc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdG5Ra0ZEZEVNc1QwRkJUeXdyUWtGQkswSXNRMEZCUXp0aFFVTjRRenRaUVVORUxFMUJRVTBzWTBGQll5eEhRVUZITEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1dVRkRha1VzWTBGQll5eERRVUZETEd0RFFVRnJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFsQlF6TkVMRTFCUVUwc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdXVUZEYmtVc1pVRkJaU3hEUVVGRExHdERRVUZyUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xbEJRelZFTEVsQlFVa3NTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETEdsQ1FVRnBRaXhGUVVGRkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0blFrRkRNMFFzWlVGQlpTeERRVUZETEN0Q1FVRXJRaXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzJGQlF6RkVPMWxCUTBRc1QwRkJUeXdyUWtGQkswSXNRMEZCUXp0UlFVTjZReXhEUVVGRExFTkJRVU03VVVGRFJpeFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMR1ZCUVdVc1EwRkJReXhYUVVGWExFTkJRelZETEVsQlFVa3NRMEZCUXl4MVFrRkJkVUlzUlVGRE5VSXNUVUZCVFN4RlFVTk9MRWxCUVVrc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4cFFrRkJhVUlzUTBGQlF6dFpRVU0xUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhoUVVGaExFVkJRVVVzVlVGQlZTeERRVUZETzFsQlF6ZENMRU5CUVVNc1EwRkJReXhEUVVGRExHRkJRV0VzUTBGQlF5eERRVU53UWl4RFFVRkRPMUZCUlVZc1NVRkJTU3hEUVVGRExESkNRVUV5UWl4SFFVRkhMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVU3V1VGRE4wTXNjVU5CUVhGRE8xbEJRM0pETEVsQlFVa3NlVUpCUVhsQ0xFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVTdaMEpCUTNSRExFOUJRVTg3WVVGRFVqdFpRVU5FTEUxQlFVMHNZMEZCWXl4SFFVRkhMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03V1VGRGFrVXNZMEZCWXl4RFFVRkRMSE5EUVVGelF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMWxCUXk5RUxFbEJRVWtzUTBGQlF5d3dRa0ZCTUVJc1EwRkROMElzVDBGQlR5eEZRVU5RTEU5QlFVOHNSVUZEVUN4MVFrRkJkVUlzUlVGQlJTeERRVU14UWl4RFFVRkRPMUZCUTBvc1EwRkJReXhEUVVGRE8xRkJRMFlzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4dFFrRkJiVUlzUTBGQlF5eFhRVUZYTEVOQlEyaEVMRWxCUVVrc1EwRkJReXd5UWtGQk1rSXNSVUZEYUVNc1RVRkJUU3hGUVVOT0xFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkRia0lzUTBGQlF6dFJRVVZHTEVsQlFVa3NRMEZCUXl4M1FrRkJkMElzUjBGQlJ5eERRVUZETEU5QlFVOHNSVUZCUlN4RlFVRkZPMWxCUXpGRExIRkRRVUZ4UXp0WlFVTnlReXhKUVVGSkxIbENRVUY1UWl4RFFVRkRMRTlCUVU4c1EwRkJReXhGUVVGRk8yZENRVU4wUXl4UFFVRlBPMkZCUTFJN1dVRkRSQ3hKUVVGSkxFTkJRVU1zZFVKQlFYVkNMRU5CUVVNc1QwRkJUeXhGUVVGRkxFOUJRVThzUlVGQlJTeDFRa0ZCZFVJc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRE5VVXNRMEZCUXl4RFFVRkRPMUZCUTBZc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhYUVVGWExFTkJRemRETEVsQlFVa3NRMEZCUXl4M1FrRkJkMElzUlVGRE4wSXNUVUZCVFN4RlFVTk9MRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNRMEZEY0VJc1EwRkJRenRSUVVWR0xFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1IwRkJSeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTzFsQlEzSkRMSEZEUVVGeFF6dFpRVU55UXl4SlFVRkpMSGxDUVVGNVFpeERRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMmRDUVVOMFF5eFBRVUZQTzJGQlExSTdXVUZEUkN4TlFVRk5MR1ZCUVdVc1IwRkJSeXhKUVVGSkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFsQlEyNUZMR1ZCUVdVc1EwRkJReXc0UWtGQk9FSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRaUVVONFJDeEpRVUZKTEVOQlFVTXNhMEpCUVd0Q0xFTkJRM0pDTEU5QlFVOHNSVUZEVUN4UFFVRlBMRVZCUTFBc2RVSkJRWFZDTEVWQlFVVXNSVUZEZWtJc2FVSkJRV2xDTEVOQlEyeENMRU5CUVVNN1VVRkRTaXhEUVVGRExFTkJRVU03VVVGRFJpeFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRmRCUVZjc1EwRkJReXhYUVVGWExFTkJRM2hETEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUlVGRGVFSXNUVUZCVFN4RlFVTk9MRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNRMEZEY0VJc1EwRkJRenRKUVVOS0xFTkJRVU03U1VGRlRTeFBRVUZQTzFGQlExb3NTVUZCU1N4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTEVWQlFVVTdXVUZEYUVNc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eGxRVUZsTEVOQlFVTXNZMEZCWXl4RFFVTXZReXhKUVVGSkxFTkJRVU1zZFVKQlFYVkNMRU5CUXpkQ0xFTkJRVU03VTBGRFNEdFJRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMREpDUVVFeVFpeEZRVUZGTzFsQlEzQkRMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1kwRkJZeXhEUVVOdVJDeEpRVUZKTEVOQlFVTXNNa0pCUVRKQ0xFTkJRMnBETEVOQlFVTTdVMEZEU0R0UlFVTkVMRWxCUVVrc1NVRkJTU3hEUVVGRExIZENRVUYzUWl4RlFVRkZPMWxCUTJwRExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zWTBGQll5eERRVU5vUkN4SlFVRkpMRU5CUVVNc2QwSkJRWGRDTEVOQlF6bENMRU5CUVVNN1UwRkRTRHRSUVVORUxFbEJRVWtzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhGUVVGRk8xbEJRelZDTEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1YwRkJWeXhEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zUTBGQlF6dFRRVU42UlR0SlFVTklMRU5CUVVNN1NVRkZUeXh6UWtGQmMwSXNRMEZCUXl4cFFrRkJiME03VVVGRGFrVXNTVUZCU1N4cFFrRkJhVUlzUzBGQlN5eEpRVUZKTEVWQlFVVTdXVUZET1VJc1QwRkJUeXhKUVVGSkxFTkJRVU03VTBGRFlqdFJRVU5FTEVsQlFVa3NhVUpCUVdsQ0xFdEJRVXNzUzBGQlN5eEZRVUZGTzFsQlF5OUNMRTlCUVU4c1MwRkJTeXhEUVVGRE8xTkJRMlE3VVVGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4M1FrRkJkMElzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZEY2tVc1EwRkJRenRKUVVWUExIZENRVUYzUWl4RFFVRkRMR2xDUVVGNVFqdFJRVU40UkN4UFFVRlBMR2xDUVVGcFFpeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVcxQ0xFTkJRVU03U1VGRGVFUXNRMEZCUXp0SlFVVkVPenM3T3pzN1QwRk5SenRKUVVOTExHbENRVUZwUWl4RFFVTjJRaXhwUWtGQmIwTXNSVUZEY0VNc1dVRkJNRUk3VVVGRk1VSXNTVUZCU1N4cFFrRkJhVUlzUzBGQlN5eEpRVUZKTEVWQlFVVTdXVUZET1VJc1QwRkJUeXhKUVVGSkxFTkJRVU03VTBGRFlqdFJRVU5FTEVsQlFVa3NhVUpCUVdsQ0xFdEJRVXNzUzBGQlN5eEZRVUZGTzFsQlF5OUNMRTlCUVU4c1MwRkJTeXhEUVVGRE8xTkJRMlE3VVVGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4M1FrRkJkMElzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGRE9VUXNXVUZCV1N4RFFVTmlMRU5CUVVNN1NVRkRTaXhEUVVGRE8wbEJSVThzYVVKQlFXbENMRU5CUVVNc1UwRkJVenRSUVVOcVF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhUUVVGVExFTkJRVU1zUlVGQlJUdFpRVU53UXl4SlFVRkpMRU5CUVVNc1pVRkJaU3hEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVsQlFVa3NZMEZCWXl4RlFVRkZMRU5CUVVNN1UwRkRlRVE3VVVGRFJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4bFFVRmxMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03U1VGRGVrTXNRMEZCUXp0SlFVVlBMR3RDUVVGclFpeERRVUZETEZOQlFWTTdVVUZEYkVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFTkJRVU1zUlVGQlJUdFpRVU55UXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hsUVVGbExFVkJRVVVzUTBGQlF6dFRRVU14UkR0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8wbEJRekZETEVOQlFVTTdTVUZGUkRzN1QwRkZSenRKUVVWTExFdEJRVXNzUTBGQlF5d3dRa0ZCTUVJc1EwRkRkRU1zVDBGQmEwUXNSVUZEYkVRc1QwRkJUeXhGUVVOUUxGbEJRVzlDTzFGQlJYQkNMRTFCUVUwc1IwRkJSeXhIUVVOUUxFOUJRVThzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRPMWxCUTJoQ0xFTkJRVU1zUTBGQlF5eE5RVUZOTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTTdXVUZEZGtNc1EwRkJReXhEUVVGRExFVkJRVVVzVVVGQlVTeEZRVUZGTEZOQlFWTXNSVUZCUlN4VFFVRlRMRVZCUVVVc1UwRkJVeXhGUVVGRkxFZEJRVWNzUlVGQlJTeFRRVUZUTEVWQlFVVXNRMEZCUXp0UlFVVndSU3hOUVVGTkxFMUJRVTBzUjBGQlJ5eEZRVUZwUWl4RFFVRkRPMUZCUldwRExFMUJRVTBzUTBGQlF5eFRRVUZUTEVkQlFVY3NVMEZCVXl4RFFVRkRMRWRCUVVjc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVU0xUXl4TlFVRk5MRU5CUVVNc1ZVRkJWU3hIUVVGSExFOUJRVThzUTBGQlF6dFJRVU0xUWl4TlFVRk5MRU5CUVVNc2MwSkJRWE5DTEVkQlFVY3NiMEpCUVc5Q0xFTkJRVU03VVVGRGNrUXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1IwRkJSeXhaUVVGWkxFTkJRVU03VVVGRGNFTXNUVUZCVFN4RFFVRkRMRk5CUVZNc1IwRkJSeXhIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETzFGQlEyaERMRTFCUVUwc1EwRkJReXhOUVVGTkxFZEJRVWNzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXp0UlFVTTVRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeEhRVUZITEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNN1VVRkZiRU1zYlVaQlFXMUdPMUZCUTI1R0xFMUJRVTBzUTBGQlF5eFZRVUZWTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVVU1UXl4TlFVRk5MRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETzFGQlEzaENMRTFCUVUwc1EwRkJReXhIUVVGSExFZEJRVWNzVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUlRWQ0xFMUJRVTBzWVVGQllTeEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNN1VVRkRja01zVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4WlFVRlpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03VVVGRk5VTXNUVUZCVFN4WlFVRlpMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMUZCUTJwRUxFMUJRVTBzUTBGQlF5eFZRVUZWTEVkQlFVY3NXVUZCV1N4RFFVRkRMRmRCUVZjc1JVRkJSU3hEUVVGRE8xRkJSUzlETEVsQlFVa3NXVUZCV1N4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVOMFFpeEpRVUZKTEZGQlFWRXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRiRUlzVFVGQlRTeFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTI1Q0xFbEJRVWtzVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXp0UlFVTnVRaXhKUVVGSkxFOUJRVThzUTBGQlF5eGpRVUZqTEVWQlFVVTdXVUZETVVJc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4aFFVRmhMRVZCUVVVc1JVRkJSVHRuUWtGRE0wTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1JVRkJSU3hMUVVGTExFVkJRVVVzUjBGQlJ5eGhRVUZoTEVOQlFVTTdaMEpCUTNSRExFMUJRVTBzVjBGQlZ5eEhRVUZITEVWQlFVVXNRMEZCUXp0blFrRkRka0lzVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEY2tNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGRFTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dG5Ra0ZETVVJc1NVRkJTU3hKUVVGSkxFdEJRVXNzWTBGQll5eEZRVUZGTzI5Q1FVTXpRaXhaUVVGWkxFZEJRVWNzUzBGQlN5eERRVUZETzI5Q1FVTnlRaXhKUVVGSkxGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNNRUpCUVRCQ0xFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNSVUZCUlR0M1FrRkRNMFFzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXp0eFFrRkRaanRwUWtGRFJqdG5Ra0ZEUkN4SlFVRkpMRWxCUVVrc1MwRkJTeXhUUVVGVExFVkJRVVU3YjBKQlEzUkNMRkZCUVZFc1IwRkJSeXhMUVVGTExFTkJRVU03YVVKQlEyeENPMWxCUTBnc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRFNqdFJRVVZFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRWRCUVVjc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlJYcERMRWxCUVVrc1lVRkJZU3hMUVVGTExFMUJRVTBzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4cFEwRkJhVU1zUlVGQlJUdFpRVU42UlN4TlFVRk5MR05CUVdNc1IwRkJSeXhKUVVGSkxFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFsQlEycEZMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzWTBGQll5eERRVUZETEhGQ1FVRnhRaXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlEyeEZMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVU3WjBKQlEySXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhSUVVGUkxFTkJRM2hDTEhGSFFVRnhSeXhEUVVOMFJ5eERRVUZETzJGQlEwZzdhVUpCUVUwN1owSkJRMHdzVFVGQlRTd3lRa0ZCTWtJc1IwRkRMMElzVFVGQlRTeGpRVUZqTEVOQlFVTXNNa0pCUVRKQ0xFTkJRVU03WjBKQlEyNUVMRTFCUVUwc1YwRkJWeXhIUVVGSExESkNRVUV5UWl4RFFVRkRMRmRCUVZjc1EwRkJRenRuUWtGRk5VUXNTVUZCU1N4WFFVRlhMRVZCUVVVN2IwSkJRMllzVFVGQlRTeFZRVUZWTEVkQlFVY3NTVUZCU1N4alFVRmpMRU5CUTI1RExESkNRVUV5UWl4RlFVTXpRaXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVU5zUWl4RFFVRkRPMjlDUVVOR0xFMUJRVTBzVDBGQlR5eEhRVUZ6UWl4VlFVRlZMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNRMEZCUXp0dlFrRkZha1VzWjBSQlFXZEVPMjlDUVVOb1JDeEpRVUZKTEdOQlFXTXNTVUZCU1N4UFFVRlBMRVZCUVVVN2QwSkJRemRDTERCR1FVRXdSanQzUWtGRE1VWXNiVWRCUVcxSE8zZENRVU51Unl4TlFVRk5MR05CUVdNc1IwRkJSenMwUWtGRGNrSXNZMEZCWXpzMFFrRkRaQ3h4UWtGQmNVSTdORUpCUTNKQ0xHZENRVUZuUWp0NVFrRkRha0lzUTBGQlF6dDNRa0ZEUml4TFFVRkxMRTFCUVUwc1NVRkJTU3hKUVVGSkxFOUJRVThzUTBGQlF5eFpRVUZaTEVWQlFVVTdORUpCUTNaRExFbEJRVWtzWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSVHRuUTBGRGFrTXNUVUZCVFN4WFFVRlhMRWRCUVVjc1JVRkJSU3hEUVVGRE8yZERRVU4yUWl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmREUVVOeVF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhQUVVGUExFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUTBGRE0wUXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6czJRa0ZETTBJN2VVSkJRMFk3Y1VKQlEwWTdiMEpCUTBRc0swWkJRU3RHTzI5Q1FVTXZSaXhKUVVGSkxGZEJRVmNzU1VGQlNTeFBRVUZQTEVWQlFVVTdkMEpCUXpGQ0xFMUJRVTBzUTBGQlF5eFRRVUZUTEVkQlFVY3NUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJRenR4UWtGRGRFTTdiMEpCUTBRc1NVRkJTU3hsUVVGbExFbEJRVWtzVDBGQlR5eEZRVUZGTzNkQ1FVTTVRaXhOUVVGTkxFTkJRVU1zWVVGQllTeEhRVUZITEU5QlFVOHNRMEZCUXl4aFFVRmhMRU5CUVVNN2NVSkJRemxETzJsQ1FVTkdPMkZCUTBZN1UwRkRSanRSUVVWRUxFMUJRVTBzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFJRVVY2UXl4bFFVRmxPMUZCUTJZc1RVRkJUU3hMUVVGTExFZEJRVWNzVDBGQlR5eERRVUZETEVsQlFVa3NTMEZCU3l4blFrRkJaMElzUTBGQlF6dFJRVU5vUkN4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVVnFReXcyUTBGQk5rTTdVVUZETjBNc1NVRkJTU3huUWtGQlowSXNRMEZCUXp0UlFVTnlRaXhKUVVGSkxHRkJRV0VzUTBGQlF6dFJRVU5zUWl4SlFVRkpMRTlCUVU4c1EwRkJReXhUUVVGVExFVkJRVVU3V1VGRGNrSXNUVUZCVFN4bFFVRmxMRWRCUVVjc1NVRkJTU3hIUVVGSExFTkJRVU1zVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMWxCUTI1RUxHZENRVUZuUWl4SFFVRkhMR1ZCUVdVc1EwRkJReXhOUVVGTkxFTkJRVU03VTBGRE0wTTdVVUZEUkN4SlFVRkpMRTlCUVU4c1EwRkJReXhYUVVGWExFVkJRVVU3V1VGRGRrSXNUVUZCVFN4cFFrRkJhVUlzUjBGQlJ5eEpRVUZKTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03V1VGRGRrUXNZVUZCWVN4SFFVRkhMR2xDUVVGcFFpeERRVUZETEUxQlFVMHNRMEZCUXp0VFFVTXhRenRSUVVORUxFMUJRVTBzUTBGQlF5eHBRa0ZCYVVJc1IwRkJSeXhaUVVGWkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenRSUVVNeFJDeE5RVUZOTEVOQlFVTXNZMEZCWXl4SFFVRkhMRmxCUVZrc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dFJRVVZ3UkN4NVFrRkJlVUk3VVVGRGVrSXNlVVZCUVhsRk8xRkJRM3BGTERoQ1FVRTRRanRSUVVNNVFpeE5RVUZOTEZkQlFWY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1YwRkJWeXhEUVVGRE8xRkJRM2hETEUxQlFVMHNRMEZCUXl4WlFVRlpMRWRCUVVjc1dVRkJXU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFGQlJXaEVMR3RGUVVGclJUdFJRVU5zUlN4cFJrRkJhVVk3VVVGRGFrWXNhVUpCUVdsQ08xRkJRMnBDTEhGSFFVRnhSenRSUVVOeVJ5eE5RVUZOTEVOQlFVTXNZVUZCWVN4SFFVRkhMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU03VVVGRmNFTTdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3p0VlFUQkRSVHRSUVVOR0xFMUJRVTBzUTBGQlF5eGhRVUZoTEVkQlFVY3NVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXgzUWtGQmQwSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM3BGTEUxQlFVMHNRMEZCUXl4bFFVRmxMRWRCUVVjc1QwRkJUeXhEUVVGRExHRkJRV0VzUTBGQlF6dFJRVU12UXl4TlFVRk5MRU5CUVVNc1pVRkJaU3hIUVVGSExGbEJRVmtzUTBGRGJrTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhQUVVGUExFTkJRVU1zWTBGQll5eERRVUZETEVOQlEzWkRMRU5CUVVNN1VVRkRSaXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZWQlFWVXNRMEZCUXl4bFFVRmxMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03U1VGRGVFUXNRMEZCUXp0SlFVVkVPenM3T3pzN096czdPenM3VDBGWlJ6dEpRVU5MTEhkQ1FVRjNRaXhEUVVNNVFpeFBRVUZyUkR0UlFVVnNSQ3hKUVVGSkxFZEJRVWNzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZGWWl4SlFVRkpMRTlCUVU4c1EwRkJReXhKUVVGSkxFdEJRVXNzV1VGQldTeEZRVUZGTzFsQlEycERMSGREUVVGM1F6dFpRVU40UXl4SFFVRkhMRWRCUVVjc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF6dFRRVU51UWp0aFFVRk5MRWxCUVVrc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhGUVVGRk8xbEJRMjVFTEdsRlFVRnBSVHRaUVVOcVJTeHpSVUZCYzBVN1dVRkRkRVVzUjBGQlJ5eEhRVUZITEU5QlFVOHNRMEZCUXl4alFVRmpMRU5CUVVNc1RVRkJUVHRuUWtGRGFrTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eERRVUZETEdOQlFXTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ6dG5Ra0ZETDBRc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eFhRVUZYTEVOQlFVTTdVMEZEZWtJN1lVRkJUVHRaUVVOTUxIVkVRVUYxUkR0WlFVTjJSQ3gzUmtGQmQwWTdXVUZEZUVZc1IwRkJSeXhIUVVGSExFOUJRVThzUTBGQlF5eFhRVUZYTEVOQlFVTTdVMEZETTBJN1VVRkRSQ3hQUVVGUExFZEJRVWNzUTBGQlF6dEpRVU5pTEVOQlFVTTdTVUZGVHl4TFFVRkxMRU5CUVVNc2RVSkJRWFZDTEVOQlEyNURMRTlCUVN0RExFVkJReTlETEU5QlFVOHNSVUZEVUN4WlFVRnZRanRSUVVWd1FqczdPenM3TzFWQlRVVTdVVUZGUml3MFFrRkJORUk3VVVGRE5VSXNhVVJCUVdsRU8xRkJSV3BFT3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096dFZRVEpFUlR0UlFVVkdMRTFCUVUwc1kwRkJZeXhIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTTdVVUZETVVNc1RVRkJUU3hyUWtGQmEwSXNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRE8xRkJSVGxETEUxQlFVMHNSMEZCUnl4SFFVTlFMRTlCUVU4c1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlEyaENMRU5CUVVNc1EwRkJReXhOUVVGTkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU03V1VGRGRrTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1VVRkJVU3hGUVVGRkxGTkJRVk1zUlVGQlJTeFRRVUZUTEVWQlFVVXNVMEZCVXl4RlFVRkZMRU5CUVVNN1VVRkRjRVFzVFVGQlRTeFpRVUZaTEVkQlFXbENPMWxCUTJwRExGTkJRVk1zUlVGQlJTeFRRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRMRk5CUVZNc1EwRkJRenRaUVVOdVF5eFZRVUZWTEVWQlFVVXNUMEZCVHp0WlFVTnVRaXhsUVVGbExFVkJRVVVzVTBGQlV5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNN1dVRkRka01zWTBGQll5eEZRVUZGTEU5QlFVOHNRMEZCUXl4VFFVRlRPMWxCUTJwRExHVkJRV1VzUlVGQlJTeFRRVUZUTEVOQlFVTXNUMEZCVHl4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVNdlF5eGpRVUZqTEVWQlFVVXNTVUZCU1R0WlFVTndRaXh6UWtGQmMwSXNSVUZCUlN4dlFrRkJiMEk3V1VGRE5VTXNZVUZCWVN4RlFVRkZMRmxCUVZrN1dVRkRNMElzVTBGQlV5eEZRVUZGTEVkQlFVY3NRMEZCUXl4UlFVRlJPMWxCUTNaQ0xFMUJRVTBzUlVGQlJTeFBRVUZQTEVOQlFVTXNTMEZCU3p0WlFVTnlRaXhSUVVGUkxFVkJRVVVzVDBGQlR5eERRVUZETEU5QlFVODdXVUZEZWtJc1pVRkJaU3hGUVVGRkxHTkJRV003V1VGREwwSXNiMEpCUVc5Q0xFVkJRVVVzV1VGQldTeERRVUZETEd0Q1FVRnJRaXhEUVVGRE8xbEJRM1JFTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFOUJRVThzUTBGQlF5eGxRVUZsTEVOQlFVTXNRMEZCUXl4UFFVRlBPMWxCUXpkRUxGVkJRVlVzUlVGQlJTeEpRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zVjBGQlZ5eEZRVUZGTzFOQlEzUkVMRU5CUVVNN1VVRkZSaXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZWQlFWVXNRMEZCUXl4blFrRkJaMElzUlVGQlJTeFpRVUZaTEVOQlFVTXNRMEZCUXp0SlFVTXZSQ3hEUVVGRE8wbEJSVVE3TzA5QlJVYzdTVUZGU3l4TFFVRkxMRU5CUVVNc2JVSkJRVzFDTEVOQlF5OUNMRTlCUVRoRExFVkJRemxETEUxQlFXOUNPMUZCUlhCQ0xFMUJRVTBzWlVGQlpTeEhRVUZITEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1VVRkRia1VzU1VGQlNUdFpRVU5HTEUxQlFVMHNiMEpCUVc5Q0xFZEJRVWNzWlVGQlpTeERRVUZETEc5Q1FVRnZRaXhEUVVGRE8xbEJRMnhGTEUxQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc2IwSkJRVzlDTEVOQlFVTXNaVUZCWlN4RlFVRkZMRU5CUVVNN1dVRkRPVVFzVFVGQlRTeFhRVUZYTEVkQlFVY3NUVUZCVFN4dlFrRkJiMElzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXp0WlFVTm9SU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZkQlFWY3NRMEZCUXl4UlFVRlJMRVZCUVVVc1dVRkJXU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEYmtVc1RVRkJUU3hEUVVGRExGbEJRVmtzUjBGQlJ5eFhRVUZYTEVOQlFVTTdXVUZEYkVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdVMEZEZUVRN1VVRkJReXhQUVVGUExFZEJRVWNzUlVGQlJUdFpRVU5hT3pzN096czdPMk5CVDBVN1dVRkRSaXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZEZUVJc2JVTkJRVzFETzJkQ1FVTnFReXh6UkVGQmMwUTdaMEpCUTNSRUxFZEJRVWNzUTBGQlF5eEpRVUZKTzJkQ1FVTlNMRWRCUVVjc1EwRkJReXhQUVVGUE8yZENRVU5ZTEVsQlFVazdaMEpCUTBvc1IwRkJSeXhEUVVGRExFdEJRVXNzUTBGRFdpeERRVUZETzFsQlEwWXNUVUZCVFN4RFFVRkRMRmxCUVZrc1IwRkJSeXhUUVVGVExFTkJRVU03V1VGRGFFTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFTkJRVU1zWjBKQlFXZENMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03VTBGRGVFUTdTVUZEU0N4RFFVRkRPMGxCUlVRc05FSkJRVFJDTzBsQlEzQkNMRXRCUVVzc1EwRkJReXhyUWtGQmEwSXNRMEZET1VJc1QwRkJNRU1zUlVGRE1VTXNUMEZCVHl4RlFVTlFMRmxCUVZrc1JVRkRXaXhYUVVGWE8xRkJSVmc3T3pzN096czdWVUZQUlR0UlFVVkdMRTFCUVUwc1IwRkJSeXhIUVVOUUxFOUJRVThzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRPMWxCUTJoQ0xFTkJRVU1zUTBGQlF5eE5RVUZOTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTTdXVUZEZGtNc1EwRkJReXhEUVVGRExFVkJRVVVzVVVGQlVTeEZRVUZGTEZOQlFWTXNSVUZCUlN4VFFVRlRMRVZCUVVVc1UwRkJVeXhGUVVGRkxFTkJRVU03VVVGRmNFUXNUVUZCVFN4TlFVRk5MRWRCUVVjc1JVRkJhMElzUTBGQlF6dFJRVVZzUXl4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1VVRkROVU1zVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4UFFVRlBMRU5CUVVNN1VVRkROVUlzVFVGQlRTeERRVUZETEhOQ1FVRnpRaXhIUVVGSExHOUNRVUZ2UWl4RFFVRkRPMUZCUTNKRUxFMUJRVTBzUTBGQlF5eGhRVUZoTEVkQlFVY3NXVUZCV1N4RFFVRkRPMUZCUTNCRExFMUJRVTBzUTBGQlF5eFRRVUZUTEVkQlFVY3NSMEZCUnl4RFFVRkRMRkZCUVZFc1EwRkJRenRSUVVOb1F5eE5RVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU03VVVGRE9VSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETzFGQlJXeERMRzFHUVVGdFJqdFJRVU51Uml4TlFVRk5MRU5CUVVNc1ZVRkJWU3hIUVVGSExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1VVRkZPVU1zVFVGQlRTeFJRVUZSTEVkQlFVY3NUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJRenRSUVVOdVF5eE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVVYyUXl4TlFVRk5MRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETzFGQlEzaENMRTFCUVUwc1EwRkJReXhIUVVGSExFZEJRVWNzVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUlRWQ0xFMUJRVTBzWVVGQllTeEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNN1VVRkRja01zVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4WlFVRlpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03VVVGRk5VTXNNRVJCUVRCRU8xRkJRekZFTERaRlFVRTJSVHRSUVVNM1JTd3lSVUZCTWtVN1VVRkRNMFVzUlVGQlJUdFJRVU5HTEhGQ1FVRnhRanRSUVVOeVFpd3dRa0ZCTUVJN1VVRkRNVUlzYzBOQlFYTkRPMUZCUTNSRExFbEJRVWs3VVVGRFNpdzBRMEZCTkVNN1VVRkZOVU1zVFVGQlRTeGpRVUZqTEVkQlFVY3NUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJRenRSUVVNeFF5eE5RVUZOTEVOQlFVTXNaVUZCWlN4SFFVRkhMR05CUVdNc1EwRkJRenRSUVVWNFF5eE5RVUZOTEd0Q1FVRnJRaXhIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTTdVVUZET1VNc1RVRkJUU3hEUVVGRExHOUNRVUZ2UWl4SFFVRkhMRmxCUVZrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMUZCUlM5RUxFMUJRVTBzV1VGQldTeEhRVUZITEVsQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVU5xUkN4TlFVRk5MRU5CUVVNc1ZVRkJWU3hIUVVGSExGbEJRVmtzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVVXZReXhOUVVGTkxHRkJRV0VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTlCUVU4c1EwRkJReXhsUVVGbExFTkJRVU1zUTBGQlF6dFJRVU51UlN4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGSExHRkJRV0VzUTBGQlF5eFBRVUZQTEVOQlFVTTdVVUZEZGtNc1RVRkJUU3hEUVVGRExGRkJRVkVzUjBGQlJ5eGhRVUZoTEVOQlFVTXNVVUZCVVN4RFFVRkRPMUZCUlhwRExFbEJRVWtzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExGZEJRVmNzUlVGQlJTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVN1dVRkRja1FzU1VGQlNTeERRVUZETEcxQ1FVRnRRaXhEUVVGRExFOUJRVThzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0VFFVTXpRenRoUVVGTk8xbEJRMHdzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1UwRkRlRVE3U1VGRFNDeERRVUZETzBsQlJVOHNZMEZCWXl4RFFVRkRMRTlCUVc5Q08xRkJRM3BETEUxQlFVMHNZVUZCWVN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVONlFpeEpRVUZKTEZGQlFWRXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRiRUlzU1VGQlNTeFBRVUZQTEVWQlFVVTdXVUZEV0N4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zWTBGQll5eEZRVUZGTEVWQlFVVTdaMEpCUXpkQ0xFMUJRVTBzUlVGQlJTeEpRVUZKTEVWQlFVVXNTMEZCU3l4RlFVRkZMRWRCUVVjc1kwRkJZeXhEUVVGRE8yZENRVU4yUXl4TlFVRk5MRmRCUVZjc1IwRkJSeXhGUVVGRkxFTkJRVU03WjBKQlEzWkNMRmRCUVZjc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRM0pETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNSRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1owSkJRMmhETEVsQlFVa3NTVUZCU1N4RFFVRkRMRmRCUVZjc1JVRkJSU3hMUVVGTExGVkJRVlVzUlVGQlJUdHZRa0ZEY2tNc1VVRkJVU3hIUVVGSExFdEJRVXNzUTBGQlF6dHBRa0ZEYkVJN1dVRkRTQ3hEUVVGRExFTkJRVU1zUTBGQlF6dFRRVU5LTzFGQlEwUXNUMEZCVHp0WlFVTk1MRTlCUVU4c1JVRkJSU3hKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEdGQlFXRXNRMEZCUXp0WlFVTjBReXhSUVVGUkxFVkJRVVVzV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXp0VFFVTnFReXhEUVVGRE8wbEJRMG9zUTBGQlF6dERRVU5HSW4wPSIsImltcG9ydCB7IGluY3JlbWVudGVkRXZlbnRPcmRpbmFsIH0gZnJvbSBcIi4uL2xpYi9leHRlbnNpb24tc2Vzc2lvbi1ldmVudC1vcmRpbmFsXCI7XG5pbXBvcnQgeyBleHRlbnNpb25TZXNzaW9uVXVpZCB9IGZyb20gXCIuLi9saWIvZXh0ZW5zaW9uLXNlc3Npb24tdXVpZFwiO1xuaW1wb3J0IHsgYm9vbFRvSW50LCBlc2NhcGVTdHJpbmcsIGVzY2FwZVVybCB9IGZyb20gXCIuLi9saWIvc3RyaW5nLXV0aWxzXCI7XG5leHBvcnQgY2xhc3MgSmF2YXNjcmlwdEluc3RydW1lbnQge1xuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHJlY2VpdmVkIGNhbGwgYW5kIHZhbHVlcyBkYXRhIGZyb20gdGhlIEpTIEluc3RydW1lbnRhdGlvblxuICAgICAqIGludG8gdGhlIGZvcm1hdCB0aGF0IHRoZSBzY2hlbWEgZXhwZWN0cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHBhcmFtIHNlbmRlclxuICAgICAqL1xuICAgIHN0YXRpYyBwcm9jZXNzQ2FsbHNBbmRWYWx1ZXMoZGF0YSwgc2VuZGVyKSB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9IHt9O1xuICAgICAgICB1cGRhdGUuZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZCA9IGV4dGVuc2lvblNlc3Npb25VdWlkO1xuICAgICAgICB1cGRhdGUuZXZlbnRfb3JkaW5hbCA9IGluY3JlbWVudGVkRXZlbnRPcmRpbmFsKCk7XG4gICAgICAgIHVwZGF0ZS5wYWdlX3Njb3BlZF9ldmVudF9vcmRpbmFsID0gZGF0YS5vcmRpbmFsO1xuICAgICAgICB1cGRhdGUud2luZG93X2lkID0gc2VuZGVyLnRhYi53aW5kb3dJZDtcbiAgICAgICAgdXBkYXRlLnRhYl9pZCA9IHNlbmRlci50YWIuaWQ7XG4gICAgICAgIHVwZGF0ZS5mcmFtZV9pZCA9IHNlbmRlci5mcmFtZUlkO1xuICAgICAgICB1cGRhdGUuc2NyaXB0X3VybCA9IGVzY2FwZVVybChkYXRhLnNjcmlwdFVybCk7XG4gICAgICAgIHVwZGF0ZS5zY3JpcHRfbGluZSA9IGVzY2FwZVN0cmluZyhkYXRhLnNjcmlwdExpbmUpO1xuICAgICAgICB1cGRhdGUuc2NyaXB0X2NvbCA9IGVzY2FwZVN0cmluZyhkYXRhLnNjcmlwdENvbCk7XG4gICAgICAgIHVwZGF0ZS5mdW5jX25hbWUgPSBlc2NhcGVTdHJpbmcoZGF0YS5mdW5jTmFtZSk7XG4gICAgICAgIHVwZGF0ZS5zY3JpcHRfbG9jX2V2YWwgPSBlc2NhcGVTdHJpbmcoZGF0YS5zY3JpcHRMb2NFdmFsKTtcbiAgICAgICAgdXBkYXRlLmNhbGxfc3RhY2sgPSBlc2NhcGVTdHJpbmcoZGF0YS5jYWxsU3RhY2spO1xuICAgICAgICB1cGRhdGUuc3ltYm9sID0gZXNjYXBlU3RyaW5nKGRhdGEuc3ltYm9sKTtcbiAgICAgICAgdXBkYXRlLm9wZXJhdGlvbiA9IGVzY2FwZVN0cmluZyhkYXRhLm9wZXJhdGlvbik7XG4gICAgICAgIHVwZGF0ZS52YWx1ZSA9IGVzY2FwZVN0cmluZyhkYXRhLnZhbHVlKTtcbiAgICAgICAgdXBkYXRlLnRpbWVfc3RhbXAgPSBkYXRhLnRpbWVTdGFtcDtcbiAgICAgICAgdXBkYXRlLmluY29nbml0byA9IGJvb2xUb0ludChzZW5kZXIudGFiLmluY29nbml0byk7XG4gICAgICAgIC8vIGRvY3VtZW50X3VybCBpcyB0aGUgY3VycmVudCBmcmFtZSdzIGRvY3VtZW50IGhyZWZcbiAgICAgICAgLy8gdG9wX2xldmVsX3VybCBpcyB0aGUgdG9wLWxldmVsIGZyYW1lJ3MgZG9jdW1lbnQgaHJlZlxuICAgICAgICB1cGRhdGUuZG9jdW1lbnRfdXJsID0gZXNjYXBlVXJsKHNlbmRlci51cmwpO1xuICAgICAgICB1cGRhdGUudG9wX2xldmVsX3VybCA9IGVzY2FwZVVybChzZW5kZXIudGFiLnVybCk7XG4gICAgICAgIGlmIChkYXRhLm9wZXJhdGlvbiA9PT0gXCJjYWxsXCIgJiYgZGF0YS5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHVwZGF0ZS5hcmd1bWVudHMgPSBlc2NhcGVTdHJpbmcoSlNPTi5zdHJpbmdpZnkoZGF0YS5hcmdzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVwZGF0ZTtcbiAgICB9XG4gICAgZGF0YVJlY2VpdmVyO1xuICAgIG9uTWVzc2FnZUxpc3RlbmVyO1xuICAgIGNvbmZpZ3VyZWQgPSBmYWxzZTtcbiAgICBwZW5kaW5nUmVjb3JkcyA9IFtdO1xuICAgIGNyYXdsSUQ7XG4gICAgY29uc3RydWN0b3IoZGF0YVJlY2VpdmVyKSB7XG4gICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyID0gZGF0YVJlY2VpdmVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIG1lc3NhZ2VzIGZyb20gcGFnZS9jb250ZW50L2JhY2tncm91bmQgc2NyaXB0cyBpbmplY3RlZCB0byBpbnN0cnVtZW50IEphdmFTY3JpcHQgQVBJc1xuICAgICAqL1xuICAgIGxpc3RlbigpIHtcbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VMaXN0ZW5lciA9IChtZXNzYWdlLCBzZW5kZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLm5hbWVzcGFjZSAmJlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UubmFtZXNwYWNlID09PSBcImphdmFzY3JpcHQtaW5zdHJ1bWVudGF0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUpzSW5zdHJ1bWVudGF0aW9uTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHRoaXMub25NZXNzYWdlTGlzdGVuZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFaXRoZXIgc2VuZHMgdGhlIGxvZyBkYXRhIHRvIHRoZSBkYXRhUmVjZWl2ZXIgb3Igc3RvcmUgaXQgaW4gbWVtb3J5XG4gICAgICogYXMgYSBwZW5kaW5nIHJlY29yZCBpZiB0aGUgSlMgaW5zdHJ1bWVudGF0aW9uIGlzIG5vdCB5ZXQgY29uZmlndXJlZFxuICAgICAqXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gc2VuZGVyXG4gICAgICovXG4gICAgaGFuZGxlSnNJbnN0cnVtZW50YXRpb25NZXNzYWdlKG1lc3NhZ2UsIHNlbmRlcikge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImxvZ0NhbGxcIjpcbiAgICAgICAgICAgIGNhc2UgXCJsb2dWYWx1ZVwiOlxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZSA9IEphdmFzY3JpcHRJbnN0cnVtZW50LnByb2Nlc3NDYWxsc0FuZFZhbHVlcyhtZXNzYWdlLmRhdGEsIHNlbmRlcik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJlZCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGUuYnJvd3Nlcl9pZCA9IHRoaXMuY3Jhd2xJRDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImphdmFzY3JpcHRcIiwgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ1JlY29yZHMucHVzaCh1cGRhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydHMgbGlzdGVuaW5nIGlmIGhhdmVuJ3QgZG9uZSBzbyBhbHJlYWR5LCBzZXRzIHRoZSBjcmF3bCBJRCxcbiAgICAgKiBtYXJrcyB0aGUgSlMgaW5zdHJ1bWVudGF0aW9uIGFzIGNvbmZpZ3VyZWQgYW5kIHNlbmRzIGFueSBwZW5kaW5nXG4gICAgICogcmVjb3JkcyB0aGF0IGhhdmUgYmVlbiByZWNlaXZlZCB1cCB1bnRpbCB0aGlzIHBvaW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGNyYXdsSURcbiAgICAgKi9cbiAgICBydW4oY3Jhd2xJRCkge1xuICAgICAgICBpZiAoIXRoaXMub25NZXNzYWdlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jcmF3bElEID0gY3Jhd2xJRDtcbiAgICAgICAgdGhpcy5jb25maWd1cmVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVjb3Jkcy5tYXAoKHVwZGF0ZSkgPT4ge1xuICAgICAgICAgICAgdXBkYXRlLmJyb3dzZXJfaWQgPSB0aGlzLmNyYXdsSUQ7XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiamF2YXNjcmlwdFwiLCB1cGRhdGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgcmVnaXN0ZXJDb250ZW50U2NyaXB0KHRlc3RpbmcsIGpzSW5zdHJ1bWVudGF0aW9uU2V0dGluZ3MpIHtcbiAgICAgICAgY29uc3QgY29udGVudFNjcmlwdENvbmZpZyA9IHtcbiAgICAgICAgICAgIHRlc3RpbmcsXG4gICAgICAgICAgICBqc0luc3RydW1lbnRhdGlvblNldHRpbmdzLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoY29udGVudFNjcmlwdENvbmZpZykge1xuICAgICAgICAgICAgLy8gVE9ETzogQXZvaWQgdXNpbmcgd2luZG93IHRvIHBhc3MgdGhlIGNvbnRlbnQgc2NyaXB0IGNvbmZpZ1xuICAgICAgICAgICAgYXdhaXQgYnJvd3Nlci5jb250ZW50U2NyaXB0cy5yZWdpc3Rlcih7XG4gICAgICAgICAgICAgICAganM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogYHdpbmRvdy5vcGVuV3BtQ29udGVudFNjcmlwdENvbmZpZyA9ICR7SlNPTi5zdHJpbmdpZnkoY29udGVudFNjcmlwdENvbmZpZyl9O2AsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBtYXRjaGVzOiBbXCI8YWxsX3VybHM+XCJdLFxuICAgICAgICAgICAgICAgIGFsbEZyYW1lczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBydW5BdDogXCJkb2N1bWVudF9zdGFydFwiLFxuICAgICAgICAgICAgICAgIG1hdGNoQWJvdXRCbGFuazogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBicm93c2VyLmNvbnRlbnRTY3JpcHRzLnJlZ2lzdGVyKHtcbiAgICAgICAgICAgIGpzOiBbeyBmaWxlOiBcIi9jb250ZW50LmpzXCIgfV0sXG4gICAgICAgICAgICBtYXRjaGVzOiBbXCI8YWxsX3VybHM+XCJdLFxuICAgICAgICAgICAgYWxsRnJhbWVzOiB0cnVlLFxuICAgICAgICAgICAgcnVuQXQ6IFwiZG9jdW1lbnRfc3RhcnRcIixcbiAgICAgICAgICAgIG1hdGNoQWJvdXRCbGFuazogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNsZWFudXAoKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ1JlY29yZHMgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UucmVtb3ZlTGlzdGVuZXIodGhpcy5vbk1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhbUYyWVhOamNtbHdkQzFwYm5OMGNuVnRaVzUwTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDJKaFkydG5jbTkxYm1RdmFtRjJZWE5qY21sd2RDMXBibk4wY25WdFpXNTBMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVOQkxFOUJRVThzUlVGQlJTeDFRa0ZCZFVJc1JVRkJSU3hOUVVGTkxIZERRVUYzUXl4RFFVRkRPMEZCUTJwR0xFOUJRVThzUlVGQlJTeHZRa0ZCYjBJc1JVRkJSU3hOUVVGTkxDdENRVUVyUWl4RFFVRkRPMEZCUTNKRkxFOUJRVThzUlVGQlJTeFRRVUZUTEVWQlFVVXNXVUZCV1N4RlFVRkZMRk5CUVZNc1JVRkJSU3hOUVVGTkxIRkNRVUZ4UWl4RFFVRkRPMEZCU1hwRkxFMUJRVTBzVDBGQlR5eHZRa0ZCYjBJN1NVRkRMMEk3T3pzN096dFBRVTFITzBsQlEwc3NUVUZCVFN4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRnhRanRSUVVNNVJDeE5RVUZOTEUxQlFVMHNSMEZCUnl4RlFVRjVRaXhEUVVGRE8xRkJRM3BETEUxQlFVMHNRMEZCUXl4elFrRkJjMElzUjBGQlJ5eHZRa0ZCYjBJc1EwRkJRenRSUVVOeVJDeE5RVUZOTEVOQlFVTXNZVUZCWVN4SFFVRkhMSFZDUVVGMVFpeEZRVUZGTEVOQlFVTTdVVUZEYWtRc1RVRkJUU3hEUVVGRExIbENRVUY1UWl4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU03VVVGRGFFUXNUVUZCVFN4RFFVRkRMRk5CUVZNc1IwRkJSeXhOUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXp0UlFVTjJReXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hEUVVGRE8xRkJRemxDTEUxQlFVMHNRMEZCUXl4UlFVRlJMRWRCUVVjc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF6dFJRVU5xUXl4TlFVRk5MRU5CUVVNc1ZVRkJWU3hIUVVGSExGTkJRVk1zUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1VVRkRPVU1zVFVGQlRTeERRVUZETEZkQlFWY3NSMEZCUnl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFGQlEyNUVMRTFCUVUwc1EwRkJReXhWUVVGVkxFZEJRVWNzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRSUVVOcVJDeE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZETDBNc1RVRkJUU3hEUVVGRExHVkJRV1VzUjBGQlJ5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRE8xRkJRekZFTEUxQlFVMHNRMEZCUXl4VlFVRlZMRWRCUVVjc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0UlFVTnFSQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03VVVGRE1VTXNUVUZCVFN4RFFVRkRMRk5CUVZNc1IwRkJSeXhaUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMUZCUTJoRUxFMUJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU40UXl4TlFVRk5MRU5CUVVNc1ZVRkJWU3hIUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTTdVVUZEYmtNc1RVRkJUU3hEUVVGRExGTkJRVk1zUjBGQlJ5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVVZ1UkN4dlJFRkJiMFE3VVVGRGNFUXNkVVJCUVhWRU8xRkJRM1pFTEUxQlFVMHNRMEZCUXl4WlFVRlpMRWRCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTTFReXhOUVVGTkxFTkJRVU1zWVVGQllTeEhRVUZITEZOQlFWTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlJXcEVMRWxCUVVrc1NVRkJTU3hEUVVGRExGTkJRVk1zUzBGQlN5eE5RVUZOTEVsQlFVa3NTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEZRVUZGTzFsQlEzSkVMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdVMEZETlVRN1VVRkZSQ3hQUVVGUExFMUJRVTBzUTBGQlF6dEpRVU5vUWl4RFFVRkRPMGxCUTJkQ0xGbEJRVmtzUTBGQlF6dEpRVU4wUWl4cFFrRkJhVUlzUTBGQlF6dEpRVU5zUWl4VlFVRlZMRWRCUVZrc1MwRkJTeXhEUVVGRE8wbEJRelZDTEdOQlFXTXNSMEZCTUVJc1JVRkJSU3hEUVVGRE8wbEJRek5ETEU5QlFVOHNRMEZCUXp0SlFVVm9RaXhaUVVGWkxGbEJRVms3VVVGRGRFSXNTVUZCU1N4RFFVRkRMRmxCUVZrc1IwRkJSeXhaUVVGWkxFTkJRVU03U1VGRGJrTXNRMEZCUXp0SlFVVkVPenRQUVVWSE8wbEJRMGtzVFVGQlRUdFJRVU5ZTEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUjBGQlJ5eERRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVc1JVRkJSVHRaUVVNelF5eEpRVU5GTEU5QlFVOHNRMEZCUXl4VFFVRlRPMmRDUVVOcVFpeFBRVUZQTEVOQlFVTXNVMEZCVXl4TFFVRkxMRFJDUVVFMFFpeEZRVU5zUkR0blFrRkRRU3hKUVVGSkxFTkJRVU1zT0VKQlFUaENMRU5CUVVNc1QwRkJUeXhGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETzJGQlEzUkVPMUZCUTBnc1EwRkJReXhEUVVGRE8xRkJRMFlzVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhEUVVGRE8wbEJRMmhGTEVOQlFVTTdTVUZGUkRzN096czdPMDlCVFVjN1NVRkRTU3c0UWtGQk9FSXNRMEZCUXl4UFFVRlBMRVZCUVVVc1RVRkJjVUk3VVVGRGJFVXNVVUZCVVN4UFFVRlBMRU5CUVVNc1NVRkJTU3hGUVVGRk8xbEJRM0JDTEV0QlFVc3NVMEZCVXl4RFFVRkRPMWxCUTJZc1MwRkJTeXhWUVVGVk8yZENRVU5pTEUxQlFVMHNUVUZCVFN4SFFVRkhMRzlDUVVGdlFpeERRVUZETEhGQ1FVRnhRaXhEUVVOMlJDeFBRVUZQTEVOQlFVTXNTVUZCU1N4RlFVTmFMRTFCUVUwc1EwRkRVQ3hEUVVGRE8yZENRVU5HTEVsQlFVa3NTVUZCU1N4RFFVRkRMRlZCUVZVc1JVRkJSVHR2UWtGRGJrSXNUVUZCVFN4RFFVRkRMRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzI5Q1FVTnFReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZWQlFWVXNRMEZCUXl4WlFVRlpMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03YVVKQlEzQkVPM0ZDUVVGTk8yOUNRVU5NTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzJsQ1FVTnNRenRuUWtGRFJDeE5RVUZOTzFOQlExUTdTVUZEU0N4RFFVRkRPMGxCUlVRN096czdPenRQUVUxSE8wbEJRMGtzUjBGQlJ5eERRVUZETEU5QlFVODdVVUZEYUVJc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1JVRkJSVHRaUVVNelFpeEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN1UwRkRaanRSUVVORUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NUMEZCVHl4RFFVRkRPMUZCUTNaQ0xFbEJRVWtzUTBGQlF5eFZRVUZWTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUTNaQ0xFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFVkJRVVU3V1VGRGFrTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzFsQlEycERMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVlVGQlZTeERRVUZETEZsQlFWa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenRSUVVOeVJDeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTk1MRU5CUVVNN1NVRkZUU3hMUVVGTExFTkJRVU1zY1VKQlFYRkNMRU5CUTJoRExFOUJRV2RDTEVWQlEyaENMSGxDUVVGblJEdFJRVVZvUkN4TlFVRk5MRzFDUVVGdFFpeEhRVUZITzFsQlF6RkNMRTlCUVU4N1dVRkRVQ3g1UWtGQmVVSTdVMEZETVVJc1EwRkJRenRSUVVOR0xFbEJRVWtzYlVKQlFXMUNMRVZCUVVVN1dVRkRka0lzTmtSQlFUWkVPMWxCUXpkRUxFMUJRVTBzVDBGQlR5eERRVUZETEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNN1owSkJRM0JETEVWQlFVVXNSVUZCUlR0dlFrRkRSanQzUWtGRFJTeEpRVUZKTEVWQlFVVXNkVU5CUVhWRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlEzcEVMRzFDUVVGdFFpeERRVU53UWl4SFFVRkhPM0ZDUVVOTU8ybENRVU5HTzJkQ1FVTkVMRTlCUVU4c1JVRkJSU3hEUVVGRExGbEJRVmtzUTBGQlF6dG5Ra0ZEZGtJc1UwRkJVeXhGUVVGRkxFbEJRVWs3WjBKQlEyWXNTMEZCU3l4RlFVRkZMR2RDUVVGblFqdG5Ra0ZEZGtJc1pVRkJaU3hGUVVGRkxFbEJRVWs3WVVGRGRFSXNRMEZCUXl4RFFVRkRPMU5CUTBvN1VVRkRSQ3hQUVVGUExFOUJRVThzUTBGQlF5eGpRVUZqTEVOQlFVTXNVVUZCVVN4RFFVRkRPMWxCUTNKRExFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMR0ZCUVdFc1JVRkJSU3hEUVVGRE8xbEJRemRDTEU5QlFVOHNSVUZCUlN4RFFVRkRMRmxCUVZrc1EwRkJRenRaUVVOMlFpeFRRVUZUTEVWQlFVVXNTVUZCU1R0WlFVTm1MRXRCUVVzc1JVRkJSU3huUWtGQlowSTdXVUZEZGtJc1pVRkJaU3hGUVVGRkxFbEJRVWs3VTBGRGRFSXNRMEZCUXl4RFFVRkRPMGxCUTB3c1EwRkJRenRKUVVWTkxFOUJRVTg3VVVGRFdpeEpRVUZKTEVOQlFVTXNZMEZCWXl4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVONlFpeEpRVUZKTEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUlVGQlJUdFpRVU14UWl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdVMEZEYkVVN1NVRkRTQ3hEUVVGRE8wTkJRMFlpZlE9PSIsImltcG9ydCB7IGluY3JlbWVudGVkRXZlbnRPcmRpbmFsIH0gZnJvbSBcIi4uL2xpYi9leHRlbnNpb24tc2Vzc2lvbi1ldmVudC1vcmRpbmFsXCI7XG5pbXBvcnQgeyBleHRlbnNpb25TZXNzaW9uVXVpZCB9IGZyb20gXCIuLi9saWIvZXh0ZW5zaW9uLXNlc3Npb24tdXVpZFwiO1xuaW1wb3J0IHsgUGVuZGluZ05hdmlnYXRpb24gfSBmcm9tIFwiLi4vbGliL3BlbmRpbmctbmF2aWdhdGlvblwiO1xuaW1wb3J0IHsgYm9vbFRvSW50LCBlc2NhcGVTdHJpbmcsIGVzY2FwZVVybCB9IGZyb20gXCIuLi9saWIvc3RyaW5nLXV0aWxzXCI7XG5pbXBvcnQgeyBtYWtlVVVJRCB9IGZyb20gXCIuLi9saWIvdXVpZFwiO1xuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybVdlYk5hdmlnYXRpb25CYXNlRXZlbnREZXRhaWxzVG9PcGVuV1BNU2NoZW1hID0gYXN5bmMgKGNyYXdsSUQsIGRldGFpbHMpID0+IHtcbiAgICBjb25zdCB0YWIgPSBkZXRhaWxzLnRhYklkID4gLTFcbiAgICAgICAgPyBhd2FpdCBicm93c2VyLnRhYnMuZ2V0KGRldGFpbHMudGFiSWQpXG4gICAgICAgIDoge1xuICAgICAgICAgICAgd2luZG93SWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluY29nbml0bzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgY29va2llU3RvcmVJZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgb3BlbmVyVGFiSWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICBjb25zdCB3aW5kb3cgPSB0YWIud2luZG93SWRcbiAgICAgICAgPyBhd2FpdCBicm93c2VyLndpbmRvd3MuZ2V0KHRhYi53aW5kb3dJZClcbiAgICAgICAgOiB7IHdpZHRoOiB1bmRlZmluZWQsIGhlaWdodDogdW5kZWZpbmVkLCB0eXBlOiB1bmRlZmluZWQgfTtcbiAgICBjb25zdCBuYXZpZ2F0aW9uID0ge1xuICAgICAgICBicm93c2VyX2lkOiBjcmF3bElELFxuICAgICAgICBpbmNvZ25pdG86IGJvb2xUb0ludCh0YWIuaW5jb2duaXRvKSxcbiAgICAgICAgZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZDogZXh0ZW5zaW9uU2Vzc2lvblV1aWQsXG4gICAgICAgIHByb2Nlc3NfaWQ6IGRldGFpbHMucHJvY2Vzc0lkLFxuICAgICAgICB3aW5kb3dfaWQ6IHRhYi53aW5kb3dJZCxcbiAgICAgICAgdGFiX2lkOiBkZXRhaWxzLnRhYklkLFxuICAgICAgICB0YWJfb3BlbmVyX3RhYl9pZDogdGFiLm9wZW5lclRhYklkLFxuICAgICAgICBmcmFtZV9pZDogZGV0YWlscy5mcmFtZUlkLFxuICAgICAgICB3aW5kb3dfd2lkdGg6IHdpbmRvdy53aWR0aCxcbiAgICAgICAgd2luZG93X2hlaWdodDogd2luZG93LmhlaWdodCxcbiAgICAgICAgd2luZG93X3R5cGU6IHdpbmRvdy50eXBlLFxuICAgICAgICB0YWJfd2lkdGg6IHRhYi53aWR0aCxcbiAgICAgICAgdGFiX2hlaWdodDogdGFiLmhlaWdodCxcbiAgICAgICAgdGFiX2Nvb2tpZV9zdG9yZV9pZDogZXNjYXBlU3RyaW5nKHRhYi5jb29raWVTdG9yZUlkKSxcbiAgICAgICAgdXVpZDogbWFrZVVVSUQoKSxcbiAgICAgICAgdXJsOiBlc2NhcGVVcmwoZGV0YWlscy51cmwpLFxuICAgIH07XG4gICAgcmV0dXJuIG5hdmlnYXRpb247XG59O1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25JbnN0cnVtZW50IHtcbiAgICBzdGF0aWMgbmF2aWdhdGlvbklkKHByb2Nlc3NJZCwgdGFiSWQsIGZyYW1lSWQpIHtcbiAgICAgICAgcmV0dXJuIGAke3Byb2Nlc3NJZH0tJHt0YWJJZH0tJHtmcmFtZUlkfWA7XG4gICAgfVxuICAgIGRhdGFSZWNlaXZlcjtcbiAgICBvbkJlZm9yZU5hdmlnYXRlTGlzdGVuZXI7XG4gICAgb25Db21taXR0ZWRMaXN0ZW5lcjtcbiAgICBwZW5kaW5nTmF2aWdhdGlvbnMgPSB7fTtcbiAgICBjb25zdHJ1Y3RvcihkYXRhUmVjZWl2ZXIpIHtcbiAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIgPSBkYXRhUmVjZWl2ZXI7XG4gICAgfVxuICAgIHJ1bihjcmF3bElEKSB7XG4gICAgICAgIHRoaXMub25CZWZvcmVOYXZpZ2F0ZUxpc3RlbmVyID0gYXN5bmMgKGRldGFpbHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRpb25JZCA9IE5hdmlnYXRpb25JbnN0cnVtZW50Lm5hdmlnYXRpb25JZChkZXRhaWxzLnByb2Nlc3NJZCwgZGV0YWlscy50YWJJZCwgZGV0YWlscy5mcmFtZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdOYXZpZ2F0aW9uID0gdGhpcy5pbnN0YW50aWF0ZVBlbmRpbmdOYXZpZ2F0aW9uKG5hdmlnYXRpb25JZCk7XG4gICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uID0gYXdhaXQgdHJhbnNmb3JtV2ViTmF2aWdhdGlvbkJhc2VFdmVudERldGFpbHNUb09wZW5XUE1TY2hlbWEoY3Jhd2xJRCwgZGV0YWlscyk7XG4gICAgICAgICAgICBuYXZpZ2F0aW9uLnBhcmVudF9mcmFtZV9pZCA9IGRldGFpbHMucGFyZW50RnJhbWVJZDtcbiAgICAgICAgICAgIG5hdmlnYXRpb24uYmVmb3JlX25hdmlnYXRlX2V2ZW50X29yZGluYWwgPSBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCgpO1xuICAgICAgICAgICAgbmF2aWdhdGlvbi5iZWZvcmVfbmF2aWdhdGVfdGltZV9zdGFtcCA9IG5ldyBEYXRlKGRldGFpbHMudGltZVN0YW1wKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgcGVuZGluZ05hdmlnYXRpb24ucmVzb2x2ZU9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb24obmF2aWdhdGlvbik7XG4gICAgICAgIH07XG4gICAgICAgIGJyb3dzZXIud2ViTmF2aWdhdGlvbi5vbkJlZm9yZU5hdmlnYXRlLmFkZExpc3RlbmVyKHRoaXMub25CZWZvcmVOYXZpZ2F0ZUxpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5vbkNvbW1pdHRlZExpc3RlbmVyID0gYXN5bmMgKGRldGFpbHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRpb25JZCA9IE5hdmlnYXRpb25JbnN0cnVtZW50Lm5hdmlnYXRpb25JZChkZXRhaWxzLnByb2Nlc3NJZCwgZGV0YWlscy50YWJJZCwgZGV0YWlscy5mcmFtZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRpb24gPSBhd2FpdCB0cmFuc2Zvcm1XZWJOYXZpZ2F0aW9uQmFzZUV2ZW50RGV0YWlsc1RvT3BlbldQTVNjaGVtYShjcmF3bElELCBkZXRhaWxzKTtcbiAgICAgICAgICAgIG5hdmlnYXRpb24udHJhbnNpdGlvbl9xdWFsaWZpZXJzID0gZXNjYXBlU3RyaW5nKEpTT04uc3RyaW5naWZ5KGRldGFpbHMudHJhbnNpdGlvblF1YWxpZmllcnMpKTtcbiAgICAgICAgICAgIG5hdmlnYXRpb24udHJhbnNpdGlvbl90eXBlID0gZXNjYXBlU3RyaW5nKGRldGFpbHMudHJhbnNpdGlvblR5cGUpO1xuICAgICAgICAgICAgbmF2aWdhdGlvbi5jb21taXR0ZWRfZXZlbnRfb3JkaW5hbCA9IGluY3JlbWVudGVkRXZlbnRPcmRpbmFsKCk7XG4gICAgICAgICAgICBuYXZpZ2F0aW9uLmNvbW1pdHRlZF90aW1lX3N0YW1wID0gbmV3IERhdGUoZGV0YWlscy50aW1lU3RhbXApLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICAvLyBpbmNsdWRlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgY29ycmVzcG9uZGluZyBvbkJlZm9yZU5hdmlnYXRpb24gZXZlbnRcbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdOYXZpZ2F0aW9uID0gdGhpcy5nZXRQZW5kaW5nTmF2aWdhdGlvbihuYXZpZ2F0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdOYXZpZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgcGVuZGluZ05hdmlnYXRpb24ucmVzb2x2ZU9uQ29tbWl0dGVkRXZlbnROYXZpZ2F0aW9uKG5hdmlnYXRpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgcGVuZGluZ05hdmlnYXRpb24ucmVzb2x2ZWRXaXRoaW5UaW1lb3V0KDEwMDApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvbkJlZm9yZU5hdmlnYXRlRXZlbnROYXZpZ2F0aW9uID0gYXdhaXQgcGVuZGluZ05hdmlnYXRpb24ub25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgbmF2aWdhdGlvbi5wYXJlbnRfZnJhbWVfaWQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgb25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbi5wYXJlbnRfZnJhbWVfaWQ7XG4gICAgICAgICAgICAgICAgICAgIG5hdmlnYXRpb24uYmVmb3JlX25hdmlnYXRlX2V2ZW50X29yZGluYWwgPVxuICAgICAgICAgICAgICAgICAgICAgICAgb25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbi5iZWZvcmVfbmF2aWdhdGVfZXZlbnRfb3JkaW5hbDtcbiAgICAgICAgICAgICAgICAgICAgbmF2aWdhdGlvbi5iZWZvcmVfbmF2aWdhdGVfdGltZV9zdGFtcCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkJlZm9yZU5hdmlnYXRlRXZlbnROYXZpZ2F0aW9uLmJlZm9yZV9uYXZpZ2F0ZV90aW1lX3N0YW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJuYXZpZ2F0aW9uc1wiLCBuYXZpZ2F0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgYnJvd3Nlci53ZWJOYXZpZ2F0aW9uLm9uQ29tbWl0dGVkLmFkZExpc3RlbmVyKHRoaXMub25Db21taXR0ZWRMaXN0ZW5lcik7XG4gICAgfVxuICAgIGNsZWFudXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlTmF2aWdhdGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgYnJvd3Nlci53ZWJOYXZpZ2F0aW9uLm9uQmVmb3JlTmF2aWdhdGUucmVtb3ZlTGlzdGVuZXIodGhpcy5vbkJlZm9yZU5hdmlnYXRlTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uQ29tbWl0dGVkTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIud2ViTmF2aWdhdGlvbi5vbkNvbW1pdHRlZC5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uQ29tbWl0dGVkTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluc3RhbnRpYXRlUGVuZGluZ05hdmlnYXRpb24obmF2aWdhdGlvbklkKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ05hdmlnYXRpb25zW25hdmlnYXRpb25JZF0gPSBuZXcgUGVuZGluZ05hdmlnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ05hdmlnYXRpb25zW25hdmlnYXRpb25JZF07XG4gICAgfVxuICAgIGdldFBlbmRpbmdOYXZpZ2F0aW9uKG5hdmlnYXRpb25JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTmF2aWdhdGlvbnNbbmF2aWdhdGlvbklkXTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2libUYyYVdkaGRHbHZiaTFwYm5OMGNuVnRaVzUwTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDJKaFkydG5jbTkxYm1RdmJtRjJhV2RoZEdsdmJpMXBibk4wY25WdFpXNTBMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFOUJRVThzUlVGQlJTeDFRa0ZCZFVJc1JVRkJSU3hOUVVGTkxIZERRVUYzUXl4RFFVRkRPMEZCUTJwR0xFOUJRVThzUlVGQlJTeHZRa0ZCYjBJc1JVRkJSU3hOUVVGTkxDdENRVUVyUWl4RFFVRkRPMEZCUTNKRkxFOUJRVThzUlVGQlJTeHBRa0ZCYVVJc1JVRkJSU3hOUVVGTkxESkNRVUV5UWl4RFFVRkRPMEZCUXpsRUxFOUJRVThzUlVGQlJTeFRRVUZUTEVWQlFVVXNXVUZCV1N4RlFVRkZMRk5CUVZNc1JVRkJSU3hOUVVGTkxIRkNRVUZ4UWl4RFFVRkRPMEZCUTNwRkxFOUJRVThzUlVGQlJTeFJRVUZSTEVWQlFVVXNUVUZCVFN4aFFVRmhMRU5CUVVNN1FVRlJka01zVFVGQlRTeERRVUZETEUxQlFVMHNjVVJCUVhGRUxFZEJRVWNzUzBGQlN5eEZRVU40UlN4UFFVRlBMRVZCUTFBc1QwRkJjME1zUlVGRGFrSXNSVUZCUlR0SlFVTjJRaXhOUVVGTkxFZEJRVWNzUjBGRFVDeFBRVUZQTEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOb1FpeERRVUZETEVOQlFVTXNUVUZCVFN4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRPMUZCUTNaRExFTkJRVU1zUTBGQlF6dFpRVU5GTEZGQlFWRXNSVUZCUlN4VFFVRlRPMWxCUTI1Q0xGTkJRVk1zUlVGQlJTeFRRVUZUTzFsQlEzQkNMR0ZCUVdFc1JVRkJSU3hUUVVGVE8xbEJRM2hDTEZkQlFWY3NSVUZCUlN4VFFVRlRPMWxCUTNSQ0xFdEJRVXNzUlVGQlJTeFRRVUZUTzFsQlEyaENMRTFCUVUwc1JVRkJSU3hUUVVGVE8xTkJRMnhDTEVOQlFVTTdTVUZEVWl4TlFVRk5MRTFCUVUwc1IwRkJSeXhIUVVGSExFTkJRVU1zVVVGQlVUdFJRVU42UWl4RFFVRkRMRU5CUVVNc1RVRkJUU3hQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRE8xRkJRM3BETEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1JVRkJSU3hUUVVGVExFVkJRVVVzVFVGQlRTeEZRVUZGTEZOQlFWTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1UwRkJVeXhGUVVGRkxFTkJRVU03U1VGRE4wUXNUVUZCVFN4VlFVRlZMRWRCUVdVN1VVRkROMElzVlVGQlZTeEZRVUZGTEU5QlFVODdVVUZEYmtJc1UwRkJVeXhGUVVGRkxGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNVMEZCVXl4RFFVRkRPMUZCUTI1RExITkNRVUZ6UWl4RlFVRkZMRzlDUVVGdlFqdFJRVU0xUXl4VlFVRlZMRVZCUVVVc1QwRkJUeXhEUVVGRExGTkJRVk03VVVGRE4wSXNVMEZCVXl4RlFVRkZMRWRCUVVjc1EwRkJReXhSUVVGUk8xRkJRM1pDTEUxQlFVMHNSVUZCUlN4UFFVRlBMRU5CUVVNc1MwRkJTenRSUVVOeVFpeHBRa0ZCYVVJc1JVRkJSU3hIUVVGSExFTkJRVU1zVjBGQlZ6dFJRVU5zUXl4UlFVRlJMRVZCUVVVc1QwRkJUeXhEUVVGRExFOUJRVTg3VVVGRGVrSXNXVUZCV1N4RlFVRkZMRTFCUVUwc1EwRkJReXhMUVVGTE8xRkJRekZDTEdGQlFXRXNSVUZCUlN4TlFVRk5MRU5CUVVNc1RVRkJUVHRSUVVNMVFpeFhRVUZYTEVWQlFVVXNUVUZCVFN4RFFVRkRMRWxCUVVrN1VVRkRlRUlzVTBGQlV5eEZRVUZGTEVkQlFVY3NRMEZCUXl4TFFVRkxPMUZCUTNCQ0xGVkJRVlVzUlVGQlJTeEhRVUZITEVOQlFVTXNUVUZCVFR0UlFVTjBRaXh0UWtGQmJVSXNSVUZCUlN4WlFVRlpMRU5CUVVNc1IwRkJSeXhEUVVGRExHRkJRV0VzUTBGQlF6dFJRVU53UkN4SlFVRkpMRVZCUVVVc1VVRkJVU3hGUVVGRk8xRkJRMmhDTEVkQlFVY3NSVUZCUlN4VFFVRlRMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF6dExRVU0xUWl4RFFVRkRPMGxCUTBZc1QwRkJUeXhWUVVGVkxFTkJRVU03UVVGRGNFSXNRMEZCUXl4RFFVRkRPMEZCUlVZc1RVRkJUU3hQUVVGUExHOUNRVUZ2UWp0SlFVTjRRaXhOUVVGTkxFTkJRVU1zV1VGQldTeERRVUZETEZOQlFWTXNSVUZCUlN4TFFVRkxMRVZCUVVVc1QwRkJUenRSUVVOc1JDeFBRVUZQTEVkQlFVY3NVMEZCVXl4SlFVRkpMRXRCUVVzc1NVRkJTU3hQUVVGUExFVkJRVVVzUTBGQlF6dEpRVU0xUXl4RFFVRkRPMGxCUTJkQ0xGbEJRVmtzUTBGQlF6dEpRVU4wUWl4M1FrRkJkMElzUTBGQlF6dEpRVU42UWl4dFFrRkJiVUlzUTBGQlF6dEpRVU53UWl4clFrRkJhMElzUjBGRmRFSXNSVUZCUlN4RFFVRkRPMGxCUlZBc1dVRkJXU3haUVVGWk8xRkJRM1JDTEVsQlFVa3NRMEZCUXl4WlFVRlpMRWRCUVVjc1dVRkJXU3hEUVVGRE8wbEJRMjVETEVOQlFVTTdTVUZGVFN4SFFVRkhMRU5CUVVNc1QwRkJUenRSUVVOb1FpeEpRVUZKTEVOQlFVTXNkMEpCUVhkQ0xFZEJRVWNzUzBGQlN5eEZRVU51UXl4UFFVRnJSQ3hGUVVOc1JDeEZRVUZGTzFsQlEwWXNUVUZCVFN4WlFVRlpMRWRCUVVjc2IwSkJRVzlDTEVOQlFVTXNXVUZCV1N4RFFVTndSQ3hQUVVGUExFTkJRVU1zVTBGQlV5eEZRVU5xUWl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVOaUxFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlEyaENMRU5CUVVNN1dVRkRSaXhOUVVGTkxHbENRVUZwUWl4SFFVRkhMRWxCUVVrc1EwRkJReXcwUWtGQk5FSXNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJRenRaUVVNeFJTeE5RVUZOTEZWQlFWVXNSMEZEWkN4TlFVRk5MSEZFUVVGeFJDeERRVU42UkN4UFFVRlBMRVZCUTFBc1QwRkJUeXhEUVVOU0xFTkJRVU03V1VGRFNpeFZRVUZWTEVOQlFVTXNaVUZCWlN4SFFVRkhMRTlCUVU4c1EwRkJReXhoUVVGaExFTkJRVU03V1VGRGJrUXNWVUZCVlN4RFFVRkRMRFpDUVVFMlFpeEhRVUZITEhWQ1FVRjFRaXhGUVVGRkxFTkJRVU03V1VGRGNrVXNWVUZCVlN4RFFVRkRMREJDUVVFd1FpeEhRVUZITEVsQlFVa3NTVUZCU1N4RFFVTTVReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVU5zUWl4RFFVRkRMRmRCUVZjc1JVRkJSU3hEUVVGRE8xbEJRMmhDTEdsQ1FVRnBRaXhEUVVGRExITkRRVUZ6UXl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJRM1pGTEVOQlFVTXNRMEZCUXp0UlFVTkdMRTlCUVU4c1EwRkJReXhoUVVGaExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1YwRkJWeXhEUVVOb1JDeEpRVUZKTEVOQlFVTXNkMEpCUVhkQ0xFTkJRemxDTEVOQlFVTTdVVUZEUml4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVkQlFVY3NTMEZCU3l4RlFVTTVRaXhQUVVFMlF5eEZRVU0zUXl4RlFVRkZPMWxCUTBZc1RVRkJUU3haUVVGWkxFZEJRVWNzYjBKQlFXOUNMRU5CUVVNc1dVRkJXU3hEUVVOd1JDeFBRVUZQTEVOQlFVTXNVMEZCVXl4RlFVTnFRaXhQUVVGUExFTkJRVU1zUzBGQlN5eEZRVU5pTEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUTJoQ0xFTkJRVU03V1VGRFJpeE5RVUZOTEZWQlFWVXNSMEZEWkN4TlFVRk5MSEZFUVVGeFJDeERRVU42UkN4UFFVRlBMRVZCUTFBc1QwRkJUeXhEUVVOU0xFTkJRVU03V1VGRFNpeFZRVUZWTEVOQlFVTXNjVUpCUVhGQ0xFZEJRVWNzV1VGQldTeERRVU0zUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhEUVVNM1F5eERRVUZETzFsQlEwWXNWVUZCVlN4RFFVRkRMR1ZCUVdVc1IwRkJSeXhaUVVGWkxFTkJRVU1zVDBGQlR5eERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRPMWxCUTJ4RkxGVkJRVlVzUTBGQlF5eDFRa0ZCZFVJc1IwRkJSeXgxUWtGQmRVSXNSVUZCUlN4RFFVRkRPMWxCUXk5RUxGVkJRVlVzUTBGQlF5eHZRa0ZCYjBJc1IwRkJSeXhKUVVGSkxFbEJRVWtzUTBGRGVFTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkRiRUlzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0WlFVVm9RaXh4UlVGQmNVVTdXVUZEY2tVc1RVRkJUU3hwUWtGQmFVSXNSMEZCUnl4SlFVRkpMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1dVRkRiRVVzU1VGQlNTeHBRa0ZCYVVJc1JVRkJSVHRuUWtGRGNrSXNhVUpCUVdsQ0xFTkJRVU1zYVVOQlFXbERMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03WjBKQlEyaEZMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzYVVKQlFXbENMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJRM0pGTEVsQlFVa3NVVUZCVVN4RlFVRkZPMjlDUVVOYUxFMUJRVTBzSzBKQlFTdENMRWRCUTI1RExFMUJRVTBzYVVKQlFXbENMRU5CUVVNc0swSkJRU3RDTEVOQlFVTTdiMEpCUXpGRUxGVkJRVlVzUTBGQlF5eGxRVUZsTzNkQ1FVTjRRaXdyUWtGQkswSXNRMEZCUXl4bFFVRmxMRU5CUVVNN2IwSkJRMnhFTEZWQlFWVXNRMEZCUXl3MlFrRkJOa0k3ZDBKQlEzUkRMQ3RDUVVFclFpeERRVUZETERaQ1FVRTJRaXhEUVVGRE8yOUNRVU5vUlN4VlFVRlZMRU5CUVVNc01FSkJRVEJDTzNkQ1FVTnVReXdyUWtGQkswSXNRMEZCUXl3d1FrRkJNRUlzUTBGQlF6dHBRa0ZET1VRN1lVRkRSanRaUVVWRUxFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNWVUZCVlN4RFFVRkRMR0ZCUVdFc1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVU14UkN4RFFVRkRMRU5CUVVNN1VVRkRSaXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEZkQlFWY3NRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRU5CUVVNN1NVRkRNVVVzUTBGQlF6dEpRVVZOTEU5QlFVODdVVUZEV2l4SlFVRkpMRWxCUVVrc1EwRkJReXgzUWtGQmQwSXNSVUZCUlR0WlFVTnFReXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExHTkJRV01zUTBGRGJrUXNTVUZCU1N4RFFVRkRMSGRDUVVGM1FpeERRVU01UWl4RFFVRkRPMU5CUTBnN1VVRkRSQ3hKUVVGSkxFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1JVRkJSVHRaUVVNMVFpeFBRVUZQTEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1EwRkJReXhqUVVGakxFTkJRemxETEVsQlFVa3NRMEZCUXl4dFFrRkJiVUlzUTBGRGVrSXNRMEZCUXp0VFFVTklPMGxCUTBnc1EwRkJRenRKUVVWUExEUkNRVUUwUWl4RFFVTnNReXhaUVVGdlFqdFJRVVZ3UWl4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWRCUVVjc1NVRkJTU3hwUWtGQmFVSXNSVUZCUlN4RFFVRkRPMUZCUTJoRkxFOUJRVThzU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzBsQlF5OURMRU5CUVVNN1NVRkZUeXh2UWtGQmIwSXNRMEZCUXl4WlFVRnZRanRSUVVNdlF5eFBRVUZQTEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0SlFVTXZReXhEUVVGRE8wTkJRMFlpZlE9PSIsImltcG9ydCB7IGdldEluc3RydW1lbnRKUyB9IGZyb20gXCIuLi9saWIvanMtaW5zdHJ1bWVudHNcIjtcbmltcG9ydCB7IHBhZ2VTY3JpcHQgfSBmcm9tIFwiLi9qYXZhc2NyaXB0LWluc3RydW1lbnQtcGFnZS1zY29wZVwiO1xuZnVuY3Rpb24gZ2V0UGFnZVNjcmlwdEFzU3RyaW5nKGpzSW5zdHJ1bWVudGF0aW9uU2V0dGluZ3MpIHtcbiAgICAvLyBUaGUgSlMgSW5zdHJ1bWVudCBSZXF1ZXN0cyBhcmUgc2V0dXAgYW5kIHZhbGlkYXRlZCBweXRob24gc2lkZVxuICAgIC8vIGluY2x1ZGluZyBzZXR0aW5nIGRlZmF1bHRzIGZvciBsb2dTZXR0aW5ncy4gU2VlIEpTSW5zdHJ1bWVudGF0aW9uLnB5XG4gICAgY29uc3QgcGFnZVNjcmlwdFN0cmluZyA9IGBcbi8vIFN0YXJ0IG9mIGpzLWluc3RydW1lbnRzLlxuJHtnZXRJbnN0cnVtZW50SlN9XG4vLyBFbmQgb2YganMtaW5zdHJ1bWVudHMuXG5cbi8vIFN0YXJ0IG9mIGN1c3RvbSBpbnN0cnVtZW50UmVxdWVzdHMuXG5jb25zdCBqc0luc3RydW1lbnRhdGlvblNldHRpbmdzID0gJHtKU09OLnN0cmluZ2lmeShqc0luc3RydW1lbnRhdGlvblNldHRpbmdzKX07XG4vLyBFbmQgb2YgY3VzdG9tIGluc3RydW1lbnRSZXF1ZXN0cy5cblxuLy8gU3RhcnQgb2YgYW5vbnltb3VzIGZ1bmN0aW9uIGZyb20gamF2YXNjcmlwdC1pbnN0cnVtZW50LXBhZ2Utc2NvcGUudHNcbigke3BhZ2VTY3JpcHR9KGdldEluc3RydW1lbnRKUywganNJbnN0cnVtZW50YXRpb25TZXR0aW5ncykpO1xuLy8gRW5kLlxuICBgO1xuICAgIHJldHVybiBwYWdlU2NyaXB0U3RyaW5nO1xufVxuO1xuZnVuY3Rpb24gaW5zZXJ0U2NyaXB0KHBhZ2VTY3JpcHRTdHJpbmcsIGV2ZW50SWQsIHRlc3RpbmcgPSBmYWxzZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHNjcmlwdC50ZXh0ID0gcGFnZVNjcmlwdFN0cmluZztcbiAgICBzY3JpcHQuYXN5bmMgPSBmYWxzZTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKFwiZGF0YS1ldmVudC1pZFwiLCBldmVudElkKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKFwiZGF0YS10ZXN0aW5nXCIsIGAke3Rlc3Rpbmd9YCk7XG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShzY3JpcHQsIHBhcmVudC5maXJzdENoaWxkKTtcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbn1cbjtcbmZ1bmN0aW9uIGVtaXRNc2codHlwZSwgbXNnKSB7XG4gICAgbXNnLnRpbWVTdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBuYW1lc3BhY2U6IFwiamF2YXNjcmlwdC1pbnN0cnVtZW50YXRpb25cIixcbiAgICAgICAgdHlwZSxcbiAgICAgICAgZGF0YTogbXNnLFxuICAgIH0pO1xufVxuO1xuY29uc3QgZXZlbnRJZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKTtcbi8vIGxpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgc2NyaXB0IHdlIGFyZSBhYm91dCB0byBpbnNlcnRcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRJZCwgKGUpID0+IHtcbiAgICAvLyBwYXNzIHRoZXNlIG9uIHRvIHRoZSBiYWNrZ3JvdW5kIHBhZ2VcbiAgICBjb25zdCBtc2dzID0gZS5kZXRhaWw7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobXNncykpIHtcbiAgICAgICAgbXNncy5mb3JFYWNoKChtc2cpID0+IHtcbiAgICAgICAgICAgIGVtaXRNc2cobXNnLnR5cGUsIG1zZy5jb250ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBlbWl0TXNnKG1zZ3MudHlwZSwgbXNncy5jb250ZW50KTtcbiAgICB9XG59KTtcbmV4cG9ydCBjb25zdCBpbmplY3RKYXZhc2NyaXB0SW5zdHJ1bWVudFBhZ2VTY3JpcHQgPSAoY29udGVudFNjcmlwdENvbmZpZykgPT4ge1xuICAgIGluc2VydFNjcmlwdChnZXRQYWdlU2NyaXB0QXNTdHJpbmcoY29udGVudFNjcmlwdENvbmZpZy5qc0luc3RydW1lbnRhdGlvblNldHRpbmdzKSwgZXZlbnRJZCwgY29udGVudFNjcmlwdENvbmZpZy50ZXN0aW5nKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhbUYyWVhOamNtbHdkQzFwYm5OMGNuVnRaVzUwTFdOdmJuUmxiblF0YzJOdmNHVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTh1TGk5emNtTXZZMjl1ZEdWdWRDOXFZWFpoYzJOeWFYQjBMV2x1YzNSeWRXMWxiblF0WTI5dWRHVnVkQzF6WTI5d1pTNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4UFFVRlBMRVZCUVVVc1pVRkJaU3hGUVVGMVFpeE5RVUZOTEhWQ1FVRjFRaXhEUVVGRE8wRkJRemRGTEU5QlFVOHNSVUZCUlN4VlFVRlZMRVZCUVVVc1RVRkJUU3h2UTBGQmIwTXNRMEZCUXp0QlFVZG9SU3hUUVVGVExIRkNRVUZ4UWl4RFFVTTFRaXg1UWtGQlowUTdTVUZGYUVRc2FVVkJRV2xGTzBsQlEycEZMSFZGUVVGMVJUdEpRVU4yUlN4TlFVRk5MR2RDUVVGblFpeEhRVUZIT3p0RlFVVjZRaXhsUVVGbE96czdPMjlEUVVsdFFpeEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMSGxDUVVGNVFpeERRVUZET3pzN08wZEJTVEZGTEZWQlFWVTdPMGRCUlZZc1EwRkJRenRKUVVOR0xFOUJRVThzWjBKQlFXZENMRU5CUVVNN1FVRkRNVUlzUTBGQlF6dEJRVUZCTEVOQlFVTTdRVUZGUml4VFFVRlRMRmxCUVZrc1EwRkRia0lzWjBKQlFYZENMRVZCUTNoQ0xFOUJRV1VzUlVGRFppeFZRVUZ0UWl4TFFVRkxPMGxCUlhoQ0xFMUJRVTBzVFVGQlRTeEhRVUZITEZGQlFWRXNRMEZCUXl4bFFVRmxMRU5CUVVNN1NVRkRlRU1zVFVGQlRTeE5RVUZOTEVkQlFVY3NVVUZCVVN4RFFVRkRMR0ZCUVdFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEpRVU5vUkN4TlFVRk5MRU5CUVVNc1NVRkJTU3hIUVVGSExHZENRVUZuUWl4RFFVRkRPMGxCUXk5Q0xFMUJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRPMGxCUTNKQ0xFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTXNaVUZCWlN4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8wbEJRemxETEUxQlFVMHNRMEZCUXl4WlFVRlpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFZEJRVWNzVDBGQlR5eEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTnNSQ3hOUVVGTkxFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03U1VGREwwTXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEJRVU0zUWl4RFFVRkRPMEZCUVVFc1EwRkJRenRCUVVWR0xGTkJRVk1zVDBGQlR5eERRVUZGTEVsQlFVa3NSVUZCUlN4SFFVRkhPMGxCUTNwQ0xFZEJRVWNzUTBGQlF5eFRRVUZUTEVkQlFVY3NTVUZCU1N4SlFVRkpMRVZCUVVVc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF6dEpRVU42UXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExGZEJRVmNzUTBGQlF6dFJRVU14UWl4VFFVRlRMRVZCUVVVc05FSkJRVFJDTzFGQlEzWkRMRWxCUVVrN1VVRkRTaXhKUVVGSkxFVkJRVVVzUjBGQlJ6dExRVU5XTEVOQlFVTXNRMEZCUXp0QlFVTk1MRU5CUVVNN1FVRkJRU3hEUVVGRE8wRkJSVVlzVFVGQlRTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETzBGQlJYcERMRFpFUVVFMlJEdEJRVU0zUkN4UlFVRlJMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNc1EwRkJZeXhGUVVGRkxFVkJRVVU3U1VGRGNFUXNkVU5CUVhWRE8wbEJRM1pETEUxQlFVMHNTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU03U1VGRGRFSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzFGQlEzWkNMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eEhRVUZITEVWQlFVVXNSVUZCUlR0WlFVTnVRaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRGFrTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1MwRkRTanRUUVVGTk8xRkJRMHdzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzB0QlEyeERPMEZCUTBnc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRlNDeE5RVUZOTEVOQlFVTXNUVUZCVFN4dlEwRkJiME1zUjBGQlJ5eERRVUZETEcxQ1FVRXJReXhGUVVGRkxFVkJRVVU3U1VGRGRFY3NXVUZCV1N4RFFVTldMSEZDUVVGeFFpeERRVUZETEcxQ1FVRnRRaXhEUVVGRExIbENRVUY1UWl4RFFVRkRMRVZCUTNCRkxFOUJRVThzUlVGRFVDeHRRa0ZCYlVJc1EwRkJReXhQUVVGUExFTkJRelZDTEVOQlFVTTdRVUZEU2l4RFFVRkRMRU5CUVVFaWZRPT0iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4vLyBDb2RlIGJlbG93IGlzIG5vdCBhIGNvbnRlbnQgc2NyaXB0OiBubyBGaXJlZm94IEFQSXMgc2hvdWxkIGJlIHVzZWRcbi8vIEFsc28sIG5vIHdlYnBhY2svZXM2IGltcG9ydHMgbWF5IGJlIHVzZWQgaW4gdGhpcyBmaWxlIHNpbmNlIHRoZSBzY3JpcHRcbi8vIGlzIGV4cG9ydGVkIGFzIGEgcGFnZSBzY3JpcHQgYXMgYSBzdHJpbmdcbmV4cG9ydCBmdW5jdGlvbiBwYWdlU2NyaXB0KGdldEluc3RydW1lbnRKUywganNJbnN0cnVtZW50YXRpb25TZXR0aW5ncykge1xuICAgIC8vIG1lc3NhZ2VzIHRoZSBpbmplY3RlZCBzY3JpcHRcbiAgICBjb25zdCBzZW5kTWVzc2FnZXNUb0xvZ2dlciA9IChldmVudElkLCBtZXNzYWdlcykgPT4ge1xuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudElkLCB7XG4gICAgICAgICAgICBkZXRhaWw6IG1lc3NhZ2VzLFxuICAgICAgICB9KSk7XG4gICAgfTtcbiAgICBjb25zdCBldmVudElkID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWV2ZW50LWlkXCIpO1xuICAgIGNvbnN0IHRlc3RpbmcgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LmdldEF0dHJpYnV0ZShcImRhdGEtdGVzdGluZ1wiKTtcbiAgICBjb25zdCBpbnN0cnVtZW50SlMgPSBnZXRJbnN0cnVtZW50SlMoZXZlbnRJZCwgc2VuZE1lc3NhZ2VzVG9Mb2dnZXIpO1xuICAgIGxldCB0MDtcbiAgICBpZiAodGVzdGluZyA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcGVuV1BNOiBDdXJyZW50bHkgdGVzdGluZ1wiKTtcbiAgICAgICAgdDAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJCZWdpbiBsb2FkaW5nIEpTIGluc3RydW1lbnRhdGlvbi5cIik7XG4gICAgfVxuICAgIGluc3RydW1lbnRKUyhqc0luc3RydW1lbnRhdGlvblNldHRpbmdzKTtcbiAgICBpZiAodGVzdGluZyA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgY29uc3QgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc29sZS5sb2coYENhbGwgdG8gaW5zdHJ1bWVudEpTIHRvb2sgJHt0MSAtIHQwfSBtaWxsaXNlY29uZHMuYCk7XG4gICAgICAgIHdpbmRvdy5pbnN0cnVtZW50SlMgPSBpbnN0cnVtZW50SlM7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiT3BlbldQTTogQ29udGVudC1zaWRlIGphdmFzY3JpcHQgaW5zdHJ1bWVudGF0aW9uIHN0YXJ0ZWQgd2l0aCBzcGVjOlwiLCBqc0luc3RydW1lbnRhdGlvblNldHRpbmdzLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksIFwiKGlmIHNwZWMgaXMgJzx1bmF2YWlsYWJsZT4nIGNoZWNrIHdlYiBjb25zb2xlLilcIik7XG4gICAgfVxufVxuO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYW1GMllYTmpjbWx3ZEMxcGJuTjBjblZ0Wlc1MExYQmhaMlV0YzJOdmNHVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTh1TGk5emNtTXZZMjl1ZEdWdWRDOXFZWFpoYzJOeWFYQjBMV2x1YzNSeWRXMWxiblF0Y0dGblpTMXpZMjl3WlM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3dyUWtGQkswSTdRVUZETDBJc2NVVkJRWEZGTzBGQlEzSkZMSGxGUVVGNVJUdEJRVU42UlN3eVEwRkJNa003UVVGRk0wTXNUVUZCVFN4VlFVRlZMRlZCUVZVc1EwRkJSU3hsUVVGbExFVkJRVVVzZVVKQlFYbENPMGxCUTNCRkxDdENRVUVyUWp0SlFVTXZRaXhOUVVGTkxHOUNRVUZ2UWl4SFFVRkhMRU5CUVVNc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeEZRVUZGTzFGQlEycEVMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRM0JDTEVsQlFVa3NWMEZCVnl4RFFVRkRMRTlCUVU4c1JVRkJSVHRaUVVOMlFpeE5RVUZOTEVWQlFVVXNVVUZCVVR0VFFVTnFRaXhEUVVGRExFTkJRMGdzUTBGQlF6dEpRVU5LTEVOQlFVTXNRMEZCUXp0SlFVVkdMRTFCUVUwc1QwRkJUeXhIUVVGSExGRkJRVkVzUTBGQlF5eGhRVUZoTEVOQlFVTXNXVUZCV1N4RFFVRkRMR1ZCUVdVc1EwRkJReXhEUVVGRE8wbEJRM0pGTEUxQlFVMHNUMEZCVHl4SFFVRkhMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zV1VGQldTeERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRPMGxCUTNCRkxFMUJRVTBzV1VGQldTeEhRVUZITEdWQlFXVXNRMEZCUXl4UFFVRlBMRVZCUVVVc2IwSkJRVzlDTEVOQlFVTXNRMEZCUXp0SlFVTndSU3hKUVVGSkxFVkJRVlVzUTBGQlF6dEpRVU5tTEVsQlFVa3NUMEZCVHl4TFFVRkxMRTFCUVUwc1JVRkJSVHRSUVVOMFFpeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRFJDUVVFMFFpeERRVUZETEVOQlFVTTdVVUZETVVNc1JVRkJSU3hIUVVGSExGZEJRVmNzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjJRaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEcxRFFVRnRReXhEUVVGRExFTkJRVU03UzBGRGJFUTdTVUZEUkN4WlFVRlpMRU5CUVVNc2VVSkJRWGxDTEVOQlFVTXNRMEZCUXp0SlFVTjRReXhKUVVGSkxFOUJRVThzUzBGQlN5eE5RVUZOTEVWQlFVVTdVVUZEZEVJc1RVRkJUU3hGUVVGRkxFZEJRVWNzVjBGQlZ5eERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUXpkQ0xFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNOa0pCUVRaQ0xFVkJRVVVzUjBGQlJ5eEZRVUZGTEdkQ1FVRm5RaXhEUVVGRExFTkJRVU03VVVGRGFrVXNUVUZCWXl4RFFVRkRMRmxCUVZrc1IwRkJSeXhaUVVGWkxFTkJRVU03VVVGRE5VTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkRWQ3h4UlVGQmNVVXNSVUZEY2tVc2VVSkJRWGxDTEVWQlEzcENMRWxCUVVrc1NVRkJTU3hGUVVGRkxFTkJRVU1zVjBGQlZ5eEZRVUZGTEVWQlEzaENMR2xFUVVGcFJDeERRVU5zUkN4RFFVRkRPMHRCUTBnN1FVRkRTQ3hEUVVGRE8wRkJRVUVzUTBGQlF5SjkiLCJleHBvcnQgKiBmcm9tIFwiLi9iYWNrZ3JvdW5kL2Nvb2tpZS1pbnN0cnVtZW50XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9iYWNrZ3JvdW5kL2Rucy1pbnN0cnVtZW50XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9iYWNrZ3JvdW5kL2h0dHAtaW5zdHJ1bWVudFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vYmFja2dyb3VuZC9qYXZhc2NyaXB0LWluc3RydW1lbnRcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2JhY2tncm91bmQvbmF2aWdhdGlvbi1pbnN0cnVtZW50XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9jb250ZW50L2phdmFzY3JpcHQtaW5zdHJ1bWVudC1jb250ZW50LXNjb3BlXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9saWIvaHR0cC1wb3N0LXBhcnNlclwiO1xuZXhwb3J0ICogZnJvbSBcIi4vbGliL3N0cmluZy11dGlsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc2NoZW1hXCI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhVzVrWlhndWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12YVc1a1pYZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1kwRkJZeXhuUTBGQlowTXNRMEZCUXp0QlFVTXZReXhqUVVGakxEWkNRVUUyUWl4RFFVRkRPMEZCUXpWRExHTkJRV01zT0VKQlFUaENMRU5CUVVNN1FVRkROME1zWTBGQll5eHZRMEZCYjBNc1EwRkJRenRCUVVOdVJDeGpRVUZqTEc5RFFVRnZReXhEUVVGRE8wRkJRMjVFTEdOQlFXTXNLME5CUVN0RExFTkJRVU03UVVGRE9VUXNZMEZCWXl4M1FrRkJkMElzUTBGQlF6dEJRVU4yUXl4alFVRmpMRzlDUVVGdlFpeERRVUZETzBGQlEyNURMR05CUVdNc1ZVRkJWU3hEUVVGREluMD0iLCIvKipcbiAqIFRoaXMgZW5hYmxlcyB1cyB0byBrZWVwIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvcmlnaW5hbCBvcmRlclxuICogaW4gd2hpY2ggZXZlbnRzIGFycml2ZWQgdG8gb3VyIGV2ZW50IGxpc3RlbmVycy5cbiAqL1xubGV0IGV2ZW50T3JkaW5hbCA9IDA7XG5leHBvcnQgY29uc3QgaW5jcmVtZW50ZWRFdmVudE9yZGluYWwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGV2ZW50T3JkaW5hbCsrO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpYaDBaVzV6YVc5dUxYTmxjM05wYjI0dFpYWmxiblF0YjNKa2FXNWhiQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUwzTnlZeTlzYVdJdlpYaDBaVzV6YVc5dUxYTmxjM05wYjI0dFpYWmxiblF0YjNKa2FXNWhiQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdPMGRCUjBjN1FVRkRTQ3hKUVVGSkxGbEJRVmtzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZGY2tJc1RVRkJUU3hEUVVGRExFMUJRVTBzZFVKQlFYVkNMRWRCUVVjc1IwRkJSeXhGUVVGRk8wbEJRekZETEU5QlFVOHNXVUZCV1N4RlFVRkZMRU5CUVVNN1FVRkRlRUlzUTBGQlF5eERRVUZESW4wPSIsImltcG9ydCB7IG1ha2VVVUlEIH0gZnJvbSBcIi4vdXVpZFwiO1xuLyoqXG4gKiBUaGlzIGVuYWJsZXMgdXMgdG8gYWNjZXNzIGEgdW5pcXVlIHJlZmVyZW5jZSB0byB0aGlzIGJyb3dzZXJcbiAqIHNlc3Npb24gLSByZWdlbmVyYXRlZCBhbnkgdGltZSB0aGUgYmFja2dyb3VuZCBwcm9jZXNzIGdldHNcbiAqIHJlc3RhcnRlZCAod2hpY2ggc2hvdWxkIG9ubHkgYmUgb24gYnJvd3NlciByZXN0YXJ0cylcbiAqL1xuZXhwb3J0IGNvbnN0IGV4dGVuc2lvblNlc3Npb25VdWlkID0gbWFrZVVVSUQoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpYaDBaVzV6YVc5dUxYTmxjM05wYjI0dGRYVnBaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUwzTnlZeTlzYVdJdlpYaDBaVzV6YVc5dUxYTmxjM05wYjI0dGRYVnBaQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNVVUZCVVN4RlFVRkZMRTFCUVUwc1VVRkJVU3hEUVVGRE8wRkJSV3hET3pzN08wZEJTVWM3UVVGRFNDeE5RVUZOTEVOQlFVTXNUVUZCVFN4dlFrRkJiMElzUjBGQlJ5eFJRVUZSTEVWQlFVVXNRMEZCUXlKOSIsImltcG9ydCB7IGVzY2FwZVN0cmluZywgVWludDhUb0Jhc2U2NCB9IGZyb20gXCIuL3N0cmluZy11dGlsc1wiO1xuZXhwb3J0IGNsYXNzIEh0dHBQb3N0UGFyc2VyIHtcbiAgICBvbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHM7XG4gICAgZGF0YVJlY2VpdmVyO1xuICAgIGNvbnN0cnVjdG9yKG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscywgZGF0YVJlY2VpdmVyKSB7XG4gICAgICAgIHRoaXMub25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzID0gb25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzO1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlciA9IGRhdGFSZWNlaXZlcjtcbiAgICB9XG4gICAgcGFyc2VQb3N0UmVxdWVzdCgpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdEJvZHkgPSB0aGlzLm9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscy5yZXF1ZXN0Qm9keTtcbiAgICAgICAgaWYgKHJlcXVlc3RCb2R5LmVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5sb2dFcnJvcihcIkV4Y2VwdGlvbjogVXBzdHJlYW0gZmFpbGVkIHRvIHBhcnNlIFBPU1Q6IFwiICsgcmVxdWVzdEJvZHkuZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXF1ZXN0Qm9keS5mb3JtRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwb3N0X2JvZHk6IGVzY2FwZVN0cmluZyhKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keS5mb3JtRGF0YSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxdWVzdEJvZHkucmF3KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBvc3RfYm9keV9yYXc6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3RCb2R5LnJhdy5tYXAoKHgpID0+IFtcbiAgICAgICAgICAgICAgICAgICAgeC5maWxlLFxuICAgICAgICAgICAgICAgICAgICBVaW50OFRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHguYnl0ZXMpKSxcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhSFIwY0Mxd2IzTjBMWEJoY25ObGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMeTR1TDNOeVl5OXNhV0l2YUhSMGNDMXdiM04wTFhCaGNuTmxjaTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGRFFTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RlFVRkZMR0ZCUVdFc1JVRkJSU3hOUVVGTkxHZENRVUZuUWl4RFFVRkRPMEZCVVRkRUxFMUJRVTBzVDBGQlR5eGpRVUZqTzBsQlExSXNNa0pCUVRKQ0xFTkJRWGRETzBsQlEyNUZMRmxCUVZrc1EwRkJRenRKUVVVNVFpeFpRVU5GTERKQ1FVRnJSU3hGUVVOc1JTeFpRVUZaTzFGQlJWb3NTVUZCU1N4RFFVRkRMREpDUVVFeVFpeEhRVUZITERKQ1FVRXlRaXhEUVVGRE8xRkJReTlFTEVsQlFVa3NRMEZCUXl4WlFVRlpMRWRCUVVjc1dVRkJXU3hEUVVGRE8wbEJRMjVETEVOQlFVTTdTVUZGVFN4blFrRkJaMEk3VVVGRGNrSXNUVUZCVFN4WFFVRlhMRWRCUVVjc1NVRkJTU3hEUVVGRExESkNRVUV5UWl4RFFVRkRMRmRCUVZjc1EwRkJRenRSUVVOcVJTeEpRVUZKTEZkQlFWY3NRMEZCUXl4TFFVRkxMRVZCUVVVN1dVRkRja0lzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUTNoQ0xEUkRRVUUwUXl4SFFVRkhMRmRCUVZjc1EwRkJReXhMUVVGTExFTkJRMnBGTEVOQlFVTTdVMEZEU0R0UlFVTkVMRWxCUVVrc1YwRkJWeXhEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU40UWl4UFFVRlBPMmRDUVVOTUxGTkJRVk1zUlVGQlJTeFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdZVUZET1VRc1EwRkJRenRUUVVOSU8xRkJRMFFzU1VGQlNTeFhRVUZYTEVOQlFVTXNSMEZCUnl4RlFVRkZPMWxCUTI1Q0xFOUJRVTg3WjBKQlEwd3NZVUZCWVN4RlFVRkZMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRek5DTEZkQlFWY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXp0dlFrRkRla0lzUTBGQlF5eERRVUZETEVsQlFVazdiMEpCUTA0c1lVRkJZU3hEUVVGRExFbEJRVWtzVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRwUWtGRGRrTXNRMEZCUXl4RFFVTklPMkZCUTBZc1EwRkJRenRUUVVOSU8xRkJRMFFzVDBGQlR5eEZRVUZGTEVOQlFVTTdTVUZEV2l4RFFVRkRPME5CUTBZaWZRPT0iLCIvLyBJbnRydW1lbnRhdGlvbiBpbmplY3Rpb24gY29kZSBpcyBiYXNlZCBvbiBwcml2YWN5YmFkZ2VyZmlyZWZveFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL0VGRm9yZy9wcml2YWN5YmFkZ2VyZmlyZWZveC9ibG9iL21hc3Rlci9kYXRhL2ZpbmdlcnByaW50aW5nLmpzXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5zdHJ1bWVudEpTKGV2ZW50SWQsIHNlbmRNZXNzYWdlc1RvTG9nZ2VyKSB7XG4gICAgLypcbiAgICAgKiBJbnN0cnVtZW50YXRpb24gaGVscGVyc1xuICAgICAqIChJbmxpbmVkIGluIG9yZGVyIGZvciBqc0luc3RydW1lbnRzIHRvIGJlIGVhc2lseSBleHBvcnRhYmxlIGFzIGEgc3RyaW5nKVxuICAgICAqL1xuICAgIC8vIENvdW50ZXIgdG8gY2FwICMgb2YgY2FsbHMgbG9nZ2VkIGZvciBlYWNoIHNjcmlwdC9hcGkgY29tYmluYXRpb25cbiAgICBjb25zdCBtYXhMb2dDb3VudCA9IDUwMDtcbiAgICAvLyBsb2dDb3VudGVyXG4gICAgY29uc3QgbG9nQ291bnRlciA9IG5ldyBPYmplY3QoKTtcbiAgICAvLyBQcmV2ZW50IGxvZ2dpbmcgb2YgZ2V0cyBhcmlzaW5nIGZyb20gbG9nZ2luZ1xuICAgIGxldCBpbkxvZyA9IGZhbHNlO1xuICAgIC8vIFRvIGtlZXAgdHJhY2sgb2YgdGhlIG9yaWdpbmFsIG9yZGVyIG9mIGV2ZW50c1xuICAgIGxldCBvcmRpbmFsID0gMDtcbiAgICAvLyBPcHRpb25zIGZvciBKU09wZXJhdGlvblxuICAgIGNvbnN0IEpTT3BlcmF0aW9uID0ge1xuICAgICAgICBjYWxsOiBcImNhbGxcIixcbiAgICAgICAgZ2V0OiBcImdldFwiLFxuICAgICAgICBnZXRfZmFpbGVkOiBcImdldChmYWlsZWQpXCIsXG4gICAgICAgIGdldF9mdW5jdGlvbjogXCJnZXQoZnVuY3Rpb24pXCIsXG4gICAgICAgIHNldDogXCJzZXRcIixcbiAgICAgICAgc2V0X2ZhaWxlZDogXCJzZXQoZmFpbGVkKVwiLFxuICAgICAgICBzZXRfcHJldmVudGVkOiBcInNldChwcmV2ZW50ZWQpXCIsXG4gICAgfTtcbiAgICAvLyBSb3VnaCBpbXBsZW1lbnRhdGlvbnMgb2YgT2JqZWN0LmdldFByb3BlcnR5RGVzY3JpcHRvciBhbmQgT2JqZWN0LmdldFByb3BlcnR5TmFtZXNcbiAgICAvLyBTZWUgaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTpleHRlbmRlZF9vYmplY3RfYXBpXG4gICAgT2JqZWN0LmdldFByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIChzdWJqZWN0LCBuYW1lKSB7XG4gICAgICAgIGlmIChzdWJqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGdldCBwcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzdWJqZWN0LCBuYW1lKTtcbiAgICAgICAgbGV0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHN1YmplY3QpO1xuICAgICAgICB3aGlsZSAocGQgPT09IHVuZGVmaW5lZCAmJiBwcm90byAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcGQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvLCBuYW1lKTtcbiAgICAgICAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGQ7XG4gICAgfTtcbiAgICBPYmplY3QuZ2V0UHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgICAgIGlmIChzdWJqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGdldCBwcm9wZXJ0eSBuYW1lcyBmb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwcm9wcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHN1YmplY3QpO1xuICAgICAgICBsZXQgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc3ViamVjdCk7XG4gICAgICAgIHdoaWxlIChwcm90byAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcHJvcHMgPSBwcm9wcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pKTtcbiAgICAgICAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGSVhNRTogcmVtb3ZlIGR1cGxpY2F0ZSBwcm9wZXJ0eSBuYW1lcyBmcm9tIHByb3BzXG4gICAgICAgIHJldHVybiBwcm9wcztcbiAgICB9O1xuICAgIC8vIGRlYm91bmNlIC0gZnJvbSBVbmRlcnNjb3JlIHYxLjYuMFxuICAgIGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGxldCB0aW1lb3V0O1xuICAgICAgICBsZXQgYXJncztcbiAgICAgICAgbGV0IGNvbnRleHQ7XG4gICAgICAgIGxldCB0aW1lc3RhbXA7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIGNvbnN0IGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgbGFzdCA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG4gICAgICAgICAgICBpZiAobGFzdCA8IHdhaXQpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBjb25zdCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGdlbmVyYXRlcyBhIHBhdGggZm9yIGFuIGVsZW1lbnRcbiAgICBmdW5jdGlvbiBnZXRQYXRoVG9Eb21FbGVtZW50KGVsZW1lbnQsIHZpc2liaWxpdHlBdHRyID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnRhZ05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiTlVMTC9cIiArIGVsZW1lbnQudGFnTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2libGluZ0luZGV4ID0gMTtcbiAgICAgICAgY29uc3Qgc2libGluZ3MgPSBlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2RlcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaWJsaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgc2libGluZyA9IHNpYmxpbmdzW2ldO1xuICAgICAgICAgICAgaWYgKHNpYmxpbmcgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGdldFBhdGhUb0RvbUVsZW1lbnQoZWxlbWVudC5wYXJlbnROb2RlLCB2aXNpYmlsaXR5QXR0cik7XG4gICAgICAgICAgICAgICAgcGF0aCArPSBcIi9cIiArIGVsZW1lbnQudGFnTmFtZSArIFwiW1wiICsgc2libGluZ0luZGV4O1xuICAgICAgICAgICAgICAgIHBhdGggKz0gXCIsXCIgKyBlbGVtZW50LmlkO1xuICAgICAgICAgICAgICAgIHBhdGggKz0gXCIsXCIgKyBlbGVtZW50LmNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAodmlzaWJpbGl0eUF0dHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArPSBcIixcIiArIGVsZW1lbnQuaGlkZGVuO1xuICAgICAgICAgICAgICAgICAgICBwYXRoICs9IFwiLFwiICsgZWxlbWVudC5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgICAgICAgICBwYXRoICs9IFwiLFwiICsgZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSBcIkFcIikge1xuICAgICAgICAgICAgICAgICAgICBwYXRoICs9IFwiLFwiICsgZWxlbWVudC5ocmVmO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXRoICs9IFwiXVwiO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNpYmxpbmcubm9kZVR5cGUgPT09IDEgJiYgc2libGluZy50YWdOYW1lID09PSBlbGVtZW50LnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICBzaWJsaW5nSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBIZWxwZXIgZm9yIEpTT05pZnlpbmcgb2JqZWN0c1xuICAgIGZ1bmN0aW9uIHNlcmlhbGl6ZU9iamVjdChvYmplY3QsIHN0cmluZ2lmeUZ1bmN0aW9ucyA9IGZhbHNlKSB7XG4gICAgICAgIC8vIEhhbmRsZSBwZXJtaXNzaW9ucyBlcnJvcnNcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChvYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUZ1bmN0aW9ucyA/IG9iamVjdC50b1N0cmluZygpIDogXCJGVU5DVElPTlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc2Vlbk9iamVjdHMgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmplY3QsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnlGdW5jdGlvbnMgPyB2YWx1ZS50b1N0cmluZygpIDogXCJGVU5DVElPTlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB3cmFwcGluZyBvbiBjb250ZW50IG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwid3JhcHBlZEpTT2JqZWN0XCIgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUud3JhcHBlZEpTT2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFNlcmlhbGl6ZSBET00gZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRQYXRoVG9Eb21FbGVtZW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBQcmV2ZW50IHNlcmlhbGl6YXRpb24gY3ljbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IFwiXCIgfHwgc2Vlbk9iamVjdHMuaW5kZXhPZih2YWx1ZSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVuT2JqZWN0cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9wZW5XUE06IFNFUklBTElaQVRJT04gRVJST1I6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIFwiU0VSSUFMSVpBVElPTiBFUlJPUjogXCIgKyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGVDb3VudGVyQW5kQ2hlY2tJZk92ZXIoc2NyaXB0VXJsLCBzeW1ib2wpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gc2NyaXB0VXJsICsgXCJ8XCIgKyBzeW1ib2w7XG4gICAgICAgIGlmIChrZXkgaW4gbG9nQ291bnRlciAmJiBsb2dDb3VudGVyW2tleV0gPj0gbWF4TG9nQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCEoa2V5IGluIGxvZ0NvdW50ZXIpKSB7XG4gICAgICAgICAgICBsb2dDb3VudGVyW2tleV0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9nQ291bnRlcltrZXldICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBGb3IgZ2V0cywgc2V0cywgZXRjLiBvbiBhIHNpbmdsZSB2YWx1ZVxuICAgIGZ1bmN0aW9uIGxvZ1ZhbHVlKGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSwgdmFsdWUsIG9wZXJhdGlvbiwgLy8gZnJvbSBKU09wZXJhdGlvbiBvYmplY3QgcGxlYXNlXG4gICAgY2FsbENvbnRleHQsIGxvZ1NldHRpbmdzKSB7XG4gICAgICAgIGlmIChpbkxvZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluTG9nID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgb3ZlckxpbWl0ID0gdXBkYXRlQ291bnRlckFuZENoZWNrSWZPdmVyKGNhbGxDb250ZXh0LnNjcmlwdFVybCwgaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lKTtcbiAgICAgICAgaWYgKG92ZXJMaW1pdCkge1xuICAgICAgICAgICAgaW5Mb2cgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtc2cgPSB7XG4gICAgICAgICAgICBvcGVyYXRpb24sXG4gICAgICAgICAgICBzeW1ib2w6IGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiBzZXJpYWxpemVPYmplY3QodmFsdWUsIGxvZ1NldHRpbmdzLmxvZ0Z1bmN0aW9uc0FzU3RyaW5ncyksXG4gICAgICAgICAgICBzY3JpcHRVcmw6IGNhbGxDb250ZXh0LnNjcmlwdFVybCxcbiAgICAgICAgICAgIHNjcmlwdExpbmU6IGNhbGxDb250ZXh0LnNjcmlwdExpbmUsXG4gICAgICAgICAgICBzY3JpcHRDb2w6IGNhbGxDb250ZXh0LnNjcmlwdENvbCxcbiAgICAgICAgICAgIGZ1bmNOYW1lOiBjYWxsQ29udGV4dC5mdW5jTmFtZSxcbiAgICAgICAgICAgIHNjcmlwdExvY0V2YWw6IGNhbGxDb250ZXh0LnNjcmlwdExvY0V2YWwsXG4gICAgICAgICAgICBjYWxsU3RhY2s6IGNhbGxDb250ZXh0LmNhbGxTdGFjayxcbiAgICAgICAgICAgIG9yZGluYWw6IG9yZGluYWwrKyxcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNlbmQoXCJsb2dWYWx1ZVwiLCBtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcGVuV1BNOiBVbnN1Y2Nlc3NmdWwgdmFsdWUgbG9nIVwiKTtcbiAgICAgICAgICAgIGxvZ0Vycm9yVG9Db25zb2xlKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBpbkxvZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBGb3IgZnVuY3Rpb25zXG4gICAgZnVuY3Rpb24gbG9nQ2FsbChpbnN0cnVtZW50ZWRGdW5jdGlvbk5hbWUsIGFyZ3MsIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncykge1xuICAgICAgICBpZiAoaW5Mb2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbkxvZyA9IHRydWU7XG4gICAgICAgIGNvbnN0IG92ZXJMaW1pdCA9IHVwZGF0ZUNvdW50ZXJBbmRDaGVja0lmT3ZlcihjYWxsQ29udGV4dC5zY3JpcHRVcmwsIGluc3RydW1lbnRlZEZ1bmN0aW9uTmFtZSk7XG4gICAgICAgIGlmIChvdmVyTGltaXQpIHtcbiAgICAgICAgICAgIGluTG9nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc3BlY2lhbCBhcmd1bWVudHMgYXJyYXkgdG8gYSBzdGFuZGFyZCBhcnJheSBmb3IgSlNPTmlmeWluZ1xuICAgICAgICAgICAgY29uc3Qgc2VyaWFsQXJncyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgYXJncykge1xuICAgICAgICAgICAgICAgIHNlcmlhbEFyZ3MucHVzaChzZXJpYWxpemVPYmplY3QoYXJnLCBsb2dTZXR0aW5ncy5sb2dGdW5jdGlvbnNBc1N0cmluZ3MpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb246IEpTT3BlcmF0aW9uLmNhbGwsXG4gICAgICAgICAgICAgICAgc3ltYm9sOiBpbnN0cnVtZW50ZWRGdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogc2VyaWFsQXJncyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcbiAgICAgICAgICAgICAgICBzY3JpcHRVcmw6IGNhbGxDb250ZXh0LnNjcmlwdFVybCxcbiAgICAgICAgICAgICAgICBzY3JpcHRMaW5lOiBjYWxsQ29udGV4dC5zY3JpcHRMaW5lLFxuICAgICAgICAgICAgICAgIHNjcmlwdENvbDogY2FsbENvbnRleHQuc2NyaXB0Q29sLFxuICAgICAgICAgICAgICAgIGZ1bmNOYW1lOiBjYWxsQ29udGV4dC5mdW5jTmFtZSxcbiAgICAgICAgICAgICAgICBzY3JpcHRMb2NFdmFsOiBjYWxsQ29udGV4dC5zY3JpcHRMb2NFdmFsLFxuICAgICAgICAgICAgICAgIGNhbGxTdGFjazogY2FsbENvbnRleHQuY2FsbFN0YWNrLFxuICAgICAgICAgICAgICAgIG9yZGluYWw6IG9yZGluYWwrKyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZW5kKFwibG9nQ2FsbFwiLCBtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcGVuV1BNOiBVbnN1Y2Nlc3NmdWwgY2FsbCBsb2c6IFwiICsgaW5zdHJ1bWVudGVkRnVuY3Rpb25OYW1lKTtcbiAgICAgICAgICAgIGxvZ0Vycm9yVG9Db25zb2xlKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBpbkxvZyA9IGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsb2dFcnJvclRvQ29uc29sZShlcnJvciwgY29udGV4dCA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuV1BNOiBFcnJvciBuYW1lOiBcIiArIGVycm9yLm5hbWUpO1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiT3BlbldQTTogRXJyb3IgbWVzc2FnZTogXCIgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk9wZW5XUE06IEVycm9yIGZpbGVuYW1lOiBcIiArIGVycm9yLmZpbGVOYW1lKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk9wZW5XUE06IEVycm9yIGxpbmUgbnVtYmVyOiBcIiArIGVycm9yLmxpbmVOdW1iZXIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiT3BlbldQTTogRXJyb3Igc3RhY2s6IFwiICsgZXJyb3Iuc3RhY2spO1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk9wZW5XUE06IEVycm9yIGNvbnRleHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoY29udGV4dCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEhlbHBlciB0byBnZXQgb3JpZ2luYXRpbmcgc2NyaXB0IHVybHNcbiAgICBmdW5jdGlvbiBnZXRTdGFja1RyYWNlKCkge1xuICAgICAgICBsZXQgc3RhY2s7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzdGFjayA9IGVyci5zdGFjaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RhY2s7XG4gICAgfVxuICAgIC8vIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTIwMjE4NVxuICAgIGNvbnN0IHJzcGxpdCA9IGZ1bmN0aW9uIChzb3VyY2UsIHNlcCwgbWF4c3BsaXQpIHtcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBzb3VyY2Uuc3BsaXQoc2VwKTtcbiAgICAgICAgcmV0dXJuIG1heHNwbGl0XG4gICAgICAgICAgICA/IFtzcGxpdC5zbGljZSgwLCAtbWF4c3BsaXQpLmpvaW4oc2VwKV0uY29uY2F0KHNwbGl0LnNsaWNlKC1tYXhzcGxpdCkpXG4gICAgICAgICAgICA6IHNwbGl0O1xuICAgIH07XG4gICAgZnVuY3Rpb24gZ2V0T3JpZ2luYXRpbmdTY3JpcHRDb250ZXh0KGdldENhbGxTdGFjayA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IHRyYWNlID0gZ2V0U3RhY2tUcmFjZSgpLnRyaW0oKS5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgLy8gcmV0dXJuIGEgY29udGV4dCBvYmplY3QgZXZlbiBpZiB0aGVyZSBpcyBhbiBlcnJvclxuICAgICAgICBjb25zdCBlbXB0eV9jb250ZXh0ID0ge1xuICAgICAgICAgICAgc2NyaXB0VXJsOiBcIlwiLFxuICAgICAgICAgICAgc2NyaXB0TGluZTogXCJcIixcbiAgICAgICAgICAgIHNjcmlwdENvbDogXCJcIixcbiAgICAgICAgICAgIGZ1bmNOYW1lOiBcIlwiLFxuICAgICAgICAgICAgc2NyaXB0TG9jRXZhbDogXCJcIixcbiAgICAgICAgICAgIGNhbGxTdGFjazogXCJcIixcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYWNlLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbXB0eV9jb250ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIDAsIDEgYW5kIDIgYXJlIE9wZW5XUE0ncyBvd24gZnVuY3Rpb25zIChlLmcuIGdldFN0YWNrVHJhY2UpLCBza2lwIHRoZW0uXG4gICAgICAgIGNvbnN0IGNhbGxTaXRlID0gdHJhY2VbM107XG4gICAgICAgIGlmICghY2FsbFNpdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBlbXB0eV9jb250ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8qXG4gICAgICAgICAqIFN0YWNrIGZyYW1lIGZvcm1hdCBpcyBzaW1wbHk6IEZVTkNfTkFNRUBGSUxFTkFNRTpMSU5FX05POkNPTFVNTl9OT1xuICAgICAgICAgKlxuICAgICAgICAgKiBJZiBldmFsIG9yIEZ1bmN0aW9uIGlzIGludm9sdmVkIHdlIGhhdmUgYW4gYWRkaXRpb25hbCBwYXJ0IGFmdGVyIHRoZSBGSUxFTkFNRSwgZS5nLjpcbiAgICAgICAgICogRlVOQ19OQU1FQEZJTEVOQU1FIGxpbmUgMTIzID4gZXZhbCBsaW5lIDEgPiBldmFsOkxJTkVfTk86Q09MVU1OX05PXG4gICAgICAgICAqIG9yIEZVTkNfTkFNRUBGSUxFTkFNRSBsaW5lIDIzNCA+IEZ1bmN0aW9uOkxJTkVfTk86Q09MVU1OX05PXG4gICAgICAgICAqXG4gICAgICAgICAqIFdlIHN0b3JlIHRoZSBwYXJ0IGJldHdlZW4gdGhlIEZJTEVOQU1FIGFuZCB0aGUgTElORV9OTyBpbiBzY3JpcHRMb2NFdmFsXG4gICAgICAgICAqL1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHNjcmlwdFVybCA9IFwiXCI7XG4gICAgICAgICAgICBsZXQgc2NyaXB0TG9jRXZhbCA9IFwiXCI7IC8vIGZvciBldmFsIG9yIEZ1bmN0aW9uIGNhbGxzXG4gICAgICAgICAgICBjb25zdCBjYWxsU2l0ZVBhcnRzID0gY2FsbFNpdGUuc3BsaXQoXCJAXCIpO1xuICAgICAgICAgICAgY29uc3QgZnVuY05hbWUgPSBjYWxsU2l0ZVBhcnRzWzBdIHx8IFwiXCI7XG4gICAgICAgICAgICBjb25zdCBpdGVtcyA9IHJzcGxpdChjYWxsU2l0ZVBhcnRzWzFdLCBcIjpcIiwgMik7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5ObyA9IGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgbGluZU5vID0gaXRlbXNbaXRlbXMubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICBjb25zdCBzY3JpcHRGaWxlTmFtZSA9IGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDNdIHx8IFwiXCI7XG4gICAgICAgICAgICBjb25zdCBsaW5lTm9JZHggPSBzY3JpcHRGaWxlTmFtZS5pbmRleE9mKFwiIGxpbmUgXCIpOyAvLyBsaW5lIGluIHRoZSBVUkwgbWVhbnMgZXZhbCBvciBGdW5jdGlvblxuICAgICAgICAgICAgaWYgKGxpbmVOb0lkeCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHRVcmwgPSBzY3JpcHRGaWxlTmFtZTsgLy8gVE9ETzogc29tZXRpbWVzIHdlIGhhdmUgZmlsZW5hbWUgb25seSwgZS5nLiBYWC5qc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0VXJsID0gc2NyaXB0RmlsZU5hbWUuc2xpY2UoMCwgbGluZU5vSWR4KTtcbiAgICAgICAgICAgICAgICBzY3JpcHRMb2NFdmFsID0gc2NyaXB0RmlsZU5hbWUuc2xpY2UobGluZU5vSWR4ICsgMSwgc2NyaXB0RmlsZU5hbWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNhbGxDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIHNjcmlwdFVybCxcbiAgICAgICAgICAgICAgICBzY3JpcHRMaW5lOiBsaW5lTm8sXG4gICAgICAgICAgICAgICAgc2NyaXB0Q29sOiBjb2x1bW5ObyxcbiAgICAgICAgICAgICAgICBmdW5jTmFtZSxcbiAgICAgICAgICAgICAgICBzY3JpcHRMb2NFdmFsLFxuICAgICAgICAgICAgICAgIGNhbGxTdGFjazogZ2V0Q2FsbFN0YWNrID8gdHJhY2Uuc2xpY2UoMykuam9pbihcIlxcblwiKS50cmltKCkgOiBcIlwiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsQ29udGV4dDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcGVuV1BNOiBFcnJvciBwYXJzaW5nIHRoZSBzY3JpcHQgY29udGV4dFwiLCBlLnRvU3RyaW5nKCksIGNhbGxTaXRlKTtcbiAgICAgICAgICAgIHJldHVybiBlbXB0eV9jb250ZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KG9iamVjdCwgcHJvcGVydHlOYW1lKSB7XG4gICAgICAgIGxldCBwcm9wZXJ0eTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb3BlcnR5ID0gb2JqZWN0W3Byb3BlcnR5TmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3BlcnR5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBudWxsIGlzIHR5cGUgXCJvYmplY3RcIlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0eXBlb2YgcHJvcGVydHkgPT09IFwib2JqZWN0XCI7XG4gICAgfVxuICAgIC8vIExvZyBjYWxscyB0byBhIGdpdmVuIGZ1bmN0aW9uXG4gICAgLy8gVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIHdyYXBwZXIgYXJvdW5kIGBmdW5jYCB3aGljaCBsb2dzIGNhbGxzXG4gICAgLy8gdG8gYGZ1bmNgLiBgb2JqZWN0TmFtZWAgYW5kIGBtZXRob2ROYW1lYCBhcmUgdXNlZCBzdHJpY3RseSB0byBpZGVudGlmeVxuICAgIC8vIHdoaWNoIG9iamVjdCBtZXRob2QgYGZ1bmNgIGlzIGNvbWluZyBmcm9tIGluIHRoZSBsb2dzXG4gICAgZnVuY3Rpb24gaW5zdHJ1bWVudEZ1bmN0aW9uKG9iamVjdE5hbWUsIG1ldGhvZE5hbWUsIGZ1bmMsIGxvZ1NldHRpbmdzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsQ29udGV4dCA9IGdldE9yaWdpbmF0aW5nU2NyaXB0Q29udGV4dChsb2dTZXR0aW5ncy5sb2dDYWxsU3RhY2spO1xuICAgICAgICAgICAgbG9nQ2FsbChvYmplY3ROYW1lICsgXCIuXCIgKyBtZXRob2ROYW1lLCBhcmd1bWVudHMsIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBMb2cgcHJvcGVydGllcyBvZiBwcm90b3R5cGVzIGFuZCBvYmplY3RzXG4gICAgZnVuY3Rpb24gaW5zdHJ1bWVudE9iamVjdFByb3BlcnR5KG9iamVjdCwgb2JqZWN0TmFtZSwgcHJvcGVydHlOYW1lLCBsb2dTZXR0aW5ncykge1xuICAgICAgICBpZiAoIW9iamVjdCB8fFxuICAgICAgICAgICAgIW9iamVjdE5hbWUgfHxcbiAgICAgICAgICAgICFwcm9wZXJ0eU5hbWUgfHxcbiAgICAgICAgICAgIHByb3BlcnR5TmFtZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlcXVlc3QgdG8gaW5zdHJ1bWVudE9iamVjdFByb3BlcnR5LlxuICAgICAgICBPYmplY3Q6ICR7b2JqZWN0fVxuICAgICAgICBvYmplY3ROYW1lOiAke29iamVjdE5hbWV9XG4gICAgICAgIHByb3BlcnR5TmFtZTogJHtwcm9wZXJ0eU5hbWV9XG4gICAgICAgIGApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFN0b3JlIG9yaWdpbmFsIGRlc2NyaXB0b3IgaW4gY2xvc3VyZVxuICAgICAgICBjb25zdCBwcm9wRGVzYyA9IE9iamVjdC5nZXRQcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgICAvLyBQcm9wZXJ0eSBkZXNjcmlwdG9yIG11c3QgZXhpc3QgdW5sZXNzIHdlIGFyZSBpbnN0cnVtZW50aW5nIGEgbm9uRXhpc3RpbmcgcHJvcGVydHlcbiAgICAgICAgaWYgKCFwcm9wRGVzYyAmJlxuICAgICAgICAgICAgIWxvZ1NldHRpbmdzLm5vbkV4aXN0aW5nUHJvcGVydGllc1RvSW5zdHJ1bWVudC5pbmNsdWRlcyhwcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiUHJvcGVydHkgZGVzY3JpcHRvciBub3QgZm91bmQgZm9yXCIsIG9iamVjdE5hbWUsIHByb3BlcnR5TmFtZSwgb2JqZWN0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBQcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciB1bmRlZmluZWQgcHJvcGVydGllc1xuICAgICAgICBsZXQgdW5kZWZpbmVkUHJvcFZhbHVlO1xuICAgICAgICBjb25zdCB1bmRlZmluZWRQcm9wRGVzYyA9IHtcbiAgICAgICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRQcm9wVmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRQcm9wVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gSW5zdHJ1bWVudCBkYXRhIG9yIGFjY2Vzc29yIHByb3BlcnR5IGRlc2NyaXB0b3JzXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsR2V0dGVyID0gcHJvcERlc2MgPyBwcm9wRGVzYy5nZXQgOiB1bmRlZmluZWRQcm9wRGVzYy5nZXQ7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU2V0dGVyID0gcHJvcERlc2MgPyBwcm9wRGVzYy5zZXQgOiB1bmRlZmluZWRQcm9wRGVzYy5zZXQ7XG4gICAgICAgIGxldCBvcmlnaW5hbFZhbHVlID0gcHJvcERlc2MgPyBwcm9wRGVzYy52YWx1ZSA6IHVuZGVmaW5lZFByb3BWYWx1ZTtcbiAgICAgICAgLy8gV2Ugb3ZlcndyaXRlIGJvdGggZGF0YSBhbmQgYWNjZXNzb3IgcHJvcGVydGllcyBhcyBhbiBpbnN0cnVtZW50ZWRcbiAgICAgICAgLy8gYWNjZXNzb3IgcHJvcGVydHlcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgcHJvcGVydHlOYW1lLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQ6IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9yaWdQcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbENvbnRleHQgPSBnZXRPcmlnaW5hdGluZ1NjcmlwdENvbnRleHQobG9nU2V0dGluZ3MubG9nQ2FsbFN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lID0gYCR7b2JqZWN0TmFtZX0uJHtwcm9wZXJ0eU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IG9yaWdpbmFsIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJvcERlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHVuZGVmaW5lZCBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ1Byb3BlcnR5ID0gdW5kZWZpbmVkUHJvcFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsR2V0dGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBhY2Nlc3NvciBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ1Byb3BlcnR5ID0gb3JpZ2luYWxHZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChcInZhbHVlXCIgaW4gcHJvcERlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGRhdGEgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdQcm9wZXJ0eSA9IG9yaWdpbmFsVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBQcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciAke2luc3RydW1lbnRlZFZhcmlhYmxlTmFtZX0gZG9lc24ndCBoYXZlIGdldHRlciBvciB2YWx1ZT9gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1ZhbHVlKGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSwgXCJcIiwgSlNPcGVyYXRpb24uZ2V0X2ZhaWxlZCwgY2FsbENvbnRleHQsIGxvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBMb2cgYGdldHNgIGV4Y2VwdCB0aG9zZSB0aGF0IGhhdmUgaW5zdHJ1bWVudGVkIHJldHVybiB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gKiBBbGwgcmV0dXJuZWQgZnVuY3Rpb25zIGFyZSBpbnN0cnVtZW50ZWQgd2l0aCBhIHdyYXBwZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gKiBSZXR1cm5lZCBvYmplY3RzIG1heSBiZSBpbnN0cnVtZW50ZWQgaWYgcmVjdXJzaXZlXG4gICAgICAgICAgICAgICAgICAgIC8vICAgaW5zdHJ1bWVudGF0aW9uIGlzIGVuYWJsZWQgYW5kIHRoaXMgaXNuJ3QgYXQgdGhlIGRlcHRoIGxpbWl0LlxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9yaWdQcm9wZXJ0eSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9nU2V0dGluZ3MubG9nRnVuY3Rpb25HZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nVmFsdWUoaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lLCBvcmlnUHJvcGVydHksIEpTT3BlcmF0aW9uLmdldF9mdW5jdGlvbiwgY2FsbENvbnRleHQsIGxvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RydW1lbnRlZEZ1bmN0aW9uV3JhcHBlciA9IGluc3RydW1lbnRGdW5jdGlvbihvYmplY3ROYW1lLCBwcm9wZXJ0eU5hbWUsIG9yaWdQcm9wZXJ0eSwgbG9nU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcHJvdG90eXBlIGFuZCBjb25zdHJ1Y3RvciBzbyB0aGF0IGluc3RydW1lbnRlZCBjbGFzc2VzIHJlbWFpbiBpbnRhY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFRoaXMgbWF5IGhhdmUgaW50cm9kdWNlZCBwcm90b3R5cGUgcG9sbHV0aW9uIGFzIHBlciBodHRwczovL2dpdGh1Yi5jb20vb3BlbndwbS9PcGVuV1BNL2lzc3Vlcy80NzFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnUHJvcGVydHkucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudGVkRnVuY3Rpb25XcmFwcGVyLnByb3RvdHlwZSA9IG9yaWdQcm9wZXJ0eS5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdQcm9wZXJ0eS5wcm90b3R5cGUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudGVkRnVuY3Rpb25XcmFwcGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnUHJvcGVydHkucHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0cnVtZW50ZWRGdW5jdGlvbldyYXBwZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9yaWdQcm9wZXJ0eSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nU2V0dGluZ3MucmVjdXJzaXZlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dTZXR0aW5ncy5kZXB0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcmlnUHJvcGVydHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dWYWx1ZShpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWUsIG9yaWdQcm9wZXJ0eSwgSlNPcGVyYXRpb24uZ2V0LCBjYWxsQ29udGV4dCwgbG9nU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdQcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgc2V0OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbENvbnRleHQgPSBnZXRPcmlnaW5hdGluZ1NjcmlwdENvbnRleHQobG9nU2V0dGluZ3MubG9nQ2FsbFN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lID0gYCR7b2JqZWN0TmFtZX0uJHtwcm9wZXJ0eU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJldHVyblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBQcmV2ZW50IHNldHMgZm9yIGZ1bmN0aW9ucyBhbmQgb2JqZWN0cyBpZiBlbmFibGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2dTZXR0aW5ncy5wcmV2ZW50U2V0cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKHR5cGVvZiBvcmlnaW5hbFZhbHVlID09PSBcImZ1bmN0aW9uXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gXCJvYmplY3RcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1ZhbHVlKGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSwgdmFsdWUsIEpTT3BlcmF0aW9uLnNldF9wcmV2ZW50ZWQsIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IG5ldyB2YWx1ZSB0byBvcmlnaW5hbCBzZXR0ZXIvbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsU2V0dGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBhY2Nlc3NvciBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBvcmlnaW5hbFNldHRlci5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChcInZhbHVlXCIgaW4gcHJvcERlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluTG9nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmplY3QuaXNQcm90b3R5cGVPZih0aGlzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eU5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5Mb2cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFByb3BlcnR5IGRlc2NyaXB0b3IgZm9yICR7aW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lfSBkb2Vzbid0IGhhdmUgc2V0dGVyIG9yIHZhbHVlP2ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nVmFsdWUoaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lLCB2YWx1ZSwgSlNPcGVyYXRpb24uc2V0X2ZhaWxlZCwgY2FsbENvbnRleHQsIGxvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2dWYWx1ZShpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWUsIHZhbHVlLCBKU09wZXJhdGlvbi5zZXQsIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluc3RydW1lbnRPYmplY3Qob2JqZWN0LCBpbnN0cnVtZW50ZWROYW1lLCBsb2dTZXR0aW5ncykge1xuICAgICAgICAvLyBTZXQgcHJvcGVydGllc1RvSW5zdHJ1bWVudCB0byBudWxsIHRvIGZvcmNlIG5vIHByb3BlcnRpZXMgdG8gYmUgaW5zdHJ1bWVudGVkLlxuICAgICAgICAvLyAodGhpcyBpcyB1c2VkIGluIHRlc3RpbmcgZm9yIGV4YW1wbGUpXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzVG9JbnN0cnVtZW50O1xuICAgICAgICBpZiAobG9nU2V0dGluZ3MucHJvcGVydGllc1RvSW5zdHJ1bWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcHJvcGVydGllc1RvSW5zdHJ1bWVudCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGxvZ1NldHRpbmdzLnByb3BlcnRpZXNUb0luc3RydW1lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzVG9JbnN0cnVtZW50ID0gT2JqZWN0LmdldFByb3BlcnR5TmFtZXMob2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXNUb0luc3RydW1lbnQgPSBsb2dTZXR0aW5ncy5wcm9wZXJ0aWVzVG9JbnN0cnVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcHJvcGVydHlOYW1lIG9mIHByb3BlcnRpZXNUb0luc3RydW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChsb2dTZXR0aW5ncy5leGNsdWRlZFByb3BlcnRpZXMuaW5jbHVkZXMocHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgYHJlY3Vyc2l2ZWAgZmxhZyBzZXQgd2Ugd2FudCB0byByZWN1cnNpdmVseSBpbnN0cnVtZW50IGFueVxuICAgICAgICAgICAgLy8gb2JqZWN0IHByb3BlcnRpZXMgdGhhdCBhcmVuJ3QgdGhlIHByb3RvdHlwZSBvYmplY3QuXG4gICAgICAgICAgICBpZiAobG9nU2V0dGluZ3MucmVjdXJzaXZlICYmXG4gICAgICAgICAgICAgICAgbG9nU2V0dGluZ3MuZGVwdGggPiAwICYmXG4gICAgICAgICAgICAgICAgaXNPYmplY3Qob2JqZWN0LCBwcm9wZXJ0eU5hbWUpICYmXG4gICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lICE9PSBcIl9fcHJvdG9fX1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SW5zdHJ1bWVudGVkTmFtZSA9IGAke2luc3RydW1lbnRlZE5hbWV9LiR7cHJvcGVydHlOYW1lfWA7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3TG9nU2V0dGluZ3MgPSB7IC4uLmxvZ1NldHRpbmdzIH07XG4gICAgICAgICAgICAgICAgbmV3TG9nU2V0dGluZ3MuZGVwdGggPSBsb2dTZXR0aW5ncy5kZXB0aCAtIDE7XG4gICAgICAgICAgICAgICAgbmV3TG9nU2V0dGluZ3MucHJvcGVydGllc1RvSW5zdHJ1bWVudCA9IFtdO1xuICAgICAgICAgICAgICAgIGluc3RydW1lbnRPYmplY3Qob2JqZWN0W3Byb3BlcnR5TmFtZV0sIG5ld0luc3RydW1lbnRlZE5hbWUsIG5ld0xvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudE9iamVjdFByb3BlcnR5KG9iamVjdCwgaW5zdHJ1bWVudGVkTmFtZSwgcHJvcGVydHlOYW1lLCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUeXBlRXJyb3IgJiZcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcImNhbid0IHJlZGVmaW5lIG5vbi1jb25maWd1cmFibGUgcHJvcGVydHlcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBDYW5ub3QgaW5zdHJ1bWVudCBub24tY29uZmlndXJhYmxlIHByb3BlcnR5OiAke2luc3RydW1lbnRlZE5hbWV9OiR7cHJvcGVydHlOYW1lfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nRXJyb3JUb0NvbnNvbGUoZXJyb3IsIHsgaW5zdHJ1bWVudGVkTmFtZSwgcHJvcGVydHlOYW1lIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5TmFtZSBvZiBsb2dTZXR0aW5ncy5ub25FeGlzdGluZ1Byb3BlcnRpZXNUb0luc3RydW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChsb2dTZXR0aW5ncy5leGNsdWRlZFByb3BlcnRpZXMuaW5jbHVkZXMocHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50T2JqZWN0UHJvcGVydHkob2JqZWN0LCBpbnN0cnVtZW50ZWROYW1lLCBwcm9wZXJ0eU5hbWUsIGxvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxvZ0Vycm9yVG9Db25zb2xlKGVycm9yLCB7IGluc3RydW1lbnRlZE5hbWUsIHByb3BlcnR5TmFtZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzZW5kRmFjdG9yeSA9IGZ1bmN0aW9uIChldmVudElkLCAkc2VuZE1lc3NhZ2VzVG9Mb2dnZXIpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2VzID0gW107XG4gICAgICAgIC8vIGRlYm91bmNlIHNlbmRpbmcgcXVldWVkIG1lc3NhZ2VzXG4gICAgICAgIGNvbnN0IF9zZW5kID0gZGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNlbmRNZXNzYWdlc1RvTG9nZ2VyKGV2ZW50SWQsIG1lc3NhZ2VzKTtcbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBxdWV1ZVxuICAgICAgICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtc2dUeXBlLCBtc2cpIHtcbiAgICAgICAgICAgIC8vIHF1ZXVlIHRoZSBtZXNzYWdlXG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKHsgdHlwZTogbXNnVHlwZSwgY29udGVudDogbXNnIH0pO1xuICAgICAgICAgICAgX3NlbmQoKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGNvbnN0IHNlbmQgPSBzZW5kRmFjdG9yeShldmVudElkLCBzZW5kTWVzc2FnZXNUb0xvZ2dlcik7XG4gICAgZnVuY3Rpb24gaW5zdHJ1bWVudEpTKEpTSW5zdHJ1bWVudFJlcXVlc3RzKSB7XG4gICAgICAgIC8vIFRoZSBKUyBJbnN0cnVtZW50IFJlcXVlc3RzIGFyZSBzZXR1cCBhbmQgdmFsaWRhdGVkIHB5dGhvbiBzaWRlXG4gICAgICAgIC8vIGluY2x1ZGluZyBzZXR0aW5nIGRlZmF1bHRzIGZvciBsb2dTZXR0aW5ncy5cbiAgICAgICAgLy8gTW9yZSBkZXRhaWxzIGFib3V0IGhvdyB0aGlzIGZ1bmN0aW9uIGlzIGludm9rZWQgYXJlIGluXG4gICAgICAgIC8vIGNvbnRlbnQvamF2YXNjcmlwdC1pbnN0cnVtZW50LWNvbnRlbnQtc2NvcGUudHNcbiAgICAgICAgSlNJbnN0cnVtZW50UmVxdWVzdHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgaW5zdHJ1bWVudE9iamVjdChldmFsKGl0ZW0ub2JqZWN0KSwgaXRlbS5pbnN0cnVtZW50ZWROYW1lLCBpdGVtLmxvZ1NldHRpbmdzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFRoaXMgd2hvbGUgZnVuY3Rpb24gZ2V0SW5zdHJ1bWVudEpTIHJldHVybnMganVzdCB0aGUgZnVuY3Rpb24gYGluc3RydW1lbnRKU2AuXG4gICAgcmV0dXJuIGluc3RydW1lbnRKUztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFuTXRhVzV6ZEhKMWJXVnVkSE11YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12YkdsaUwycHpMV2x1YzNSeWRXMWxiblJ6TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMR2xGUVVGcFJUdEJRVU5xUlN4dlJrRkJiMFk3UVVFNFFuQkdMRTFCUVUwc1ZVRkJWU3hsUVVGbExFTkJRVU1zVDBGQlpTeEZRVUZGTEc5Q1FVRnZRanRKUVVOdVJUczdPMDlCUjBjN1NVRkZTQ3h0UlVGQmJVVTdTVUZEYmtVc1RVRkJUU3hYUVVGWExFZEJRVWNzUjBGQlJ5eERRVUZETzBsQlEzaENMR0ZCUVdFN1NVRkRZaXhOUVVGTkxGVkJRVlVzUjBGQlJ5eEpRVUZKTEUxQlFVMHNSVUZCUlN4RFFVRkRPMGxCUTJoRExDdERRVUVyUXp0SlFVTXZReXhKUVVGSkxFdEJRVXNzUjBGQlJ5eExRVUZMTEVOQlFVTTdTVUZEYkVJc1owUkJRV2RFTzBsQlEyaEVMRWxCUVVrc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF6dEpRVVZvUWl3d1FrRkJNRUk3U1VGRE1VSXNUVUZCVFN4WFFVRlhMRWRCUVVjN1VVRkRiRUlzU1VGQlNTeEZRVUZGTEUxQlFVMDdVVUZEV2l4SFFVRkhMRVZCUVVVc1MwRkJTenRSUVVOV0xGVkJRVlVzUlVGQlJTeGhRVUZoTzFGQlEzcENMRmxCUVZrc1JVRkJSU3hsUVVGbE8xRkJRemRDTEVkQlFVY3NSVUZCUlN4TFFVRkxPMUZCUTFZc1ZVRkJWU3hGUVVGRkxHRkJRV0U3VVVGRGVrSXNZVUZCWVN4RlFVRkZMR2RDUVVGblFqdExRVU5vUXl4RFFVRkRPMGxCUlVZc2IwWkJRVzlHTzBsQlEzQkdMSGxGUVVGNVJUdEpRVU42UlN4TlFVRk5MRU5CUVVNc2NVSkJRWEZDTEVkQlFVY3NWVUZCVlN4UFFVRlBMRVZCUVVVc1NVRkJTVHRSUVVOd1JDeEpRVUZKTEU5QlFVOHNTMEZCU3l4VFFVRlRMRVZCUVVVN1dVRkRla0lzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3MlEwRkJOa01zUTBGQlF5eERRVUZETzFOQlEyaEZPMUZCUTBRc1NVRkJTU3hGUVVGRkxFZEJRVWNzVFVGQlRTeERRVUZETEhkQ1FVRjNRaXhEUVVGRExFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTjRSQ3hKUVVGSkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJRek5ETEU5QlFVOHNSVUZCUlN4TFFVRkxMRk5CUVZNc1NVRkJTU3hMUVVGTExFdEJRVXNzU1VGQlNTeEZRVUZGTzFsQlEzcERMRVZCUVVVc1IwRkJSeXhOUVVGTkxFTkJRVU1zZDBKQlFYZENMRU5CUVVNc1MwRkJTeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFsQlEyeEVMRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMU5CUTNSRE8xRkJRMFFzVDBGQlR5eEZRVUZGTEVOQlFVTTdTVUZEV2l4RFFVRkRMRU5CUVVNN1NVRkZSaXhOUVVGTkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1ZVRkJWU3hQUVVGUE8xRkJRM3BETEVsQlFVa3NUMEZCVHl4TFFVRkxMRk5CUVZNc1JVRkJSVHRaUVVONlFpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSGREUVVGM1F5eERRVUZETEVOQlFVTTdVMEZETTBRN1VVRkRSQ3hKUVVGSkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdVVUZEYUVRc1NVRkJTU3hMUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETEdOQlFXTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVNelF5eFBRVUZQTEV0QlFVc3NTMEZCU3l4SlFVRkpMRVZCUVVVN1dVRkRja0lzUzBGQlN5eEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGVFUXNTMEZCU3l4SFFVRkhMRTFCUVUwc1EwRkJReXhqUVVGakxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdVMEZEZEVNN1VVRkRSQ3h2UkVGQmIwUTdVVUZEY0VRc1QwRkJUeXhMUVVGTExFTkJRVU03U1VGRFppeERRVUZETEVOQlFVTTdTVUZGUml4dlEwRkJiME03U1VGRGNFTXNVMEZCVXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFpRVUZ4UWl4TFFVRkxPMUZCUTNSRUxFbEJRVWtzVDBGQlR5eERRVUZETzFGQlExb3NTVUZCU1N4SlFVRkpMRU5CUVVNN1VVRkRWQ3hKUVVGSkxFOUJRVThzUTBGQlF6dFJRVU5hTEVsQlFVa3NVMEZCVXl4RFFVRkRPMUZCUTJRc1NVRkJTU3hOUVVGTkxFTkJRVU03VVVGRldDeE5RVUZOTEV0QlFVc3NSMEZCUnp0WlFVTmFMRTFCUVUwc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNSMEZCUnl4VFFVRlRMRU5CUVVNN1dVRkRjRU1zU1VGQlNTeEpRVUZKTEVkQlFVY3NTVUZCU1N4RlFVRkZPMmRDUVVObUxFOUJRVThzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU14UXp0cFFrRkJUVHRuUWtGRFRDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmRDUVVObUxFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVTdiMEpCUTJRc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yOUNRVU51UXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dHBRa0ZEZGtJN1lVRkRSanRSUVVOSUxFTkJRVU1zUTBGQlF6dFJRVVZHTEU5QlFVODdXVUZEVEN4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRMllzU1VGQlNTeEhRVUZITEZOQlFWTXNRMEZCUXp0WlFVTnFRaXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMWxCUTNaQ0xFMUJRVTBzVDBGQlR5eEhRVUZITEZOQlFWTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJRenRaUVVOMFF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZPMmRDUVVOYUxFOUJRVThzUjBGQlJ5eFZRVUZWTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yRkJRMjVETzFsQlEwUXNTVUZCU1N4UFFVRlBMRVZCUVVVN1owSkJRMWdzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVTnVReXhQUVVGUExFZEJRVWNzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXp0aFFVTjJRanRaUVVWRUxFOUJRVThzVFVGQlRTeERRVUZETzFGQlEyaENMRU5CUVVNc1EwRkJRenRKUVVOS0xFTkJRVU03U1VGRlJDdzRRMEZCT0VNN1NVRkRPVU1zVTBGQlV5eHRRa0ZCYlVJc1EwRkJReXhQUVVGWkxFVkJRVVVzYVVKQlFUQkNMRXRCUVVzN1VVRkRlRVVzU1VGQlNTeFBRVUZQTEV0QlFVc3NVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSVHRaUVVNM1FpeFBRVUZQTEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNN1UwRkRlRUk3VVVGRFJDeEpRVUZKTEU5QlFVOHNRMEZCUXl4VlFVRlZMRXRCUVVzc1NVRkJTU3hGUVVGRk8xbEJReTlDTEU5QlFVOHNUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU03VTBGRGJFTTdVVUZGUkN4SlFVRkpMRmxCUVZrc1IwRkJSeXhEUVVGRExFTkJRVU03VVVGRGNrSXNUVUZCVFN4UlFVRlJMRWRCUVVjc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTTdVVUZETDBNc1MwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVTdXVUZEZUVNc1RVRkJUU3hQUVVGUExFZEJRVWNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXpWQ0xFbEJRVWtzVDBGQlR5eExRVUZMTEU5QlFVOHNSVUZCUlR0blFrRkRka0lzU1VGQlNTeEpRVUZKTEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU1zVDBGQlR5eERRVUZETEZWQlFWVXNSVUZCUlN4alFVRmpMRU5CUVVNc1EwRkJRenRuUWtGRGJrVXNTVUZCU1N4SlFVRkpMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eEhRVUZITEVkQlFVY3NSMEZCUnl4WlFVRlpMRU5CUVVNN1owSkJRMjVFTEVsQlFVa3NTVUZCU1N4SFFVRkhMRWRCUVVjc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF6dG5Ra0ZEZWtJc1NVRkJTU3hKUVVGSkxFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRPMmRDUVVOb1F5eEpRVUZKTEdOQlFXTXNSVUZCUlR0dlFrRkRiRUlzU1VGQlNTeEpRVUZKTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRE8yOUNRVU0zUWl4SlFVRkpMRWxCUVVrc1IwRkJSeXhIUVVGSExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRPMjlDUVVOd1F5eEpRVUZKTEVsQlFVa3NSMEZCUnl4SFFVRkhMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zVlVGQlZTeERRVUZETzJsQ1FVTjRRenRuUWtGRFJDeEpRVUZKTEU5QlFVOHNRMEZCUXl4UFFVRlBMRXRCUVVzc1IwRkJSeXhGUVVGRk8yOUNRVU16UWl4SlFVRkpMRWxCUVVrc1IwRkJSeXhIUVVGSExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTTdhVUpCUXpWQ08yZENRVU5FTEVsQlFVa3NTVUZCU1N4SFFVRkhMRU5CUVVNN1owSkJRMW9zVDBGQlR5eEpRVUZKTEVOQlFVTTdZVUZEWWp0WlFVTkVMRWxCUVVrc1QwRkJUeXhEUVVGRExGRkJRVkVzUzBGQlN5eERRVUZETEVsQlFVa3NUMEZCVHl4RFFVRkRMRTlCUVU4c1MwRkJTeXhQUVVGUExFTkJRVU1zVDBGQlR5eEZRVUZGTzJkQ1FVTnFSU3haUVVGWkxFVkJRVVVzUTBGQlF6dGhRVU5vUWp0VFFVTkdPMGxCUTBnc1EwRkJRenRKUVVWRUxHZERRVUZuUXp0SlFVTm9ReXhUUVVGVExHVkJRV1VzUTBGRGRFSXNUVUZCVFN4RlFVTk9MSEZDUVVFNFFpeExRVUZMTzFGQlJXNURMRFJDUVVFMFFqdFJRVU0xUWl4SlFVRkpPMWxCUTBZc1NVRkJTU3hOUVVGTkxFdEJRVXNzU1VGQlNTeEZRVUZGTzJkQ1FVTnVRaXhQUVVGUExFMUJRVTBzUTBGQlF6dGhRVU5tTzFsQlEwUXNTVUZCU1N4UFFVRlBMRTFCUVUwc1MwRkJTeXhWUVVGVkxFVkJRVVU3WjBKQlEyaERMRTlCUVU4c2EwSkJRV3RDTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRPMkZCUXpWRU8xbEJRMFFzU1VGQlNTeFBRVUZQTEUxQlFVMHNTMEZCU3l4UlFVRlJMRVZCUVVVN1owSkJRemxDTEU5QlFVOHNUVUZCVFN4RFFVRkRPMkZCUTJZN1dVRkRSQ3hOUVVGTkxGZEJRVmNzUjBGQlJ5eEZRVUZGTEVOQlFVTTdXVUZEZGtJc1QwRkJUeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNSVUZCUlN4VlFVRlZMRWRCUVVjc1JVRkJSU3hMUVVGTE8yZENRVU5vUkN4SlFVRkpMRXRCUVVzc1MwRkJTeXhKUVVGSkxFVkJRVVU3YjBKQlEyeENMRTlCUVU4c1RVRkJUU3hEUVVGRE8ybENRVU5tTzJkQ1FVTkVMRWxCUVVrc1QwRkJUeXhMUVVGTExFdEJRVXNzVlVGQlZTeEZRVUZGTzI5Q1FVTXZRaXhQUVVGUExHdENRVUZyUWl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJRenRwUWtGRE0wUTdaMEpCUTBRc1NVRkJTU3hQUVVGUExFdEJRVXNzUzBGQlN5eFJRVUZSTEVWQlFVVTdiMEpCUXpkQ0xIRkRRVUZ4UXp0dlFrRkRja01zU1VGQlNTeHBRa0ZCYVVJc1NVRkJTU3hMUVVGTExFVkJRVVU3ZDBKQlF6bENMRXRCUVVzc1IwRkJSeXhMUVVGTExFTkJRVU1zWlVGQlpTeERRVUZETzNGQ1FVTXZRanR2UWtGRlJDeDVRa0ZCZVVJN2IwSkJRM3BDTEVsQlFVa3NTMEZCU3l4WlFVRlpMRmRCUVZjc1JVRkJSVHQzUWtGRGFFTXNUMEZCVHl4dFFrRkJiVUlzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0eFFrRkRia003YjBKQlJVUXNLMEpCUVN0Q08yOUNRVU12UWl4SlFVRkpMRWRCUVVjc1MwRkJTeXhGUVVGRkxFbEJRVWtzVjBGQlZ5eERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVU3ZDBKQlEyaEVMRmRCUVZjc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdkMEpCUTNoQ0xFOUJRVThzUzBGQlN5eERRVUZETzNGQ1FVTmtPM2xDUVVGTk8zZENRVU5NTEU5QlFVOHNUMEZCVHl4TFFVRkxMRU5CUVVNN2NVSkJRM0pDTzJsQ1FVTkdPMmRDUVVORUxFOUJRVThzUzBGQlN5eERRVUZETzFsQlEyWXNRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkRTanRSUVVGRExFOUJRVThzUzBGQlN5eEZRVUZGTzFsQlEyUXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhuUTBGQlowTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJRenRaUVVOMFJDeFBRVUZQTEhWQ1FVRjFRaXhIUVVGSExFdEJRVXNzUTBGQlF6dFRRVU40UXp0SlFVTklMRU5CUVVNN1NVRkZSQ3hUUVVGVExESkNRVUV5UWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hOUVVGTk8xRkJRM0JFTEUxQlFVMHNSMEZCUnl4SFFVRkhMRk5CUVZNc1IwRkJSeXhIUVVGSExFZEJRVWNzVFVGQlRTeERRVUZETzFGQlEzSkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxGVkJRVlVzU1VGQlNTeFZRVUZWTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1YwRkJWeXhGUVVGRk8xbEJRM1pFTEU5QlFVOHNTVUZCU1N4RFFVRkRPMU5CUTJJN1lVRkJUU3hKUVVGSkxFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NWVUZCVlN4RFFVRkRMRVZCUVVVN1dVRkRMMElzVlVGQlZTeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRUUVVOeVFqdGhRVUZOTzFsQlEwd3NWVUZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFRRVU4wUWp0UlFVTkVMRTlCUVU4c1MwRkJTeXhEUVVGRE8wbEJRMllzUTBGQlF6dEpRVVZFTEhsRFFVRjVRenRKUVVONlF5eFRRVUZUTEZGQlFWRXNRMEZEWml4M1FrRkJaME1zUlVGRGFFTXNTMEZCVlN4RlFVTldMRk5CUVdsQ0xFVkJRVVVzYVVOQlFXbERPMGxCUTNCRUxGZEJRV2RDTEVWQlEyaENMRmRCUVhkQ08xRkJSWGhDTEVsQlFVa3NTMEZCU3l4RlFVRkZPMWxCUTFRc1QwRkJUenRUUVVOU08xRkJRMFFzUzBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXp0UlFVVmlMRTFCUVUwc1UwRkJVeXhIUVVGSExESkNRVUV5UWl4RFFVTXpReXhYUVVGWExFTkJRVU1zVTBGQlV5eEZRVU55UWl4M1FrRkJkMElzUTBGRGVrSXNRMEZCUXp0UlFVTkdMRWxCUVVrc1UwRkJVeXhGUVVGRk8xbEJRMklzUzBGQlN5eEhRVUZITEV0QlFVc3NRMEZCUXp0WlFVTmtMRTlCUVU4N1UwRkRVanRSUVVWRUxFMUJRVTBzUjBGQlJ5eEhRVUZITzFsQlExWXNVMEZCVXp0WlFVTlVMRTFCUVUwc1JVRkJSU3gzUWtGQmQwSTdXVUZEYUVNc1MwRkJTeXhGUVVGRkxHVkJRV1VzUTBGQlF5eExRVUZMTEVWQlFVVXNWMEZCVnl4RFFVRkRMSEZDUVVGeFFpeERRVUZETzFsQlEyaEZMRk5CUVZNc1JVRkJSU3hYUVVGWExFTkJRVU1zVTBGQlV6dFpRVU5vUXl4VlFVRlZMRVZCUVVVc1YwRkJWeXhEUVVGRExGVkJRVlU3V1VGRGJFTXNVMEZCVXl4RlFVRkZMRmRCUVZjc1EwRkJReXhUUVVGVE8xbEJRMmhETEZGQlFWRXNSVUZCUlN4WFFVRlhMRU5CUVVNc1VVRkJVVHRaUVVNNVFpeGhRVUZoTEVWQlFVVXNWMEZCVnl4RFFVRkRMR0ZCUVdFN1dVRkRlRU1zVTBGQlV5eEZRVUZGTEZkQlFWY3NRMEZCUXl4VFFVRlRPMWxCUTJoRExFOUJRVThzUlVGQlJTeFBRVUZQTEVWQlFVVTdVMEZEYmtJc1EwRkJRenRSUVVWR0xFbEJRVWs3V1VGRFJpeEpRVUZKTEVOQlFVTXNWVUZCVlN4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xTkJRM1pDTzFGQlFVTXNUMEZCVHl4TFFVRkxMRVZCUVVVN1dVRkRaQ3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEd0RFFVRnJReXhEUVVGRExFTkJRVU03V1VGRGFFUXNhVUpCUVdsQ0xFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdVMEZETVVJN1VVRkZSQ3hMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETzBsQlEyaENMRU5CUVVNN1NVRkZSQ3huUWtGQlowSTdTVUZEYUVJc1UwRkJVeXhQUVVGUExFTkJRMlFzZDBKQlFXZERMRVZCUTJoRExFbEJRV2RDTEVWQlEyaENMRmRCUVdkQ0xFVkJRMmhDTEZkQlFYZENPMUZCUlhoQ0xFbEJRVWtzUzBGQlN5eEZRVUZGTzFsQlExUXNUMEZCVHp0VFFVTlNPMUZCUTBRc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF6dFJRVVZpTEUxQlFVMHNVMEZCVXl4SFFVRkhMREpDUVVFeVFpeERRVU16UXl4WFFVRlhMRU5CUVVNc1UwRkJVeXhGUVVOeVFpeDNRa0ZCZDBJc1EwRkRla0lzUTBGQlF6dFJRVU5HTEVsQlFVa3NVMEZCVXl4RlFVRkZPMWxCUTJJc1MwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU5rTEU5QlFVODdVMEZEVWp0UlFVVkVMRWxCUVVrN1dVRkRSaXh4UlVGQmNVVTdXVUZEY2tVc1RVRkJUU3hWUVVGVkxFZEJRV0VzUlVGQlJTeERRVUZETzFsQlEyaERMRXRCUVVzc1RVRkJUU3hIUVVGSExFbEJRVWtzU1VGQlNTeEZRVUZGTzJkQ1FVTjBRaXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVU5pTEdWQlFXVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1YwRkJWeXhEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRU5CUTNoRUxFTkJRVU03WVVGRFNEdFpRVU5FTEUxQlFVMHNSMEZCUnl4SFFVRkhPMmRDUVVOV0xGTkJRVk1zUlVGQlJTeFhRVUZYTEVOQlFVTXNTVUZCU1R0blFrRkRNMElzVFVGQlRTeEZRVUZGTEhkQ1FVRjNRanRuUWtGRGFFTXNTVUZCU1N4RlFVRkZMRlZCUVZVN1owSkJRMmhDTEV0QlFVc3NSVUZCUlN4RlFVRkZPMmRDUVVOVUxGTkJRVk1zUlVGQlJTeFhRVUZYTEVOQlFVTXNVMEZCVXp0blFrRkRhRU1zVlVGQlZTeEZRVUZGTEZkQlFWY3NRMEZCUXl4VlFVRlZPMmRDUVVOc1F5eFRRVUZUTEVWQlFVVXNWMEZCVnl4RFFVRkRMRk5CUVZNN1owSkJRMmhETEZGQlFWRXNSVUZCUlN4WFFVRlhMRU5CUVVNc1VVRkJVVHRuUWtGRE9VSXNZVUZCWVN4RlFVRkZMRmRCUVZjc1EwRkJReXhoUVVGaE8yZENRVU40UXl4VFFVRlRMRVZCUVVVc1YwRkJWeXhEUVVGRExGTkJRVk03WjBKQlEyaERMRTlCUVU4c1JVRkJSU3hQUVVGUExFVkJRVVU3WVVGRGJrSXNRMEZCUXp0WlFVTkdMRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZEZEVJN1VVRkJReXhQUVVGUExFdEJRVXNzUlVGQlJUdFpRVU5rTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUTFRc2EwTkJRV3RETEVkQlFVY3NkMEpCUVhkQ0xFTkJRemxFTEVOQlFVTTdXVUZEUml4cFFrRkJhVUlzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0VFFVTXhRanRSUVVORUxFdEJRVXNzUjBGQlJ5eExRVUZMTEVOQlFVTTdTVUZEYUVJc1EwRkJRenRKUVVWRUxGTkJRVk1zYVVKQlFXbENMRU5CUVVNc1MwRkJTeXhGUVVGRkxGVkJRV1VzUzBGQlN6dFJRVU53UkN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExIVkNRVUYxUWl4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU53UkN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExEQkNRVUV3UWl4SFFVRkhMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFJRVU14UkN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExESkNRVUV5UWl4SFFVRkhMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU0xUkN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExEaENRVUU0UWl4SFFVRkhMRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVU5xUlN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExIZENRVUYzUWl4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU4wUkN4SlFVRkpMRTlCUVU4c1JVRkJSVHRaUVVOWUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNNRUpCUVRCQ0xFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xTkJRM0pGTzBsQlEwZ3NRMEZCUXp0SlFVVkVMSGREUVVGM1F6dEpRVU40UXl4VFFVRlRMR0ZCUVdFN1VVRkRjRUlzU1VGQlNTeExRVUZMTEVOQlFVTTdVVUZGVml4SlFVRkpPMWxCUTBZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUlVGQlJTeERRVUZETzFOQlEyNUNPMUZCUVVNc1QwRkJUeXhIUVVGSExFVkJRVVU3V1VGRFdpeExRVUZMTEVkQlFVY3NSMEZCUnl4RFFVRkRMRXRCUVVzc1EwRkJRenRUUVVOdVFqdFJRVVZFTEU5QlFVOHNTMEZCU3l4RFFVRkRPMGxCUTJZc1EwRkJRenRKUVVWRUxEQkRRVUV3UXp0SlFVTXhReXhOUVVGTkxFMUJRVTBzUjBGQlJ5eFZRVUZWTEUxQlFXTXNSVUZCUlN4SFFVRkhMRVZCUVVVc1VVRkJVVHRSUVVOd1JDeE5RVUZOTEV0QlFVc3NSMEZCUnl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEyaERMRTlCUVU4c1VVRkJVVHRaUVVOaUxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFpRVU4wUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRE8wbEJRMW9zUTBGQlF5eERRVUZETzBsQlJVWXNVMEZCVXl3eVFrRkJNa0lzUTBGQlF5eFpRVUZaTEVkQlFVY3NTMEZCU3p0UlFVTjJSQ3hOUVVGTkxFdEJRVXNzUjBGQlJ5eGhRVUZoTEVWQlFVVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEYWtRc2IwUkJRVzlFTzFGQlEzQkVMRTFCUVUwc1lVRkJZU3hIUVVGSE8xbEJRM0JDTEZOQlFWTXNSVUZCUlN4RlFVRkZPMWxCUTJJc1ZVRkJWU3hGUVVGRkxFVkJRVVU3V1VGRFpDeFRRVUZUTEVWQlFVVXNSVUZCUlR0WlFVTmlMRkZCUVZFc1JVRkJSU3hGUVVGRk8xbEJRMW9zWVVGQllTeEZRVUZGTEVWQlFVVTdXVUZEYWtJc1UwRkJVeXhGUVVGRkxFVkJRVVU3VTBGRFpDeERRVUZETzFGQlEwWXNTVUZCU1N4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJUdFpRVU53UWl4UFFVRlBMR0ZCUVdFc1EwRkJRenRUUVVOMFFqdFJRVU5FTERCRlFVRXdSVHRSUVVNeFJTeE5RVUZOTEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRE1VSXNTVUZCU1N4RFFVRkRMRkZCUVZFc1JVRkJSVHRaUVVOaUxFOUJRVThzWVVGQllTeERRVUZETzFOQlEzUkNPMUZCUTBRN096czdPenM3TzFkQlVVYzdVVUZEU0N4SlFVRkpPMWxCUTBZc1NVRkJTU3hUUVVGVExFZEJRVWNzUlVGQlJTeERRVUZETzFsQlEyNUNMRWxCUVVrc1lVRkJZU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETERaQ1FVRTJRanRaUVVOeVJDeE5RVUZOTEdGQlFXRXNSMEZCUnl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlF6RkRMRTFCUVUwc1VVRkJVU3hIUVVGSExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1dVRkRlRU1zVFVGQlRTeExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRMME1zVFVGQlRTeFJRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEZWtNc1RVRkJUU3hOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGRrTXNUVUZCVFN4alFVRmpMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xbEJRM0pFTEUxQlFVMHNVMEZCVXl4SFFVRkhMR05CUVdNc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4NVEwRkJlVU03V1VGRE4wWXNTVUZCU1N4VFFVRlRMRXRCUVVzc1EwRkJReXhEUVVGRExFVkJRVVU3WjBKQlEzQkNMRk5CUVZNc1IwRkJSeXhqUVVGakxFTkJRVU1zUTBGQlF5eHZSRUZCYjBRN1lVRkRha1k3YVVKQlFVMDdaMEpCUTB3c1UwRkJVeXhIUVVGSExHTkJRV01zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE8yZENRVU12UXl4aFFVRmhMRWRCUVVjc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGRGJFTXNVMEZCVXl4SFFVRkhMRU5CUVVNc1JVRkRZaXhqUVVGakxFTkJRVU1zVFVGQlRTeERRVU4wUWl4RFFVRkRPMkZCUTBnN1dVRkRSQ3hOUVVGTkxGZEJRVmNzUjBGQlJ6dG5Ra0ZEYkVJc1UwRkJVenRuUWtGRFZDeFZRVUZWTEVWQlFVVXNUVUZCVFR0blFrRkRiRUlzVTBGQlV5eEZRVUZGTEZGQlFWRTdaMEpCUTI1Q0xGRkJRVkU3WjBKQlExSXNZVUZCWVR0blFrRkRZaXhUUVVGVExFVkJRVVVzV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0aFFVTm9SU3hEUVVGRE8xbEJRMFlzVDBGQlR5eFhRVUZYTEVOQlFVTTdVMEZEY0VJN1VVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdFpRVU5XTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUTFRc01rTkJRVEpETEVWQlF6TkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFVkJRVVVzUlVGRFdpeFJRVUZSTEVOQlExUXNRMEZCUXp0WlFVTkdMRTlCUVU4c1lVRkJZU3hEUVVGRE8xTkJRM1JDTzBsQlEwZ3NRMEZCUXp0SlFVVkVMRk5CUVZNc1VVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJTeFpRVUZaTzFGQlEzQkRMRWxCUVVrc1VVRkJVU3hEUVVGRE8xRkJRMklzU1VGQlNUdFpRVU5HTEZGQlFWRXNSMEZCUnl4TlFVRk5MRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03VTBGRGFrTTdVVUZCUXl4UFFVRlBMRXRCUVVzc1JVRkJSVHRaUVVOa0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZEUkN4SlFVRkpMRkZCUVZFc1MwRkJTeXhKUVVGSkxFVkJRVVU3V1VGRGNrSXNkMEpCUVhkQ08xbEJRM2hDTEU5QlFVOHNTMEZCU3l4RFFVRkRPMU5CUTJRN1VVRkRSQ3hQUVVGUExFOUJRVThzVVVGQlVTeExRVUZMTEZGQlFWRXNRMEZCUXp0SlFVTjBReXhEUVVGRE8wbEJSVVFzWjBOQlFXZERPMGxCUTJoRExIZEZRVUYzUlR0SlFVTjRSU3g1UlVGQmVVVTdTVUZEZWtVc2QwUkJRWGRFTzBsQlEzaEVMRk5CUVZNc2EwSkJRV3RDTEVOQlEzcENMRlZCUVd0Q0xFVkJRMnhDTEZWQlFXdENMRVZCUTJ4Q0xFbEJRVk1zUlVGRFZDeFhRVUYzUWp0UlFVVjRRaXhQUVVGUE8xbEJRMHdzVFVGQlRTeFhRVUZYTEVkQlFVY3NNa0pCUVRKQ0xFTkJRVU1zVjBGQlZ5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMWxCUXpGRkxFOUJRVThzUTBGRFRDeFZRVUZWTEVkQlFVY3NSMEZCUnl4SFFVRkhMRlZCUVZVc1JVRkROMElzVTBGQlV5eEZRVU5VTEZkQlFWY3NSVUZEV0N4WFFVRlhMRU5CUTFvc1EwRkJRenRaUVVOR0xFOUJRVThzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03VVVGRGNrTXNRMEZCUXl4RFFVRkRPMGxCUTBvc1EwRkJRenRKUVVWRUxESkRRVUV5UXp0SlFVTXpReXhUUVVGVExIZENRVUYzUWl4RFFVTXZRaXhOUVVGTkxFVkJRMDRzVlVGQmEwSXNSVUZEYkVJc1dVRkJiMElzUlVGRGNFSXNWMEZCZDBJN1VVRkZlRUlzU1VGRFJTeERRVUZETEUxQlFVMDdXVUZEVUN4RFFVRkRMRlZCUVZVN1dVRkRXQ3hEUVVGRExGbEJRVms3V1VGRFlpeFpRVUZaTEV0QlFVc3NWMEZCVnl4RlFVTTFRanRaUVVOQkxFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlEySTdhMEpCUTFVc1RVRkJUVHR6UWtGRFJpeFZRVUZWTzNkQ1FVTlNMRmxCUVZrN1UwRkRNMElzUTBGRFJpeERRVUZETzFOQlEwZzdVVUZGUkN4MVEwRkJkVU03VVVGRGRrTXNUVUZCVFN4UlFVRlJMRWRCUVVjc1RVRkJUU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRTFCUVUwc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF6dFJRVVZ3UlN4dlJrRkJiMFk3VVVGRGNFWXNTVUZEUlN4RFFVRkRMRkZCUVZFN1dVRkRWQ3hEUVVGRExGZEJRVmNzUTBGQlF5eHBRMEZCYVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zV1VGQldTeERRVUZETEVWQlEzSkZPMWxCUTBFc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGRFdDeHRRMEZCYlVNc1JVRkRia01zVlVGQlZTeEZRVU5XTEZsQlFWa3NSVUZEV2l4TlFVRk5MRU5CUTFBc1EwRkJRenRaUVVOR0xFOUJRVTg3VTBGRFVqdFJRVVZFTEN0RFFVRXJRenRSUVVNdlF5eEpRVUZKTEd0Q1FVRnJRaXhEUVVGRE8xRkJRM1pDTEUxQlFVMHNhVUpCUVdsQ0xFZEJRVWM3V1VGRGVFSXNSMEZCUnl4RlFVRkZMRWRCUVVjc1JVRkJSVHRuUWtGRFVpeFBRVUZQTEd0Q1FVRnJRaXhEUVVGRE8xbEJRelZDTEVOQlFVTTdXVUZEUkN4SFFVRkhMRVZCUVVVc1EwRkJReXhMUVVGTExFVkJRVVVzUlVGQlJUdG5Ra0ZEWWl4clFrRkJhMElzUjBGQlJ5eExRVUZMTEVOQlFVTTdXVUZETjBJc1EwRkJRenRaUVVORUxGVkJRVlVzUlVGQlJTeExRVUZMTzFOQlEyeENMRU5CUVVNN1VVRkZSaXh0UkVGQmJVUTdVVUZEYmtRc1RVRkJUU3hqUVVGakxFZEJRVWNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhIUVVGSExFTkJRVU03VVVGRGRrVXNUVUZCVFN4alFVRmpMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4SFFVRkhMRU5CUVVNN1VVRkRka1VzU1VGQlNTeGhRVUZoTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4clFrRkJhMElzUTBGQlF6dFJRVVZ1UlN4dlJVRkJiMFU3VVVGRGNFVXNiMEpCUVc5Q08xRkJRM0JDTEUxQlFVMHNRMEZCUXl4alFVRmpMRU5CUVVNc1RVRkJUU3hGUVVGRkxGbEJRVmtzUlVGQlJUdFpRVU14UXl4WlFVRlpMRVZCUVVVc1NVRkJTVHRaUVVOc1FpeEhRVUZITEVWQlFVVXNRMEZCUXp0blFrRkRTaXhQUVVGUE8yOUNRVU5NTEVsQlFVa3NXVUZCV1N4RFFVRkRPMjlDUVVOcVFpeE5RVUZOTEZkQlFWY3NSMEZCUnl3eVFrRkJNa0lzUTBGRE4wTXNWMEZCVnl4RFFVRkRMRmxCUVZrc1EwRkRla0lzUTBGQlF6dHZRa0ZEUml4TlFVRk5MSGRDUVVGM1FpeEhRVUZITEVkQlFVY3NWVUZCVlN4SlFVRkpMRmxCUVZrc1JVRkJSU3hEUVVGRE8yOUNRVVZxUlN4eFFrRkJjVUk3YjBKQlEzSkNMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVU3ZDBKQlEySXNkMEpCUVhkQ08zZENRVU40UWl4WlFVRlpMRWRCUVVjc2EwSkJRV3RDTEVOQlFVTTdjVUpCUTI1RE8zbENRVUZOTEVsQlFVa3NZMEZCWXl4RlFVRkZPM2RDUVVONlFpeDFRa0ZCZFVJN2QwSkJRM1pDTEZsQlFWa3NSMEZCUnl4alFVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzNGQ1FVTXhRenQ1UWtGQlRTeEpRVUZKTEU5QlFVOHNTVUZCU1N4UlFVRlJMRVZCUVVVN2QwSkJRemxDTEcxQ1FVRnRRanQzUWtGRGJrSXNXVUZCV1N4SFFVRkhMR0ZCUVdFc1EwRkJRenR4UWtGRE9VSTdlVUpCUVUwN2QwSkJRMHdzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZEV0N3eVFrRkJNa0lzZDBKQlFYZENMR2REUVVGblF5eERRVU53Uml4RFFVRkRPM2RDUVVOR0xGRkJRVkVzUTBGRFRpeDNRa0ZCZDBJc1JVRkRlRUlzUlVGQlJTeEZRVU5HTEZkQlFWY3NRMEZCUXl4VlFVRlZMRVZCUTNSQ0xGZEJRVmNzUlVGRFdDeFhRVUZYTEVOQlExb3NRMEZCUXp0M1FrRkRSaXhQUVVGUE8zRkNRVU5TTzI5Q1FVVkVMQ3RFUVVFclJEdHZRa0ZETDBRc01rUkJRVEpFTzI5Q1FVTXpSQ3h6UkVGQmMwUTdiMEpCUTNSRUxHdEZRVUZyUlR0dlFrRkRiRVVzU1VGQlNTeFBRVUZQTEZsQlFWa3NTMEZCU3l4VlFVRlZMRVZCUVVVN2QwSkJRM1JETEVsQlFVa3NWMEZCVnl4RFFVRkRMR1ZCUVdVc1JVRkJSVHMwUWtGREwwSXNVVUZCVVN4RFFVTk9MSGRDUVVGM1FpeEZRVU40UWl4WlFVRlpMRVZCUTFvc1YwRkJWeXhEUVVGRExGbEJRVmtzUlVGRGVFSXNWMEZCVnl4RlFVTllMRmRCUVZjc1EwRkRXaXhEUVVGRE8zbENRVU5JTzNkQ1FVTkVMRTFCUVUwc01rSkJRVEpDTEVkQlFVY3NhMEpCUVd0Q0xFTkJRM0JFTEZWQlFWVXNSVUZEVml4WlFVRlpMRVZCUTFvc1dVRkJXU3hGUVVOYUxGZEJRVmNzUTBGRFdpeERRVUZETzNkQ1FVTkdMRFJHUVVFMFJqdDNRa0ZETlVZc01FZEJRVEJITzNkQ1FVTXhSeXhKUVVGSkxGbEJRVmtzUTBGQlF5eFRRVUZUTEVWQlFVVTdORUpCUXpGQ0xESkNRVUV5UWl4RFFVRkRMRk5CUVZNc1IwRkJSeXhaUVVGWkxFTkJRVU1zVTBGQlV5eERRVUZET3pSQ1FVTXZSQ3hKUVVGSkxGbEJRVmtzUTBGQlF5eFRRVUZUTEVOQlFVTXNWMEZCVnl4RlFVRkZPMmREUVVOMFF5d3lRa0ZCTWtJc1EwRkJReXhUUVVGVExFTkJRVU1zVjBGQlZ6dHZRMEZETDBNc1dVRkJXU3hEUVVGRExGTkJRVk1zUTBGQlF5eFhRVUZYTEVOQlFVTTdOa0pCUTNSRE8zbENRVU5HTzNkQ1FVTkVMRTlCUVU4c01rSkJRVEpDTEVOQlFVTTdjVUpCUTNCRE8zbENRVUZOTEVsQlEwd3NUMEZCVHl4WlFVRlpMRXRCUVVzc1VVRkJVVHQzUWtGRGFFTXNWMEZCVnl4RFFVRkRMRk5CUVZNN2QwSkJRM0pDTEZkQlFWY3NRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhGUVVOeVFqdDNRa0ZEUVN4UFFVRlBMRmxCUVZrc1EwRkJRenR4UWtGRGNrSTdlVUpCUVUwN2QwSkJRMHdzVVVGQlVTeERRVU5PTEhkQ1FVRjNRaXhGUVVONFFpeFpRVUZaTEVWQlExb3NWMEZCVnl4RFFVRkRMRWRCUVVjc1JVRkRaaXhYUVVGWExFVkJRMWdzVjBGQlZ5eERRVU5hTEVOQlFVTTdkMEpCUTBZc1QwRkJUeXhaUVVGWkxFTkJRVU03Y1VKQlEzSkNPMmRDUVVOSUxFTkJRVU1zUTBGQlF6dFpRVU5LTEVOQlFVTXNRMEZCUXl4RlFVRkZPMWxCUTBvc1IwRkJSeXhGUVVGRkxFTkJRVU03WjBKQlEwb3NUMEZCVHl4VlFVRlZMRXRCUVVzN2IwSkJRM0JDTEUxQlFVMHNWMEZCVnl4SFFVRkhMREpDUVVFeVFpeERRVU0zUXl4WFFVRlhMRU5CUVVNc1dVRkJXU3hEUVVONlFpeERRVUZETzI5Q1FVTkdMRTFCUVUwc2QwSkJRWGRDTEVkQlFVY3NSMEZCUnl4VlFVRlZMRWxCUVVrc1dVRkJXU3hGUVVGRkxFTkJRVU03YjBKQlEycEZMRWxCUVVrc1YwRkJWeXhEUVVGRE8yOUNRVVZvUWl4dlJFRkJiMFE3YjBKQlEzQkVMRWxCUTBVc1YwRkJWeXhEUVVGRExGZEJRVmM3ZDBKQlEzWkNMRU5CUVVNc1QwRkJUeXhoUVVGaExFdEJRVXNzVlVGQlZUczBRa0ZEYkVNc1QwRkJUeXhoUVVGaExFdEJRVXNzVVVGQlVTeERRVUZETEVWQlEzQkRPM2RDUVVOQkxGRkJRVkVzUTBGRFRpeDNRa0ZCZDBJc1JVRkRlRUlzUzBGQlN5eEZRVU5NTEZkQlFWY3NRMEZCUXl4aFFVRmhMRVZCUTNwQ0xGZEJRVmNzUlVGRFdDeFhRVUZYTEVOQlExb3NRMEZCUXp0M1FrRkRSaXhQUVVGUExFdEJRVXNzUTBGQlF6dHhRa0ZEWkR0dlFrRkZSQ3cwUTBGQk5FTTdiMEpCUXpWRExFbEJRVWtzWTBGQll5eEZRVUZGTzNkQ1FVTnNRaXgxUWtGQmRVSTdkMEpCUTNaQ0xGZEJRVmNzUjBGQlJ5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dHhRa0ZEYUVRN2VVSkJRVTBzU1VGQlNTeFBRVUZQTEVsQlFVa3NVVUZCVVN4RlFVRkZPM2RDUVVNNVFpeExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRPM2RDUVVOaUxFbEJRVWtzVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSVHMwUWtGRE9VSXNUVUZCVFN4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFVkJRVVVzV1VGQldTeEZRVUZGTzJkRFFVTjRReXhMUVVGTE96WkNRVU5PTEVOQlFVTXNRMEZCUXp0NVFrRkRTanMyUWtGQlRUczBRa0ZEVEN4aFFVRmhMRWRCUVVjc1MwRkJTeXhEUVVGRE8zbENRVU4yUWp0M1FrRkRSQ3hYUVVGWExFZEJRVWNzUzBGQlN5eERRVUZETzNkQ1FVTndRaXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETzNGQ1FVTm1PM2xDUVVGTk8zZENRVU5NTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUTFnc01rSkJRVEpDTEhkQ1FVRjNRaXhuUTBGQlowTXNRMEZEY0VZc1EwRkJRenQzUWtGRFJpeFJRVUZSTEVOQlEwNHNkMEpCUVhkQ0xFVkJRM2hDTEV0QlFVc3NSVUZEVEN4WFFVRlhMRU5CUVVNc1ZVRkJWU3hGUVVOMFFpeFhRVUZYTEVWQlExZ3NWMEZCVnl4RFFVTmFMRU5CUVVNN2QwSkJRMFlzVDBGQlR5eExRVUZMTEVOQlFVTTdjVUpCUTJRN2IwSkJRMFFzVVVGQlVTeERRVU5PTEhkQ1FVRjNRaXhGUVVONFFpeExRVUZMTEVWQlEwd3NWMEZCVnl4RFFVRkRMRWRCUVVjc1JVRkRaaXhYUVVGWExFVkJRMWdzVjBGQlZ5eERRVU5hTEVOQlFVTTdiMEpCUTBZc1QwRkJUeXhYUVVGWExFTkJRVU03WjBKQlEzSkNMRU5CUVVNc1EwRkJRenRaUVVOS0xFTkJRVU1zUTBGQlF5eEZRVUZGTzFOQlEwd3NRMEZCUXl4RFFVRkRPMGxCUTB3c1EwRkJRenRKUVVWRUxGTkJRVk1zWjBKQlFXZENMRU5CUTNaQ0xFMUJRVmNzUlVGRFdDeG5Ra0ZCZDBJc1JVRkRlRUlzVjBGQmQwSTdVVUZGZUVJc1owWkJRV2RHTzFGQlEyaEdMSGREUVVGM1F6dFJRVU40UXl4SlFVRkpMSE5DUVVGblF5eERRVUZETzFGQlEzSkRMRWxCUVVrc1YwRkJWeXhEUVVGRExITkNRVUZ6UWl4TFFVRkxMRWxCUVVrc1JVRkJSVHRaUVVNdlF5eHpRa0ZCYzBJc1IwRkJSeXhGUVVGRkxFTkJRVU03VTBGRE4wSTdZVUZCVFN4SlFVRkpMRmRCUVZjc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4TlFVRk5MRXRCUVVzc1EwRkJReXhGUVVGRk8xbEJRekZFTEhOQ1FVRnpRaXhIUVVGSExFMUJRVTBzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFRRVU14UkR0aFFVRk5PMWxCUTB3c2MwSkJRWE5DTEVkQlFVY3NWMEZCVnl4RFFVRkRMSE5DUVVGelFpeERRVUZETzFOQlF6ZEVPMUZCUTBRc1MwRkJTeXhOUVVGTkxGbEJRVmtzU1VGQlNTeHpRa0ZCYzBJc1JVRkJSVHRaUVVOcVJDeEpRVUZKTEZkQlFWY3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eFJRVUZSTEVOQlFVTXNXVUZCV1N4RFFVRkRMRVZCUVVVN1owSkJRM3BFTEZOQlFWTTdZVUZEVmp0WlFVTkVMR2RGUVVGblJUdFpRVU5vUlN4elJFRkJjMFE3V1VGRGRFUXNTVUZEUlN4WFFVRlhMRU5CUVVNc1UwRkJVenRuUWtGRGNrSXNWMEZCVnl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRE8yZENRVU55UWl4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxGbEJRVmtzUTBGQlF6dG5Ra0ZET1VJc1dVRkJXU3hMUVVGTExGZEJRVmNzUlVGRE5VSTdaMEpCUTBFc1RVRkJUU3h0UWtGQmJVSXNSMEZCUnl4SFFVRkhMR2RDUVVGblFpeEpRVUZKTEZsQlFWa3NSVUZCUlN4RFFVRkRPMmRDUVVOc1JTeE5RVUZOTEdOQlFXTXNSMEZCUnl4RlFVRkZMRWRCUVVjc1YwRkJWeXhGUVVGRkxFTkJRVU03WjBKQlF6RkRMR05CUVdNc1EwRkJReXhMUVVGTExFZEJRVWNzVjBGQlZ5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNN1owSkJRemRETEdOQlFXTXNRMEZCUXl4elFrRkJjMElzUjBGQlJ5eEZRVUZGTEVOQlFVTTdaMEpCUXpORExHZENRVUZuUWl4RFFVTmtMRTFCUVUwc1EwRkJReXhaUVVGWkxFTkJRVU1zUlVGRGNFSXNiVUpCUVcxQ0xFVkJRMjVDTEdOQlFXTXNRMEZEWml4RFFVRkRPMkZCUTBnN1dVRkRSQ3hKUVVGSk8yZENRVU5HTEhkQ1FVRjNRaXhEUVVOMFFpeE5RVUZOTEVWQlEwNHNaMEpCUVdkQ0xFVkJRMmhDTEZsQlFWa3NSVUZEV2l4WFFVRlhMRU5CUTFvc1EwRkJRenRoUVVOSU8xbEJRVU1zVDBGQlR5eExRVUZMTEVWQlFVVTdaMEpCUTJRc1NVRkRSU3hMUVVGTExGbEJRVmtzVTBGQlV6dHZRa0ZETVVJc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNNRU5CUVRCRExFTkJRVU1zUlVGRGJFVTdiMEpCUTBFc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGRFZpeG5SRUZCWjBRc1owSkJRV2RDTEVsQlFVa3NXVUZCV1N4RlFVRkZMRU5CUTI1R0xFTkJRVU03YVVKQlEwZzdjVUpCUVUwN2IwSkJRMHdzYVVKQlFXbENMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzWjBKQlFXZENMRVZCUVVVc1dVRkJXU3hGUVVGRkxFTkJRVU1zUTBGQlF6dHBRa0ZET1VRN1lVRkRSanRUUVVOR08xRkJRMFFzUzBGQlN5eE5RVUZOTEZsQlFWa3NTVUZCU1N4WFFVRlhMRU5CUVVNc2FVTkJRV2xETEVWQlFVVTdXVUZEZUVVc1NVRkJTU3hYUVVGWExFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1VVRkJVU3hEUVVGRExGbEJRVmtzUTBGQlF5eEZRVUZGTzJkQ1FVTjZSQ3hUUVVGVE8yRkJRMVk3V1VGRFJDeEpRVUZKTzJkQ1FVTkdMSGRDUVVGM1FpeERRVU4wUWl4TlFVRk5MRVZCUTA0c1owSkJRV2RDTEVWQlEyaENMRmxCUVZrc1JVRkRXaXhYUVVGWExFTkJRMW9zUTBGQlF6dGhRVU5JTzFsQlFVTXNUMEZCVHl4TFFVRkxMRVZCUVVVN1owSkJRMlFzYVVKQlFXbENMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVVVzWjBKQlFXZENMRVZCUVVVc1dVRkJXU3hGUVVGRkxFTkJRVU1zUTBGQlF6dGhRVU01UkR0VFFVTkdPMGxCUTBnc1EwRkJRenRKUVVWRUxFMUJRVTBzVjBGQlZ5eEhRVUZITEZWQlFWVXNUMEZCVHl4RlFVRkZMSEZDUVVGeFFqdFJRVU14UkN4SlFVRkpMRkZCUVZFc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRGJFSXNiVU5CUVcxRE8xRkJRMjVETEUxQlFVMHNTMEZCU3l4SFFVRkhMRkZCUVZFc1EwRkJRenRaUVVOeVFpeHhRa0ZCY1VJc1EwRkJReXhQUVVGUExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdXVUZGZWtNc2EwSkJRV3RDTzFsQlEyeENMRkZCUVZFc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRGFFSXNRMEZCUXl4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJSVklzVDBGQlR5eFZRVUZWTEU5QlFVOHNSVUZCUlN4SFFVRkhPMWxCUXpOQ0xHOUNRVUZ2UWp0WlFVTndRaXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSU3hQUVVGUExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0WlFVTXZReXhMUVVGTExFVkJRVVVzUTBGQlF6dFJRVU5XTEVOQlFVTXNRMEZCUXp0SlFVTktMRU5CUVVNc1EwRkJRenRKUVVWR0xFMUJRVTBzU1VGQlNTeEhRVUZITEZkQlFWY3NRMEZCUXl4UFFVRlBMRVZCUVVVc2IwSkJRVzlDTEVOQlFVTXNRMEZCUXp0SlFVVjRSQ3hUUVVGVExGbEJRVmtzUTBGQlF5eHZRa0ZCTWtNN1VVRkRMMFFzYVVWQlFXbEZPMUZCUTJwRkxEaERRVUU0UXp0UlFVVTVReXg1UkVGQmVVUTdVVUZEZWtRc2FVUkJRV2xFTzFGQlEycEVMRzlDUVVGdlFpeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRWxCUVVrN1dVRkRla01zWjBKQlFXZENMRU5CUTJRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZEYWtJc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RlFVTnlRaXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVU5xUWl4RFFVRkRPMUZCUTBvc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRFRDeERRVUZETzBsQlJVUXNaMFpCUVdkR08wbEJRMmhHTEU5QlFVOHNXVUZCV1N4RFFVRkRPMEZCUTNSQ0xFTkJRVU1pZlE9PSIsIi8qKlxuICogVGllcyB0b2dldGhlciB0aGUgdHdvIHNlcGFyYXRlIG5hdmlnYXRpb24gZXZlbnRzIHRoYXQgdG9nZXRoZXIgaG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgYm90aCBwYXJlbnQgZnJhbWUgaWQgYW5kIHRyYW5zaXRpb24tcmVsYXRlZCBhdHRyaWJ1dGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBQZW5kaW5nTmF2aWdhdGlvbiB7XG4gICAgb25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbjtcbiAgICBvbkNvbW1pdHRlZEV2ZW50TmF2aWdhdGlvbjtcbiAgICByZXNvbHZlT25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbjtcbiAgICByZXNvbHZlT25Db21taXR0ZWRFdmVudE5hdmlnYXRpb247XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMub25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbiA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVPbkJlZm9yZU5hdmlnYXRlRXZlbnROYXZpZ2F0aW9uID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub25Db21taXR0ZWRFdmVudE5hdmlnYXRpb24gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlT25Db21taXR0ZWRFdmVudE5hdmlnYXRpb24gPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVzb2x2ZWQoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb24sXG4gICAgICAgICAgICB0aGlzLm9uQ29tbWl0dGVkRXZlbnROYXZpZ2F0aW9uLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRWl0aGVyIHJldHVybnMgb3IgdGltZXMgb3V0IGFuZCByZXR1cm5zIHVuZGVmaW5lZCBvclxuICAgICAqIHJldHVybnMgdGhlIHJlc3VsdHMgZnJvbSByZXNvbHZlZCgpIGFib3ZlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbXNcbiAgICAgKi9cbiAgICBhc3luYyByZXNvbHZlZFdpdGhpblRpbWVvdXQobXMpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlZCgpLFxuICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKSxcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR1Z1WkdsdVp5MXVZWFpwWjJGMGFXOXVMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMMnhwWWk5d1pXNWthVzVuTFc1aGRtbG5ZWFJwYjI0dWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJSVUU3TzBkQlJVYzdRVUZEU0N4TlFVRk5MRTlCUVU4c2FVSkJRV2xDTzBsQlExb3NLMEpCUVN0Q0xFTkJRWE5DTzBsQlEzSkVMREJDUVVFd1FpeERRVUZ6UWp0SlFVTjZSQ3h6UTBGQmMwTXNRMEZCWjBNN1NVRkRkRVVzYVVOQlFXbERMRU5CUVdkRE8wbEJRM2hGTzFGQlEwVXNTVUZCU1N4RFFVRkRMQ3RDUVVFclFpeEhRVUZITEVsQlFVa3NUMEZCVHl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVU3V1VGRE4wUXNTVUZCU1N4RFFVRkRMSE5EUVVGelF5eEhRVUZITEU5QlFVOHNRMEZCUXp0UlFVTjRSQ3hEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5JTEVsQlFVa3NRMEZCUXl3d1FrRkJNRUlzUjBGQlJ5eEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRk8xbEJRM2hFTEVsQlFVa3NRMEZCUXl4cFEwRkJhVU1zUjBGQlJ5eFBRVUZQTEVOQlFVTTdVVUZEYmtRc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRFRDeERRVUZETzBsQlEwMHNVVUZCVVR0UlFVTmlMRTlCUVU4c1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF6dFpRVU5xUWl4SlFVRkpMRU5CUVVNc0swSkJRU3RDTzFsQlEzQkRMRWxCUVVrc1EwRkJReXd3UWtGQk1FSTdVMEZEYUVNc1EwRkJReXhEUVVGRE8wbEJRMHdzUTBGQlF6dEpRVVZFT3pzN096dFBRVXRITzBsQlEwa3NTMEZCU3l4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVWQlFVVTdVVUZEYmtNc1RVRkJUU3hSUVVGUkxFZEJRVWNzVFVGQlRTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRPMWxCUTJ4RExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVTdXVUZEWml4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF6dFRRVU5zUkN4RFFVRkRMRU5CUVVNN1VVRkRTQ3hQUVVGUExGRkJRVkVzUTBGQlF6dEpRVU5zUWl4RFFVRkRPME5CUTBZaWZRPT0iLCIvKipcbiAqIFRpZXMgdG9nZXRoZXIgdGhlIHR3byBzZXBhcmF0ZSBldmVudHMgdGhhdCB0b2dldGhlciBob2xkcyBpbmZvcm1hdGlvbiBhYm91dCBib3RoIHJlcXVlc3QgaGVhZGVycyBhbmQgYm9keVxuICovXG5leHBvcnQgY2xhc3MgUGVuZGluZ1JlcXVlc3Qge1xuICAgIG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscztcbiAgICBvbkJlZm9yZVNlbmRIZWFkZXJzRXZlbnREZXRhaWxzO1xuICAgIHJlc29sdmVPbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHM7XG4gICAgcmVzb2x2ZU9uQmVmb3JlU2VuZEhlYWRlcnNFdmVudERldGFpbHM7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMub25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyA9IHJlc29sdmU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9uQmVmb3JlU2VuZEhlYWRlcnNFdmVudERldGFpbHMgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlT25CZWZvcmVTZW5kSGVhZGVyc0V2ZW50RGV0YWlscyA9IHJlc29sdmU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXNvbHZlZCgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzLFxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZVNlbmRIZWFkZXJzRXZlbnREZXRhaWxzLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRWl0aGVyIHJldHVybnMgb3IgdGltZXMgb3V0IGFuZCByZXR1cm5zIHVuZGVmaW5lZCBvclxuICAgICAqIHJldHVybnMgdGhlIHJlc3VsdHMgZnJvbSByZXNvbHZlZCgpIGFib3ZlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbXNcbiAgICAgKi9cbiAgICBhc3luYyByZXNvbHZlZFdpdGhpblRpbWVvdXQobXMpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlZCgpLFxuICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKSxcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR1Z1WkdsdVp5MXlaWEYxWlhOMExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwyeHBZaTl3Wlc1a2FXNW5MWEpsY1hWbGMzUXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUzBFN08wZEJSVWM3UVVGRFNDeE5RVUZOTEU5QlFVOHNZMEZCWXp0SlFVTlVMREpDUVVFeVFpeERRVUZwUkR0SlFVTTFSU3dyUWtGQkswSXNRMEZCY1VRN1NVRkROMFlzYTBOQlFXdERMRU5CUlM5Q08wbEJRMGdzYzBOQlFYTkRMRU5CUlc1RE8wbEJRMVk3VVVGRFJTeEpRVUZKTEVOQlFVTXNNa0pCUVRKQ0xFZEJRVWNzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSVHRaUVVONlJDeEpRVUZKTEVOQlFVTXNhME5CUVd0RExFZEJRVWNzVDBGQlR5eERRVUZETzFGQlEzQkVMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMGdzU1VGQlNTeERRVUZETEN0Q1FVRXJRaXhIUVVGSExFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVN1dVRkROMFFzU1VGQlNTeERRVUZETEhORFFVRnpReXhIUVVGSExFOUJRVThzUTBGQlF6dFJRVU40UkN4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVOTUxFTkJRVU03U1VGRFRTeFJRVUZSTzFGQlEySXNUMEZCVHl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRE8xbEJRMnBDTEVsQlFVa3NRMEZCUXl3eVFrRkJNa0k3V1VGRGFFTXNTVUZCU1N4RFFVRkRMQ3RDUVVFclFqdFRRVU55UXl4RFFVRkRMRU5CUVVNN1NVRkRUQ3hEUVVGRE8wbEJSVVE3T3pzN08wOUJTMGM3U1VGRFNTeExRVUZMTEVOQlFVTXNjVUpCUVhGQ0xFTkJRVU1zUlVGQlJUdFJRVU51UXl4TlFVRk5MRkZCUVZFc1IwRkJSeXhOUVVGTkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTTdXVUZEYkVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU5tTEVsQlFVa3NUMEZCVHl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVVzUTBGQlF5eFZRVUZWTEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xTkJRMnhFTEVOQlFVTXNRMEZCUXp0UlFVTklMRTlCUVU4c1VVRkJVU3hEUVVGRE8wbEJRMnhDTEVOQlFVTTdRMEZEUmlKOSIsImltcG9ydCB7IFJlc3BvbnNlQm9keUxpc3RlbmVyIH0gZnJvbSBcIi4vcmVzcG9uc2UtYm9keS1saXN0ZW5lclwiO1xuLyoqXG4gKiBUaWVzIHRvZ2V0aGVyIHRoZSB0d28gc2VwYXJhdGUgZXZlbnRzIHRoYXQgdG9nZXRoZXIgaG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgYm90aCByZXNwb25zZSBoZWFkZXJzIGFuZCBib2R5XG4gKi9cbmV4cG9ydCBjbGFzcyBQZW5kaW5nUmVzcG9uc2Uge1xuICAgIG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscztcbiAgICBvbkNvbXBsZXRlZEV2ZW50RGV0YWlscztcbiAgICByZXNwb25zZUJvZHlMaXN0ZW5lcjtcbiAgICByZXNvbHZlT25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzO1xuICAgIHJlc29sdmVPbkNvbXBsZXRlZEV2ZW50RGV0YWlscztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5vbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlT25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub25Db21wbGV0ZWRFdmVudERldGFpbHMgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlT25Db21wbGV0ZWRFdmVudERldGFpbHMgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWRkUmVzcG9uc2VSZXNwb25zZUJvZHlMaXN0ZW5lcihkZXRhaWxzKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2VCb2R5TGlzdGVuZXIgPSBuZXcgUmVzcG9uc2VCb2R5TGlzdGVuZXIoZGV0YWlscyk7XG4gICAgfVxuICAgIHJlc29sdmVkKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMsXG4gICAgICAgICAgICB0aGlzLm9uQ29tcGxldGVkRXZlbnREZXRhaWxzLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRWl0aGVyIHJldHVybnMgb3IgdGltZXMgb3V0IGFuZCByZXR1cm5zIHVuZGVmaW5lZCBvclxuICAgICAqIHJldHVybnMgdGhlIHJlc3VsdHMgZnJvbSByZXNvbHZlZCgpIGFib3ZlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbXNcbiAgICAgKi9cbiAgICBhc3luYyByZXNvbHZlZFdpdGhpblRpbWVvdXQobXMpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlZCgpLFxuICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKSxcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR1Z1WkdsdVp5MXlaWE53YjI1elpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMeTR1TDNOeVl5OXNhV0l2Y0dWdVpHbHVaeTF5WlhOd2IyNXpaUzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGSlFTeFBRVUZQTEVWQlFVVXNiMEpCUVc5Q0xFVkJRVVVzVFVGQlRTd3dRa0ZCTUVJc1EwRkJRenRCUVVWb1JUczdSMEZGUnp0QlFVTklMRTFCUVUwc1QwRkJUeXhsUVVGbE8wbEJRMVlzTWtKQlFUSkNMRU5CUVdsRU8wbEJRelZGTEhWQ1FVRjFRaXhEUVVFMlF6dEpRVU0zUlN4dlFrRkJiMElzUTBGQmRVSTdTVUZETTBNc2EwTkJRV3RETEVOQlJTOUNPMGxCUTBnc09FSkJRVGhDTEVOQlJUTkNPMGxCUTFZN1VVRkRSU3hKUVVGSkxFTkJRVU1zTWtKQlFUSkNMRWRCUVVjc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlR0WlFVTjZSQ3hKUVVGSkxFTkJRVU1zYTBOQlFXdERMRWRCUVVjc1QwRkJUeXhEUVVGRE8xRkJRM0JFTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTBnc1NVRkJTU3hEUVVGRExIVkNRVUYxUWl4SFFVRkhMRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVTdXVUZEY2tRc1NVRkJTU3hEUVVGRExEaENRVUU0UWl4SFFVRkhMRTlCUVU4c1EwRkJRenRSUVVOb1JDeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTk1MRU5CUVVNN1NVRkRUU3dyUWtGQkswSXNRMEZEY0VNc1QwRkJPRU03VVVGRk9VTXNTVUZCU1N4RFFVRkRMRzlDUVVGdlFpeEhRVUZITEVsQlFVa3NiMEpCUVc5Q0xFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdTVUZEYUVVc1EwRkJRenRKUVVOTkxGRkJRVkU3VVVGRFlpeFBRVUZQTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNN1dVRkRha0lzU1VGQlNTeERRVUZETERKQ1FVRXlRanRaUVVOb1F5eEpRVUZKTEVOQlFVTXNkVUpCUVhWQ08xTkJRemRDTEVOQlFVTXNRMEZCUXp0SlFVTk1MRU5CUVVNN1NVRkZSRHM3T3pzN1QwRkxSenRKUVVOSkxFdEJRVXNzUTBGQlF5eHhRa0ZCY1VJc1EwRkJReXhGUVVGRk8xRkJRMjVETEUxQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF6dFpRVU5zUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8xbEJRMllzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSU3hEUVVGRExGVkJRVlVzUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1UwRkRiRVFzUTBGQlF5eERRVUZETzFGQlEwZ3NUMEZCVHl4UlFVRlJMRU5CUVVNN1NVRkRiRUlzUTBGQlF6dERRVU5HSW4wPSIsImltcG9ydCB7IGRpZ2VzdE1lc3NhZ2UgfSBmcm9tIFwiLi9zaGEyNTZcIjtcbmV4cG9ydCBjbGFzcyBSZXNwb25zZUJvZHlMaXN0ZW5lciB7XG4gICAgcmVzcG9uc2VCb2R5O1xuICAgIGNvbnRlbnRIYXNoO1xuICAgIHJlc29sdmVSZXNwb25zZUJvZHk7XG4gICAgcmVzb2x2ZUNvbnRlbnRIYXNoO1xuICAgIGNvbnN0cnVjdG9yKGRldGFpbHMpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZUJvZHkgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlUmVzcG9uc2VCb2R5ID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29udGVudEhhc2ggPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlQ29udGVudEhhc2ggPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gVXNlZCB0byBwYXJzZSBSZXNwb25zZSBzdHJlYW1cbiAgICAgICAgY29uc3QgZmlsdGVyID0gYnJvd3Nlci53ZWJSZXF1ZXN0LmZpbHRlclJlc3BvbnNlRGF0YShkZXRhaWxzLnJlcXVlc3RJZC50b1N0cmluZygpKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlQm9keSA9IG5ldyBVaW50OEFycmF5KCk7XG4gICAgICAgIGZpbHRlci5vbmRhdGEgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGRpZ2VzdE1lc3NhZ2UoZXZlbnQuZGF0YSkudGhlbigoZGlnZXN0KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNvbHZlQ29udGVudEhhc2goZGlnZXN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgaW5jb21pbmcgPSBuZXcgVWludDhBcnJheShldmVudC5kYXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHRtcCA9IG5ldyBVaW50OEFycmF5KHJlc3BvbnNlQm9keS5sZW5ndGggKyBpbmNvbWluZy5sZW5ndGgpO1xuICAgICAgICAgICAgdG1wLnNldChyZXNwb25zZUJvZHkpO1xuICAgICAgICAgICAgdG1wLnNldChpbmNvbWluZywgcmVzcG9uc2VCb2R5Lmxlbmd0aCk7XG4gICAgICAgICAgICByZXNwb25zZUJvZHkgPSB0bXA7XG4gICAgICAgICAgICBmaWx0ZXIud3JpdGUoZXZlbnQuZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIGZpbHRlci5vbnN0b3AgPSAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVSZXNwb25zZUJvZHkocmVzcG9uc2VCb2R5KTtcbiAgICAgICAgICAgIGZpbHRlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIGdldFJlc3BvbnNlQm9keSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2VCb2R5O1xuICAgIH1cbiAgICBhc3luYyBnZXRDb250ZW50SGFzaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudEhhc2g7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY21WemNHOXVjMlV0WW05a2VTMXNhWE4wWlc1bGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMeTR1TDNOeVl5OXNhV0l2Y21WemNHOXVjMlV0WW05a2VTMXNhWE4wWlc1bGNpNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZEUVN4UFFVRlBMRVZCUVVVc1lVRkJZU3hGUVVGRkxFMUJRVTBzVlVGQlZTeERRVUZETzBGQlJYcERMRTFCUVUwc1QwRkJUeXh2UWtGQmIwSTdTVUZEWkN4WlFVRlpMRU5CUVhOQ08wbEJRMnhETEZkQlFWY3NRMEZCYTBJN1NVRkRkRU1zYlVKQlFXMUNMRU5CUVhGRE8wbEJRM2hFTEd0Q1FVRnJRaXhEUVVGblF6dEpRVVV4UkN4WlFVRlpMRTlCUVRoRE8xRkJRM2hFTEVsQlFVa3NRMEZCUXl4WlFVRlpMRWRCUVVjc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlR0WlFVTXhReXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRWRCUVVjc1QwRkJUeXhEUVVGRE8xRkJRM0pETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTBnc1NVRkJTU3hEUVVGRExGZEJRVmNzUjBGQlJ5eEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRk8xbEJRM3BETEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUjBGQlJ5eFBRVUZQTEVOQlFVTTdVVUZEY0VNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRlNDeG5RMEZCWjBNN1VVRkRhRU1zVFVGQlRTeE5RVUZOTEVkQlFWRXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhyUWtGQmEwSXNRMEZEZGtRc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZEZEVJc1EwRkJRenRSUVVWVUxFbEJRVWtzV1VGQldTeEhRVUZITEVsQlFVa3NWVUZCVlN4RlFVRkZMRU5CUVVNN1VVRkRjRU1zVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRk8xbEJRM2hDTEdGQlFXRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVN1owSkJRM2hETEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0WlFVTnNReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5JTEUxQlFVMHNVVUZCVVN4SFFVRkhMRWxCUVVrc1ZVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTTFReXhOUVVGTkxFZEJRVWNzUjBGQlJ5eEpRVUZKTEZWQlFWVXNRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0WlFVTnNSU3hIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMWxCUTNSQ0xFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNVVUZCVVN4RlFVRkZMRmxCUVZrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFpRVU4yUXl4WlFVRlpMRWRCUVVjc1IwRkJSeXhEUVVGRE8xbEJRMjVDTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlF6TkNMRU5CUVVNc1EwRkJRenRSUVVWR0xFMUJRVTBzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSVHRaUVVONlFpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFTkJRVU1zV1VGQldTeERRVUZETEVOQlFVTTdXVUZEZGtNc1RVRkJUU3hEUVVGRExGVkJRVlVzUlVGQlJTeERRVUZETzFGQlEzUkNMRU5CUVVNc1EwRkJRenRKUVVOS0xFTkJRVU03U1VGRlRTeExRVUZMTEVOQlFVTXNaVUZCWlR0UlFVTXhRaXhQUVVGUExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTTdTVUZETTBJc1EwRkJRenRKUVVWTkxFdEJRVXNzUTBGQlF5eGpRVUZqTzFGQlEzcENMRTlCUVU4c1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF6dEpRVU14UWl4RFFVRkRPME5CUTBZaWZRPT0iLCIvKipcbiAqIENvZGUgZnJvbSB0aGUgZXhhbXBsZSBhdFxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N1YnRsZUNyeXB0by9kaWdlc3RcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpZ2VzdE1lc3NhZ2UobXNnVWludDgpIHtcbiAgICBjb25zdCBoYXNoQnVmZmVyID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoXCJTSEEtMjU2XCIsIG1zZ1VpbnQ4KTsgLy8gaGFzaCB0aGUgbWVzc2FnZVxuICAgIGNvbnN0IGhhc2hBcnJheSA9IEFycmF5LmZyb20obmV3IFVpbnQ4QXJyYXkoaGFzaEJ1ZmZlcikpOyAvLyBjb252ZXJ0IGJ1ZmZlciB0byBieXRlIGFycmF5XG4gICAgY29uc3QgaGFzaEhleCA9IGhhc2hBcnJheVxuICAgICAgICAubWFwKChiKSA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCBcIjBcIikpXG4gICAgICAgIC5qb2luKFwiXCIpOyAvLyBjb252ZXJ0IGJ5dGVzIHRvIGhleCBzdHJpbmdcbiAgICByZXR1cm4gaGFzaEhleDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMyaGhNalUyTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDJ4cFlpOXphR0V5TlRZdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUU3T3p0SFFVZEhPMEZCUlVnc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeGhRVUZoTEVOQlFVTXNVVUZCYjBJN1NVRkRkRVFzVFVGQlRTeFZRVUZWTEVkQlFVY3NUVUZCVFN4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eFRRVUZUTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXh0UWtGQmJVSTdTVUZEZGtZc1RVRkJUU3hUUVVGVExFZEJRVWNzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRlZCUVZVc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNLMEpCUVN0Q08wbEJRM3BHTEUxQlFVMHNUMEZCVHl4SFFVRkhMRk5CUVZNN1UwRkRkRUlzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZETTBNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNPRUpCUVRoQ08wbEJRek5ETEU5QlFVOHNUMEZCVHl4RFFVRkRPMEZCUTJwQ0xFTkJRVU1pZlE9PSIsImV4cG9ydCBmdW5jdGlvbiBlbmNvZGVfdXRmOChzKSB7XG4gICAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzKSk7XG59XG5leHBvcnQgY29uc3QgZXNjYXBlU3RyaW5nID0gZnVuY3Rpb24gKHN0cikge1xuICAgIC8vIENvbnZlcnQgdG8gc3RyaW5nIGlmIG5lY2Vzc2FyeVxuICAgIGlmICh0eXBlb2Ygc3RyICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIH1cbiAgICByZXR1cm4gZW5jb2RlX3V0Zjgoc3RyKTtcbn07XG5leHBvcnQgY29uc3QgZXNjYXBlVXJsID0gZnVuY3Rpb24gKHVybCwgc3RyaXBEYXRhVXJsRGF0YSA9IHRydWUpIHtcbiAgICB1cmwgPSBlc2NhcGVTdHJpbmcodXJsKTtcbiAgICAvLyBkYXRhOls8bWVkaWF0eXBlPl1bO2Jhc2U2NF0sPGRhdGE+XG4gICAgaWYgKHVybC5zdWJzdHIoMCwgNSkgPT09IFwiZGF0YTpcIiAmJlxuICAgICAgICBzdHJpcERhdGFVcmxEYXRhICYmXG4gICAgICAgIHVybC5pbmRleE9mKFwiLFwiKSA+IC0xKSB7XG4gICAgICAgIHVybCA9IHVybC5zdWJzdHIoMCwgdXJsLmluZGV4T2YoXCIsXCIpICsgMSkgKyBcIjxkYXRhLXN0cmlwcGVkPlwiO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufTtcbi8vIEJhc2U2NCBlbmNvZGluZywgZm91bmQgb246XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjcxMDAwMS9ob3ctdG8tY29udmVydC11aW50OC1hcnJheS10by1iYXNlNjQtZW5jb2RlZC1zdHJpbmcvMjU2NDQ0MDkjMjU2NDQ0MDlcbmV4cG9ydCBjb25zdCBVaW50OFRvQmFzZTY0ID0gZnVuY3Rpb24gKHU4QXJyKSB7XG4gICAgY29uc3QgQ0hVTktfU0laRSA9IDB4ODAwMDsgLy8gYXJiaXRyYXJ5IG51bWJlclxuICAgIGxldCBpbmRleCA9IDA7XG4gICAgY29uc3QgbGVuZ3RoID0gdThBcnIubGVuZ3RoO1xuICAgIGxldCByZXN1bHQgPSBcIlwiO1xuICAgIGxldCBzbGljZTtcbiAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgc2xpY2UgPSB1OEFyci5zdWJhcnJheShpbmRleCwgTWF0aC5taW4oaW5kZXggKyBDSFVOS19TSVpFLCBsZW5ndGgpKTtcbiAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgc2xpY2UpO1xuICAgICAgICBpbmRleCArPSBDSFVOS19TSVpFO1xuICAgIH1cbiAgICByZXR1cm4gYnRvYShyZXN1bHQpO1xufTtcbmV4cG9ydCBjb25zdCBib29sVG9JbnQgPSBmdW5jdGlvbiAoYm9vbCkge1xuICAgIHJldHVybiBib29sID8gMSA6IDA7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSeWFXNW5MWFYwYVd4ekxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwyeHBZaTl6ZEhKcGJtY3RkWFJwYkhNdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeFZRVUZWTEZkQlFWY3NRMEZCUXl4RFFVRkRPMGxCUXpOQ0xFOUJRVThzVVVGQlVTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEZWtNc1EwRkJRenRCUVVWRUxFMUJRVTBzUTBGQlF5eE5RVUZOTEZsQlFWa3NSMEZCUnl4VlFVRlZMRWRCUVZFN1NVRkROVU1zYVVOQlFXbERPMGxCUTJwRExFbEJRVWtzVDBGQlR5eEhRVUZITEV0QlFVc3NVVUZCVVN4RlFVRkZPMUZCUXpOQ0xFZEJRVWNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1MwRkRia0k3U1VGRlJDeFBRVUZQTEZkQlFWY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRCUVVNeFFpeERRVUZETEVOQlFVTTdRVUZGUml4TlFVRk5MRU5CUVVNc1RVRkJUU3hUUVVGVExFZEJRVWNzVlVGRGRrSXNSMEZCVnl4RlFVTllMRzFDUVVFMFFpeEpRVUZKTzBsQlJXaERMRWRCUVVjc1IwRkJSeXhaUVVGWkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdTVUZEZUVJc2NVTkJRWEZETzBsQlEzSkRMRWxCUTBVc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRXRCUVVzc1QwRkJUenRSUVVNMVFpeG5Ra0ZCWjBJN1VVRkRhRUlzUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUlVGRGNrSTdVVUZEUVN4SFFVRkhMRWRCUVVjc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4cFFrRkJhVUlzUTBGQlF6dExRVU12UkR0SlFVTkVMRTlCUVU4c1IwRkJSeXhEUVVGRE8wRkJRMklzUTBGQlF5eERRVUZETzBGQlJVWXNOa0pCUVRaQ08wRkJRemRDTEhGSVFVRnhTRHRCUVVOeVNDeE5RVUZOTEVOQlFVTXNUVUZCVFN4aFFVRmhMRWRCUVVjc1ZVRkJWU3hMUVVGcFFqdEpRVU4wUkN4TlFVRk5MRlZCUVZVc1IwRkJSeXhOUVVGTkxFTkJRVU1zUTBGQlF5eHRRa0ZCYlVJN1NVRkRPVU1zU1VGQlNTeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRPMGxCUTJRc1RVRkJUU3hOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXp0SlFVTTFRaXhKUVVGSkxFMUJRVTBzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEYUVJc1NVRkJTU3hMUVVGcFFpeERRVUZETzBsQlEzUkNMRTlCUVU4c1MwRkJTeXhIUVVGSExFMUJRVTBzUlVGQlJUdFJRVU55UWl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVWQlFVVXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhMUVVGTExFZEJRVWNzVlVGQlZTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRjRVVzVFVGQlRTeEpRVUZKTEUxQlFVMHNRMEZCUXl4WlFVRlpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0UlFVTnFSQ3hMUVVGTExFbEJRVWtzVlVGQlZTeERRVUZETzB0QlEzSkNPMGxCUTBRc1QwRkJUeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdRVUZEZEVJc1EwRkJReXhEUVVGRE8wRkJSVVlzVFVGQlRTeERRVUZETEUxQlFVMHNVMEZCVXl4SFFVRkhMRlZCUVZVc1NVRkJZVHRKUVVNNVF5eFBRVUZQTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEZEVJc1EwRkJReXhEUVVGREluMD0iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1iaXR3aXNlICovXG4vLyBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZC85ODI4ODMjZ2lzdGNvbW1lbnQtMjQwMzM2OVxuY29uc3QgaGV4ID0gW107XG5mb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgaGV4W2ldID0gKGkgPCAxNiA/IFwiMFwiIDogXCJcIikgKyBpLnRvU3RyaW5nKDE2KTtcbn1cbmV4cG9ydCBjb25zdCBtYWtlVVVJRCA9ICgpID0+IHtcbiAgICBjb25zdCByID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxNikpO1xuICAgIHJbNl0gPSAocls2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICByWzhdID0gKHJbOF0gJiAweDNmKSB8IDB4ODA7XG4gICAgcmV0dXJuIChoZXhbclswXV0gK1xuICAgICAgICBoZXhbclsxXV0gK1xuICAgICAgICBoZXhbclsyXV0gK1xuICAgICAgICBoZXhbclszXV0gK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIGhleFtyWzRdXSArXG4gICAgICAgIGhleFtyWzVdXSArXG4gICAgICAgIFwiLVwiICtcbiAgICAgICAgaGV4W3JbNl1dICtcbiAgICAgICAgaGV4W3JbN11dICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICBoZXhbcls4XV0gK1xuICAgICAgICBoZXhbcls5XV0gK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIGhleFtyWzEwXV0gK1xuICAgICAgICBoZXhbclsxMV1dICtcbiAgICAgICAgaGV4W3JbMTJdXSArXG4gICAgICAgIGhleFtyWzEzXV0gK1xuICAgICAgICBoZXhbclsxNF1dICtcbiAgICAgICAgaGV4W3JbMTVdXSk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pZFhWcFpDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMeTR1TDNOeVl5OXNhV0l2ZFhWcFpDNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN3clFrRkJLMEk3UVVGRkwwSXNPRVJCUVRoRU8wRkJRemxFTEUxQlFVMHNSMEZCUnl4SFFVRkhMRVZCUVVVc1EwRkJRenRCUVVWbUxFdEJRVXNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhIUVVGSExFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVTdTVUZETlVJc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPME5CUXk5RE8wRkJSVVFzVFVGQlRTeERRVUZETEUxQlFVMHNVVUZCVVN4SFFVRkhMRWRCUVVjc1JVRkJSVHRKUVVNelFpeE5RVUZOTEVOQlFVTXNSMEZCUnl4TlFVRk5MRU5CUVVNc1pVRkJaU3hEUVVGRExFbEJRVWtzVlVGQlZTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkZja1FzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJRenRKUVVNMVFpeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRE8wbEJSVFZDTEU5QlFVOHNRMEZEVEN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExUXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5VTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFZDeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVFzUjBGQlJ6dFJRVU5JTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFZDeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVFzUjBGQlJ6dFJRVU5JTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFZDeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVFzUjBGQlJ6dFJRVU5JTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRFZDeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVFzUjBGQlJ6dFJRVU5JTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRFZpeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJRMVlzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVOV0xFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRWaXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTFZc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVTllMRU5CUVVNN1FVRkRTaXhEUVVGRExFTkJRVU1pZlE9PSIsIi8vIGh0dHBzOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9GaWVsZF9TeW1ib2xfVGFibGVcbmV4cG9ydCBjb25zdCBkYXRlVGltZVVuaWNvZGVGb3JtYXRTdHJpbmcgPSBcInl5eXktTU0tZGQnVCdISDptbTpzcy5TU1NYWFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzJOb1pXMWhMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwzTmphR1Z0WVM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkpRU3dyUlVGQkswVTdRVUZETDBVc1RVRkJUU3hEUVVGRExFMUJRVTBzTWtKQlFUSkNMRWRCUVVjc05rSkJRVFpDTEVOQlFVTWlmUT09IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQge1xuICAgIENvb2tpZUluc3RydW1lbnQsXG4gICAgRG5zSW5zdHJ1bWVudCxcbiAgICBIdHRwSW5zdHJ1bWVudCxcbiAgICBKYXZhc2NyaXB0SW5zdHJ1bWVudCxcbiAgICBOYXZpZ2F0aW9uSW5zdHJ1bWVudFxufSBmcm9tIFwib3BlbndwbS13ZWJleHQtaW5zdHJ1bWVudGF0aW9uXCI7XG5cbmltcG9ydCAqIGFzIGxvZ2dpbmdEQiBmcm9tIFwiLi9sb2dnaW5nZGIuanNcIjtcbmltcG9ydCB7Q2FsbHN0YWNrSW5zdHJ1bWVudH0gZnJvbSBcIi4vY2FsbHN0YWNrLWluc3RydW1lbnQuanNcIjtcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgLy8gUmVhZCB0aGUgYnJvd3NlciBjb25maWd1cmF0aW9uIGZyb20gZmlsZVxuICBsZXQgZmlsZW5hbWUgPSBcImJyb3dzZXJfcGFyYW1zLmpzb25cIjtcbiAgbGV0IGNvbmZpZyA9IGF3YWl0IGJyb3dzZXIucHJvZmlsZURpcklPLnJlYWRGaWxlKGZpbGVuYW1lKTtcbiAgaWYgKGNvbmZpZykge1xuICAgIGNvbmZpZyA9IEpTT04ucGFyc2UoY29uZmlnKTtcbiAgICBjb25zb2xlLmxvZyhcIkJyb3dzZXIgQ29uZmlnOlwiLCBjb25maWcpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IHtcbiAgICAgIG5hdmlnYXRpb25faW5zdHJ1bWVudDp0cnVlLFxuICAgICAgY29va2llX2luc3RydW1lbnQ6dHJ1ZSxcbiAgICAgIGpzX2luc3RydW1lbnQ6dHJ1ZSxcbiAgICAgIGNsZWFuZWRfanNfaW5zdHJ1bWVudF9zZXR0aW5nczpcbiAgICAgIFtcbiAgICAgICAge1xuICAgICAgICAgIG9iamVjdDogYHdpbmRvdy5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlYCxcbiAgICAgICAgICBpbnN0cnVtZW50ZWROYW1lOiBcIkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFwiLFxuICAgICAgICAgIGxvZ1NldHRpbmdzOiB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzVG9JbnN0cnVtZW50OiBbXSxcbiAgICAgICAgICAgIG5vbkV4aXN0aW5nUHJvcGVydGllc1RvSW5zdHJ1bWVudDogW10sXG4gICAgICAgICAgICBleGNsdWRlZFByb3BlcnRpZXM6IFtdLFxuICAgICAgICAgICAgbG9nQ2FsbFN0YWNrOiBmYWxzZSxcbiAgICAgICAgICAgIGxvZ0Z1bmN0aW9uc0FzU3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgICBsb2dGdW5jdGlvbkdldHM6IGZhbHNlLFxuICAgICAgICAgICAgcHJldmVudFNldHM6IGZhbHNlLFxuICAgICAgICAgICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoOiA1LFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBodHRwX2luc3RydW1lbnQ6dHJ1ZSxcbiAgICAgIGNhbGxzdGFja19pbnN0cnVtZW50OnRydWUsXG4gICAgICBzYXZlX2NvbnRlbnQ6ZmFsc2UsXG4gICAgICB0ZXN0aW5nOnRydWUsXG4gICAgICBicm93c2VyX2lkOjAsXG4gICAgICBjdXN0b21fcGFyYW1zOiB7fVxuICAgIH07XG4gICAgY29uc29sZS5sb2coXCJXQVJOSU5HOiBjb25maWcgbm90IGZvdW5kLiBBc3N1bWluZyB0aGlzIGlzIGEgdGVzdCBydW4gb2ZcIixcbiAgICAgICAgICAgICAgICBcInRoZSBleHRlbnNpb24uIE91dHB1dHRpbmcgYWxsIHF1ZXJpZXMgdG8gY29uc29sZS5cIiwge2NvbmZpZ30pO1xuICB9XG5cbiAgYXdhaXQgbG9nZ2luZ0RCLm9wZW4oY29uZmlnWydzdG9yYWdlX2NvbnRyb2xsZXJfYWRkcmVzcyddLFxuICAgICAgICAgICAgICAgICAgICAgICBjb25maWdbJ2xvZ2dlcl9hZGRyZXNzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ1snYnJvd3Nlcl9pZCddKTtcblxuICBpZiAoY29uZmlnW1wiY3VzdG9tX3BhcmFtc1wiXVtcInByZV9pbnN0cnVtZW50YXRpb25fY29kZVwiXSkge1xuICAgIGV2YWwoY29uZmlnW1wiY3VzdG9tX3BhcmFtc1wiXVtcInByZV9pbnN0cnVtZW50YXRpb25fY29kZVwiXSlcbiAgfVxuICBpZiAoY29uZmlnW1wibmF2aWdhdGlvbl9pbnN0cnVtZW50XCJdKSB7XG4gICAgbG9nZ2luZ0RCLmxvZ0RlYnVnKFwiTmF2aWdhdGlvbiBpbnN0cnVtZW50YXRpb24gZW5hYmxlZFwiKTtcbiAgICBsZXQgbmF2aWdhdGlvbkluc3RydW1lbnQgPSBuZXcgTmF2aWdhdGlvbkluc3RydW1lbnQobG9nZ2luZ0RCKTtcbiAgICBuYXZpZ2F0aW9uSW5zdHJ1bWVudC5ydW4oY29uZmlnW1wiYnJvd3Nlcl9pZFwiXSk7XG4gIH1cblxuICBpZiAoY29uZmlnWydjb29raWVfaW5zdHJ1bWVudCddKSB7XG4gICAgbG9nZ2luZ0RCLmxvZ0RlYnVnKFwiQ29va2llIGluc3RydW1lbnRhdGlvbiBlbmFibGVkXCIpO1xuICAgIGxldCBjb29raWVJbnN0cnVtZW50ID0gbmV3IENvb2tpZUluc3RydW1lbnQobG9nZ2luZ0RCKTtcbiAgICBjb29raWVJbnN0cnVtZW50LnJ1bihjb25maWdbJ2Jyb3dzZXJfaWQnXSk7XG4gIH1cblxuICBpZiAoY29uZmlnWydqc19pbnN0cnVtZW50J10pIHtcbiAgICBsb2dnaW5nREIubG9nRGVidWcoXCJKYXZhc2NyaXB0IGluc3RydW1lbnRhdGlvbiBlbmFibGVkXCIpO1xuICAgIGxldCBqc0luc3RydW1lbnQgPSBuZXcgSmF2YXNjcmlwdEluc3RydW1lbnQobG9nZ2luZ0RCKTtcbiAgICBqc0luc3RydW1lbnQucnVuKGNvbmZpZ1snYnJvd3Nlcl9pZCddKTtcbiAgICBhd2FpdCBqc0luc3RydW1lbnQucmVnaXN0ZXJDb250ZW50U2NyaXB0KGNvbmZpZ1sndGVzdGluZyddLCBjb25maWdbJ2NsZWFuZWRfanNfaW5zdHJ1bWVudF9zZXR0aW5ncyddKTtcbiAgfVxuXG4gIGlmIChjb25maWdbJ2h0dHBfaW5zdHJ1bWVudCddKSB7XG4gICAgbG9nZ2luZ0RCLmxvZ0RlYnVnKFwiSFRUUCBJbnN0cnVtZW50YXRpb24gZW5hYmxlZFwiKTtcbiAgICBsZXQgaHR0cEluc3RydW1lbnQgPSBuZXcgSHR0cEluc3RydW1lbnQobG9nZ2luZ0RCKTtcbiAgICBodHRwSW5zdHJ1bWVudC5ydW4oY29uZmlnWydicm93c2VyX2lkJ10sXG4gICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ1snc2F2ZV9jb250ZW50J10pO1xuICB9XG5cbiAgaWYgKGNvbmZpZ1snY2FsbHN0YWNrX2luc3RydW1lbnQnXSkge1xuICAgIGxvZ2dpbmdEQi5sb2dEZWJ1ZyhcIkNhbGxzdGFjayBJbnN0cnVtZW50YXRpb24gZW5hYmxlZFwiKTtcbiAgICBsZXQgY2FsbHN0YWNrSW5zdHJ1bWVudCA9IG5ldyBDYWxsc3RhY2tJbnN0cnVtZW50KGxvZ2dpbmdEQik7XG4gICAgY2FsbHN0YWNrSW5zdHJ1bWVudC5ydW4oY29uZmlnWydicm93c2VyX2lkJ10pO1xuICB9XG4gIFxuICBpZiAoY29uZmlnWydkbnNfaW5zdHJ1bWVudCddKSB7XG4gICAgbG9nZ2luZ0RCLmxvZ0RlYnVnKFwiRE5TIGluc3RydW1lbnRhdGlvbiBlbmFibGVkXCIpO1xuICAgIGxldCBkbnNJbnN0cnVtZW50ID0gbmV3IERuc0luc3RydW1lbnQobG9nZ2luZ0RCKTtcbiAgICBkbnNJbnN0cnVtZW50LnJ1bihjb25maWdbJ2Jyb3dzZXJfaWQnXSk7XG4gIH1cblxuICBhd2FpdCBicm93c2VyLnByb2ZpbGVEaXJJTy53cml0ZUZpbGUoXCJPUEVOV1BNX1NUQVJUVVBfU1VDQ0VTUy50eHRcIiwgXCJcIik7XG59XG5cbm1haW4oKTtcblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9