/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5zLWluc3RydW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmFja2dyb3VuZC9kbnMtaW5zdHJ1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHMUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzdDLE1BQU0sT0FBTyxhQUFhO0lBQ1AsWUFBWSxDQUFDO0lBQ3RCLGtCQUFrQixDQUFDO0lBQ25CLGdCQUFnQixHQUVwQixFQUFFLENBQUM7SUFFUCxZQUFZLFlBQVk7UUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7SUFDbkMsQ0FBQztJQUVNLEdBQUcsQ0FBQyxPQUFPO1FBQ2hCLE1BQU0sTUFBTSxHQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUV4RSxNQUFNLHlCQUF5QixHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDNUMsT0FBTyxDQUNMLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQzFDLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRjs7V0FFRztRQUNILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQTBDLEVBQUUsRUFBRTtZQUN2RSxxQ0FBcUM7WUFDckMsSUFBSSx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdEMsT0FBTzthQUNSO1lBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRSxlQUFlLENBQUMsOEJBQThCLENBQUMs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

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
  !*** ./content.js/index.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openwpm-webext-instrumentation */ "../webext-instrumentation/build/module/index.js");


(0,openwpm_webext_instrumentation__WEBPACK_IMPORTED_MODULE_0__.injectJavascriptInstrumentPageScript)(window.openWpmContentScriptConfig || {});
delete window.openWpmContentScriptConfig;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQSwyQ0FBMkM7Ozs7Ozs7Ozs7Ozs7O0FDN0IzQztBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixxQkFBcUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRUFBZ0U7QUFDaEU7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsc0JBQXNCO0FBQ3RCLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELFdBQVcsR0FBRyxhQUFhO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsMEJBQTBCO0FBQzNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsV0FBVyxHQUFHLGFBQWE7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsMEJBQTBCO0FBQzNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLGlCQUFpQixHQUFHLGFBQWE7QUFDaEYseUNBQXlDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUZBQWlGLGlCQUFpQixHQUFHLGFBQWE7QUFDbEg7QUFDQTtBQUNBLCtDQUErQyxnQ0FBZ0M7QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxnQ0FBZ0M7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLDRCQUE0Qiw2QkFBNkI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQzs7Ozs7Ozs7Ozs7Ozs7QUNua0IzQztBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDOzs7Ozs7Ozs7Ozs7OztBQ3BDM0M7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQzs7Ozs7Ozs7Ozs7Ozs7O0FDcENxQjtBQUNoRTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0Esd0NBQXdDLHlFQUFvQjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7Ozs7Ozs7Ozs7Ozs7OztBQ3pDRjtBQUNsQztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHNEQUFhO0FBQ3pCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDOzs7Ozs7Ozs7Ozs7OztBQ3ZDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLHdFQUF3RTtBQUN4RSw4REFBOEQ7QUFDOUQ7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0EsMkNBQTJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNacEM7QUFDUDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQSwyQ0FBMkM7Ozs7Ozs7Ozs7Ozs7O0FDdEMzQztBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7Ozs7Ozs7Ozs7Ozs7O0FDL0IzQztBQUNPO0FBQ1AsMkNBQTJDOzs7Ozs7VUNGM0M7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ05vRjs7QUFFcEYsb0dBQW9DLHdDQUF3QztBQUM1RSIsInNvdXJjZXMiOlsid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2JhY2tncm91bmQvY29va2llLWluc3RydW1lbnQuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvYmFja2dyb3VuZC9kbnMtaW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9iYWNrZ3JvdW5kL2h0dHAtaW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9iYWNrZ3JvdW5kL2phdmFzY3JpcHQtaW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9iYWNrZ3JvdW5kL25hdmlnYXRpb24taW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9jb250ZW50L2phdmFzY3JpcHQtaW5zdHJ1bWVudC1jb250ZW50LXNjb3BlLmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2NvbnRlbnQvamF2YXNjcmlwdC1pbnN0cnVtZW50LXBhZ2Utc2NvcGUuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL2V4dGVuc2lvbi1zZXNzaW9uLWV2ZW50LW9yZGluYWwuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL2V4dGVuc2lvbi1zZXNzaW9uLXV1aWQuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL2h0dHAtcG9zdC1wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL2pzLWluc3RydW1lbnRzLmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2xpYi9wZW5kaW5nLW5hdmlnYXRpb24uanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL3BlbmRpbmctcmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvcGVuZGluZy1yZXNwb25zZS5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvcmVzcG9uc2UtYm9keS1saXN0ZW5lci5qcyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC8uLi93ZWJleHQtaW5zdHJ1bWVudGF0aW9uL2J1aWxkL21vZHVsZS9saWIvc2hhMjU2LmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94Ly4uL3dlYmV4dC1pbnN0cnVtZW50YXRpb24vYnVpbGQvbW9kdWxlL2xpYi9zdHJpbmctdXRpbHMuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvbGliL3V1aWQuanMiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi4vd2ViZXh0LWluc3RydW1lbnRhdGlvbi9idWlsZC9tb2R1bGUvc2NoZW1hLmpzIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9Ab3BlbndwbS93ZWJleHQtZmlyZWZveC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BvcGVud3BtL3dlYmV4dC1maXJlZm94L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQG9wZW53cG0vd2ViZXh0LWZpcmVmb3gvLi9jb250ZW50LmpzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluY3JlbWVudGVkRXZlbnRPcmRpbmFsIH0gZnJvbSBcIi4uL2xpYi9leHRlbnNpb24tc2Vzc2lvbi1ldmVudC1vcmRpbmFsXCI7XG5pbXBvcnQgeyBleHRlbnNpb25TZXNzaW9uVXVpZCB9IGZyb20gXCIuLi9saWIvZXh0ZW5zaW9uLXNlc3Npb24tdXVpZFwiO1xuaW1wb3J0IHsgYm9vbFRvSW50LCBlc2NhcGVTdHJpbmcgfSBmcm9tIFwiLi4vbGliL3N0cmluZy11dGlsc1wiO1xuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybUNvb2tpZU9iamVjdFRvTWF0Y2hPcGVuV1BNU2NoZW1hID0gKGNvb2tpZSkgPT4ge1xuICAgIGNvbnN0IGphdmFzY3JpcHRDb29raWUgPSB7fTtcbiAgICAvLyBFeHBpcnkgdGltZSAoaW4gc2Vjb25kcylcbiAgICAvLyBNYXkgcmV0dXJuIH5NYXgoaW50NjQpLiBJIGJlbGlldmUgdGhpcyBpcyBhIHNlc3Npb25cbiAgICAvLyBjb29raWUgd2hpY2ggZG9lc24ndCBleHBpcmUuIFNlc3Npb25zIGNvb2tpZXMgd2l0aFxuICAgIC8vIG5vbi1tYXggZXhwaXJ5IHRpbWUgZXhwaXJlIGFmdGVyIHNlc3Npb24gb3IgYXQgZXhwaXJ5LlxuICAgIGNvbnN0IGV4cGlyeVRpbWUgPSBjb29raWUuZXhwaXJhdGlvbkRhdGU7IC8vIHJldHVybnMgc2Vjb25kc1xuICAgIGxldCBleHBpcnlUaW1lU3RyaW5nO1xuICAgIGNvbnN0IG1heEludDY0ID0gOTIyMzM3MjAzNjg1NDc3NjAwMDtcbiAgICBpZiAoIWNvb2tpZS5leHBpcmF0aW9uRGF0ZSB8fCBleHBpcnlUaW1lID09PSBtYXhJbnQ2NCkge1xuICAgICAgICBleHBpcnlUaW1lU3RyaW5nID0gXCI5OTk5LTEyLTMxVDIxOjU5OjU5LjAwMFpcIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGV4cGlyeVRpbWVEYXRlID0gbmV3IERhdGUoZXhwaXJ5VGltZSAqIDEwMDApOyAvLyByZXF1aXJlcyBtaWxsaXNlY29uZHNcbiAgICAgICAgZXhwaXJ5VGltZVN0cmluZyA9IGV4cGlyeVRpbWVEYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgfVxuICAgIGphdmFzY3JpcHRDb29raWUuZXhwaXJ5ID0gZXhwaXJ5VGltZVN0cmluZztcbiAgICBqYXZhc2NyaXB0Q29va2llLmlzX2h0dHBfb25seSA9IGJvb2xUb0ludChjb29raWUuaHR0cE9ubHkpO1xuICAgIGphdmFzY3JpcHRDb29raWUuaXNfaG9zdF9vbmx5ID0gYm9vbFRvSW50KGNvb2tpZS5ob3N0T25seSk7XG4gICAgamF2YXNjcmlwdENvb2tpZS5pc19zZXNzaW9uID0gYm9vbFRvSW50KGNvb2tpZS5zZXNzaW9uKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLmhvc3QgPSBlc2NhcGVTdHJpbmcoY29va2llLmRvbWFpbik7XG4gICAgamF2YXNjcmlwdENvb2tpZS5pc19zZWN1cmUgPSBib29sVG9JbnQoY29va2llLnNlY3VyZSk7XG4gICAgamF2YXNjcmlwdENvb2tpZS5uYW1lID0gZXNjYXBlU3RyaW5nKGNvb2tpZS5uYW1lKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLnBhdGggPSBlc2NhcGVTdHJpbmcoY29va2llLnBhdGgpO1xuICAgIGphdmFzY3JpcHRDb29raWUudmFsdWUgPSBlc2NhcGVTdHJpbmcoY29va2llLnZhbHVlKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLnNhbWVfc2l0ZSA9IGVzY2FwZVN0cmluZyhjb29raWUuc2FtZVNpdGUpO1xuICAgIGphdmFzY3JpcHRDb29raWUuZmlyc3RfcGFydHlfZG9tYWluID0gZXNjYXBlU3RyaW5nKGNvb2tpZS5maXJzdFBhcnR5RG9tYWluKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLnN0b3JlX2lkID0gZXNjYXBlU3RyaW5nKGNvb2tpZS5zdG9yZUlkKTtcbiAgICBqYXZhc2NyaXB0Q29va2llLnRpbWVfc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgcmV0dXJuIGphdmFzY3JpcHRDb29raWU7XG59O1xuZXhwb3J0IGNsYXNzIENvb2tpZUluc3RydW1lbnQge1xuICAgIGRhdGFSZWNlaXZlcjtcbiAgICBvbkNoYW5nZWRMaXN0ZW5lcjtcbiAgICBjb25zdHJ1Y3RvcihkYXRhUmVjZWl2ZXIpIHtcbiAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIgPSBkYXRhUmVjZWl2ZXI7XG4gICAgfVxuICAgIHJ1bihjcmF3bElEKSB7XG4gICAgICAgIC8vIEluc3RydW1lbnQgY29va2llIGNoYW5nZXNcbiAgICAgICAgdGhpcy5vbkNoYW5nZWRMaXN0ZW5lciA9IGFzeW5jIChjaGFuZ2VJbmZvKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldmVudFR5cGUgPSBjaGFuZ2VJbmZvLnJlbW92ZWQgPyBcImRlbGV0ZWRcIiA6IFwiYWRkZWQtb3ItY2hhbmdlZFwiO1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlID0ge1xuICAgICAgICAgICAgICAgIHJlY29yZF90eXBlOiBldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgY2hhbmdlX2NhdXNlOiBjaGFuZ2VJbmZvLmNhdXNlLFxuICAgICAgICAgICAgICAgIGJyb3dzZXJfaWQ6IGNyYXdsSUQsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZDogZXh0ZW5zaW9uU2Vzc2lvblV1aWQsXG4gICAgICAgICAgICAgICAgZXZlbnRfb3JkaW5hbDogaW5jcmVtZW50ZWRFdmVudE9yZGluYWwoKSxcbiAgICAgICAgICAgICAgICAuLi50cmFuc2Zvcm1Db29raWVPYmplY3RUb01hdGNoT3BlbldQTVNjaGVtYShjaGFuZ2VJbmZvLmNvb2tpZSksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImphdmFzY3JpcHRfY29va2llc1wiLCB1cGRhdGUpO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLmNvb2tpZXMub25DaGFuZ2VkLmFkZExpc3RlbmVyKHRoaXMub25DaGFuZ2VkTGlzdGVuZXIpO1xuICAgIH1cbiAgICBhc3luYyBzYXZlQWxsQ29va2llcyhjcmF3bElEKSB7XG4gICAgICAgIGNvbnN0IGFsbENvb2tpZXMgPSBhd2FpdCBicm93c2VyLmNvb2tpZXMuZ2V0QWxsKHt9KTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoYWxsQ29va2llcy5tYXAoKGNvb2tpZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlID0ge1xuICAgICAgICAgICAgICAgIHJlY29yZF90eXBlOiBcIm1hbnVhbC1leHBvcnRcIixcbiAgICAgICAgICAgICAgICBicm93c2VyX2lkOiBjcmF3bElELFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbl9zZXNzaW9uX3V1aWQ6IGV4dGVuc2lvblNlc3Npb25VdWlkLFxuICAgICAgICAgICAgICAgIC4uLnRyYW5zZm9ybUNvb2tpZU9iamVjdFRvTWF0Y2hPcGVuV1BNU2NoZW1hKGNvb2tpZSksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJqYXZhc2NyaXB0X2Nvb2tpZXNcIiwgdXBkYXRlKTtcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBjbGVhbnVwKCkge1xuICAgICAgICBpZiAodGhpcy5vbkNoYW5nZWRMaXN0ZW5lcikge1xuICAgICAgICAgICAgYnJvd3Nlci5jb29raWVzLm9uQ2hhbmdlZC5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uQ2hhbmdlZExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVkyOXZhMmxsTFdsdWMzUnlkVzFsYm5RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdlltRmphMmR5YjNWdVpDOWpiMjlyYVdVdGFXNXpkSEoxYldWdWRDNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4UFFVRlBMRVZCUVVVc2RVSkJRWFZDTEVWQlFVVXNUVUZCVFN4M1EwRkJkME1zUTBGQlF6dEJRVU5xUml4UFFVRlBMRVZCUVVVc2IwSkJRVzlDTEVWQlFVVXNUVUZCVFN3clFrRkJLMElzUTBGQlF6dEJRVU55UlN4UFFVRlBMRVZCUVVVc1UwRkJVeXhGUVVGRkxGbEJRVmtzUlVGQlJTeE5RVUZOTEhGQ1FVRnhRaXhEUVVGRE8wRkJTemxFTEUxQlFVMHNRMEZCUXl4TlFVRk5MSGxEUVVGNVF5eEhRVUZITEVOQlFVTXNUVUZCWXl4RlFVRkZMRVZCUVVVN1NVRkRNVVVzVFVGQlRTeG5Ra0ZCWjBJc1IwRkJSeXhGUVVGelFpeERRVUZETzBsQlJXaEVMREpDUVVFeVFqdEpRVU16UWl4elJFRkJjMFE3U1VGRGRFUXNjVVJCUVhGRU8wbEJRM0pFTEhsRVFVRjVSRHRKUVVONlJDeE5RVUZOTEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU1zYTBKQlFXdENPMGxCUXpWRUxFbEJRVWtzWjBKQlFXZENMRU5CUVVNN1NVRkRja0lzVFVGQlRTeFJRVUZSTEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU03U1VGRGNrTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhqUVVGakxFbEJRVWtzVlVGQlZTeExRVUZMTEZGQlFWRXNSVUZCUlR0UlFVTnlSQ3huUWtGQlowSXNSMEZCUnl3d1FrRkJNRUlzUTBGQlF6dExRVU12UXp0VFFVRk5PMUZCUTB3c1RVRkJUU3hqUVVGakxFZEJRVWNzU1VGQlNTeEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zZDBKQlFYZENPMUZCUXpWRkxHZENRVUZuUWl4SFFVRkhMR05CUVdNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF6dExRVU5xUkR0SlFVTkVMR2RDUVVGblFpeERRVUZETEUxQlFVMHNSMEZCUnl4blFrRkJaMElzUTBGQlF6dEpRVU16UXl4blFrRkJaMElzUTBGQlF5eFpRVUZaTEVkQlFVY3NVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEpRVU16UkN4blFrRkJaMElzUTBGQlF5eFpRVUZaTEVkQlFVY3NVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEpRVU16UkN4blFrRkJaMElzUTBGQlF5eFZRVUZWTEVkQlFVY3NVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dEpRVVY0UkN4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVkQlFVY3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEpRVU53UkN4blFrRkJaMElzUTBGQlF5eFRRVUZUTEVkQlFVY3NVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEpRVU4wUkN4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVkQlFVY3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU5zUkN4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVkQlFVY3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEpRVU5zUkN4blFrRkJaMElzUTBGQlF5eExRVUZMTEVkQlFVY3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU53UkN4blFrRkJaMElzUTBGQlF5eFRRVUZUTEVkQlFVY3NXVUZCV1N4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEpRVU16UkN4blFrRkJaMElzUTBGQlF5eHJRa0ZCYTBJc1IwRkJSeXhaUVVGWkxFTkJRVU1zVFVGQlRTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU03U1VGRE5VVXNaMEpCUVdkQ0xFTkJRVU1zVVVGQlVTeEhRVUZITEZsQlFWa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03U1VGRmVrUXNaMEpCUVdkQ0xFTkJRVU1zVlVGQlZTeEhRVUZITEVsQlFVa3NTVUZCU1N4RlFVRkZMRU5CUVVNc1YwRkJWeXhGUVVGRkxFTkJRVU03U1VGRmRrUXNUMEZCVHl4blFrRkJaMElzUTBGQlF6dEJRVU14UWl4RFFVRkRMRU5CUVVNN1FVRkZSaXhOUVVGTkxFOUJRVThzWjBKQlFXZENPMGxCUTFZc1dVRkJXU3hEUVVGRE8wbEJRM1JDTEdsQ1FVRnBRaXhEUVVGRE8wbEJSVEZDTEZsQlFWa3NXVUZCV1R0UlFVTjBRaXhKUVVGSkxFTkJRVU1zV1VGQldTeEhRVUZITEZsQlFWa3NRMEZCUXp0SlFVTnVReXhEUVVGRE8wbEJSVTBzUjBGQlJ5eERRVUZETEU5QlFVODdVVUZEYUVJc05FSkJRVFJDTzFGQlF6VkNMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNSMEZCUnl4TFFVRkxMRVZCUVVVc1ZVRlBMMElzUlVGQlJTeEZRVUZGTzFsQlEwZ3NUVUZCVFN4VFFVRlRMRWRCUVVjc1ZVRkJWU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhyUWtGQmEwSXNRMEZCUXp0WlFVTjBSU3hOUVVGTkxFMUJRVTBzUjBGQk1rSTdaMEpCUTNKRExGZEJRVmNzUlVGQlJTeFRRVUZUTzJkQ1FVTjBRaXhaUVVGWkxFVkJRVVVzVlVGQlZTeERRVUZETEV0QlFVczdaMEpCUXpsQ0xGVkJRVlVzUlVGQlJTeFBRVUZQTzJkQ1FVTnVRaXh6UWtGQmMwSXNSVUZCUlN4dlFrRkJiMEk3WjBKQlF6VkRMR0ZCUVdFc1JVRkJSU3gxUWtGQmRVSXNSVUZCUlR0blFrRkRlRU1zUjBGQlJ5eDVRMEZCZVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETzJGQlEyaEZMRU5CUVVNN1dVRkRSaXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEZWQlFWVXNRMEZCUXl4dlFrRkJiMElzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0UlFVTTNSQ3hEUVVGRExFTkJRVU03VVVGRFJpeFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFTkJRVU03U1VGRGFFVXNRMEZCUXp0SlFVVk5MRXRCUVVzc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR6dFJRVU5xUXl4TlFVRk5MRlZCUVZVc1IwRkJSeXhOUVVGTkxFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJRM0JFTEUxQlFVMHNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkRaaXhWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCWXl4RlFVRkZMRVZCUVVVN1dVRkRhRU1zVFVGQlRTeE5RVUZOTEVkQlFUSkNPMmRDUVVOeVF5eFhRVUZYTEVWQlFVVXNaVUZCWlR0blFrRkROVUlzVlVGQlZTeEZRVUZGTEU5QlFVODdaMEpCUTI1Q0xITkNRVUZ6UWl4RlFVRkZMRzlDUVVGdlFqdG5Ra0ZETlVNc1IwRkJSeXg1UTBGQmVVTXNRMEZCUXl4TlFVRk5MRU5CUVVNN1lVRkRja1FzUTBGQlF6dFpRVU5HTEU5QlFVOHNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFTkJRVU1zYjBKQlFXOUNMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03VVVGRGNFVXNRMEZCUXl4RFFVRkRMRU5CUTBnc1EwRkJRenRKUVVOS0xFTkJRVU03U1VGRlRTeFBRVUZQTzFGQlExb3NTVUZCU1N4SlFVRkpMRU5CUVVNc2FVSkJRV2xDTEVWQlFVVTdXVUZETVVJc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRPMU5CUTJ4Rk8wbEJRMGdzUTBGQlF6dERRVU5HSW4wPSIsImltcG9ydCB7IFBlbmRpbmdSZXNwb25zZSB9IGZyb20gXCIuLi9saWIvcGVuZGluZy1yZXNwb25zZVwiO1xuaW1wb3J0IHsgYWxsVHlwZXMgfSBmcm9tIFwiLi9odHRwLWluc3RydW1lbnRcIjtcbmV4cG9ydCBjbGFzcyBEbnNJbnN0cnVtZW50IHtcbiAgICBkYXRhUmVjZWl2ZXI7XG4gICAgb25Db21wbGV0ZUxpc3RlbmVyO1xuICAgIHBlbmRpbmdSZXNwb25zZXMgPSB7fTtcbiAgICBjb25zdHJ1Y3RvcihkYXRhUmVjZWl2ZXIpIHtcbiAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIgPSBkYXRhUmVjZWl2ZXI7XG4gICAgfVxuICAgIHJ1bihjcmF3bElEKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlciA9IHsgdXJsczogW1wiPGFsbF91cmxzPlwiXSwgdHlwZXM6IGFsbFR5cGVzIH07XG4gICAgICAgIGNvbnN0IHJlcXVlc3RTdGVtc0Zyb21FeHRlbnNpb24gPSAoZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChkZXRhaWxzLm9yaWdpblVybCAmJlxuICAgICAgICAgICAgICAgIGRldGFpbHMub3JpZ2luVXJsLmluZGV4T2YoXCJtb3otZXh0ZW5zaW9uOi8vXCIpID4gLTEgJiZcbiAgICAgICAgICAgICAgICBkZXRhaWxzLm9yaWdpblVybC5pbmNsdWRlcyhcImZha2VSZXF1ZXN0XCIpKTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcbiAgICAgICAgICogQXR0YWNoIGhhbmRsZXJzIHRvIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vbkNvbXBsZXRlTGlzdGVuZXIgPSAoZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgLy8gSWdub3JlIHJlcXVlc3RzIG1hZGUgYnkgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RTdGVtc0Zyb21FeHRlbnNpb24oZGV0YWlscykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nUmVzcG9uc2UgPSB0aGlzLmdldFBlbmRpbmdSZXNwb25zZShkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgICAgICBwZW5kaW5nUmVzcG9uc2UucmVzb2x2ZU9uQ29tcGxldGVkRXZlbnREZXRhaWxzKGRldGFpbHMpO1xuICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlRG5zSGFuZGxlcihkZXRhaWxzLCBjcmF3bElEKTtcbiAgICAgICAgfTtcbiAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQ29tcGxldGVkLmFkZExpc3RlbmVyKHRoaXMub25Db21wbGV0ZUxpc3RlbmVyLCBmaWx0ZXIpO1xuICAgIH1cbiAgICBjbGVhbnVwKCkge1xuICAgICAgICBpZiAodGhpcy5vbkNvbXBsZXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIud2ViUmVxdWVzdC5vbkNvbXBsZXRlZC5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uQ29tcGxldGVMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0UGVuZGluZ1Jlc3BvbnNlKHJlcXVlc3RJZCkge1xuICAgICAgICBpZiAoIXRoaXMucGVuZGluZ1Jlc3BvbnNlc1tyZXF1ZXN0SWRdKSB7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdSZXNwb25zZXNbcmVxdWVzdElkXSA9IG5ldyBQZW5kaW5nUmVzcG9uc2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wZW5kaW5nUmVzcG9uc2VzW3JlcXVlc3RJZF07XG4gICAgfVxuICAgIGhhbmRsZVJlc29sdmVkRG5zRGF0YShkbnNSZWNvcmRPYmosIGRhdGFSZWNlaXZlcikge1xuICAgICAgICAvLyBDdXJyaW5nIHRoZSBkYXRhIHJldHVybmVkIGJ5IEFQSSBjYWxsLlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgICAgICAgICAgLy8gR2V0IGRhdGEgZnJvbSBBUEkgY2FsbFxuICAgICAgICAgICAgZG5zUmVjb3JkT2JqLmFkZHJlc3NlcyA9IHJlY29yZC5hZGRyZXNzZXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGRuc1JlY29yZE9iai5jYW5vbmljYWxfbmFtZSA9IHJlY29yZC5jYW5vbmljYWxOYW1lO1xuICAgICAgICAgICAgZG5zUmVjb3JkT2JqLmlzX1RSUiA9IHJlY29yZC5pc1RSUjtcbiAgICAgICAgICAgIC8vIFNlbmQgZGF0YSB0byBtYWluIE9wZW5XUE0gZGF0YSBhZ2dyZWdhdG9yLlxuICAgICAgICAgICAgZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJkbnNfcmVzcG9uc2VzXCIsIGRuc1JlY29yZE9iaik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIG9uQ29tcGxldGVEbnNIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBwb3B1bGF0ZSBEbnNSZXNvbHZlIG9iamVjdFxuICAgICAgICBjb25zdCBkbnNSZWNvcmQgPSB7fTtcbiAgICAgICAgZG5zUmVjb3JkLmJyb3dzZXJfaWQgPSBjcmF3bElEO1xuICAgICAgICBkbnNSZWNvcmQucmVxdWVzdF9pZCA9IE51bWJlcihkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgIGRuc1JlY29yZC51c2VkX2FkZHJlc3MgPSBkZXRhaWxzLmlwO1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5ldyBEYXRlKGRldGFpbHMudGltZVN0YW1wKTtcbiAgICAgICAgZG5zUmVjb3JkLnRpbWVfc3RhbXAgPSBjdXJyZW50VGltZS50b0lTT1N0cmluZygpO1xuICAgICAgICAvLyBRdWVyeSBETlMgQVBJXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoZGV0YWlscy51cmwpO1xuICAgICAgICBkbnNSZWNvcmQuaG9zdG5hbWUgPSB1cmwuaG9zdG5hbWU7XG4gICAgICAgIGNvbnN0IGRuc1Jlc29sdmUgPSBicm93c2VyLmRucy5yZXNvbHZlKGRuc1JlY29yZC5ob3N0bmFtZSwgW1xuICAgICAgICAgICAgXCJjYW5vbmljYWxfbmFtZVwiLFxuICAgICAgICBdKTtcbiAgICAgICAgZG5zUmVzb2x2ZS50aGVuKHRoaXMuaGFuZGxlUmVzb2x2ZWREbnNEYXRhKGRuc1JlY29yZCwgdGhpcy5kYXRhUmVjZWl2ZXIpKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2laRzV6TFdsdWMzUnlkVzFsYm5RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdlltRmphMmR5YjNWdVpDOWtibk10YVc1emRISjFiV1Z1ZEM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hQUVVGUExFVkJRVVVzWlVGQlpTeEZRVUZGTEUxQlFVMHNlVUpCUVhsQ0xFTkJRVU03UVVGSE1VUXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hOUVVGTkxHMUNRVUZ0UWl4RFFVRkRPMEZCUnpkRExFMUJRVTBzVDBGQlR5eGhRVUZoTzBsQlExQXNXVUZCV1N4RFFVRkRPMGxCUTNSQ0xHdENRVUZyUWl4RFFVRkRPMGxCUTI1Q0xHZENRVUZuUWl4SFFVVndRaXhGUVVGRkxFTkJRVU03U1VGRlVDeFpRVUZaTEZsQlFWazdVVUZEZEVJc1NVRkJTU3hEUVVGRExGbEJRVmtzUjBGQlJ5eFpRVUZaTEVOQlFVTTdTVUZEYmtNc1EwRkJRenRKUVVWTkxFZEJRVWNzUTBGQlF5eFBRVUZQTzFGQlEyaENMRTFCUVUwc1RVRkJUU3hIUVVGclFpeEZRVUZGTEVsQlFVa3NSVUZCUlN4RFFVRkRMRmxCUVZrc1EwRkJReXhGUVVGRkxFdEJRVXNzUlVGQlJTeFJRVUZSTEVWQlFVVXNRMEZCUXp0UlFVVjRSU3hOUVVGTkxIbENRVUY1UWl4SFFVRkhMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVU3V1VGRE5VTXNUMEZCVHl4RFFVTk1MRTlCUVU4c1EwRkJReXhUUVVGVE8yZENRVU5xUWl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dG5Ra0ZEYkVRc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUXpGRExFTkJRVU03VVVGRFNpeERRVUZETEVOQlFVTTdVVUZGUmpzN1YwRkZSenRSUVVOSUxFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1IwRkJSeXhEUVVGRExFOUJRVEJETEVWQlFVVXNSVUZCUlR0WlFVTjJSU3h4UTBGQmNVTTdXVUZEY2tNc1NVRkJTU3g1UWtGQmVVSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRuUWtGRGRFTXNUMEZCVHp0aFFVTlNPMWxCUTBRc1RVRkJUU3hsUVVGbExFZEJRVWNzU1VGQlNTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0WlFVTnVSU3hsUVVGbExFTkJRVU1zT0VKQlFUaENMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03V1VGRmVFUXNTVUZCU1N4RFFVRkRMRzlDUVVGdlFpeERRVUZETEU5QlFVOHNSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVNNVF5eERRVUZETEVOQlFVTTdVVUZGUml4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExGZEJRVmNzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMR3RDUVVGclFpeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMGxCUXpsRkxFTkJRVU03U1VGRlRTeFBRVUZQTzFGQlExb3NTVUZCU1N4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVWQlFVVTdXVUZETTBJc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eFhRVUZYTEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMU5CUTNoRk8wbEJRMGdzUTBGQlF6dEpRVVZQTEd0Q1FVRnJRaXhEUVVGRExGTkJRVk03VVVGRGJFTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSVHRaUVVOeVF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NTVUZCU1N4bFFVRmxMRVZCUVVVc1EwRkJRenRUUVVNeFJEdFJRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGRlR5eHhRa0ZCY1VJc1EwRkJReXhaUVVGWkxFVkJRVVVzV1VGQldUdFJRVU4wUkN4NVEwRkJlVU03VVVGRGVrTXNUMEZCVHl4VlFVRlZMRTFCUVUwN1dVRkRja0lzZVVKQlFYbENPMWxCUTNwQ0xGbEJRVmtzUTBGQlF5eFRRVUZUTEVkQlFVY3NUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFpRVU55UkN4WlFVRlpMRU5CUVVNc1kwRkJZeXhIUVVGSExFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTTdXVUZEYmtRc1dVRkJXU3hEUVVGRExFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRPMWxCUlc1RExEWkRRVUUyUXp0WlFVTTNReXhaUVVGWkxFTkJRVU1zVlVGQlZTeERRVUZETEdWQlFXVXNSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJRenRSUVVONlJDeERRVUZETEVOQlFVTTdTVUZEU2l4RFFVRkRPMGxCUlU4c1MwRkJTeXhEUVVGRExHOUNRVUZ2UWl4RFFVTm9ReXhQUVVFd1F5eEZRVU14UXl4UFFVRlBPMUZCUlZBc2QwTkJRWGRETzFGQlEzaERMRTFCUVUwc1UwRkJVeXhIUVVGSExFVkJRV2xDTEVOQlFVTTdVVUZEY0VNc1UwRkJVeXhEUVVGRExGVkJRVlVzUjBGQlJ5eFBRVUZQTEVOQlFVTTdVVUZETDBJc1UwRkJVeXhEUVVGRExGVkJRVlVzUjBGQlJ5eE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xRkJRMnBFTEZOQlFWTXNRMEZCUXl4WlFVRlpMRWRCUVVjc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU53UXl4TlFVRk5MRmRCUVZjc1IwRkJSeXhKUVVGSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1VVRkRhRVFzVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUnl4WFFVRlhMRU5CUVVNc1YwRkJWeXhGUVVGRkxFTkJRVU03VVVGRmFrUXNaMEpCUVdkQ08xRkJRMmhDTEUxQlFVMHNSMEZCUnl4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTnFReXhUUVVGVExFTkJRVU1zVVVGQlVTeEhRVUZITEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNN1VVRkRiRU1zVFVGQlRTeFZRVUZWTEVkQlFVY3NUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNSVUZCUlR0WlFVTjZSQ3huUWtGQlowSTdVMEZEYWtJc1EwRkJReXhEUVVGRE8xRkJRMGdzVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNVMEZCVXl4RlFVRkZMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETzBsQlF6VkZMRU5CUVVNN1EwRkRSaUo5IiwiaW1wb3J0IHsgaW5jcmVtZW50ZWRFdmVudE9yZGluYWwgfSBmcm9tIFwiLi4vbGliL2V4dGVuc2lvbi1zZXNzaW9uLWV2ZW50LW9yZGluYWxcIjtcbmltcG9ydCB7IGV4dGVuc2lvblNlc3Npb25VdWlkIH0gZnJvbSBcIi4uL2xpYi9leHRlbnNpb24tc2Vzc2lvbi11dWlkXCI7XG5pbXBvcnQgeyBIdHRwUG9zdFBhcnNlciB9IGZyb20gXCIuLi9saWIvaHR0cC1wb3N0LXBhcnNlclwiO1xuaW1wb3J0IHsgUGVuZGluZ1JlcXVlc3QgfSBmcm9tIFwiLi4vbGliL3BlbmRpbmctcmVxdWVzdFwiO1xuaW1wb3J0IHsgUGVuZGluZ1Jlc3BvbnNlIH0gZnJvbSBcIi4uL2xpYi9wZW5kaW5nLXJlc3BvbnNlXCI7XG5pbXBvcnQgeyBib29sVG9JbnQsIGVzY2FwZVN0cmluZywgZXNjYXBlVXJsIH0gZnJvbSBcIi4uL2xpYi9zdHJpbmctdXRpbHNcIjtcbi8qKlxuICogTm90ZTogRGlmZmVyZW50IHBhcnRzIG9mIHRoZSBkZXNpcmVkIGluZm9ybWF0aW9uIGFycml2ZXMgaW4gZGlmZmVyZW50IGV2ZW50cyBhcyBwZXIgYmVsb3c6XG4gKiByZXF1ZXN0ID0gaGVhZGVycyBpbiBvbkJlZm9yZVNlbmRIZWFkZXJzICsgYm9keSBpbiBvbkJlZm9yZVJlcXVlc3RcbiAqIHJlc3BvbnNlID0gaGVhZGVycyBpbiBvbkNvbXBsZXRlZCArIGJvZHkgdmlhIGEgb25CZWZvcmVSZXF1ZXN0IGZpbHRlclxuICogcmVkaXJlY3QgPSBvcmlnaW5hbCByZXF1ZXN0IGhlYWRlcnMrYm9keSwgZm9sbG93ZWQgYnkgYSBvbkJlZm9yZVJlZGlyZWN0IGFuZCB0aGVuIGEgbmV3IHNldCBvZiByZXF1ZXN0IGhlYWRlcnMrYm9keSBhbmQgcmVzcG9uc2UgaGVhZGVycytib2R5XG4gKiBEb2NzOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1VzZXI6d2JhbWJlcmcvd2ViUmVxdWVzdC5SZXF1ZXN0RGV0YWlsc1xuICovXG5jb25zdCBhbGxUeXBlcyA9IFtcbiAgICBcImJlYWNvblwiLFxuICAgIFwiY3NwX3JlcG9ydFwiLFxuICAgIFwiZm9udFwiLFxuICAgIFwiaW1hZ2VcIixcbiAgICBcImltYWdlc2V0XCIsXG4gICAgXCJtYWluX2ZyYW1lXCIsXG4gICAgXCJtZWRpYVwiLFxuICAgIFwib2JqZWN0XCIsXG4gICAgXCJvYmplY3Rfc3VicmVxdWVzdFwiLFxuICAgIFwicGluZ1wiLFxuICAgIFwic2NyaXB0XCIsXG4gICAgXCJzcGVjdWxhdGl2ZVwiLFxuICAgIFwic3R5bGVzaGVldFwiLFxuICAgIFwic3ViX2ZyYW1lXCIsXG4gICAgXCJ3ZWJfbWFuaWZlc3RcIixcbiAgICBcIndlYnNvY2tldFwiLFxuICAgIFwieG1sX2R0ZFwiLFxuICAgIFwieG1saHR0cHJlcXVlc3RcIixcbiAgICBcInhzbHRcIixcbiAgICBcIm90aGVyXCIsXG5dO1xuZXhwb3J0IHsgYWxsVHlwZXMgfTtcbmV4cG9ydCBjbGFzcyBIdHRwSW5zdHJ1bWVudCB7XG4gICAgZGF0YVJlY2VpdmVyO1xuICAgIHBlbmRpbmdSZXF1ZXN0cyA9IHt9O1xuICAgIHBlbmRpbmdSZXNwb25zZXMgPSB7fTtcbiAgICBvbkJlZm9yZVJlcXVlc3RMaXN0ZW5lcjtcbiAgICBvbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXI7XG4gICAgb25CZWZvcmVSZWRpcmVjdExpc3RlbmVyO1xuICAgIG9uQ29tcGxldGVkTGlzdGVuZXI7XG4gICAgY29uc3RydWN0b3IoZGF0YVJlY2VpdmVyKSB7XG4gICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyID0gZGF0YVJlY2VpdmVyO1xuICAgIH1cbiAgICBydW4oY3Jhd2xJRCwgc2F2ZUNvbnRlbnRPcHRpb24pIHtcbiAgICAgICAgY29uc3QgZmlsdGVyID0geyB1cmxzOiBbXCI8YWxsX3VybHM+XCJdLCB0eXBlczogYWxsVHlwZXMgfTtcbiAgICAgICAgY29uc3QgcmVxdWVzdFN0ZW1zRnJvbUV4dGVuc2lvbiA9IChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGRldGFpbHMub3JpZ2luVXJsICYmIGRldGFpbHMub3JpZ2luVXJsLmluZGV4T2YoXCJtb3otZXh0ZW5zaW9uOi8vXCIpID4gLTEpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgKiBBdHRhY2ggaGFuZGxlcnMgdG8gZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uQmVmb3JlUmVxdWVzdExpc3RlbmVyID0gKGRldGFpbHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJsb2NraW5nUmVzcG9uc2VUaGF0RG9lc05vdGhpbmcgPSB7fTtcbiAgICAgICAgICAgIC8vIElnbm9yZSByZXF1ZXN0cyBtYWRlIGJ5IGV4dGVuc2lvbnNcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0U3RlbXNGcm9tRXh0ZW5zaW9uKGRldGFpbHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJsb2NraW5nUmVzcG9uc2VUaGF0RG9lc05vdGhpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nUmVxdWVzdCA9IHRoaXMuZ2V0UGVuZGluZ1JlcXVlc3QoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICAgICAgcGVuZGluZ1JlcXVlc3QucmVzb2x2ZU9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyhkZXRhaWxzKTtcbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdSZXNwb25zZSA9IHRoaXMuZ2V0UGVuZGluZ1Jlc3BvbnNlKGRldGFpbHMucmVxdWVzdElkKTtcbiAgICAgICAgICAgIHBlbmRpbmdSZXNwb25zZS5yZXNvbHZlT25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzKGRldGFpbHMpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2F2ZUNvbnRlbnQoc2F2ZUNvbnRlbnRPcHRpb24sIGRldGFpbHMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBwZW5kaW5nUmVzcG9uc2UuYWRkUmVzcG9uc2VSZXNwb25zZUJvZHlMaXN0ZW5lcihkZXRhaWxzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBibG9ja2luZ1Jlc3BvbnNlVGhhdERvZXNOb3RoaW5nO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LmFkZExpc3RlbmVyKHRoaXMub25CZWZvcmVSZXF1ZXN0TGlzdGVuZXIsIGZpbHRlciwgdGhpcy5pc0NvbnRlbnRTYXZpbmdFbmFibGVkKHNhdmVDb250ZW50T3B0aW9uKVxuICAgICAgICAgICAgPyBbXCJyZXF1ZXN0Qm9keVwiLCBcImJsb2NraW5nXCJdXG4gICAgICAgICAgICA6IFtcInJlcXVlc3RCb2R5XCJdKTtcbiAgICAgICAgdGhpcy5vbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIgPSAoZGV0YWlscykgPT4ge1xuICAgICAgICAgICAgLy8gSWdub3JlIHJlcXVlc3RzIG1hZGUgYnkgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RTdGVtc0Zyb21FeHRlbnNpb24oZGV0YWlscykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nUmVxdWVzdCA9IHRoaXMuZ2V0UGVuZGluZ1JlcXVlc3QoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICAgICAgcGVuZGluZ1JlcXVlc3QucmVzb2x2ZU9uQmVmb3JlU2VuZEhlYWRlcnNFdmVudERldGFpbHMoZGV0YWlscyk7XG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlU2VuZEhlYWRlcnNIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQsIGluY3JlbWVudGVkRXZlbnRPcmRpbmFsKCkpO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25CZWZvcmVTZW5kSGVhZGVycy5hZGRMaXN0ZW5lcih0aGlzLm9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lciwgZmlsdGVyLCBbXCJyZXF1ZXN0SGVhZGVyc1wiXSk7XG4gICAgICAgIHRoaXMub25CZWZvcmVSZWRpcmVjdExpc3RlbmVyID0gKGRldGFpbHMpID0+IHtcbiAgICAgICAgICAgIC8vIElnbm9yZSByZXF1ZXN0cyBtYWRlIGJ5IGV4dGVuc2lvbnNcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0U3RlbXNGcm9tRXh0ZW5zaW9uKGRldGFpbHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZVJlZGlyZWN0SGFuZGxlcihkZXRhaWxzLCBjcmF3bElELCBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVkaXJlY3QuYWRkTGlzdGVuZXIodGhpcy5vbkJlZm9yZVJlZGlyZWN0TGlzdGVuZXIsIGZpbHRlciwgW1wicmVzcG9uc2VIZWFkZXJzXCJdKTtcbiAgICAgICAgdGhpcy5vbkNvbXBsZXRlZExpc3RlbmVyID0gKGRldGFpbHMpID0+IHtcbiAgICAgICAgICAgIC8vIElnbm9yZSByZXF1ZXN0cyBtYWRlIGJ5IGV4dGVuc2lvbnNcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0U3RlbXNGcm9tRXh0ZW5zaW9uKGRldGFpbHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1Jlc3BvbnNlID0gdGhpcy5nZXRQZW5kaW5nUmVzcG9uc2UoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICAgICAgcGVuZGluZ1Jlc3BvbnNlLnJlc29sdmVPbkNvbXBsZXRlZEV2ZW50RGV0YWlscyhkZXRhaWxzKTtcbiAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZWRIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQsIGluY3JlbWVudGVkRXZlbnRPcmRpbmFsKCksIHNhdmVDb250ZW50T3B0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQ29tcGxldGVkLmFkZExpc3RlbmVyKHRoaXMub25Db21wbGV0ZWRMaXN0ZW5lciwgZmlsdGVyLCBbXCJyZXNwb25zZUhlYWRlcnNcIl0pO1xuICAgIH1cbiAgICBjbGVhbnVwKCkge1xuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVJlcXVlc3RMaXN0ZW5lcikge1xuICAgICAgICAgICAgYnJvd3Nlci53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uQmVmb3JlUmVxdWVzdExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLnJlbW92ZUxpc3RlbmVyKHRoaXMub25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVJlZGlyZWN0TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIud2ViUmVxdWVzdC5vbkJlZm9yZVJlZGlyZWN0LnJlbW92ZUxpc3RlbmVyKHRoaXMub25CZWZvcmVSZWRpcmVjdExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vbkNvbXBsZXRlZExpc3RlbmVyKSB7XG4gICAgICAgICAgICBicm93c2VyLndlYlJlcXVlc3Qub25Db21wbGV0ZWQucmVtb3ZlTGlzdGVuZXIodGhpcy5vbkNvbXBsZXRlZExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc0NvbnRlbnRTYXZpbmdFbmFibGVkKHNhdmVDb250ZW50T3B0aW9uKSB7XG4gICAgICAgIGlmIChzYXZlQ29udGVudE9wdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVDb250ZW50T3B0aW9uID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNhdmVDb250ZW50UmVzb3VyY2VUeXBlcyhzYXZlQ29udGVudE9wdGlvbikubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgc2F2ZUNvbnRlbnRSZXNvdXJjZVR5cGVzKHNhdmVDb250ZW50T3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBzYXZlQ29udGVudE9wdGlvbi5zcGxpdChcIixcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdlIHJlbHkgb24gdGhlIHJlc291cmNlIHR5cGUgdG8gZmlsdGVyIHJlc3BvbnNlc1xuICAgICAqIFNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvd2ViUmVxdWVzdC9SZXNvdXJjZVR5cGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzYXZlQ29udGVudE9wdGlvblxuICAgICAqIEBwYXJhbSByZXNvdXJjZVR5cGVcbiAgICAgKi9cbiAgICBzaG91bGRTYXZlQ29udGVudChzYXZlQ29udGVudE9wdGlvbiwgcmVzb3VyY2VUeXBlKSB7XG4gICAgICAgIGlmIChzYXZlQ29udGVudE9wdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVDb250ZW50T3B0aW9uID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNhdmVDb250ZW50UmVzb3VyY2VUeXBlcyhzYXZlQ29udGVudE9wdGlvbikuaW5jbHVkZXMocmVzb3VyY2VUeXBlKTtcbiAgICB9XG4gICAgZ2V0UGVuZGluZ1JlcXVlc3QocmVxdWVzdElkKSB7XG4gICAgICAgIGlmICghdGhpcy5wZW5kaW5nUmVxdWVzdHNbcmVxdWVzdElkXSkge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdHNbcmVxdWVzdElkXSA9IG5ldyBQZW5kaW5nUmVxdWVzdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdSZXF1ZXN0c1tyZXF1ZXN0SWRdO1xuICAgIH1cbiAgICBnZXRQZW5kaW5nUmVzcG9uc2UocmVxdWVzdElkKSB7XG4gICAgICAgIGlmICghdGhpcy5wZW5kaW5nUmVzcG9uc2VzW3JlcXVlc3RJZF0pIHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1Jlc3BvbnNlc1tyZXF1ZXN0SWRdID0gbmV3IFBlbmRpbmdSZXNwb25zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdSZXNwb25zZXNbcmVxdWVzdElkXTtcbiAgICB9XG4gICAgLypcbiAgICAgKiBIVFRQIFJlcXVlc3QgSGFuZGxlciBhbmQgSGVscGVyIEZ1bmN0aW9uc1xuICAgICAqL1xuICAgIGFzeW5jIG9uQmVmb3JlU2VuZEhlYWRlcnNIYW5kbGVyKGRldGFpbHMsIGNyYXdsSUQsIGV2ZW50T3JkaW5hbCkge1xuICAgICAgICBjb25zdCB0YWIgPSBkZXRhaWxzLnRhYklkID4gLTFcbiAgICAgICAgICAgID8gYXdhaXQgYnJvd3Nlci50YWJzLmdldChkZXRhaWxzLnRhYklkKVxuICAgICAgICAgICAgOiB7IHdpbmRvd0lkOiB1bmRlZmluZWQsIGluY29nbml0bzogdW5kZWZpbmVkLCB1cmw6IHVuZGVmaW5lZCB9O1xuICAgICAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICAgICAgdXBkYXRlLmluY29nbml0byA9IGJvb2xUb0ludCh0YWIuaW5jb2duaXRvKTtcbiAgICAgICAgdXBkYXRlLmJyb3dzZXJfaWQgPSBjcmF3bElEO1xuICAgICAgICB1cGRhdGUuZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZCA9IGV4dGVuc2lvblNlc3Npb25VdWlkO1xuICAgICAgICB1cGRhdGUuZXZlbnRfb3JkaW5hbCA9IGV2ZW50T3JkaW5hbDtcbiAgICAgICAgdXBkYXRlLndpbmRvd19pZCA9IHRhYi53aW5kb3dJZDtcbiAgICAgICAgdXBkYXRlLnRhYl9pZCA9IGRldGFpbHMudGFiSWQ7XG4gICAgICAgIHVwZGF0ZS5mcmFtZV9pZCA9IGRldGFpbHMuZnJhbWVJZDtcbiAgICAgICAgLy8gcmVxdWVzdElkIGlzIGEgdW5pcXVlIGlkZW50aWZpZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBsaW5rIHJlcXVlc3RzIGFuZCByZXNwb25zZXNcbiAgICAgICAgdXBkYXRlLnJlcXVlc3RfaWQgPSBOdW1iZXIoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICBjb25zdCB1cmwgPSBkZXRhaWxzLnVybDtcbiAgICAgICAgdXBkYXRlLnVybCA9IGVzY2FwZVVybCh1cmwpO1xuICAgICAgICBjb25zdCByZXF1ZXN0TWV0aG9kID0gZGV0YWlscy5tZXRob2Q7XG4gICAgICAgIHVwZGF0ZS5tZXRob2QgPSBlc2NhcGVTdHJpbmcocmVxdWVzdE1ldGhvZCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5ldyBEYXRlKGRldGFpbHMudGltZVN0YW1wKTtcbiAgICAgICAgdXBkYXRlLnRpbWVfc3RhbXAgPSBjdXJyZW50X3RpbWUudG9JU09TdHJpbmcoKTtcbiAgICAgICAgbGV0IGVuY29kaW5nVHlwZSA9IFwiXCI7XG4gICAgICAgIGxldCByZWZlcnJlciA9IFwiXCI7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXTtcbiAgICAgICAgbGV0IGlzT2NzcCA9IGZhbHNlO1xuICAgICAgICBpZiAoZGV0YWlscy5yZXF1ZXN0SGVhZGVycykge1xuICAgICAgICAgICAgZGV0YWlscy5yZXF1ZXN0SGVhZGVycy5tYXAoKHJlcXVlc3RIZWFkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IG5hbWUsIHZhbHVlIH0gPSByZXF1ZXN0SGVhZGVyO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcl9wYWlyID0gW107XG4gICAgICAgICAgICAgICAgaGVhZGVyX3BhaXIucHVzaChlc2NhcGVTdHJpbmcobmFtZSkpO1xuICAgICAgICAgICAgICAgIGhlYWRlcl9wYWlyLnB1c2goZXNjYXBlU3RyaW5nKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5wdXNoKGhlYWRlcl9wYWlyKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gXCJDb250ZW50LVR5cGVcIikge1xuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1R5cGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuY29kaW5nVHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vb2NzcC1yZXF1ZXN0XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNPY3NwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gXCJSZWZlcmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJyZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUucmVmZXJyZXIgPSBlc2NhcGVTdHJpbmcocmVmZXJyZXIpO1xuICAgICAgICBpZiAocmVxdWVzdE1ldGhvZCA9PT0gXCJQT1NUXCIgJiYgIWlzT2NzcCAvKiBkb24ndCBwcm9jZXNzIE9DU1AgcmVxdWVzdHMgKi8pIHtcbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdSZXF1ZXN0ID0gdGhpcy5nZXRQZW5kaW5nUmVxdWVzdChkZXRhaWxzLnJlcXVlc3RJZCk7XG4gICAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IGF3YWl0IHBlbmRpbmdSZXF1ZXN0LnJlc29sdmVkV2l0aGluVGltZW91dCgxMDAwKTtcbiAgICAgICAgICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5sb2dFcnJvcihcIlBlbmRpbmcgcmVxdWVzdCB0aW1lZCBvdXQgd2FpdGluZyBmb3IgZGF0YSBmcm9tIGJvdGggb25CZWZvcmVSZXF1ZXN0IGFuZCBvbkJlZm9yZVNlbmRIZWFkZXJzIGV2ZW50c1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyA9IGF3YWl0IHBlbmRpbmdSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscztcbiAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0Qm9keSA9IG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscy5yZXF1ZXN0Qm9keTtcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdEJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFBhcnNlciA9IG5ldyBIdHRwUG9zdFBhcnNlcihvbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMsIHRoaXMuZGF0YVJlY2VpdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdE9iaiA9IHBvc3RQYXJzZXIucGFyc2VQb3N0UmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgKFBPU1QpIHJlcXVlc3QgaGVhZGVycyBmcm9tIHVwbG9hZCBzdHJlYW1cbiAgICAgICAgICAgICAgICAgICAgaWYgKFwicG9zdF9oZWFkZXJzXCIgaW4gcG9zdE9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSBzdG9yZSBQT1NUIGhlYWRlcnMgdGhhdCB3ZSBrbm93IGFuZCBuZWVkLiBXZSBtYXkgbWlzaW50ZXJwcmV0IFBPU1QgZGF0YSBhcyBoZWFkZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhcyBkZXRlY3Rpb24gaXMgYmFzZWQgb24gXCJrZXk6dmFsdWVcIiBmb3JtYXQgKG5vbi1oZWFkZXIgUE9TVCBkYXRhIGNhbiBiZSBpbiB0aGlzIGZvcm1hdCBhcyB3ZWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudEhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtRGlzcG9zaXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtTGVuZ3RoXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHBvc3RPYmoucG9zdF9oZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlbnRIZWFkZXJzLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcl9wYWlyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcl9wYWlyLnB1c2goZXNjYXBlU3RyaW5nKG5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyX3BhaXIucHVzaChlc2NhcGVTdHJpbmcocG9zdE9iai5wb3N0X2hlYWRlcnNbbmFtZV0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVycy5wdXNoKGhlYWRlcl9wYWlyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gd2Ugc3RvcmUgUE9TVCBib2R5IGluIEpTT04gZm9ybWF0LCBleGNlcHQgd2hlbiBpdCdzIGEgc3RyaW5nIHdpdGhvdXQgYSAoa2V5LXZhbHVlKSBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwicG9zdF9ib2R5XCIgaW4gcG9zdE9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlLnBvc3RfYm9keSA9IHBvc3RPYmoucG9zdF9ib2R5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChcInBvc3RfYm9keV9yYXdcIiBpbiBwb3N0T2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGUucG9zdF9ib2R5X3JhdyA9IHBvc3RPYmoucG9zdF9ib2R5X3JhdztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUuaGVhZGVycyA9IEpTT04uc3RyaW5naWZ5KGhlYWRlcnMpO1xuICAgICAgICAvLyBDaGVjayBpZiB4aHJcbiAgICAgICAgY29uc3QgaXNYSFIgPSBkZXRhaWxzLnR5cGUgPT09IFwieG1saHR0cHJlcXVlc3RcIjtcbiAgICAgICAgdXBkYXRlLmlzX1hIUiA9IGJvb2xUb0ludChpc1hIUik7XG4gICAgICAgIC8vIEdyYWIgdGhlIHRyaWdnZXJpbmcgYW5kIGxvYWRpbmcgUHJpbmNpcGFsc1xuICAgICAgICBsZXQgdHJpZ2dlcmluZ09yaWdpbjtcbiAgICAgICAgbGV0IGxvYWRpbmdPcmlnaW47XG4gICAgICAgIGlmIChkZXRhaWxzLm9yaWdpblVybCkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkT3JpZ2luVXJsID0gbmV3IFVSTChkZXRhaWxzLm9yaWdpblVybCk7XG4gICAgICAgICAgICB0cmlnZ2VyaW5nT3JpZ2luID0gcGFyc2VkT3JpZ2luVXJsLm9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGV0YWlscy5kb2N1bWVudFVybCkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkRG9jdW1lbnRVcmwgPSBuZXcgVVJMKGRldGFpbHMuZG9jdW1lbnRVcmwpO1xuICAgICAgICAgICAgbG9hZGluZ09yaWdpbiA9IHBhcnNlZERvY3VtZW50VXJsLm9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUudHJpZ2dlcmluZ19vcmlnaW4gPSBlc2NhcGVTdHJpbmcodHJpZ2dlcmluZ09yaWdpbik7XG4gICAgICAgIHVwZGF0ZS5sb2FkaW5nX29yaWdpbiA9IGVzY2FwZVN0cmluZyhsb2FkaW5nT3JpZ2luKTtcbiAgICAgICAgLy8gbG9hZGluZ0RvY3VtZW50J3MgaHJlZlxuICAgICAgICAvLyBUaGUgbG9hZGluZ0RvY3VtZW50IGlzIHRoZSBkb2N1bWVudCB0aGUgZWxlbWVudCByZXNpZGVzLCByZWdhcmRsZXNzIG9mXG4gICAgICAgIC8vIGhvdyB0aGUgbG9hZCB3YXMgdHJpZ2dlcmVkLlxuICAgICAgICBjb25zdCBsb2FkaW5nSHJlZiA9IGRldGFpbHMuZG9jdW1lbnRVcmw7XG4gICAgICAgIHVwZGF0ZS5sb2FkaW5nX2hyZWYgPSBlc2NhcGVTdHJpbmcobG9hZGluZ0hyZWYpO1xuICAgICAgICAvLyByZXNvdXJjZVR5cGUgb2YgdGhlIHJlcXVlc3Rpbmcgbm9kZS4gVGhpcyBpcyBzZXQgYnkgdGhlIHR5cGUgb2ZcbiAgICAgICAgLy8gbm9kZSBtYWtpbmcgdGhlIHJlcXVlc3QgKGkuZS4gYW4gPGltZyBzcmM9Li4uPiBub2RlIHdpbGwgc2V0IHRvIHR5cGUgXCJpbWFnZVwiKS5cbiAgICAgICAgLy8gRG9jdW1lbnRhdGlvbjpcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvd2ViUmVxdWVzdC9SZXNvdXJjZVR5cGVcbiAgICAgICAgdXBkYXRlLnJlc291cmNlX3R5cGUgPSBkZXRhaWxzLnR5cGU7XG4gICAgICAgIC8qXG4gICAgICAgIC8vIFRPRE86IFJlZmFjdG9yIHRvIGNvcnJlc3BvbmRpbmcgd2ViZXh0IGxvZ2ljIG9yIGRpc2NhcmRcbiAgICAgICAgY29uc3QgVGhpcmRQYXJ0eVV0aWwgPSBDY1tcIkBtb3ppbGxhLm9yZy90aGlyZHBhcnR5dXRpbDsxXCJdLmdldFNlcnZpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2kubW96SVRoaXJkUGFydHlVdGlsKTtcbiAgICAgICAgLy8gRG8gdGhpcmQtcGFydHkgY2hlY2tzXG4gICAgICAgIC8vIFRoZXNlIHNwZWNpZmljIGNoZWNrcyBhcmUgZG9uZSBiZWNhdXNlIGl0J3Mgd2hhdCdzIHVzZWQgaW4gVHJhY2tpbmcgUHJvdGVjdGlvblxuICAgICAgICAvLyBTZWU6IGh0dHA6Ly9zZWFyY2hmb3gub3JnL21vemlsbGEtY2VudHJhbC9zb3VyY2UvbmV0d2Vyay9iYXNlL25zQ2hhbm5lbENsYXNzaWZpZXIuY3BwIzEwN1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGlzVGhpcmRQYXJ0eUNoYW5uZWwgPSBUaGlyZFBhcnR5VXRpbC5pc1RoaXJkUGFydHlDaGFubmVsKGRldGFpbHMpO1xuICAgICAgICAgIGNvbnN0IHRvcFdpbmRvdyA9IFRoaXJkUGFydHlVdGlsLmdldFRvcFdpbmRvd0ZvckNoYW5uZWwoZGV0YWlscyk7XG4gICAgICAgICAgY29uc3QgdG9wVVJJID0gVGhpcmRQYXJ0eVV0aWwuZ2V0VVJJRnJvbVdpbmRvdyh0b3BXaW5kb3cpO1xuICAgICAgICAgIGlmICh0b3BVUkkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcFVybCA9IHRvcFVSSS5zcGVjO1xuICAgICAgICAgICAgY29uc3QgY2hhbm5lbFVSSSA9IGRldGFpbHMuVVJJO1xuICAgICAgICAgICAgY29uc3QgaXNUaGlyZFBhcnR5VG9Ub3BXaW5kb3cgPSBUaGlyZFBhcnR5VXRpbC5pc1RoaXJkUGFydHlVUkkoXG4gICAgICAgICAgICAgIGNoYW5uZWxVUkksXG4gICAgICAgICAgICAgIHRvcFVSSSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB1cGRhdGUuaXNfdGhpcmRfcGFydHlfdG9fdG9wX3dpbmRvdyA9IGlzVGhpcmRQYXJ0eVRvVG9wV2luZG93O1xuICAgICAgICAgICAgdXBkYXRlLmlzX3RoaXJkX3BhcnR5X2NoYW5uZWwgPSBpc1RoaXJkUGFydHlDaGFubmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoYW5FcnJvcikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbnMgZXhwZWN0ZWQgZm9yIGNoYW5uZWxzIHRyaWdnZXJlZCBvciBsb2FkaW5nIGluIGFcbiAgICAgICAgICAvLyBOdWxsUHJpbmNpcGFsIG9yIFN5c3RlbVByaW5jaXBhbC4gVGhleSBhcmUgYWxzbyBleHBlY3RlZCBmb3IgZmF2aWNvblxuICAgICAgICAgIC8vIGxvYWRzLCB3aGljaCB3ZSBhdHRlbXB0IHRvIGZpbHRlci4gRGVwZW5kaW5nIG9uIHRoZSBuYW1pbmcsIHNvbWUgZmF2aWNvbnNcbiAgICAgICAgICAvLyBtYXkgY29udGludWUgdG8gbGVhZCB0byBlcnJvciBsb2dzLlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHVwZGF0ZS50cmlnZ2VyaW5nX29yaWdpbiAhPT0gXCJbU3lzdGVtIFByaW5jaXBhbF1cIiAmJlxuICAgICAgICAgICAgdXBkYXRlLnRyaWdnZXJpbmdfb3JpZ2luICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHVwZGF0ZS5sb2FkaW5nX29yaWdpbiAhPT0gXCJbU3lzdGVtIFByaW5jaXBhbF1cIiAmJlxuICAgICAgICAgICAgdXBkYXRlLmxvYWRpbmdfb3JpZ2luICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICF1cGRhdGUudXJsLmVuZHNXaXRoKFwiaWNvXCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIGFkZGl0aW9uYWwgY2hhbm5lbCBpbmZvcm1hdGlvbiBmb3IgVVJMOiBcIiArXG4gICAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgICB1cGRhdGUudXJsICtcbiAgICAgICAgICAgICAgXCJcXG4gRXJyb3IgdGV4dDpcIiArXG4gICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGFuRXJyb3IpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlLnRvcF9sZXZlbF91cmwgPSBlc2NhcGVVcmwodGhpcy5nZXREb2N1bWVudFVybEZvclJlcXVlc3QoZGV0YWlscykpO1xuICAgICAgICB1cGRhdGUucGFyZW50X2ZyYW1lX2lkID0gZGV0YWlscy5wYXJlbnRGcmFtZUlkO1xuICAgICAgICB1cGRhdGUuZnJhbWVfYW5jZXN0b3JzID0gZXNjYXBlU3RyaW5nKEpTT04uc3RyaW5naWZ5KGRldGFpbHMuZnJhbWVBbmNlc3RvcnMpKTtcbiAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImh0dHBfcmVxdWVzdHNcIiwgdXBkYXRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29kZSB0YWtlbiBhbmQgYWRhcHRlZCBmcm9tXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL0VGRm9yZy9wcml2YWN5YmFkZ2VyL3B1bGwvMjE5OC9maWxlc1xuICAgICAqXG4gICAgICogR2V0cyB0aGUgVVJMIGZvciBhIGdpdmVuIHJlcXVlc3QncyB0b3AtbGV2ZWwgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBUaGUgcmVxdWVzdCdzIGRvY3VtZW50IG1heSBiZSBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCB0b3AtbGV2ZWwgZG9jdW1lbnRcbiAgICAgKiBsb2FkZWQgaW4gdGFiIGFzIHJlcXVlc3RzIGNhbiBjb21lIG91dCBvZiBvcmRlcjpcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7V2ViUmVxdWVzdE9uQmVmb3JlU2VuZEhlYWRlcnNFdmVudERldGFpbHN9IGRldGFpbHNcbiAgICAgKlxuICAgICAqIEByZXR1cm4gez9TdHJpbmd9IHRoZSBVUkwgZm9yIHRoZSByZXF1ZXN0J3MgdG9wLWxldmVsIGRvY3VtZW50XG4gICAgICovXG4gICAgZ2V0RG9jdW1lbnRVcmxGb3JSZXF1ZXN0KGRldGFpbHMpIHtcbiAgICAgICAgbGV0IHVybCA9IFwiXCI7XG4gICAgICAgIGlmIChkZXRhaWxzLnR5cGUgPT09IFwibWFpbl9mcmFtZVwiKSB7XG4gICAgICAgICAgICAvLyBVcmwgb2YgdGhlIHRvcC1sZXZlbCBkb2N1bWVudCBpdHNlbGYuXG4gICAgICAgICAgICB1cmwgPSBkZXRhaWxzLnVybDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZXRhaWxzLmhhc093blByb3BlcnR5KFwiZnJhbWVBbmNlc3RvcnNcIikpIHtcbiAgICAgICAgICAgIC8vIEluIGNhc2Ugb2YgbmVzdGVkIGZyYW1lcywgcmV0cmlldmUgdXJsIGZyb20gdG9wLW1vc3QgYW5jZXN0b3IuXG4gICAgICAgICAgICAvLyBJZiBmcmFtZUFuY2VzdG9ycyA9PSBbXSwgcmVxdWVzdCBjb21lcyBmcm9tIHRoZSB0b3AtbGV2ZWwtZG9jdW1lbnQuXG4gICAgICAgICAgICB1cmwgPSBkZXRhaWxzLmZyYW1lQW5jZXN0b3JzLmxlbmd0aFxuICAgICAgICAgICAgICAgID8gZGV0YWlscy5mcmFtZUFuY2VzdG9yc1tkZXRhaWxzLmZyYW1lQW5jZXN0b3JzLmxlbmd0aCAtIDFdLnVybFxuICAgICAgICAgICAgICAgIDogZGV0YWlscy5kb2N1bWVudFVybDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHR5cGUgIT0gJ21haW5fZnJhbWUnIGFuZCBmcmFtZUFuY2VzdG9ycyA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlIHNlcnZpY2Ugd29ya2VyczogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQ3MDUzNyNjMTNcbiAgICAgICAgICAgIHVybCA9IGRldGFpbHMuZG9jdW1lbnRVcmw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgYXN5bmMgb25CZWZvcmVSZWRpcmVjdEhhbmRsZXIoZGV0YWlscywgY3Jhd2xJRCwgZXZlbnRPcmRpbmFsKSB7XG4gICAgICAgIC8qXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwib25CZWZvcmVSZWRpcmVjdEhhbmRsZXIgKHByZXZpb3VzbHkgaHR0cFJlcXVlc3RIYW5kbGVyKVwiLFxuICAgICAgICAgIGRldGFpbHMsXG4gICAgICAgICAgY3Jhd2xJRCxcbiAgICAgICAgKTtcbiAgICAgICAgKi9cbiAgICAgICAgLy8gU2F2ZSBIVFRQIHJlZGlyZWN0IGV2ZW50c1xuICAgICAgICAvLyBFdmVudHMgYXJlIHNhdmVkIHRvIHRoZSBgaHR0cF9yZWRpcmVjdHNgIHRhYmxlXG4gICAgICAgIC8qXG4gICAgICAgIC8vIFRPRE86IFJlZmFjdG9yIHRvIGNvcnJlc3BvbmRpbmcgd2ViZXh0IGxvZ2ljIG9yIGRpc2NhcmRcbiAgICAgICAgLy8gRXZlbnRzIGFyZSBzYXZlZCB0byB0aGUgYGh0dHBfcmVkaXJlY3RzYCB0YWJsZSwgYW5kIG1hcCB0aGUgb2xkXG4gICAgICAgIC8vIHJlcXVlc3QvcmVzcG9uc2UgY2hhbm5lbCBpZCB0byB0aGUgbmV3IHJlcXVlc3QvcmVzcG9uc2UgY2hhbm5lbCBpZC5cbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gYmFzZWQgb246IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMTI0MDYyN1xuICAgICAgICBjb25zdCBvbGROb3RpZmljYXRpb25zID0gZGV0YWlscy5ub3RpZmljYXRpb25DYWxsYmFja3M7XG4gICAgICAgIGxldCBvbGRFdmVudFNpbmsgPSBudWxsO1xuICAgICAgICBkZXRhaWxzLm5vdGlmaWNhdGlvbkNhbGxiYWNrcyA9IHtcbiAgICAgICAgICBRdWVyeUludGVyZmFjZTogWFBDT01VdGlscy5nZW5lcmF0ZVFJKFtcbiAgICAgICAgICAgIENpLm5zSUludGVyZmFjZVJlcXVlc3RvcixcbiAgICAgICAgICAgIENpLm5zSUNoYW5uZWxFdmVudFNpbmssXG4gICAgICAgICAgXSksXG4gICAgXG4gICAgICAgICAgZ2V0SW50ZXJmYWNlKGlpZCkge1xuICAgICAgICAgICAgLy8gV2UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpbiBuc0lDaGFubmVsRXZlbnRTaW5rLFxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBvbGQgY2FsbGJhY2tzIGZvciBhbnkgb3RoZXIgaW50ZXJmYWNlIHJlcXVlc3RzLlxuICAgICAgICAgICAgaWYgKGlpZC5lcXVhbHMoQ2kubnNJQ2hhbm5lbEV2ZW50U2luaykpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBvbGRFdmVudFNpbmsgPSBvbGROb3RpZmljYXRpb25zLlF1ZXJ5SW50ZXJmYWNlKGlpZCk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGFuRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgICAgIFwiRXJyb3IgZHVyaW5nIGNhbGwgdG8gY3VzdG9tIG5vdGlmaWNhdGlvbkNhbGxiYWNrczo6Z2V0SW50ZXJmYWNlLlwiICtcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoYW5FcnJvciksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGlmIChvbGROb3RpZmljYXRpb25zKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvbGROb3RpZmljYXRpb25zLmdldEludGVyZmFjZShpaWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgQ3IuTlNfRVJST1JfTk9fSU5URVJGQUNFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgXG4gICAgICAgICAgYXN5bmNPbkNoYW5uZWxSZWRpcmVjdChvbGRDaGFubmVsLCBuZXdDaGFubmVsLCBmbGFncywgY2FsbGJhY2spIHtcbiAgICBcbiAgICAgICAgICAgIG5ld0NoYW5uZWwuUXVlcnlJbnRlcmZhY2UoQ2kubnNJSHR0cENoYW5uZWwpO1xuICAgIFxuICAgICAgICAgICAgY29uc3QgaHR0cFJlZGlyZWN0OiBIdHRwUmVkaXJlY3QgPSB7XG4gICAgICAgICAgICAgIGJyb3dzZXJfaWQ6IGNyYXdsSUQsXG4gICAgICAgICAgICAgIG9sZF9yZXF1ZXN0X2lkOiBvbGRDaGFubmVsLmNoYW5uZWxJZCxcbiAgICAgICAgICAgICAgbmV3X3JlcXVlc3RfaWQ6IG5ld0NoYW5uZWwuY2hhbm5lbElkLFxuICAgICAgICAgICAgICB0aW1lX3N0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImh0dHBfcmVkaXJlY3RzXCIsIGh0dHBSZWRpcmVjdCk7XG4gICAgXG4gICAgICAgICAgICBpZiAob2xkRXZlbnRTaW5rKSB7XG4gICAgICAgICAgICAgIG9sZEV2ZW50U2luay5hc3luY09uQ2hhbm5lbFJlZGlyZWN0KFxuICAgICAgICAgICAgICAgIG9sZENoYW5uZWwsXG4gICAgICAgICAgICAgICAgbmV3Q2hhbm5lbCxcbiAgICAgICAgICAgICAgICBmbGFncyxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrLm9uUmVkaXJlY3RWZXJpZnlDYWxsYmFjayhDci5OU19PSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcmVzcG9uc2VTdGF0dXMgPSBkZXRhaWxzLnN0YXR1c0NvZGU7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlU3RhdHVzVGV4dCA9IGRldGFpbHMuc3RhdHVzTGluZTtcbiAgICAgICAgY29uc3QgdGFiID0gZGV0YWlscy50YWJJZCA+IC0xXG4gICAgICAgICAgICA/IGF3YWl0IGJyb3dzZXIudGFicy5nZXQoZGV0YWlscy50YWJJZClcbiAgICAgICAgICAgIDogeyB3aW5kb3dJZDogdW5kZWZpbmVkLCBpbmNvZ25pdG86IHVuZGVmaW5lZCB9O1xuICAgICAgICBjb25zdCBodHRwUmVkaXJlY3QgPSB7XG4gICAgICAgICAgICBpbmNvZ25pdG86IGJvb2xUb0ludCh0YWIuaW5jb2duaXRvKSxcbiAgICAgICAgICAgIGJyb3dzZXJfaWQ6IGNyYXdsSUQsXG4gICAgICAgICAgICBvbGRfcmVxdWVzdF91cmw6IGVzY2FwZVVybChkZXRhaWxzLnVybCksXG4gICAgICAgICAgICBvbGRfcmVxdWVzdF9pZDogZGV0YWlscy5yZXF1ZXN0SWQsXG4gICAgICAgICAgICBuZXdfcmVxdWVzdF91cmw6IGVzY2FwZVVybChkZXRhaWxzLnJlZGlyZWN0VXJsKSxcbiAgICAgICAgICAgIG5ld19yZXF1ZXN0X2lkOiBudWxsLFxuICAgICAgICAgICAgZXh0ZW5zaW9uX3Nlc3Npb25fdXVpZDogZXh0ZW5zaW9uU2Vzc2lvblV1aWQsXG4gICAgICAgICAgICBldmVudF9vcmRpbmFsOiBldmVudE9yZGluYWwsXG4gICAgICAgICAgICB3aW5kb3dfaWQ6IHRhYi53aW5kb3dJZCxcbiAgICAgICAgICAgIHRhYl9pZDogZGV0YWlscy50YWJJZCxcbiAgICAgICAgICAgIGZyYW1lX2lkOiBkZXRhaWxzLmZyYW1lSWQsXG4gICAgICAgICAgICByZXNwb25zZV9zdGF0dXM6IHJlc3BvbnNlU3RhdHVzLFxuICAgICAgICAgICAgcmVzcG9uc2Vfc3RhdHVzX3RleHQ6IGVzY2FwZVN0cmluZyhyZXNwb25zZVN0YXR1c1RleHQpLFxuICAgICAgICAgICAgaGVhZGVyczogdGhpcy5qc29uaWZ5SGVhZGVycyhkZXRhaWxzLnJlc3BvbnNlSGVhZGVycykuaGVhZGVycyxcbiAgICAgICAgICAgIHRpbWVfc3RhbXA6IG5ldyBEYXRlKGRldGFpbHMudGltZVN0YW1wKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiaHR0cF9yZWRpcmVjdHNcIiwgaHR0cFJlZGlyZWN0KTtcbiAgICB9XG4gICAgLypcbiAgICAgKiBIVFRQIFJlc3BvbnNlIEhhbmRsZXJzIGFuZCBIZWxwZXIgRnVuY3Rpb25zXG4gICAgICovXG4gICAgYXN5bmMgbG9nV2l0aFJlc3BvbnNlQm9keShkZXRhaWxzLCB1cGRhdGUpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ1Jlc3BvbnNlID0gdGhpcy5nZXRQZW5kaW5nUmVzcG9uc2UoZGV0YWlscy5yZXF1ZXN0SWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VCb2R5TGlzdGVuZXIgPSBwZW5kaW5nUmVzcG9uc2UucmVzcG9uc2VCb2R5TGlzdGVuZXI7XG4gICAgICAgICAgICBjb25zdCByZXNwQm9keSA9IGF3YWl0IHJlc3BvbnNlQm9keUxpc3RlbmVyLmdldFJlc3BvbnNlQm9keSgpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudEhhc2ggPSBhd2FpdCByZXNwb25zZUJvZHlMaXN0ZW5lci5nZXRDb250ZW50SGFzaCgpO1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZUNvbnRlbnQocmVzcEJvZHksIGVzY2FwZVN0cmluZyhjb250ZW50SGFzaCkpO1xuICAgICAgICAgICAgdXBkYXRlLmNvbnRlbnRfaGFzaCA9IGNvbnRlbnRIYXNoO1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImh0dHBfcmVzcG9uc2VzXCIsIHVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIC8vIFRPRE86IFJlZmFjdG9yIHRvIGNvcnJlc3BvbmRpbmcgd2ViZXh0IGxvZ2ljIG9yIGRpc2NhcmRcbiAgICAgICAgICAgIGRhdGFSZWNlaXZlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgXCJVbmFibGUgdG8gcmV0cmlldmUgcmVzcG9uc2UgYm9keS5cIiArIEpTT04uc3RyaW5naWZ5KGFSZWFzb24pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHVwZGF0ZS5jb250ZW50X2hhc2ggPSBcIjxlcnJvcj5cIjtcbiAgICAgICAgICAgIGRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwiaHR0cF9yZXNwb25zZXNcIiwgdXBkYXRlKTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5sb2dFcnJvcihcIlVuYWJsZSB0byByZXRyaWV2ZSByZXNwb25zZSBib2R5LlwiICtcbiAgICAgICAgICAgICAgICBcIkxpa2VseSBjYXVzZWQgYnkgYSBwcm9ncmFtbWluZyBlcnJvci4gRXJyb3IgTWVzc2FnZTpcIiArXG4gICAgICAgICAgICAgICAgZXJyLm5hbWUgK1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlICtcbiAgICAgICAgICAgICAgICBcIlxcblwiICtcbiAgICAgICAgICAgICAgICBlcnIuc3RhY2spO1xuICAgICAgICAgICAgdXBkYXRlLmNvbnRlbnRfaGFzaCA9IFwiPGVycm9yPlwiO1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImh0dHBfcmVzcG9uc2VzXCIsIHVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSW5zdHJ1bWVudCBIVFRQIHJlc3BvbnNlc1xuICAgIGFzeW5jIG9uQ29tcGxldGVkSGFuZGxlcihkZXRhaWxzLCBjcmF3bElELCBldmVudE9yZGluYWwsIHNhdmVDb250ZW50KSB7XG4gICAgICAgIC8qXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwib25Db21wbGV0ZWRIYW5kbGVyIChwcmV2aW91c2x5IGh0dHBSZXF1ZXN0SGFuZGxlcilcIixcbiAgICAgICAgICBkZXRhaWxzLFxuICAgICAgICAgIGNyYXdsSUQsXG4gICAgICAgICAgc2F2ZUNvbnRlbnQsXG4gICAgICAgICk7XG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IHRhYiA9IGRldGFpbHMudGFiSWQgPiAtMVxuICAgICAgICAgICAgPyBhd2FpdCBicm93c2VyLnRhYnMuZ2V0KGRldGFpbHMudGFiSWQpXG4gICAgICAgICAgICA6IHsgd2luZG93SWQ6IHVuZGVmaW5lZCwgaW5jb2duaXRvOiB1bmRlZmluZWQgfTtcbiAgICAgICAgY29uc3QgdXBkYXRlID0ge307XG4gICAgICAgIHVwZGF0ZS5pbmNvZ25pdG8gPSBib29sVG9JbnQodGFiLmluY29nbml0byk7XG4gICAgICAgIHVwZGF0ZS5icm93c2VyX2lkID0gY3Jhd2xJRDtcbiAgICAgICAgdXBkYXRlLmV4dGVuc2lvbl9zZXNzaW9uX3V1aWQgPSBleHRlbnNpb25TZXNzaW9uVXVpZDtcbiAgICAgICAgdXBkYXRlLmV2ZW50X29yZGluYWwgPSBldmVudE9yZGluYWw7XG4gICAgICAgIHVwZGF0ZS53aW5kb3dfaWQgPSB0YWIud2luZG93SWQ7XG4gICAgICAgIHVwZGF0ZS50YWJfaWQgPSBkZXRhaWxzLnRhYklkO1xuICAgICAgICB1cGRhdGUuZnJhbWVfaWQgPSBkZXRhaWxzLmZyYW1lSWQ7XG4gICAgICAgIC8vIHJlcXVlc3RJZCBpcyBhIHVuaXF1ZSBpZGVudGlmaWVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gbGluayByZXF1ZXN0cyBhbmQgcmVzcG9uc2VzXG4gICAgICAgIHVwZGF0ZS5yZXF1ZXN0X2lkID0gTnVtYmVyKGRldGFpbHMucmVxdWVzdElkKTtcbiAgICAgICAgY29uc3QgaXNDYWNoZWQgPSBkZXRhaWxzLmZyb21DYWNoZTtcbiAgICAgICAgdXBkYXRlLmlzX2NhY2hlZCA9IGJvb2xUb0ludChpc0NhY2hlZCk7XG4gICAgICAgIGNvbnN0IHVybCA9IGRldGFpbHMudXJsO1xuICAgICAgICB1cGRhdGUudXJsID0gZXNjYXBlVXJsKHVybCk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RNZXRob2QgPSBkZXRhaWxzLm1ldGhvZDtcbiAgICAgICAgdXBkYXRlLm1ldGhvZCA9IGVzY2FwZVN0cmluZyhyZXF1ZXN0TWV0aG9kKTtcbiAgICAgICAgLy8gVE9ETzogUmVmYWN0b3IgdG8gY29ycmVzcG9uZGluZyB3ZWJleHQgbG9naWMgb3IgZGlzY2FyZFxuICAgICAgICAvLyAocmVxdWVzdCBoZWFkZXJzIGFyZSBub3QgYXZhaWxhYmxlIGluIGh0dHAgcmVzcG9uc2UgZXZlbnQgbGlzdGVuZXIgb2JqZWN0LFxuICAgICAgICAvLyBidXQgdGhlIHJlZmVycmVyIHByb3BlcnR5IG9mIHRoZSBjb3JyZXNwb25kaW5nIHJlcXVlc3QgY291bGQgYmUgcXVlcmllZClcbiAgICAgICAgLy9cbiAgICAgICAgLy8gbGV0IHJlZmVycmVyID0gXCJcIjtcbiAgICAgICAgLy8gaWYgKGRldGFpbHMucmVmZXJyZXIpIHtcbiAgICAgICAgLy8gICByZWZlcnJlciA9IGRldGFpbHMucmVmZXJyZXIuc3BlYztcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyB1cGRhdGUucmVmZXJyZXIgPSBlc2NhcGVTdHJpbmcocmVmZXJyZXIpO1xuICAgICAgICBjb25zdCByZXNwb25zZVN0YXR1cyA9IGRldGFpbHMuc3RhdHVzQ29kZTtcbiAgICAgICAgdXBkYXRlLnJlc3BvbnNlX3N0YXR1cyA9IHJlc3BvbnNlU3RhdHVzO1xuICAgICAgICBjb25zdCByZXNwb25zZVN0YXR1c1RleHQgPSBkZXRhaWxzLnN0YXR1c0xpbmU7XG4gICAgICAgIHVwZGF0ZS5yZXNwb25zZV9zdGF0dXNfdGV4dCA9IGVzY2FwZVN0cmluZyhyZXNwb25zZVN0YXR1c1RleHQpO1xuICAgICAgICBjb25zdCBjdXJyZW50X3RpbWUgPSBuZXcgRGF0ZShkZXRhaWxzLnRpbWVTdGFtcCk7XG4gICAgICAgIHVwZGF0ZS50aW1lX3N0YW1wID0gY3VycmVudF90aW1lLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHBhcnNlZEhlYWRlcnMgPSB0aGlzLmpzb25pZnlIZWFkZXJzKGRldGFpbHMucmVzcG9uc2VIZWFkZXJzKTtcbiAgICAgICAgdXBkYXRlLmhlYWRlcnMgPSBwYXJzZWRIZWFkZXJzLmhlYWRlcnM7XG4gICAgICAgIHVwZGF0ZS5sb2NhdGlvbiA9IHBhcnNlZEhlYWRlcnMubG9jYXRpb247XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNhdmVDb250ZW50KHNhdmVDb250ZW50LCBkZXRhaWxzLnR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ1dpdGhSZXNwb25zZUJvZHkoZGV0YWlscywgdXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJodHRwX3Jlc3BvbnNlc1wiLCB1cGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGpzb25pZnlIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0SGVhZGVycyA9IFtdO1xuICAgICAgICBsZXQgbG9jYXRpb24gPSBcIlwiO1xuICAgICAgICBpZiAoaGVhZGVycykge1xuICAgICAgICAgICAgaGVhZGVycy5tYXAoKHJlc3BvbnNlSGVhZGVyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSB9ID0gcmVzcG9uc2VIZWFkZXI7XG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyX3BhaXIgPSBbXTtcbiAgICAgICAgICAgICAgICBoZWFkZXJfcGFpci5wdXNoKGVzY2FwZVN0cmluZyhuYW1lKSk7XG4gICAgICAgICAgICAgICAgaGVhZGVyX3BhaXIucHVzaChlc2NhcGVTdHJpbmcodmFsdWUpKTtcbiAgICAgICAgICAgICAgICByZXN1bHRIZWFkZXJzLnB1c2goaGVhZGVyX3BhaXIpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwibG9jYXRpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoZWFkZXJzOiBKU09OLnN0cmluZ2lmeShyZXN1bHRIZWFkZXJzKSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBlc2NhcGVTdHJpbmcobG9jYXRpb24pLFxuICAgICAgICB9O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFIUjBjQzFwYm5OMGNuVnRaVzUwTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDJKaFkydG5jbTkxYm1RdmFIUjBjQzFwYm5OMGNuVnRaVzUwTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTlCUVU4c1JVRkJSU3gxUWtGQmRVSXNSVUZCUlN4TlFVRk5MSGREUVVGM1F5eERRVUZETzBGQlEycEdMRTlCUVU4c1JVRkJSU3h2UWtGQmIwSXNSVUZCUlN4TlFVRk5MQ3RDUVVFclFpeERRVUZETzBGQlEzSkZMRTlCUVU4c1JVRkJSU3hqUVVGakxFVkJRWEZDTEUxQlFVMHNlVUpCUVhsQ0xFTkJRVU03UVVGRE5VVXNUMEZCVHl4RlFVRkZMR05CUVdNc1JVRkJSU3hOUVVGTkxIZENRVUYzUWl4RFFVRkRPMEZCUTNoRUxFOUJRVThzUlVGQlJTeGxRVUZsTEVWQlFVVXNUVUZCVFN4NVFrRkJlVUlzUTBGQlF6dEJRVU14UkN4UFFVRlBMRVZCUVVVc1UwRkJVeXhGUVVGRkxGbEJRVmtzUlVGQlJTeFRRVUZUTEVWQlFVVXNUVUZCVFN4eFFrRkJjVUlzUTBGQlF6dEJRV1Y2UlRzN096czdPMGRCVFVjN1FVRkZTQ3hOUVVGTkxGRkJRVkVzUjBGQmJVSTdTVUZETDBJc1VVRkJVVHRKUVVOU0xGbEJRVms3U1VGRFdpeE5RVUZOTzBsQlEwNHNUMEZCVHp0SlFVTlFMRlZCUVZVN1NVRkRWaXhaUVVGWk8wbEJRMW9zVDBGQlR6dEpRVU5RTEZGQlFWRTdTVUZEVWl4dFFrRkJiVUk3U1VGRGJrSXNUVUZCVFR0SlFVTk9MRkZCUVZFN1NVRkRVaXhoUVVGaE8wbEJRMklzV1VGQldUdEpRVU5hTEZkQlFWYzdTVUZEV0N4alFVRmpPMGxCUTJRc1YwRkJWenRKUVVOWUxGTkJRVk03U1VGRFZDeG5Ra0ZCWjBJN1NVRkRhRUlzVFVGQlRUdEpRVU5PTEU5QlFVODdRMEZEVWl4RFFVRkRPMEZCUlVZc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeERRVUZETzBGQlJYQkNMRTFCUVUwc1QwRkJUeXhqUVVGak8wbEJRMUlzV1VGQldTeERRVUZETzBsQlEzUkNMR1ZCUVdVc1IwRkZia0lzUlVGQlJTeERRVUZETzBsQlEwTXNaMEpCUVdkQ0xFZEJSWEJDTEVWQlFVVXNRMEZCUXp0SlFVTkRMSFZDUVVGMVFpeERRVUZETzBsQlEzaENMREpDUVVFeVFpeERRVUZETzBsQlF6VkNMSGRDUVVGM1FpeERRVUZETzBsQlEzcENMRzFDUVVGdFFpeERRVUZETzBsQlJUVkNMRmxCUVZrc1dVRkJXVHRSUVVOMFFpeEpRVUZKTEVOQlFVTXNXVUZCV1N4SFFVRkhMRmxCUVZrc1EwRkJRenRKUVVOdVF5eERRVUZETzBsQlJVMHNSMEZCUnl4RFFVRkRMRTlCUVU4c1JVRkJSU3hwUWtGQmIwTTdVVUZEZEVRc1RVRkJUU3hOUVVGTkxFZEJRV3RDTEVWQlFVVXNTVUZCU1N4RlFVRkZMRU5CUVVNc1dVRkJXU3hEUVVGRExFVkJRVVVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlN4RFFVRkRPMUZCUlhoRkxFMUJRVTBzZVVKQlFYbENMRWRCUVVjc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJUdFpRVU0xUXl4UFFVRlBMRU5CUTB3c1QwRkJUeXhEUVVGRExGTkJRVk1zU1VGQlNTeFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTlCUVU4c1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVONFJTeERRVUZETzFGQlEwb3NRMEZCUXl4RFFVRkRPMUZCUlVZN08xZEJSVWM3VVVGRlNDeEpRVUZKTEVOQlFVTXNkVUpCUVhWQ0xFZEJRVWNzUTBGRE4wSXNUMEZCT0VNc1JVRkRPVU1zUlVGQlJUdFpRVU5HTEUxQlFVMHNLMEpCUVN0Q0xFZEJRWEZDTEVWQlFVVXNRMEZCUXp0WlFVTTNSQ3h4UTBGQmNVTTdXVUZEY2tNc1NVRkJTU3g1UWtGQmVVSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRuUWtGRGRFTXNUMEZCVHl3clFrRkJLMElzUTBGQlF6dGhRVU40UXp0WlFVTkVMRTFCUVUwc1kwRkJZeXhIUVVGSExFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdXVUZEYWtVc1kwRkJZeXhEUVVGRExHdERRVUZyUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xbEJRek5FTEUxQlFVMHNaVUZCWlN4SFFVRkhMRWxCUVVrc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03V1VGRGJrVXNaVUZCWlN4RFFVRkRMR3REUVVGclF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMWxCUXpWRUxFbEJRVWtzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExHbENRVUZwUWl4RlFVRkZMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJUdG5Ra0ZETTBRc1pVRkJaU3hEUVVGRExDdENRVUVyUWl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8yRkJRekZFTzFsQlEwUXNUMEZCVHl3clFrRkJLMElzUTBGQlF6dFJRVU42UXl4RFFVRkRMRU5CUVVNN1VVRkRSaXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEdWQlFXVXNRMEZCUXl4WFFVRlhMRU5CUXpWRExFbEJRVWtzUTBGQlF5eDFRa0ZCZFVJc1JVRkROVUlzVFVGQlRTeEZRVU5PTEVsQlFVa3NRMEZCUXl4elFrRkJjMElzUTBGQlF5eHBRa0ZCYVVJc1EwRkJRenRaUVVNMVF5eERRVUZETEVOQlFVTXNRMEZCUXl4aFFVRmhMRVZCUVVVc1ZVRkJWU3hEUVVGRE8xbEJRemRDTEVOQlFVTXNRMEZCUXl4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVOd1FpeERRVUZETzFGQlJVWXNTVUZCU1N4RFFVRkRMREpDUVVFeVFpeEhRVUZITEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVN1dVRkROME1zY1VOQlFYRkRPMWxCUTNKRExFbEJRVWtzZVVKQlFYbENMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVU3WjBKQlEzUkRMRTlCUVU4N1lVRkRVanRaUVVORUxFMUJRVTBzWTBGQll5eEhRVUZITEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1dVRkRha1VzWTBGQll5eERRVUZETEhORFFVRnpReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFsQlF5OUVMRWxCUVVrc1EwRkJReXd3UWtGQk1FSXNRMEZETjBJc1QwRkJUeXhGUVVOUUxFOUJRVThzUlVGRFVDeDFRa0ZCZFVJc1JVRkJSU3hEUVVNeFFpeERRVUZETzFGQlEwb3NRMEZCUXl4RFFVRkRPMUZCUTBZc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eHRRa0ZCYlVJc1EwRkJReXhYUVVGWExFTkJRMmhFTEVsQlFVa3NRMEZCUXl3eVFrRkJNa0lzUlVGRGFFTXNUVUZCVFN4RlFVTk9MRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZEYmtJc1EwRkJRenRSUVVWR0xFbEJRVWtzUTBGQlF5eDNRa0ZCZDBJc1IwRkJSeXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTzFsQlF6RkRMSEZEUVVGeFF6dFpRVU55UXl4SlFVRkpMSGxDUVVGNVFpeERRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMmRDUVVOMFF5eFBRVUZQTzJGQlExSTdXVUZEUkN4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTlCUVU4c1JVRkJSU3gxUWtGQmRVSXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkROVVVzUTBGQlF5eERRVUZETzFGQlEwWXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4WFFVRlhMRU5CUXpkRExFbEJRVWtzUTBGQlF5eDNRa0ZCZDBJc1JVRkROMElzVFVGQlRTeEZRVU5PTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGRGNFSXNRMEZCUXp0UlFVVkdMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSMEZCUnl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRk8xbEJRM0pETEhGRFFVRnhRenRaUVVOeVF5eEpRVUZKTEhsQ1FVRjVRaXhEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTzJkQ1FVTjBReXhQUVVGUE8yRkJRMUk3V1VGRFJDeE5RVUZOTEdWQlFXVXNSMEZCUnl4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xbEJRMjVGTEdWQlFXVXNRMEZCUXl3NFFrRkJPRUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTjRSQ3hKUVVGSkxFTkJRVU1zYTBKQlFXdENMRU5CUTNKQ0xFOUJRVThzUlVGRFVDeFBRVUZQTEVWQlExQXNkVUpCUVhWQ0xFVkJRVVVzUlVGRGVrSXNhVUpCUVdsQ0xFTkJRMnhDTEVOQlFVTTdVVUZEU2l4RFFVRkRMRU5CUVVNN1VVRkRSaXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEZkQlFWY3NRMEZCUXl4WFFVRlhMRU5CUTNoRExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1JVRkRlRUlzVFVGQlRTeEZRVU5PTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGRGNFSXNRMEZCUXp0SlFVTktMRU5CUVVNN1NVRkZUU3hQUVVGUE8xRkJRMW9zU1VGQlNTeEpRVUZKTEVOQlFVTXNkVUpCUVhWQ0xFVkJRVVU3V1VGRGFFTXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhsUVVGbExFTkJRVU1zWTBGQll5eERRVU12UXl4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTEVOQlF6ZENMRU5CUVVNN1UwRkRTRHRSUVVORUxFbEJRVWtzU1VGQlNTeERRVUZETERKQ1FVRXlRaXhGUVVGRk8xbEJRM0JETEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc2JVSkJRVzFDTEVOQlFVTXNZMEZCWXl4RFFVTnVSQ3hKUVVGSkxFTkJRVU1zTWtKQlFUSkNMRU5CUTJwRExFTkJRVU03VTBGRFNEdFJRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMSGRDUVVGM1FpeEZRVUZGTzFsQlEycERMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1kwRkJZeXhEUVVOb1JDeEpRVUZKTEVOQlFVTXNkMEpCUVhkQ0xFTkJRemxDTEVOQlFVTTdVMEZEU0R0UlFVTkVMRWxCUVVrc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RlFVRkZPMWxCUXpWQ0xFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNWMEZCVnl4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1EwRkJRenRUUVVONlJUdEpRVU5JTEVOQlFVTTdTVUZGVHl4elFrRkJjMElzUTBGQlF5eHBRa0ZCYjBNN1VVRkRha1VzU1VGQlNTeHBRa0ZCYVVJc1MwRkJTeXhKUVVGSkxFVkJRVVU3V1VGRE9VSXNUMEZCVHl4SlFVRkpMRU5CUVVNN1UwRkRZanRSUVVORUxFbEJRVWtzYVVKQlFXbENMRXRCUVVzc1MwRkJTeXhGUVVGRk8xbEJReTlDTEU5QlFVOHNTMEZCU3l4RFFVRkRPMU5CUTJRN1VVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eDNRa0ZCZDBJc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGNrVXNRMEZCUXp0SlFVVlBMSGRDUVVGM1FpeERRVUZETEdsQ1FVRjVRanRSUVVONFJDeFBRVUZQTEdsQ1FVRnBRaXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFXMUNMRU5CUVVNN1NVRkRlRVFzUTBGQlF6dEpRVVZFT3pzN096czdUMEZOUnp0SlFVTkxMR2xDUVVGcFFpeERRVU4yUWl4cFFrRkJiME1zUlVGRGNFTXNXVUZCTUVJN1VVRkZNVUlzU1VGQlNTeHBRa0ZCYVVJc1MwRkJTeXhKUVVGSkxFVkJRVVU3V1VGRE9VSXNUMEZCVHl4SlFVRkpMRU5CUVVNN1UwRkRZanRSUVVORUxFbEJRVWtzYVVKQlFXbENMRXRCUVVzc1MwRkJTeXhGUVVGRk8xbEJReTlDTEU5QlFVOHNTMEZCU3l4RFFVRkRPMU5CUTJRN1VVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eDNRa0ZCZDBJc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkRPVVFzV1VGQldTeERRVU5pTEVOQlFVTTdTVUZEU2l4RFFVRkRPMGxCUlU4c2FVSkJRV2xDTEVOQlFVTXNVMEZCVXp0UlFVTnFReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSVHRaUVVOd1F5eEpRVUZKTEVOQlFVTXNaVUZCWlN4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFbEJRVWtzWTBGQll5eEZRVUZGTEVOQlFVTTdVMEZEZUVRN1VVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1NVRkRla01zUTBGQlF6dEpRVVZQTEd0Q1FVRnJRaXhEUVVGRExGTkJRVk03VVVGRGJFTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSVHRaUVVOeVF5eEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NTVUZCU1N4bFFVRmxMRVZCUVVVc1EwRkJRenRUUVVNeFJEdFJRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGRlJEczdUMEZGUnp0SlFVVkxMRXRCUVVzc1EwRkJReXd3UWtGQk1FSXNRMEZEZEVNc1QwRkJhMFFzUlVGRGJFUXNUMEZCVHl4RlFVTlFMRmxCUVc5Q08xRkJSWEJDTEUxQlFVMHNSMEZCUnl4SFFVTlFMRTlCUVU4c1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlEyaENMRU5CUVVNc1EwRkJReXhOUVVGTkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU03V1VGRGRrTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1VVRkJVU3hGUVVGRkxGTkJRVk1zUlVGQlJTeFRRVUZUTEVWQlFVVXNVMEZCVXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hUUVVGVExFVkJRVVVzUTBGQlF6dFJRVVZ3UlN4TlFVRk5MRTFCUVUwc1IwRkJSeXhGUVVGcFFpeERRVUZETzFGQlJXcERMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRSUVVNMVF5eE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRTlCUVU4c1EwRkJRenRSUVVNMVFpeE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFZEJRVWNzYjBKQlFXOUNMRU5CUVVNN1VVRkRja1FzVFVGQlRTeERRVUZETEdGQlFXRXNSMEZCUnl4WlFVRlpMRU5CUVVNN1VVRkRjRU1zVFVGQlRTeERRVUZETEZOQlFWTXNSMEZCUnl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRE8xRkJRMmhETEUxQlFVMHNRMEZCUXl4TlFVRk5MRWRCUVVjc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF6dFJRVU01UWl4TlFVRk5MRU5CUVVNc1VVRkJVU3hIUVVGSExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTTdVVUZGYkVNc2JVWkJRVzFHTzFGQlEyNUdMRTFCUVUwc1EwRkJReXhWUVVGVkxFZEJRVWNzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRSUVVVNVF5eE5RVUZOTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRE8xRkJRM2hDTEUxQlFVMHNRMEZCUXl4SFFVRkhMRWRCUVVjc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlJUVkNMRTFCUVUwc1lVRkJZU3hIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEY2tNc1RVRkJUU3hEUVVGRExFMUJRVTBzUjBGQlJ5eFpRVUZaTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNN1VVRkZOVU1zVFVGQlRTeFpRVUZaTEVkQlFVY3NTVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFGQlEycEVMRTFCUVUwc1EwRkJReXhWUVVGVkxFZEJRVWNzV1VGQldTeERRVUZETEZkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlM5RExFbEJRVWtzV1VGQldTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjBRaXhKUVVGSkxGRkJRVkVzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZEYkVJc1RVRkJUU3hQUVVGUExFZEJRVWNzUlVGQlJTeERRVUZETzFGQlEyNUNMRWxCUVVrc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF6dFJRVU51UWl4SlFVRkpMRTlCUVU4c1EwRkJReXhqUVVGakxFVkJRVVU3V1VGRE1VSXNUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eGhRVUZoTEVWQlFVVXNSVUZCUlR0blFrRkRNME1zVFVGQlRTeEZRVUZGTEVsQlFVa3NSVUZCUlN4TFFVRkxMRVZCUVVVc1IwRkJSeXhoUVVGaExFTkJRVU03WjBKQlEzUkRMRTFCUVUwc1YwRkJWeXhIUVVGSExFVkJRVVVzUTBGQlF6dG5Ra0ZEZGtJc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGNrTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRkRU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRuUWtGRE1VSXNTVUZCU1N4SlFVRkpMRXRCUVVzc1kwRkJZeXhGUVVGRk8yOUNRVU16UWl4WlFVRlpMRWRCUVVjc1MwRkJTeXhEUVVGRE8yOUNRVU55UWl4SlFVRkpMRmxCUVZrc1EwRkJReXhQUVVGUExFTkJRVU1zTUVKQlFUQkNMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUlVGQlJUdDNRa0ZETTBRc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF6dHhRa0ZEWmp0cFFrRkRSanRuUWtGRFJDeEpRVUZKTEVsQlFVa3NTMEZCU3l4VFFVRlRMRVZCUVVVN2IwSkJRM1JDTEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN2FVSkJRMnhDTzFsQlEwZ3NRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkRTanRSUVVWRUxFMUJRVTBzUTBGQlF5eFJRVUZSTEVkQlFVY3NXVUZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJSWHBETEVsQlFVa3NZVUZCWVN4TFFVRkxMRTFCUVUwc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eHBRMEZCYVVNc1JVRkJSVHRaUVVONlJTeE5RVUZOTEdOQlFXTXNSMEZCUnl4SlFVRkpMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8xbEJRMnBGTEUxQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc1kwRkJZeXhEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMnhGTEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVN1owSkJRMklzU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UlFVRlJMRU5CUTNoQ0xIRkhRVUZ4Unl4RFFVTjBSeXhEUVVGRE8yRkJRMGc3YVVKQlFVMDdaMEpCUTB3c1RVRkJUU3d5UWtGQk1rSXNSMEZETDBJc1RVRkJUU3hqUVVGakxFTkJRVU1zTWtKQlFUSkNMRU5CUVVNN1owSkJRMjVFTEUxQlFVMHNWMEZCVnl4SFFVRkhMREpDUVVFeVFpeERRVUZETEZkQlFWY3NRMEZCUXp0blFrRkZOVVFzU1VGQlNTeFhRVUZYTEVWQlFVVTdiMEpCUTJZc1RVRkJUU3hWUVVGVkxFZEJRVWNzU1VGQlNTeGpRVUZqTEVOQlEyNURMREpDUVVFeVFpeEZRVU16UWl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVOc1FpeERRVUZETzI5Q1FVTkdMRTFCUVUwc1QwRkJUeXhIUVVGelFpeFZRVUZWTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF6dHZRa0ZGYWtVc1owUkJRV2RFTzI5Q1FVTm9SQ3hKUVVGSkxHTkJRV01zU1VGQlNTeFBRVUZQTEVWQlFVVTdkMEpCUXpkQ0xEQkdRVUV3Ump0M1FrRkRNVVlzYlVkQlFXMUhPM2RDUVVOdVJ5eE5RVUZOTEdOQlFXTXNSMEZCUnpzMFFrRkRja0lzWTBGQll6czBRa0ZEWkN4eFFrRkJjVUk3TkVKQlEzSkNMR2RDUVVGblFqdDVRa0ZEYWtJc1EwRkJRenQzUWtGRFJpeExRVUZMTEUxQlFVMHNTVUZCU1N4SlFVRkpMRTlCUVU4c1EwRkJReXhaUVVGWkxFVkJRVVU3TkVKQlEzWkRMRWxCUVVrc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0blEwRkRha01zVFVGQlRTeFhRVUZYTEVkQlFVY3NSVUZCUlN4RFFVRkRPMmREUVVOMlFpeFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzJkRFFVTnlReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0blEwRkRNMFFzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenMyUWtGRE0wSTdlVUpCUTBZN2NVSkJRMFk3YjBKQlEwUXNLMFpCUVN0R08yOUNRVU12Uml4SlFVRkpMRmRCUVZjc1NVRkJTU3hQUVVGUExFVkJRVVU3ZDBKQlF6RkNMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXp0eFFrRkRkRU03YjBKQlEwUXNTVUZCU1N4bFFVRmxMRWxCUVVrc1QwRkJUeXhGUVVGRk8zZENRVU01UWl4TlFVRk5MRU5CUVVNc1lVRkJZU3hIUVVGSExFOUJRVThzUTBGQlF5eGhRVUZoTEVOQlFVTTdjVUpCUXpsRE8ybENRVU5HTzJGQlEwWTdVMEZEUmp0UlFVVkVMRTFCUVUwc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVWNlF5eGxRVUZsTzFGQlEyWXNUVUZCVFN4TFFVRkxMRWRCUVVjc1QwRkJUeXhEUVVGRExFbEJRVWtzUzBGQlN5eG5Ra0ZCWjBJc1EwRkJRenRSUVVOb1JDeE5RVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVVZxUXl3MlEwRkJOa003VVVGRE4wTXNTVUZCU1N4blFrRkJaMElzUTBGQlF6dFJRVU55UWl4SlFVRkpMR0ZCUVdFc1EwRkJRenRSUVVOc1FpeEpRVUZKTEU5QlFVOHNRMEZCUXl4VFFVRlRMRVZCUVVVN1dVRkRja0lzVFVGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4SFFVRkhMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFsQlEyNUVMR2RDUVVGblFpeEhRVUZITEdWQlFXVXNRMEZCUXl4TlFVRk5MRU5CUVVNN1UwRkRNME03VVVGRFJDeEpRVUZKTEU5QlFVOHNRMEZCUXl4WFFVRlhMRVZCUVVVN1dVRkRka0lzVFVGQlRTeHBRa0ZCYVVJc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eFBRVUZQTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNN1dVRkRka1FzWVVGQllTeEhRVUZITEdsQ1FVRnBRaXhEUVVGRExFMUJRVTBzUTBGQlF6dFRRVU14UXp0UlFVTkVMRTFCUVUwc1EwRkJReXhwUWtGQmFVSXNSMEZCUnl4WlFVRlpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNRMEZCUXp0UlFVTXhSQ3hOUVVGTkxFTkJRVU1zWTBGQll5eEhRVUZITEZsQlFWa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRSUVVWd1JDeDVRa0ZCZVVJN1VVRkRla0lzZVVWQlFYbEZPMUZCUTNwRkxEaENRVUU0UWp0UlFVTTVRaXhOUVVGTkxGZEJRVmNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWMEZCVnl4RFFVRkRPMUZCUTNoRExFMUJRVTBzUTBGQlF5eFpRVUZaTEVkQlFVY3NXVUZCV1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRE8xRkJSV2hFTEd0RlFVRnJSVHRSUVVOc1JTeHBSa0ZCYVVZN1VVRkRha1lzYVVKQlFXbENPMUZCUTJwQ0xIRkhRVUZ4Unp0UlFVTnlSeXhOUVVGTkxFTkJRVU1zWVVGQllTeEhRVUZITEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNN1VVRkZjRU03T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096dFZRVEJEUlR0UlFVTkdMRTFCUVUwc1EwRkJReXhoUVVGaExFZEJRVWNzVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4M1FrRkJkMElzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNwRkxFMUJRVTBzUTBGQlF5eGxRVUZsTEVkQlFVY3NUMEZCVHl4RFFVRkRMR0ZCUVdFc1EwRkJRenRSUVVNdlF5eE5RVUZOTEVOQlFVTXNaVUZCWlN4SFFVRkhMRmxCUVZrc1EwRkRia01zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRM1pETEVOQlFVTTdVVUZEUml4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGVkJRVlVzUTBGQlF5eGxRVUZsTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1NVRkRlRVFzUTBGQlF6dEpRVVZFT3pzN096czdPenM3T3pzN1QwRlpSenRKUVVOTExIZENRVUYzUWl4RFFVTTVRaXhQUVVGclJEdFJRVVZzUkN4SlFVRkpMRWRCUVVjc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRllpeEpRVUZKTEU5QlFVOHNRMEZCUXl4SlFVRkpMRXRCUVVzc1dVRkJXU3hGUVVGRk8xbEJRMnBETEhkRFFVRjNRenRaUVVONFF5eEhRVUZITEVkQlFVY3NUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJRenRUUVVOdVFqdGhRVUZOTEVsQlFVa3NUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RlFVRkZPMWxCUTI1RUxHbEZRVUZwUlR0WlFVTnFSU3h6UlVGQmMwVTdXVUZEZEVVc1IwRkJSeXhIUVVGSExFOUJRVThzUTBGQlF5eGpRVUZqTEVOQlFVTXNUVUZCVFR0blFrRkRha01zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4alFVRmpMRU5CUVVNc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSenRuUWtGREwwUXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhYUVVGWExFTkJRVU03VTBGRGVrSTdZVUZCVFR0WlFVTk1MSFZFUVVGMVJEdFpRVU4yUkN4M1JrRkJkMFk3V1VGRGVFWXNSMEZCUnl4SFFVRkhMRTlCUVU4c1EwRkJReXhYUVVGWExFTkJRVU03VTBGRE0wSTdVVUZEUkN4UFFVRlBMRWRCUVVjc1EwRkJRenRKUVVOaUxFTkJRVU03U1VGRlR5eExRVUZMTEVOQlFVTXNkVUpCUVhWQ0xFTkJRMjVETEU5QlFTdERMRVZCUXk5RExFOUJRVThzUlVGRFVDeFpRVUZ2UWp0UlFVVndRanM3T3pzN08xVkJUVVU3VVVGRlJpdzBRa0ZCTkVJN1VVRkROVUlzYVVSQlFXbEVPMUZCUldwRU96czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenRWUVRKRVJUdFJRVVZHTEUxQlFVMHNZMEZCWXl4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU03VVVGRE1VTXNUVUZCVFN4clFrRkJhMElzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRPMUZCUlRsRExFMUJRVTBzUjBGQlJ5eEhRVU5RTEU5QlFVOHNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRMmhDTEVOQlFVTXNRMEZCUXl4TlFVRk5MRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNN1dVRkRka01zUTBGQlF5eERRVUZETEVWQlFVVXNVVUZCVVN4RlFVRkZMRk5CUVZNc1JVRkJSU3hUUVVGVExFVkJRVVVzVTBGQlV5eEZRVUZGTEVOQlFVTTdVVUZEY0VRc1RVRkJUU3haUVVGWkxFZEJRV2xDTzFsQlEycERMRk5CUVZNc1JVRkJSU3hUUVVGVExFTkJRVU1zUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXp0WlFVTnVReXhWUVVGVkxFVkJRVVVzVDBGQlR6dFpRVU51UWl4bFFVRmxMRVZCUVVVc1UwRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTTdXVUZEZGtNc1kwRkJZeXhGUVVGRkxFOUJRVThzUTBGQlF5eFRRVUZUTzFsQlEycERMR1ZCUVdVc1JVRkJSU3hUUVVGVExFTkJRVU1zVDBGQlR5eERRVUZETEZkQlFWY3NRMEZCUXp0WlFVTXZReXhqUVVGakxFVkJRVVVzU1VGQlNUdFpRVU53UWl4elFrRkJjMElzUlVGQlJTeHZRa0ZCYjBJN1dVRkROVU1zWVVGQllTeEZRVUZGTEZsQlFWazdXVUZETTBJc1UwRkJVeXhGUVVGRkxFZEJRVWNzUTBGQlF5eFJRVUZSTzFsQlEzWkNMRTFCUVUwc1JVRkJSU3hQUVVGUExFTkJRVU1zUzBGQlN6dFpRVU55UWl4UlFVRlJMRVZCUVVVc1QwRkJUeXhEUVVGRExFOUJRVTg3V1VGRGVrSXNaVUZCWlN4RlFVRkZMR05CUVdNN1dVRkRMMElzYjBKQlFXOUNMRVZCUVVVc1dVRkJXU3hEUVVGRExHdENRVUZyUWl4RFFVRkRPMWxCUTNSRUxFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTlCUVU4c1EwRkJReXhsUVVGbExFTkJRVU1zUTBGQlF5eFBRVUZQTzFsQlF6ZEVMRlZCUVZVc1JVRkJSU3hKUVVGSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1YwRkJWeXhGUVVGRk8xTkJRM1JFTEVOQlFVTTdVVUZGUml4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGVkJRVlVzUTBGQlF5eG5Ra0ZCWjBJc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF6dEpRVU12UkN4RFFVRkRPMGxCUlVRN08wOUJSVWM3U1VGRlN5eExRVUZMTEVOQlFVTXNiVUpCUVcxQ0xFTkJReTlDTEU5QlFUaERMRVZCUXpsRExFMUJRVzlDTzFGQlJYQkNMRTFCUVUwc1pVRkJaU3hIUVVGSExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVVUZEYmtVc1NVRkJTVHRaUVVOR0xFMUJRVTBzYjBKQlFXOUNMRWRCUVVjc1pVRkJaU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRPMWxCUTJ4RkxFMUJRVTBzVVVGQlVTeEhRVUZITEUxQlFVMHNiMEpCUVc5Q0xFTkJRVU1zWlVGQlpTeEZRVUZGTEVOQlFVTTdXVUZET1VRc1RVRkJUU3hYUVVGWExFZEJRVWNzVFVGQlRTeHZRa0ZCYjBJc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF6dFpRVU5vUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVWQlFVVXNXVUZCV1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGJrVXNUVUZCVFN4RFFVRkRMRmxCUVZrc1IwRkJSeXhYUVVGWExFTkJRVU03V1VGRGJFTXNTVUZCU1N4RFFVRkRMRmxCUVZrc1EwRkJReXhWUVVGVkxFTkJRVU1zWjBKQlFXZENMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03VTBGRGVFUTdVVUZCUXl4UFFVRlBMRWRCUVVjc1JVRkJSVHRaUVVOYU96czdPenM3TzJOQlQwVTdXVUZEUml4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGRGVFSXNiVU5CUVcxRE8yZENRVU5xUXl4elJFRkJjMFE3WjBKQlEzUkVMRWRCUVVjc1EwRkJReXhKUVVGSk8yZENRVU5TTEVkQlFVY3NRMEZCUXl4UFFVRlBPMmRDUVVOWUxFbEJRVWs3WjBKQlEwb3NSMEZCUnl4RFFVRkRMRXRCUVVzc1EwRkRXaXhEUVVGRE8xbEJRMFlzVFVGQlRTeERRVUZETEZsQlFWa3NSMEZCUnl4VFFVRlRMRU5CUVVNN1dVRkRhRU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1UwRkRlRVE3U1VGRFNDeERRVUZETzBsQlJVUXNORUpCUVRSQ08wbEJRM0JDTEV0QlFVc3NRMEZCUXl4clFrRkJhMElzUTBGRE9VSXNUMEZCTUVNc1JVRkRNVU1zVDBGQlR5eEZRVU5RTEZsQlFWa3NSVUZEV2l4WFFVRlhPMUZCUlZnN096czdPenM3VlVGUFJUdFJRVVZHTEUxQlFVMHNSMEZCUnl4SFFVTlFMRTlCUVU4c1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlEyaENMRU5CUVVNc1EwRkJReXhOUVVGTkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU03V1VGRGRrTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1VVRkJVU3hGUVVGRkxGTkJRVk1zUlVGQlJTeFRRVUZUTEVWQlFVVXNVMEZCVXl4RlFVRkZMRU5CUVVNN1VVRkZjRVFzVFVGQlRTeE5RVUZOTEVkQlFVY3NSVUZCYTBJc1EwRkJRenRSUVVWc1F5eE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVVUZETlVNc1RVRkJUU3hEUVVGRExGVkJRVlVzUjBGQlJ5eFBRVUZQTEVOQlFVTTdVVUZETlVJc1RVRkJUU3hEUVVGRExITkNRVUZ6UWl4SFFVRkhMRzlDUVVGdlFpeERRVUZETzFGQlEzSkVMRTFCUVUwc1EwRkJReXhoUVVGaExFZEJRVWNzV1VGQldTeERRVUZETzFGQlEzQkRMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXp0UlFVTm9ReXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNN1VVRkRPVUlzVFVGQlRTeERRVUZETEZGQlFWRXNSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRE8xRkJSV3hETEcxR1FVRnRSanRSUVVOdVJpeE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVVUZGT1VNc1RVRkJUU3hSUVVGUkxFZEJRVWNzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXp0UlFVTnVReXhOUVVGTkxFTkJRVU1zVTBGQlV5eEhRVUZITEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVWMlF5eE5RVUZOTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRE8xRkJRM2hDTEUxQlFVMHNRMEZCUXl4SFFVRkhMRWRCUVVjc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlJUVkNMRTFCUVUwc1lVRkJZU3hIUVVGSExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTTdVVUZEY2tNc1RVRkJUU3hEUVVGRExFMUJRVTBzUjBGQlJ5eFpRVUZaTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNN1VVRkZOVU1zTUVSQlFUQkVPMUZCUXpGRUxEWkZRVUUyUlR0UlFVTTNSU3d5UlVGQk1rVTdVVUZETTBVc1JVRkJSVHRSUVVOR0xIRkNRVUZ4UWp0UlFVTnlRaXd3UWtGQk1FSTdVVUZETVVJc2MwTkJRWE5ETzFGQlEzUkRMRWxCUVVrN1VVRkRTaXcwUTBGQk5FTTdVVUZGTlVNc1RVRkJUU3hqUVVGakxFZEJRVWNzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXp0UlFVTXhReXhOUVVGTkxFTkJRVU1zWlVGQlpTeEhRVUZITEdOQlFXTXNRMEZCUXp0UlFVVjRReXhOUVVGTkxHdENRVUZyUWl4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU03VVVGRE9VTXNUVUZCVFN4RFFVRkRMRzlDUVVGdlFpeEhRVUZITEZsQlFWa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzFGQlJTOUVMRTFCUVUwc1dVRkJXU3hIUVVGSExFbEJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRSUVVOcVJDeE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRmxCUVZrc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF6dFJRVVV2UXl4TlFVRk5MR0ZCUVdFc1IwRkJSeXhKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEU5QlFVOHNRMEZCUXl4bFFVRmxMRU5CUVVNc1EwRkJRenRSUVVOdVJTeE5RVUZOTEVOQlFVTXNUMEZCVHl4SFFVRkhMR0ZCUVdFc1EwRkJReXhQUVVGUExFTkJRVU03VVVGRGRrTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1IwRkJSeXhoUVVGaExFTkJRVU1zVVVGQlVTeERRVUZETzFGQlJYcERMRWxCUVVrc1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRmRCUVZjc1JVRkJSU3hQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVTdXVUZEY2tRc1NVRkJTU3hEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRTlCUVU4c1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dFRRVU16UXp0aFFVRk5PMWxCUTB3c1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFZRVUZWTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdVMEZEZUVRN1NVRkRTQ3hEUVVGRE8wbEJSVThzWTBGQll5eERRVUZETEU5QlFXOUNPMUZCUTNwRExFMUJRVTBzWVVGQllTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjZRaXhKUVVGSkxGRkJRVkVzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZEYkVJc1NVRkJTU3hQUVVGUExFVkJRVVU3V1VGRFdDeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1kwRkJZeXhGUVVGRkxFVkJRVVU3WjBKQlF6ZENMRTFCUVUwc1JVRkJSU3hKUVVGSkxFVkJRVVVzUzBGQlN5eEZRVUZGTEVkQlFVY3NZMEZCWXl4RFFVRkRPMmRDUVVOMlF5eE5RVUZOTEZkQlFWY3NSMEZCUnl4RlFVRkZMRU5CUVVNN1owSkJRM1pDTEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTNKRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzUkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdaMEpCUTJoRExFbEJRVWtzU1VGQlNTeERRVUZETEZkQlFWY3NSVUZCUlN4TFFVRkxMRlZCUVZVc1JVRkJSVHR2UWtGRGNrTXNVVUZCVVN4SFFVRkhMRXRCUVVzc1EwRkJRenRwUWtGRGJFSTdXVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkJRenRUUVVOS08xRkJRMFFzVDBGQlR6dFpRVU5NTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExHRkJRV0VzUTBGQlF6dFpRVU4wUXl4UlFVRlJMRVZCUVVVc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF6dFRRVU5xUXl4RFFVRkRPMGxCUTBvc1EwRkJRenREUVVOR0luMD0iLCJpbXBvcnQgeyBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCB9IGZyb20gXCIuLi9saWIvZXh0ZW5zaW9uLXNlc3Npb24tZXZlbnQtb3JkaW5hbFwiO1xuaW1wb3J0IHsgZXh0ZW5zaW9uU2Vzc2lvblV1aWQgfSBmcm9tIFwiLi4vbGliL2V4dGVuc2lvbi1zZXNzaW9uLXV1aWRcIjtcbmltcG9ydCB7IGJvb2xUb0ludCwgZXNjYXBlU3RyaW5nLCBlc2NhcGVVcmwgfSBmcm9tIFwiLi4vbGliL3N0cmluZy11dGlsc1wiO1xuZXhwb3J0IGNsYXNzIEphdmFzY3JpcHRJbnN0cnVtZW50IHtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyByZWNlaXZlZCBjYWxsIGFuZCB2YWx1ZXMgZGF0YSBmcm9tIHRoZSBKUyBJbnN0cnVtZW50YXRpb25cbiAgICAgKiBpbnRvIHRoZSBmb3JtYXQgdGhhdCB0aGUgc2NoZW1hIGV4cGVjdHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEBwYXJhbSBzZW5kZXJcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJvY2Vzc0NhbGxzQW5kVmFsdWVzKGRhdGEsIHNlbmRlcikge1xuICAgICAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICAgICAgdXBkYXRlLmV4dGVuc2lvbl9zZXNzaW9uX3V1aWQgPSBleHRlbnNpb25TZXNzaW9uVXVpZDtcbiAgICAgICAgdXBkYXRlLmV2ZW50X29yZGluYWwgPSBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCgpO1xuICAgICAgICB1cGRhdGUucGFnZV9zY29wZWRfZXZlbnRfb3JkaW5hbCA9IGRhdGEub3JkaW5hbDtcbiAgICAgICAgdXBkYXRlLndpbmRvd19pZCA9IHNlbmRlci50YWIud2luZG93SWQ7XG4gICAgICAgIHVwZGF0ZS50YWJfaWQgPSBzZW5kZXIudGFiLmlkO1xuICAgICAgICB1cGRhdGUuZnJhbWVfaWQgPSBzZW5kZXIuZnJhbWVJZDtcbiAgICAgICAgdXBkYXRlLnNjcmlwdF91cmwgPSBlc2NhcGVVcmwoZGF0YS5zY3JpcHRVcmwpO1xuICAgICAgICB1cGRhdGUuc2NyaXB0X2xpbmUgPSBlc2NhcGVTdHJpbmcoZGF0YS5zY3JpcHRMaW5lKTtcbiAgICAgICAgdXBkYXRlLnNjcmlwdF9jb2wgPSBlc2NhcGVTdHJpbmcoZGF0YS5zY3JpcHRDb2wpO1xuICAgICAgICB1cGRhdGUuZnVuY19uYW1lID0gZXNjYXBlU3RyaW5nKGRhdGEuZnVuY05hbWUpO1xuICAgICAgICB1cGRhdGUuc2NyaXB0X2xvY19ldmFsID0gZXNjYXBlU3RyaW5nKGRhdGEuc2NyaXB0TG9jRXZhbCk7XG4gICAgICAgIHVwZGF0ZS5jYWxsX3N0YWNrID0gZXNjYXBlU3RyaW5nKGRhdGEuY2FsbFN0YWNrKTtcbiAgICAgICAgdXBkYXRlLnN5bWJvbCA9IGVzY2FwZVN0cmluZyhkYXRhLnN5bWJvbCk7XG4gICAgICAgIHVwZGF0ZS5vcGVyYXRpb24gPSBlc2NhcGVTdHJpbmcoZGF0YS5vcGVyYXRpb24pO1xuICAgICAgICB1cGRhdGUudmFsdWUgPSBlc2NhcGVTdHJpbmcoZGF0YS52YWx1ZSk7XG4gICAgICAgIHVwZGF0ZS50aW1lX3N0YW1wID0gZGF0YS50aW1lU3RhbXA7XG4gICAgICAgIHVwZGF0ZS5pbmNvZ25pdG8gPSBib29sVG9JbnQoc2VuZGVyLnRhYi5pbmNvZ25pdG8pO1xuICAgICAgICAvLyBkb2N1bWVudF91cmwgaXMgdGhlIGN1cnJlbnQgZnJhbWUncyBkb2N1bWVudCBocmVmXG4gICAgICAgIC8vIHRvcF9sZXZlbF91cmwgaXMgdGhlIHRvcC1sZXZlbCBmcmFtZSdzIGRvY3VtZW50IGhyZWZcbiAgICAgICAgdXBkYXRlLmRvY3VtZW50X3VybCA9IGVzY2FwZVVybChzZW5kZXIudXJsKTtcbiAgICAgICAgdXBkYXRlLnRvcF9sZXZlbF91cmwgPSBlc2NhcGVVcmwoc2VuZGVyLnRhYi51cmwpO1xuICAgICAgICBpZiAoZGF0YS5vcGVyYXRpb24gPT09IFwiY2FsbFwiICYmIGRhdGEuYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB1cGRhdGUuYXJndW1lbnRzID0gZXNjYXBlU3RyaW5nKEpTT04uc3RyaW5naWZ5KGRhdGEuYXJncykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cGRhdGU7XG4gICAgfVxuICAgIGRhdGFSZWNlaXZlcjtcbiAgICBvbk1lc3NhZ2VMaXN0ZW5lcjtcbiAgICBjb25maWd1cmVkID0gZmFsc2U7XG4gICAgcGVuZGluZ1JlY29yZHMgPSBbXTtcbiAgICBjcmF3bElEO1xuICAgIGNvbnN0cnVjdG9yKGRhdGFSZWNlaXZlcikge1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlciA9IGRhdGFSZWNlaXZlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBtZXNzYWdlcyBmcm9tIHBhZ2UvY29udGVudC9iYWNrZ3JvdW5kIHNjcmlwdHMgaW5qZWN0ZWQgdG8gaW5zdHJ1bWVudCBKYXZhU2NyaXB0IEFQSXNcbiAgICAgKi9cbiAgICBsaXN0ZW4oKSB7XG4gICAgICAgIHRoaXMub25NZXNzYWdlTGlzdGVuZXIgPSAobWVzc2FnZSwgc2VuZGVyKSA9PiB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5uYW1lc3BhY2UgJiZcbiAgICAgICAgICAgICAgICBtZXNzYWdlLm5hbWVzcGFjZSA9PT0gXCJqYXZhc2NyaXB0LWluc3RydW1lbnRhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVKc0luc3RydW1lbnRhdGlvbk1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcih0aGlzLm9uTWVzc2FnZUxpc3RlbmVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRWl0aGVyIHNlbmRzIHRoZSBsb2cgZGF0YSB0byB0aGUgZGF0YVJlY2VpdmVyIG9yIHN0b3JlIGl0IGluIG1lbW9yeVxuICAgICAqIGFzIGEgcGVuZGluZyByZWNvcmQgaWYgdGhlIEpTIGluc3RydW1lbnRhdGlvbiBpcyBub3QgeWV0IGNvbmZpZ3VyZWRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogQHBhcmFtIHNlbmRlclxuICAgICAqL1xuICAgIGhhbmRsZUpzSW5zdHJ1bWVudGF0aW9uTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJsb2dDYWxsXCI6XG4gICAgICAgICAgICBjYXNlIFwibG9nVmFsdWVcIjpcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGUgPSBKYXZhc2NyaXB0SW5zdHJ1bWVudC5wcm9jZXNzQ2FsbHNBbmRWYWx1ZXMobWVzc2FnZS5kYXRhLCBzZW5kZXIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlLmJyb3dzZXJfaWQgPSB0aGlzLmNyYXdsSUQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyLnNhdmVSZWNvcmQoXCJqYXZhc2NyaXB0XCIsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdSZWNvcmRzLnB1c2godXBkYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnRzIGxpc3RlbmluZyBpZiBoYXZlbid0IGRvbmUgc28gYWxyZWFkeSwgc2V0cyB0aGUgY3Jhd2wgSUQsXG4gICAgICogbWFya3MgdGhlIEpTIGluc3RydW1lbnRhdGlvbiBhcyBjb25maWd1cmVkIGFuZCBzZW5kcyBhbnkgcGVuZGluZ1xuICAgICAqIHJlY29yZHMgdGhhdCBoYXZlIGJlZW4gcmVjZWl2ZWQgdXAgdW50aWwgdGhpcyBwb2ludC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjcmF3bElEXG4gICAgICovXG4gICAgcnVuKGNyYXdsSUQpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uTWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3Jhd2xJRCA9IGNyYXdsSUQ7XG4gICAgICAgIHRoaXMuY29uZmlndXJlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucGVuZGluZ1JlY29yZHMubWFwKCh1cGRhdGUpID0+IHtcbiAgICAgICAgICAgIHVwZGF0ZS5icm93c2VyX2lkID0gdGhpcy5jcmF3bElEO1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIuc2F2ZVJlY29yZChcImphdmFzY3JpcHRcIiwgdXBkYXRlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHJlZ2lzdGVyQ29udGVudFNjcmlwdCh0ZXN0aW5nLCBqc0luc3RydW1lbnRhdGlvblNldHRpbmdzKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRTY3JpcHRDb25maWcgPSB7XG4gICAgICAgICAgICB0ZXN0aW5nLFxuICAgICAgICAgICAganNJbnN0cnVtZW50YXRpb25TZXR0aW5ncyxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGNvbnRlbnRTY3JpcHRDb25maWcpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IEF2b2lkIHVzaW5nIHdpbmRvdyB0byBwYXNzIHRoZSBjb250ZW50IHNjcmlwdCBjb25maWdcbiAgICAgICAgICAgIGF3YWl0IGJyb3dzZXIuY29udGVudFNjcmlwdHMucmVnaXN0ZXIoe1xuICAgICAgICAgICAgICAgIGpzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGB3aW5kb3cub3BlbldwbUNvbnRlbnRTY3JpcHRDb25maWcgPSAke0pTT04uc3RyaW5naWZ5KGNvbnRlbnRTY3JpcHRDb25maWcpfTtgLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgICAgICAgICAgICAgICBhbGxGcmFtZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgcnVuQXQ6IFwiZG9jdW1lbnRfc3RhcnRcIixcbiAgICAgICAgICAgICAgICBtYXRjaEFib3V0Qmxhbms6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnJvd3Nlci5jb250ZW50U2NyaXB0cy5yZWdpc3Rlcih7XG4gICAgICAgICAgICBqczogW3sgZmlsZTogXCIvY29udGVudC5qc1wiIH1dLFxuICAgICAgICAgICAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgICAgICAgICAgIGFsbEZyYW1lczogdHJ1ZSxcbiAgICAgICAgICAgIHJ1bkF0OiBcImRvY3VtZW50X3N0YXJ0XCIsXG4gICAgICAgICAgICBtYXRjaEFib3V0Qmxhbms6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjbGVhbnVwKCkge1xuICAgICAgICB0aGlzLnBlbmRpbmdSZWNvcmRzID0gW107XG4gICAgICAgIGlmICh0aGlzLm9uTWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKHRoaXMub25NZXNzYWdlTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYW1GMllYTmpjbWx3ZEMxcGJuTjBjblZ0Wlc1MExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwySmhZMnRuY205MWJtUXZhbUYyWVhOamNtbHdkQzFwYm5OMGNuVnRaVzUwTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVTkJMRTlCUVU4c1JVRkJSU3gxUWtGQmRVSXNSVUZCUlN4TlFVRk5MSGREUVVGM1F5eERRVUZETzBGQlEycEdMRTlCUVU4c1JVRkJSU3h2UWtGQmIwSXNSVUZCUlN4TlFVRk5MQ3RDUVVFclFpeERRVUZETzBGQlEzSkZMRTlCUVU4c1JVRkJSU3hUUVVGVExFVkJRVVVzV1VGQldTeEZRVUZGTEZOQlFWTXNSVUZCUlN4TlFVRk5MSEZDUVVGeFFpeERRVUZETzBGQlNYcEZMRTFCUVUwc1QwRkJUeXh2UWtGQmIwSTdTVUZETDBJN096czdPenRQUVUxSE8wbEJRMHNzVFVGQlRTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZ4UWp0UlFVTTVSQ3hOUVVGTkxFMUJRVTBzUjBGQlJ5eEZRVUY1UWl4RFFVRkRPMUZCUTNwRExFMUJRVTBzUTBGQlF5eHpRa0ZCYzBJc1IwRkJSeXh2UWtGQmIwSXNRMEZCUXp0UlFVTnlSQ3hOUVVGTkxFTkJRVU1zWVVGQllTeEhRVUZITEhWQ1FVRjFRaXhGUVVGRkxFTkJRVU03VVVGRGFrUXNUVUZCVFN4RFFVRkRMSGxDUVVGNVFpeEhRVUZITEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNN1VVRkRhRVFzVFVGQlRTeERRVUZETEZOQlFWTXNSMEZCUnl4TlFVRk5MRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF6dFJRVU4yUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUXpsQ0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJRenRSUVVOcVF5eE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdVVUZET1VNc1RVRkJUU3hEUVVGRExGZEJRVmNzUjBGQlJ5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJRMjVFTEUxQlFVMHNRMEZCUXl4VlFVRlZMRWRCUVVjc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXp0UlFVTnFSQ3hOUVVGTkxFTkJRVU1zVTBGQlV5eEhRVUZITEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGREwwTXNUVUZCVFN4RFFVRkRMR1ZCUVdVc1IwRkJSeXhaUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRPMUZCUXpGRUxFMUJRVTBzUTBGQlF5eFZRVUZWTEVkQlFVY3NXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dFJRVU5xUkN4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1VVRkRNVU1zVFVGQlRTeERRVUZETEZOQlFWTXNSMEZCUnl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzFGQlEyaEVMRTFCUVUwc1EwRkJReXhMUVVGTExFZEJRVWNzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRSUVVONFF5eE5RVUZOTEVOQlFVTXNWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU03VVVGRGJrTXNUVUZCVFN4RFFVRkRMRk5CUVZNc1IwRkJSeXhUUVVGVExFTkJRVU1zVFVGQlRTeERRVUZETEVkQlFVY3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRSUVVWdVJDeHZSRUZCYjBRN1VVRkRjRVFzZFVSQlFYVkVPMUZCUTNaRUxFMUJRVTBzUTBGQlF5eFpRVUZaTEVkQlFVY3NVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFJRVU0xUXl4TlFVRk5MRU5CUVVNc1lVRkJZU3hIUVVGSExGTkJRVk1zUTBGQlF5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJSV3BFTEVsQlFVa3NTVUZCU1N4RFFVRkRMRk5CUVZNc1MwRkJTeXhOUVVGTkxFbEJRVWtzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRk8xbEJRM0pFTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRE5VUTdVVUZGUkN4UFFVRlBMRTFCUVUwc1EwRkJRenRKUVVOb1FpeERRVUZETzBsQlEyZENMRmxCUVZrc1EwRkJRenRKUVVOMFFpeHBRa0ZCYVVJc1EwRkJRenRKUVVOc1FpeFZRVUZWTEVkQlFWa3NTMEZCU3l4RFFVRkRPMGxCUXpWQ0xHTkJRV01zUjBGQk1FSXNSVUZCUlN4RFFVRkRPMGxCUXpORExFOUJRVThzUTBGQlF6dEpRVVZvUWl4WlFVRlpMRmxCUVZrN1VVRkRkRUlzU1VGQlNTeERRVUZETEZsQlFWa3NSMEZCUnl4WlFVRlpMRU5CUVVNN1NVRkRia01zUTBGQlF6dEpRVVZFT3p0UFFVVkhPMGxCUTBrc1RVRkJUVHRSUVVOWUxFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1IwRkJSeXhEUVVGRExFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNSVUZCUlR0WlFVTXpReXhKUVVORkxFOUJRVThzUTBGQlF5eFRRVUZUTzJkQ1FVTnFRaXhQUVVGUExFTkJRVU1zVTBGQlV5eExRVUZMTERSQ1FVRTBRaXhGUVVOc1JEdG5Ra0ZEUVN4SlFVRkpMRU5CUVVNc09FSkJRVGhDTEVOQlFVTXNUMEZCVHl4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8yRkJRM1JFTzFGQlEwZ3NRMEZCUXl4RFFVRkRPMUZCUTBZc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4RFFVRkRPMGxCUTJoRkxFTkJRVU03U1VGRlJEczdPenM3TzA5QlRVYzdTVUZEU1N3NFFrRkJPRUlzUTBGQlF5eFBRVUZQTEVWQlFVVXNUVUZCY1VJN1VVRkRiRVVzVVVGQlVTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RlFVRkZPMWxCUTNCQ0xFdEJRVXNzVTBGQlV5eERRVUZETzFsQlEyWXNTMEZCU3l4VlFVRlZPMmRDUVVOaUxFMUJRVTBzVFVGQlRTeEhRVUZITEc5Q1FVRnZRaXhEUVVGRExIRkNRVUZ4UWl4RFFVTjJSQ3hQUVVGUExFTkJRVU1zU1VGQlNTeEZRVU5hTEUxQlFVMHNRMEZEVUN4RFFVRkRPMmRDUVVOR0xFbEJRVWtzU1VGQlNTeERRVUZETEZWQlFWVXNSVUZCUlR0dlFrRkRia0lzVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRE8yOUNRVU5xUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExGVkJRVlVzUTBGQlF5eFpRVUZaTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN2FVSkJRM0JFTzNGQ1FVRk5PMjlDUVVOTUxFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8ybENRVU5zUXp0blFrRkRSQ3hOUVVGTk8xTkJRMVE3U1VGRFNDeERRVUZETzBsQlJVUTdPenM3T3p0UFFVMUhPMGxCUTBrc1IwRkJSeXhEUVVGRExFOUJRVTg3VVVGRGFFSXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhwUWtGQmFVSXNSVUZCUlR0WlFVTXpRaXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTTdVMEZEWmp0UlFVTkVMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzVDBGQlR5eERRVUZETzFGQlEzWkNMRWxCUVVrc1EwRkJReXhWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETzFGQlEzWkNMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkZMRVZCUVVVN1dVRkRha01zVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRE8xbEJRMnBETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1ZVRkJWU3hEUVVGRExGbEJRVmtzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0UlFVTnlSQ3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU5NTEVOQlFVTTdTVUZGVFN4TFFVRkxMRU5CUVVNc2NVSkJRWEZDTEVOQlEyaERMRTlCUVdkQ0xFVkJRMmhDTEhsQ1FVRm5SRHRSUVVWb1JDeE5RVUZOTEcxQ1FVRnRRaXhIUVVGSE8xbEJRekZDTEU5QlFVODdXVUZEVUN4NVFrRkJlVUk3VTBGRE1VSXNRMEZCUXp0UlFVTkdMRWxCUVVrc2JVSkJRVzFDTEVWQlFVVTdXVUZEZGtJc05rUkJRVFpFTzFsQlF6ZEVMRTFCUVUwc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eFJRVUZSTEVOQlFVTTdaMEpCUTNCRExFVkJRVVVzUlVGQlJUdHZRa0ZEUmp0M1FrRkRSU3hKUVVGSkxFVkJRVVVzZFVOQlFYVkRMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRM3BFTEcxQ1FVRnRRaXhEUVVOd1FpeEhRVUZITzNGQ1FVTk1PMmxDUVVOR08yZENRVU5FTEU5QlFVOHNSVUZCUlN4RFFVRkRMRmxCUVZrc1EwRkJRenRuUWtGRGRrSXNVMEZCVXl4RlFVRkZMRWxCUVVrN1owSkJRMllzUzBGQlN5eEZRVUZGTEdkQ1FVRm5RanRuUWtGRGRrSXNaVUZCWlN4RlFVRkZMRWxCUVVrN1lVRkRkRUlzUTBGQlF5eERRVUZETzFOQlEwbzdVVUZEUkN4UFFVRlBMRTlCUVU4c1EwRkJReXhqUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETzFsQlEzSkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzU1VGQlNTeEZRVUZGTEdGQlFXRXNSVUZCUlN4RFFVRkRPMWxCUXpkQ0xFOUJRVThzUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXp0WlFVTjJRaXhUUVVGVExFVkJRVVVzU1VGQlNUdFpRVU5tTEV0QlFVc3NSVUZCUlN4blFrRkJaMEk3V1VGRGRrSXNaVUZCWlN4RlFVRkZMRWxCUVVrN1UwRkRkRUlzUTBGQlF5eERRVUZETzBsQlEwd3NRMEZCUXp0SlFVVk5MRTlCUVU4N1VVRkRXaXhKUVVGSkxFTkJRVU1zWTBGQll5eEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjZRaXhKUVVGSkxFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1JVRkJSVHRaUVVNeFFpeFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFTkJRVU03VTBGRGJFVTdTVUZEU0N4RFFVRkRPME5CUTBZaWZRPT0iLCJpbXBvcnQgeyBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCB9IGZyb20gXCIuLi9saWIvZXh0ZW5zaW9uLXNlc3Npb24tZXZlbnQtb3JkaW5hbFwiO1xuaW1wb3J0IHsgZXh0ZW5zaW9uU2Vzc2lvblV1aWQgfSBmcm9tIFwiLi4vbGliL2V4dGVuc2lvbi1zZXNzaW9uLXV1aWRcIjtcbmltcG9ydCB7IFBlbmRpbmdOYXZpZ2F0aW9uIH0gZnJvbSBcIi4uL2xpYi9wZW5kaW5nLW5hdmlnYXRpb25cIjtcbmltcG9ydCB7IGJvb2xUb0ludCwgZXNjYXBlU3RyaW5nLCBlc2NhcGVVcmwgfSBmcm9tIFwiLi4vbGliL3N0cmluZy11dGlsc1wiO1xuaW1wb3J0IHsgbWFrZVVVSUQgfSBmcm9tIFwiLi4vbGliL3V1aWRcIjtcbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1XZWJOYXZpZ2F0aW9uQmFzZUV2ZW50RGV0YWlsc1RvT3BlbldQTVNjaGVtYSA9IGFzeW5jIChjcmF3bElELCBkZXRhaWxzKSA9PiB7XG4gICAgY29uc3QgdGFiID0gZGV0YWlscy50YWJJZCA+IC0xXG4gICAgICAgID8gYXdhaXQgYnJvd3Nlci50YWJzLmdldChkZXRhaWxzLnRhYklkKVxuICAgICAgICA6IHtcbiAgICAgICAgICAgIHdpbmRvd0lkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmNvZ25pdG86IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNvb2tpZVN0b3JlSWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9wZW5lclRhYklkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaGVpZ2h0OiB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgY29uc3Qgd2luZG93ID0gdGFiLndpbmRvd0lkXG4gICAgICAgID8gYXdhaXQgYnJvd3Nlci53aW5kb3dzLmdldCh0YWIud2luZG93SWQpXG4gICAgICAgIDogeyB3aWR0aDogdW5kZWZpbmVkLCBoZWlnaHQ6IHVuZGVmaW5lZCwgdHlwZTogdW5kZWZpbmVkIH07XG4gICAgY29uc3QgbmF2aWdhdGlvbiA9IHtcbiAgICAgICAgYnJvd3Nlcl9pZDogY3Jhd2xJRCxcbiAgICAgICAgaW5jb2duaXRvOiBib29sVG9JbnQodGFiLmluY29nbml0byksXG4gICAgICAgIGV4dGVuc2lvbl9zZXNzaW9uX3V1aWQ6IGV4dGVuc2lvblNlc3Npb25VdWlkLFxuICAgICAgICBwcm9jZXNzX2lkOiBkZXRhaWxzLnByb2Nlc3NJZCxcbiAgICAgICAgd2luZG93X2lkOiB0YWIud2luZG93SWQsXG4gICAgICAgIHRhYl9pZDogZGV0YWlscy50YWJJZCxcbiAgICAgICAgdGFiX29wZW5lcl90YWJfaWQ6IHRhYi5vcGVuZXJUYWJJZCxcbiAgICAgICAgZnJhbWVfaWQ6IGRldGFpbHMuZnJhbWVJZCxcbiAgICAgICAgd2luZG93X3dpZHRoOiB3aW5kb3cud2lkdGgsXG4gICAgICAgIHdpbmRvd19oZWlnaHQ6IHdpbmRvdy5oZWlnaHQsXG4gICAgICAgIHdpbmRvd190eXBlOiB3aW5kb3cudHlwZSxcbiAgICAgICAgdGFiX3dpZHRoOiB0YWIud2lkdGgsXG4gICAgICAgIHRhYl9oZWlnaHQ6IHRhYi5oZWlnaHQsXG4gICAgICAgIHRhYl9jb29raWVfc3RvcmVfaWQ6IGVzY2FwZVN0cmluZyh0YWIuY29va2llU3RvcmVJZCksXG4gICAgICAgIHV1aWQ6IG1ha2VVVUlEKCksXG4gICAgICAgIHVybDogZXNjYXBlVXJsKGRldGFpbHMudXJsKSxcbiAgICB9O1xuICAgIHJldHVybiBuYXZpZ2F0aW9uO1xufTtcbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uSW5zdHJ1bWVudCB7XG4gICAgc3RhdGljIG5hdmlnYXRpb25JZChwcm9jZXNzSWQsIHRhYklkLCBmcmFtZUlkKSB7XG4gICAgICAgIHJldHVybiBgJHtwcm9jZXNzSWR9LSR7dGFiSWR9LSR7ZnJhbWVJZH1gO1xuICAgIH1cbiAgICBkYXRhUmVjZWl2ZXI7XG4gICAgb25CZWZvcmVOYXZpZ2F0ZUxpc3RlbmVyO1xuICAgIG9uQ29tbWl0dGVkTGlzdGVuZXI7XG4gICAgcGVuZGluZ05hdmlnYXRpb25zID0ge307XG4gICAgY29uc3RydWN0b3IoZGF0YVJlY2VpdmVyKSB7XG4gICAgICAgIHRoaXMuZGF0YVJlY2VpdmVyID0gZGF0YVJlY2VpdmVyO1xuICAgIH1cbiAgICBydW4oY3Jhd2xJRCkge1xuICAgICAgICB0aGlzLm9uQmVmb3JlTmF2aWdhdGVMaXN0ZW5lciA9IGFzeW5jIChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uSWQgPSBOYXZpZ2F0aW9uSW5zdHJ1bWVudC5uYXZpZ2F0aW9uSWQoZGV0YWlscy5wcm9jZXNzSWQsIGRldGFpbHMudGFiSWQsIGRldGFpbHMuZnJhbWVJZCk7XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nTmF2aWdhdGlvbiA9IHRoaXMuaW5zdGFudGlhdGVQZW5kaW5nTmF2aWdhdGlvbihuYXZpZ2F0aW9uSWQpO1xuICAgICAgICAgICAgY29uc3QgbmF2aWdhdGlvbiA9IGF3YWl0IHRyYW5zZm9ybVdlYk5hdmlnYXRpb25CYXNlRXZlbnREZXRhaWxzVG9PcGVuV1BNU2NoZW1hKGNyYXdsSUQsIGRldGFpbHMpO1xuICAgICAgICAgICAgbmF2aWdhdGlvbi5wYXJlbnRfZnJhbWVfaWQgPSBkZXRhaWxzLnBhcmVudEZyYW1lSWQ7XG4gICAgICAgICAgICBuYXZpZ2F0aW9uLmJlZm9yZV9uYXZpZ2F0ZV9ldmVudF9vcmRpbmFsID0gaW5jcmVtZW50ZWRFdmVudE9yZGluYWwoKTtcbiAgICAgICAgICAgIG5hdmlnYXRpb24uYmVmb3JlX25hdmlnYXRlX3RpbWVfc3RhbXAgPSBuZXcgRGF0ZShkZXRhaWxzLnRpbWVTdGFtcCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIHBlbmRpbmdOYXZpZ2F0aW9uLnJlc29sdmVPbkJlZm9yZU5hdmlnYXRlRXZlbnROYXZpZ2F0aW9uKG5hdmlnYXRpb24pO1xuICAgICAgICB9O1xuICAgICAgICBicm93c2VyLndlYk5hdmlnYXRpb24ub25CZWZvcmVOYXZpZ2F0ZS5hZGRMaXN0ZW5lcih0aGlzLm9uQmVmb3JlTmF2aWdhdGVMaXN0ZW5lcik7XG4gICAgICAgIHRoaXMub25Db21taXR0ZWRMaXN0ZW5lciA9IGFzeW5jIChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uSWQgPSBOYXZpZ2F0aW9uSW5zdHJ1bWVudC5uYXZpZ2F0aW9uSWQoZGV0YWlscy5wcm9jZXNzSWQsIGRldGFpbHMudGFiSWQsIGRldGFpbHMuZnJhbWVJZCk7XG4gICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uID0gYXdhaXQgdHJhbnNmb3JtV2ViTmF2aWdhdGlvbkJhc2VFdmVudERldGFpbHNUb09wZW5XUE1TY2hlbWEoY3Jhd2xJRCwgZGV0YWlscyk7XG4gICAgICAgICAgICBuYXZpZ2F0aW9uLnRyYW5zaXRpb25fcXVhbGlmaWVycyA9IGVzY2FwZVN0cmluZyhKU09OLnN0cmluZ2lmeShkZXRhaWxzLnRyYW5zaXRpb25RdWFsaWZpZXJzKSk7XG4gICAgICAgICAgICBuYXZpZ2F0aW9uLnRyYW5zaXRpb25fdHlwZSA9IGVzY2FwZVN0cmluZyhkZXRhaWxzLnRyYW5zaXRpb25UeXBlKTtcbiAgICAgICAgICAgIG5hdmlnYXRpb24uY29tbWl0dGVkX2V2ZW50X29yZGluYWwgPSBpbmNyZW1lbnRlZEV2ZW50T3JkaW5hbCgpO1xuICAgICAgICAgICAgbmF2aWdhdGlvbi5jb21taXR0ZWRfdGltZV9zdGFtcCA9IG5ldyBEYXRlKGRldGFpbHMudGltZVN0YW1wKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgLy8gaW5jbHVkZSBhdHRyaWJ1dGVzIGZyb20gdGhlIGNvcnJlc3BvbmRpbmcgb25CZWZvcmVOYXZpZ2F0aW9uIGV2ZW50XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nTmF2aWdhdGlvbiA9IHRoaXMuZ2V0UGVuZGluZ05hdmlnYXRpb24obmF2aWdhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nTmF2aWdhdGlvbikge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdOYXZpZ2F0aW9uLnJlc29sdmVPbkNvbW1pdHRlZEV2ZW50TmF2aWdhdGlvbihuYXZpZ2F0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IGF3YWl0IHBlbmRpbmdOYXZpZ2F0aW9uLnJlc29sdmVkV2l0aGluVGltZW91dCgxMDAwKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbiA9IGF3YWl0IHBlbmRpbmdOYXZpZ2F0aW9uLm9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb247XG4gICAgICAgICAgICAgICAgICAgIG5hdmlnYXRpb24ucGFyZW50X2ZyYW1lX2lkID1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb24ucGFyZW50X2ZyYW1lX2lkO1xuICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0aW9uLmJlZm9yZV9uYXZpZ2F0ZV9ldmVudF9vcmRpbmFsID1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb24uYmVmb3JlX25hdmlnYXRlX2V2ZW50X29yZGluYWw7XG4gICAgICAgICAgICAgICAgICAgIG5hdmlnYXRpb24uYmVmb3JlX25hdmlnYXRlX3RpbWVfc3RhbXAgPVxuICAgICAgICAgICAgICAgICAgICAgICAgb25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbi5iZWZvcmVfbmF2aWdhdGVfdGltZV9zdGFtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFSZWNlaXZlci5zYXZlUmVjb3JkKFwibmF2aWdhdGlvbnNcIiwgbmF2aWdhdGlvbik7XG4gICAgICAgIH07XG4gICAgICAgIGJyb3dzZXIud2ViTmF2aWdhdGlvbi5vbkNvbW1pdHRlZC5hZGRMaXN0ZW5lcih0aGlzLm9uQ29tbWl0dGVkTGlzdGVuZXIpO1xuICAgIH1cbiAgICBjbGVhbnVwKCkge1xuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZU5hdmlnYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGJyb3dzZXIud2ViTmF2aWdhdGlvbi5vbkJlZm9yZU5hdmlnYXRlLnJlbW92ZUxpc3RlbmVyKHRoaXMub25CZWZvcmVOYXZpZ2F0ZUxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vbkNvbW1pdHRlZExpc3RlbmVyKSB7XG4gICAgICAgICAgICBicm93c2VyLndlYk5hdmlnYXRpb24ub25Db21taXR0ZWQucmVtb3ZlTGlzdGVuZXIodGhpcy5vbkNvbW1pdHRlZExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbnN0YW50aWF0ZVBlbmRpbmdOYXZpZ2F0aW9uKG5hdmlnYXRpb25JZCkge1xuICAgICAgICB0aGlzLnBlbmRpbmdOYXZpZ2F0aW9uc1tuYXZpZ2F0aW9uSWRdID0gbmV3IFBlbmRpbmdOYXZpZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdOYXZpZ2F0aW9uc1tuYXZpZ2F0aW9uSWRdO1xuICAgIH1cbiAgICBnZXRQZW5kaW5nTmF2aWdhdGlvbihuYXZpZ2F0aW9uSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ05hdmlnYXRpb25zW25hdmlnYXRpb25JZF07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYm1GMmFXZGhkR2x2YmkxcGJuTjBjblZ0Wlc1MExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwySmhZMnRuY205MWJtUXZibUYyYVdkaGRHbHZiaTFwYm5OMGNuVnRaVzUwTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTlCUVU4c1JVRkJSU3gxUWtGQmRVSXNSVUZCUlN4TlFVRk5MSGREUVVGM1F5eERRVUZETzBGQlEycEdMRTlCUVU4c1JVRkJSU3h2UWtGQmIwSXNSVUZCUlN4TlFVRk5MQ3RDUVVFclFpeERRVUZETzBGQlEzSkZMRTlCUVU4c1JVRkJSU3hwUWtGQmFVSXNSVUZCUlN4TlFVRk5MREpDUVVFeVFpeERRVUZETzBGQlF6bEVMRTlCUVU4c1JVRkJSU3hUUVVGVExFVkJRVVVzV1VGQldTeEZRVUZGTEZOQlFWTXNSVUZCUlN4TlFVRk5MSEZDUVVGeFFpeERRVUZETzBGQlEzcEZMRTlCUVU4c1JVRkJSU3hSUVVGUkxFVkJRVVVzVFVGQlRTeGhRVUZoTEVOQlFVTTdRVUZSZGtNc1RVRkJUU3hEUVVGRExFMUJRVTBzY1VSQlFYRkVMRWRCUVVjc1MwRkJTeXhGUVVONFJTeFBRVUZQTEVWQlExQXNUMEZCYzBNc1JVRkRha0lzUlVGQlJUdEpRVU4yUWl4TlFVRk5MRWRCUVVjc1IwRkRVQ3hQUVVGUExFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTm9RaXhEUVVGRExFTkJRVU1zVFVGQlRTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETzFGQlEzWkRMRU5CUVVNc1EwRkJRenRaUVVORkxGRkJRVkVzUlVGQlJTeFRRVUZUTzFsQlEyNUNMRk5CUVZNc1JVRkJSU3hUUVVGVE8xbEJRM0JDTEdGQlFXRXNSVUZCUlN4VFFVRlRPMWxCUTNoQ0xGZEJRVmNzUlVGQlJTeFRRVUZUTzFsQlEzUkNMRXRCUVVzc1JVRkJSU3hUUVVGVE8xbEJRMmhDTEUxQlFVMHNSVUZCUlN4VFFVRlRPMU5CUTJ4Q0xFTkJRVU03U1VGRFVpeE5RVUZOTEUxQlFVMHNSMEZCUnl4SFFVRkhMRU5CUVVNc1VVRkJVVHRSUVVONlFpeERRVUZETEVOQlFVTXNUVUZCVFN4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRPMUZCUTNwRExFTkJRVU1zUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4VFFVRlRMRVZCUVVVc1RVRkJUU3hGUVVGRkxGTkJRVk1zUlVGQlJTeEpRVUZKTEVWQlFVVXNVMEZCVXl4RlFVRkZMRU5CUVVNN1NVRkROMFFzVFVGQlRTeFZRVUZWTEVkQlFXVTdVVUZETjBJc1ZVRkJWU3hGUVVGRkxFOUJRVTg3VVVGRGJrSXNVMEZCVXl4RlFVRkZMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETzFGQlEyNURMSE5DUVVGelFpeEZRVUZGTEc5Q1FVRnZRanRSUVVNMVF5eFZRVUZWTEVWQlFVVXNUMEZCVHl4RFFVRkRMRk5CUVZNN1VVRkROMElzVTBGQlV5eEZRVUZGTEVkQlFVY3NRMEZCUXl4UlFVRlJPMUZCUTNaQ0xFMUJRVTBzUlVGQlJTeFBRVUZQTEVOQlFVTXNTMEZCU3p0UlFVTnlRaXhwUWtGQmFVSXNSVUZCUlN4SFFVRkhMRU5CUVVNc1YwRkJWenRSUVVOc1F5eFJRVUZSTEVWQlFVVXNUMEZCVHl4RFFVRkRMRTlCUVU4N1VVRkRla0lzV1VGQldTeEZRVUZGTEUxQlFVMHNRMEZCUXl4TFFVRkxPMUZCUXpGQ0xHRkJRV0VzUlVGQlJTeE5RVUZOTEVOQlFVTXNUVUZCVFR0UlFVTTFRaXhYUVVGWExFVkJRVVVzVFVGQlRTeERRVUZETEVsQlFVazdVVUZEZUVJc1UwRkJVeXhGUVVGRkxFZEJRVWNzUTBGQlF5eExRVUZMTzFGQlEzQkNMRlZCUVZVc1JVRkJSU3hIUVVGSExFTkJRVU1zVFVGQlRUdFJRVU4wUWl4dFFrRkJiVUlzUlVGQlJTeFpRVUZaTEVOQlFVTXNSMEZCUnl4RFFVRkRMR0ZCUVdFc1EwRkJRenRSUVVOd1JDeEpRVUZKTEVWQlFVVXNVVUZCVVN4RlFVRkZPMUZCUTJoQ0xFZEJRVWNzUlVGQlJTeFRRVUZUTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJRenRMUVVNMVFpeERRVUZETzBsQlEwWXNUMEZCVHl4VlFVRlZMRU5CUVVNN1FVRkRjRUlzUTBGQlF5eERRVUZETzBGQlJVWXNUVUZCVFN4UFFVRlBMRzlDUVVGdlFqdEpRVU40UWl4TlFVRk5MRU5CUVVNc1dVRkJXU3hEUVVGRExGTkJRVk1zUlVGQlJTeExRVUZMTEVWQlFVVXNUMEZCVHp0UlFVTnNSQ3hQUVVGUExFZEJRVWNzVTBGQlV5eEpRVUZKTEV0QlFVc3NTVUZCU1N4UFFVRlBMRVZCUVVVc1EwRkJRenRKUVVNMVF5eERRVUZETzBsQlEyZENMRmxCUVZrc1EwRkJRenRKUVVOMFFpeDNRa0ZCZDBJc1EwRkJRenRKUVVONlFpeHRRa0ZCYlVJc1EwRkJRenRKUVVOd1FpeHJRa0ZCYTBJc1IwRkZkRUlzUlVGQlJTeERRVUZETzBsQlJWQXNXVUZCV1N4WlFVRlpPMUZCUTNSQ0xFbEJRVWtzUTBGQlF5eFpRVUZaTEVkQlFVY3NXVUZCV1N4RFFVRkRPMGxCUTI1RExFTkJRVU03U1VGRlRTeEhRVUZITEVOQlFVTXNUMEZCVHp0UlFVTm9RaXhKUVVGSkxFTkJRVU1zZDBKQlFYZENMRWRCUVVjc1MwRkJTeXhGUVVOdVF5eFBRVUZyUkN4RlFVTnNSQ3hGUVVGRk8xbEJRMFlzVFVGQlRTeFpRVUZaTEVkQlFVY3NiMEpCUVc5Q0xFTkJRVU1zV1VGQldTeERRVU53UkN4UFFVRlBMRU5CUVVNc1UwRkJVeXhGUVVOcVFpeFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVTmlMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRMmhDTEVOQlFVTTdXVUZEUml4TlFVRk5MR2xDUVVGcFFpeEhRVUZITEVsQlFVa3NRMEZCUXl3MFFrRkJORUlzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0WlFVTXhSU3hOUVVGTkxGVkJRVlVzUjBGRFpDeE5RVUZOTEhGRVFVRnhSQ3hEUVVONlJDeFBRVUZQTEVWQlExQXNUMEZCVHl4RFFVTlNMRU5CUVVNN1dVRkRTaXhWUVVGVkxFTkJRVU1zWlVGQlpTeEhRVUZITEU5QlFVOHNRMEZCUXl4aFFVRmhMRU5CUVVNN1dVRkRia1FzVlVGQlZTeERRVUZETERaQ1FVRTJRaXhIUVVGSExIVkNRVUYxUWl4RlFVRkZMRU5CUVVNN1dVRkRja1VzVlVGQlZTeERRVUZETERCQ1FVRXdRaXhIUVVGSExFbEJRVWtzU1VGQlNTeERRVU01UXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVOc1FpeERRVUZETEZkQlFWY3NSVUZCUlN4RFFVRkRPMWxCUTJoQ0xHbENRVUZwUWl4RFFVRkRMSE5EUVVGelF5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUTNaRkxFTkJRVU1zUTBGQlF6dFJRVU5HTEU5QlFVOHNRMEZCUXl4aFFVRmhMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNWMEZCVnl4RFFVTm9SQ3hKUVVGSkxFTkJRVU1zZDBKQlFYZENMRU5CUXpsQ0xFTkJRVU03VVVGRFJpeEpRVUZKTEVOQlFVTXNiVUpCUVcxQ0xFZEJRVWNzUzBGQlN5eEZRVU01UWl4UFFVRTJReXhGUVVNM1F5eEZRVUZGTzFsQlEwWXNUVUZCVFN4WlFVRlpMRWRCUVVjc2IwSkJRVzlDTEVOQlFVTXNXVUZCV1N4RFFVTndSQ3hQUVVGUExFTkJRVU1zVTBGQlV5eEZRVU5xUWl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVOaUxFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlEyaENMRU5CUVVNN1dVRkRSaXhOUVVGTkxGVkJRVlVzUjBGRFpDeE5RVUZOTEhGRVFVRnhSQ3hEUVVONlJDeFBRVUZQTEVWQlExQXNUMEZCVHl4RFFVTlNMRU5CUVVNN1dVRkRTaXhWUVVGVkxFTkJRVU1zY1VKQlFYRkNMRWRCUVVjc1dVRkJXU3hEUVVNM1F5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTlCUVU4c1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4RFFVTTNReXhEUVVGRE8xbEJRMFlzVlVGQlZTeERRVUZETEdWQlFXVXNSMEZCUnl4WlFVRlpMRU5CUVVNc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzFsQlEyeEZMRlZCUVZVc1EwRkJReXgxUWtGQmRVSXNSMEZCUnl4MVFrRkJkVUlzUlVGQlJTeERRVUZETzFsQlF5OUVMRlZCUVZVc1EwRkJReXh2UWtGQmIwSXNSMEZCUnl4SlFVRkpMRWxCUVVrc1EwRkRlRU1zVDBGQlR5eERRVUZETEZOQlFWTXNRMEZEYkVJc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF6dFpRVVZvUWl4eFJVRkJjVVU3V1VGRGNrVXNUVUZCVFN4cFFrRkJhVUlzUjBGQlJ5eEpRVUZKTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zV1VGQldTeERRVUZETEVOQlFVTTdXVUZEYkVVc1NVRkJTU3hwUWtGQmFVSXNSVUZCUlR0blFrRkRja0lzYVVKQlFXbENMRU5CUVVNc2FVTkJRV2xETEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1owSkJRMmhGTEUxQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc2FVSkJRV2xDTEVOQlFVTXNjVUpCUVhGQ0xFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUTNKRkxFbEJRVWtzVVVGQlVTeEZRVUZGTzI5Q1FVTmFMRTFCUVUwc0swSkJRU3RDTEVkQlEyNURMRTFCUVUwc2FVSkJRV2xDTEVOQlFVTXNLMEpCUVN0Q0xFTkJRVU03YjBKQlF6RkVMRlZCUVZVc1EwRkJReXhsUVVGbE8zZENRVU40UWl3clFrRkJLMElzUTBGQlF5eGxRVUZsTEVOQlFVTTdiMEpCUTJ4RUxGVkJRVlVzUTBGQlF5dzJRa0ZCTmtJN2QwSkJRM1JETEN0Q1FVRXJRaXhEUVVGRExEWkNRVUUyUWl4RFFVRkRPMjlDUVVOb1JTeFZRVUZWTEVOQlFVTXNNRUpCUVRCQ08zZENRVU51UXl3clFrRkJLMElzUTBGQlF5d3dRa0ZCTUVJc1EwRkJRenRwUWtGRE9VUTdZVUZEUmp0WlFVVkVMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVlVGQlZTeERRVUZETEdGQlFXRXNSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVNeFJDeERRVUZETEVOQlFVTTdVVUZEUml4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVOQlFVTTdTVUZETVVVc1EwRkJRenRKUVVWTkxFOUJRVTg3VVVGRFdpeEpRVUZKTEVsQlFVa3NRMEZCUXl4M1FrRkJkMElzUlVGQlJUdFpRVU5xUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMR05CUVdNc1EwRkRia1FzU1VGQlNTeERRVUZETEhkQ1FVRjNRaXhEUVVNNVFpeERRVUZETzFOQlEwZzdVVUZEUkN4SlFVRkpMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNSVUZCUlR0WlFVTTFRaXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEZkQlFWY3NRMEZCUXl4alFVRmpMRU5CUXpsRExFbEJRVWtzUTBGQlF5eHRRa0ZCYlVJc1EwRkRla0lzUTBGQlF6dFRRVU5JTzBsQlEwZ3NRMEZCUXp0SlFVVlBMRFJDUVVFMFFpeERRVU5zUXl4WlFVRnZRanRSUVVWd1FpeEpRVUZKTEVOQlFVTXNhMEpCUVd0Q0xFTkJRVU1zV1VGQldTeERRVUZETEVkQlFVY3NTVUZCU1N4cFFrRkJhVUlzUlVGQlJTeERRVUZETzFGQlEyaEZMRTlCUVU4c1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGRE8wbEJReTlETEVOQlFVTTdTVUZGVHl4dlFrRkJiMElzUTBGQlF5eFpRVUZ2UWp0UlFVTXZReXhQUVVGUExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dEpRVU12UXl4RFFVRkRPME5CUTBZaWZRPT0iLCJpbXBvcnQgeyBnZXRJbnN0cnVtZW50SlMgfSBmcm9tIFwiLi4vbGliL2pzLWluc3RydW1lbnRzXCI7XG5pbXBvcnQgeyBwYWdlU2NyaXB0IH0gZnJvbSBcIi4vamF2YXNjcmlwdC1pbnN0cnVtZW50LXBhZ2Utc2NvcGVcIjtcbmZ1bmN0aW9uIGdldFBhZ2VTY3JpcHRBc1N0cmluZyhqc0luc3RydW1lbnRhdGlvblNldHRpbmdzKSB7XG4gICAgLy8gVGhlIEpTIEluc3RydW1lbnQgUmVxdWVzdHMgYXJlIHNldHVwIGFuZCB2YWxpZGF0ZWQgcHl0aG9uIHNpZGVcbiAgICAvLyBpbmNsdWRpbmcgc2V0dGluZyBkZWZhdWx0cyBmb3IgbG9nU2V0dGluZ3MuIFNlZSBKU0luc3RydW1lbnRhdGlvbi5weVxuICAgIGNvbnN0IHBhZ2VTY3JpcHRTdHJpbmcgPSBgXG4vLyBTdGFydCBvZiBqcy1pbnN0cnVtZW50cy5cbiR7Z2V0SW5zdHJ1bWVudEpTfVxuLy8gRW5kIG9mIGpzLWluc3RydW1lbnRzLlxuXG4vLyBTdGFydCBvZiBjdXN0b20gaW5zdHJ1bWVudFJlcXVlc3RzLlxuY29uc3QganNJbnN0cnVtZW50YXRpb25TZXR0aW5ncyA9ICR7SlNPTi5zdHJpbmdpZnkoanNJbnN0cnVtZW50YXRpb25TZXR0aW5ncyl9O1xuLy8gRW5kIG9mIGN1c3RvbSBpbnN0cnVtZW50UmVxdWVzdHMuXG5cbi8vIFN0YXJ0IG9mIGFub255bW91cyBmdW5jdGlvbiBmcm9tIGphdmFzY3JpcHQtaW5zdHJ1bWVudC1wYWdlLXNjb3BlLnRzXG4oJHtwYWdlU2NyaXB0fShnZXRJbnN0cnVtZW50SlMsIGpzSW5zdHJ1bWVudGF0aW9uU2V0dGluZ3MpKTtcbi8vIEVuZC5cbiAgYDtcbiAgICByZXR1cm4gcGFnZVNjcmlwdFN0cmluZztcbn1cbjtcbmZ1bmN0aW9uIGluc2VydFNjcmlwdChwYWdlU2NyaXB0U3RyaW5nLCBldmVudElkLCB0ZXN0aW5nID0gZmFsc2UpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICBzY3JpcHQudGV4dCA9IHBhZ2VTY3JpcHRTdHJpbmc7XG4gICAgc2NyaXB0LmFzeW5jID0gZmFsc2U7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtZXZlbnQtaWRcIiwgZXZlbnRJZCk7XG4gICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtdGVzdGluZ1wiLCBgJHt0ZXN0aW5nfWApO1xuICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoc2NyaXB0LCBwYXJlbnQuZmlyc3RDaGlsZCk7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHNjcmlwdCk7XG59XG47XG5mdW5jdGlvbiBlbWl0TXNnKHR5cGUsIG1zZykge1xuICAgIG1zZy50aW1lU3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgbmFtZXNwYWNlOiBcImphdmFzY3JpcHQtaW5zdHJ1bWVudGF0aW9uXCIsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGRhdGE6IG1zZyxcbiAgICB9KTtcbn1cbjtcbmNvbnN0IGV2ZW50SWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCk7XG4vLyBsaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gdGhlIHNjcmlwdCB3ZSBhcmUgYWJvdXQgdG8gaW5zZXJ0XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50SWQsIChlKSA9PiB7XG4gICAgLy8gcGFzcyB0aGVzZSBvbiB0byB0aGUgYmFja2dyb3VuZCBwYWdlXG4gICAgY29uc3QgbXNncyA9IGUuZGV0YWlsO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1zZ3MpKSB7XG4gICAgICAgIG1zZ3MuZm9yRWFjaCgobXNnKSA9PiB7XG4gICAgICAgICAgICBlbWl0TXNnKG1zZy50eXBlLCBtc2cuY29udGVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZW1pdE1zZyhtc2dzLnR5cGUsIG1zZ3MuY29udGVudCk7XG4gICAgfVxufSk7XG5leHBvcnQgY29uc3QgaW5qZWN0SmF2YXNjcmlwdEluc3RydW1lbnRQYWdlU2NyaXB0ID0gKGNvbnRlbnRTY3JpcHRDb25maWcpID0+IHtcbiAgICBpbnNlcnRTY3JpcHQoZ2V0UGFnZVNjcmlwdEFzU3RyaW5nKGNvbnRlbnRTY3JpcHRDb25maWcuanNJbnN0cnVtZW50YXRpb25TZXR0aW5ncyksIGV2ZW50SWQsIGNvbnRlbnRTY3JpcHRDb25maWcudGVzdGluZyk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYW1GMllYTmpjbWx3ZEMxcGJuTjBjblZ0Wlc1MExXTnZiblJsYm5RdGMyTnZjR1V1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WTI5dWRHVnVkQzlxWVhaaGMyTnlhWEIwTFdsdWMzUnlkVzFsYm5RdFkyOXVkR1Z1ZEMxelkyOXdaUzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNaVUZCWlN4RlFVRjFRaXhOUVVGTkxIVkNRVUYxUWl4RFFVRkRPMEZCUXpkRkxFOUJRVThzUlVGQlJTeFZRVUZWTEVWQlFVVXNUVUZCVFN4dlEwRkJiME1zUTBGQlF6dEJRVWRvUlN4VFFVRlRMSEZDUVVGeFFpeERRVU0xUWl4NVFrRkJaMFE3U1VGRmFFUXNhVVZCUVdsRk8wbEJRMnBGTEhWRlFVRjFSVHRKUVVOMlJTeE5RVUZOTEdkQ1FVRm5RaXhIUVVGSE96dEZRVVY2UWl4bFFVRmxPenM3TzI5RFFVbHRRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEhsQ1FVRjVRaXhEUVVGRE96czdPMGRCU1RGRkxGVkJRVlU3TzBkQlJWWXNRMEZCUXp0SlFVTkdMRTlCUVU4c1owSkJRV2RDTEVOQlFVTTdRVUZETVVJc1EwRkJRenRCUVVGQkxFTkJRVU03UVVGRlJpeFRRVUZUTEZsQlFWa3NRMEZEYmtJc1owSkJRWGRDTEVWQlEzaENMRTlCUVdVc1JVRkRaaXhWUVVGdFFpeExRVUZMTzBsQlJYaENMRTFCUVUwc1RVRkJUU3hIUVVGSExGRkJRVkVzUTBGQlF5eGxRVUZsTEVOQlFVTTdTVUZEZUVNc1RVRkJUU3hOUVVGTkxFZEJRVWNzVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRKUVVOb1JDeE5RVUZOTEVOQlFVTXNTVUZCU1N4SFFVRkhMR2RDUVVGblFpeERRVUZETzBsQlF5OUNMRTFCUVUwc1EwRkJReXhMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETzBsQlEzSkNMRTFCUVUwc1EwRkJReXhaUVVGWkxFTkJRVU1zWlVGQlpTeEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRPMGxCUXpsRExFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTXNZMEZCWXl4RlFVRkZMRWRCUVVjc1QwRkJUeXhGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU5zUkN4TlFVRk5MRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzUlVGQlJTeE5RVUZOTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1NVRkRMME1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRCUVVNM1FpeERRVUZETzBGQlFVRXNRMEZCUXp0QlFVVkdMRk5CUVZNc1QwRkJUeXhEUVVGRkxFbEJRVWtzUlVGQlJTeEhRVUZITzBsQlEzcENMRWRCUVVjc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeEpRVUZKTEVWQlFVVXNRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenRKUVVONlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRmRCUVZjc1EwRkJRenRSUVVNeFFpeFRRVUZUTEVWQlFVVXNORUpCUVRSQ08xRkJRM1pETEVsQlFVazdVVUZEU2l4SlFVRkpMRVZCUVVVc1IwRkJSenRMUVVOV0xFTkJRVU1zUTBGQlF6dEJRVU5NTEVOQlFVTTdRVUZCUVN4RFFVRkRPMEZCUlVZc1RVRkJUU3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRE8wRkJSWHBETERaRVFVRTJSRHRCUVVNM1JDeFJRVUZSTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTXNRMEZCWXl4RlFVRkZMRVZCUVVVN1NVRkRjRVFzZFVOQlFYVkRPMGxCUTNaRExFMUJRVTBzU1VGQlNTeEhRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNN1NVRkRkRUlzU1VGQlNTeExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRk8xRkJRM1pDTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUlVGQlJUdFpRVU51UWl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1VVRkRha01zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEU2p0VFFVRk5PMUZCUTB3c1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8wdEJRMnhETzBGQlEwZ3NRMEZCUXl4RFFVRkRMRU5CUVVNN1FVRkZTQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeHZRMEZCYjBNc1IwRkJSeXhEUVVGRExHMUNRVUVyUXl4RlFVRkZMRVZCUVVVN1NVRkRkRWNzV1VGQldTeERRVU5XTEhGQ1FVRnhRaXhEUVVGRExHMUNRVUZ0UWl4RFFVRkRMSGxDUVVGNVFpeERRVUZETEVWQlEzQkZMRTlCUVU4c1JVRkRVQ3h0UWtGQmJVSXNRMEZCUXl4UFFVRlBMRU5CUXpWQ0xFTkJRVU03UVVGRFNpeERRVUZETEVOQlFVRWlmUT09IiwiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuLy8gQ29kZSBiZWxvdyBpcyBub3QgYSBjb250ZW50IHNjcmlwdDogbm8gRmlyZWZveCBBUElzIHNob3VsZCBiZSB1c2VkXG4vLyBBbHNvLCBubyB3ZWJwYWNrL2VzNiBpbXBvcnRzIG1heSBiZSB1c2VkIGluIHRoaXMgZmlsZSBzaW5jZSB0aGUgc2NyaXB0XG4vLyBpcyBleHBvcnRlZCBhcyBhIHBhZ2Ugc2NyaXB0IGFzIGEgc3RyaW5nXG5leHBvcnQgZnVuY3Rpb24gcGFnZVNjcmlwdChnZXRJbnN0cnVtZW50SlMsIGpzSW5zdHJ1bWVudGF0aW9uU2V0dGluZ3MpIHtcbiAgICAvLyBtZXNzYWdlcyB0aGUgaW5qZWN0ZWQgc2NyaXB0XG4gICAgY29uc3Qgc2VuZE1lc3NhZ2VzVG9Mb2dnZXIgPSAoZXZlbnRJZCwgbWVzc2FnZXMpID0+IHtcbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnRJZCwge1xuICAgICAgICAgICAgZGV0YWlsOiBtZXNzYWdlcyxcbiAgICAgICAgfSkpO1xuICAgIH07XG4gICAgY29uc3QgZXZlbnRJZCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuZ2V0QXR0cmlidXRlKFwiZGF0YS1ldmVudC1pZFwiKTtcbiAgICBjb25zdCB0ZXN0aW5nID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRlc3RpbmdcIik7XG4gICAgY29uc3QgaW5zdHJ1bWVudEpTID0gZ2V0SW5zdHJ1bWVudEpTKGV2ZW50SWQsIHNlbmRNZXNzYWdlc1RvTG9nZ2VyKTtcbiAgICBsZXQgdDA7XG4gICAgaWYgKHRlc3RpbmcgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiT3BlbldQTTogQ3VycmVudGx5IHRlc3RpbmdcIik7XG4gICAgICAgIHQwID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQmVnaW4gbG9hZGluZyBKUyBpbnN0cnVtZW50YXRpb24uXCIpO1xuICAgIH1cbiAgICBpbnN0cnVtZW50SlMoanNJbnN0cnVtZW50YXRpb25TZXR0aW5ncyk7XG4gICAgaWYgKHRlc3RpbmcgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGNvbnN0IHQxID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDYWxsIHRvIGluc3RydW1lbnRKUyB0b29rICR7dDEgLSB0MH0gbWlsbGlzZWNvbmRzLmApO1xuICAgICAgICB3aW5kb3cuaW5zdHJ1bWVudEpTID0gaW5zdHJ1bWVudEpTO1xuICAgICAgICBjb25zb2xlLmxvZyhcIk9wZW5XUE06IENvbnRlbnQtc2lkZSBqYXZhc2NyaXB0IGluc3RydW1lbnRhdGlvbiBzdGFydGVkIHdpdGggc3BlYzpcIiwganNJbnN0cnVtZW50YXRpb25TZXR0aW5ncywgbmV3IERhdGUoKS50b0lTT1N0cmluZygpLCBcIihpZiBzcGVjIGlzICc8dW5hdmFpbGFibGU+JyBjaGVjayB3ZWIgY29uc29sZS4pXCIpO1xuICAgIH1cbn1cbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFtRjJZWE5qY21sd2RDMXBibk4wY25WdFpXNTBMWEJoWjJVdGMyTnZjR1V1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12WTI5dWRHVnVkQzlxWVhaaGMyTnlhWEIwTFdsdWMzUnlkVzFsYm5RdGNHRm5aUzF6WTI5d1pTNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN3clFrRkJLMEk3UVVGREwwSXNjVVZCUVhGRk8wRkJRM0pGTEhsRlFVRjVSVHRCUVVONlJTd3lRMEZCTWtNN1FVRkZNME1zVFVGQlRTeFZRVUZWTEZWQlFWVXNRMEZCUlN4bFFVRmxMRVZCUVVVc2VVSkJRWGxDTzBsQlEzQkZMQ3RDUVVFclFqdEpRVU12UWl4TlFVRk5MRzlDUVVGdlFpeEhRVUZITEVOQlFVTXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hGUVVGRk8xRkJRMnBFTEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUTNCQ0xFbEJRVWtzVjBGQlZ5eERRVUZETEU5QlFVOHNSVUZCUlR0WlFVTjJRaXhOUVVGTkxFVkJRVVVzVVVGQlVUdFRRVU5xUWl4RFFVRkRMRU5CUTBnc1EwRkJRenRKUVVOS0xFTkJRVU1zUTBGQlF6dEpRVVZHTEUxQlFVMHNUMEZCVHl4SFFVRkhMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zV1VGQldTeERRVUZETEdWQlFXVXNRMEZCUXl4RFFVRkRPMGxCUTNKRkxFMUJRVTBzVDBGQlR5eEhRVUZITEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzBsQlEzQkZMRTFCUVUwc1dVRkJXU3hIUVVGSExHVkJRV1VzUTBGQlF5eFBRVUZQTEVWQlFVVXNiMEpCUVc5Q0xFTkJRVU1zUTBGQlF6dEpRVU53UlN4SlFVRkpMRVZCUVZVc1EwRkJRenRKUVVObUxFbEJRVWtzVDBGQlR5eExRVUZMTEUxQlFVMHNSVUZCUlR0UlFVTjBRaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETERSQ1FVRTBRaXhEUVVGRExFTkJRVU03VVVGRE1VTXNSVUZCUlN4SFFVRkhMRmRCUVZjc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dFJRVU4yUWl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHMURRVUZ0UXl4RFFVRkRMRU5CUVVNN1MwRkRiRVE3U1VGRFJDeFpRVUZaTEVOQlFVTXNlVUpCUVhsQ0xFTkJRVU1zUTBGQlF6dEpRVU40UXl4SlFVRkpMRTlCUVU4c1MwRkJTeXhOUVVGTkxFVkJRVVU3VVVGRGRFSXNUVUZCVFN4RlFVRkZMRWRCUVVjc1YwRkJWeXhEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETzFGQlF6ZENMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zTmtKQlFUWkNMRVZCUVVVc1IwRkJSeXhGUVVGRkxHZENRVUZuUWl4RFFVRkRMRU5CUVVNN1VVRkRha1VzVFVGQll5eERRVUZETEZsQlFWa3NSMEZCUnl4WlFVRlpMRU5CUVVNN1VVRkROVU1zVDBGQlR5eERRVUZETEVkQlFVY3NRMEZEVkN4eFJVRkJjVVVzUlVGRGNrVXNlVUpCUVhsQ0xFVkJRM3BDTEVsQlFVa3NTVUZCU1N4RlFVRkZMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRM2hDTEdsRVFVRnBSQ3hEUVVOc1JDeERRVUZETzB0QlEwZzdRVUZEU0N4RFFVRkRPMEZCUVVFc1EwRkJReUo5IiwiZXhwb3J0ICogZnJvbSBcIi4vYmFja2dyb3VuZC9jb29raWUtaW5zdHJ1bWVudFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vYmFja2dyb3VuZC9kbnMtaW5zdHJ1bWVudFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vYmFja2dyb3VuZC9odHRwLWluc3RydW1lbnRcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2JhY2tncm91bmQvamF2YXNjcmlwdC1pbnN0cnVtZW50XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9iYWNrZ3JvdW5kL25hdmlnYXRpb24taW5zdHJ1bWVudFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vY29udGVudC9qYXZhc2NyaXB0LWluc3RydW1lbnQtY29udGVudC1zY29wZVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vbGliL2h0dHAtcG9zdC1wYXJzZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2xpYi9zdHJpbmctdXRpbHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NjaGVtYVwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdmFXNWtaWGd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNZMEZCWXl4blEwRkJaME1zUTBGQlF6dEJRVU12UXl4alFVRmpMRFpDUVVFMlFpeERRVUZETzBGQlF6VkRMR05CUVdNc09FSkJRVGhDTEVOQlFVTTdRVUZETjBNc1kwRkJZeXh2UTBGQmIwTXNRMEZCUXp0QlFVTnVSQ3hqUVVGakxHOURRVUZ2UXl4RFFVRkRPMEZCUTI1RUxHTkJRV01zSzBOQlFTdERMRU5CUVVNN1FVRkRPVVFzWTBGQll5eDNRa0ZCZDBJc1EwRkJRenRCUVVOMlF5eGpRVUZqTEc5Q1FVRnZRaXhEUVVGRE8wRkJRMjVETEdOQlFXTXNWVUZCVlN4RFFVRkRJbjA9IiwiLyoqXG4gKiBUaGlzIGVuYWJsZXMgdXMgdG8ga2VlcCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgb3JpZ2luYWwgb3JkZXJcbiAqIGluIHdoaWNoIGV2ZW50cyBhcnJpdmVkIHRvIG91ciBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbmxldCBldmVudE9yZGluYWwgPSAwO1xuZXhwb3J0IGNvbnN0IGluY3JlbWVudGVkRXZlbnRPcmRpbmFsID0gKCkgPT4ge1xuICAgIHJldHVybiBldmVudE9yZGluYWwrKztcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2laWGgwWlc1emFXOXVMWE5sYzNOcGIyNHRaWFpsYm5RdGIzSmthVzVoYkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUx5NHVMM055WXk5c2FXSXZaWGgwWlc1emFXOXVMWE5sYzNOcGIyNHRaWFpsYm5RdGIzSmthVzVoYkM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3TzBkQlIwYzdRVUZEU0N4SlFVRkpMRmxCUVZrc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRmNrSXNUVUZCVFN4RFFVRkRMRTFCUVUwc2RVSkJRWFZDTEVkQlFVY3NSMEZCUnl4RlFVRkZPMGxCUXpGRExFOUJRVThzV1VGQldTeEZRVUZGTEVOQlFVTTdRVUZEZUVJc1EwRkJReXhEUVVGREluMD0iLCJpbXBvcnQgeyBtYWtlVVVJRCB9IGZyb20gXCIuL3V1aWRcIjtcbi8qKlxuICogVGhpcyBlbmFibGVzIHVzIHRvIGFjY2VzcyBhIHVuaXF1ZSByZWZlcmVuY2UgdG8gdGhpcyBicm93c2VyXG4gKiBzZXNzaW9uIC0gcmVnZW5lcmF0ZWQgYW55IHRpbWUgdGhlIGJhY2tncm91bmQgcHJvY2VzcyBnZXRzXG4gKiByZXN0YXJ0ZWQgKHdoaWNoIHNob3VsZCBvbmx5IGJlIG9uIGJyb3dzZXIgcmVzdGFydHMpXG4gKi9cbmV4cG9ydCBjb25zdCBleHRlbnNpb25TZXNzaW9uVXVpZCA9IG1ha2VVVUlEKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2laWGgwWlc1emFXOXVMWE5sYzNOcGIyNHRkWFZwWkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUx5NHVMM055WXk5c2FXSXZaWGgwWlc1emFXOXVMWE5sYzNOcGIyNHRkWFZwWkM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hQUVVGUExFVkJRVVVzVVVGQlVTeEZRVUZGTEUxQlFVMHNVVUZCVVN4RFFVRkRPMEZCUld4RE96czdPMGRCU1VjN1FVRkRTQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeHZRa0ZCYjBJc1IwRkJSeXhSUVVGUkxFVkJRVVVzUTBGQlF5SjkiLCJpbXBvcnQgeyBlc2NhcGVTdHJpbmcsIFVpbnQ4VG9CYXNlNjQgfSBmcm9tIFwiLi9zdHJpbmctdXRpbHNcIjtcbmV4cG9ydCBjbGFzcyBIdHRwUG9zdFBhcnNlciB7XG4gICAgb25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzO1xuICAgIGRhdGFSZWNlaXZlcjtcbiAgICBjb25zdHJ1Y3RvcihvbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMsIGRhdGFSZWNlaXZlcikge1xuICAgICAgICB0aGlzLm9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyA9IG9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscztcbiAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIgPSBkYXRhUmVjZWl2ZXI7XG4gICAgfVxuICAgIHBhcnNlUG9zdFJlcXVlc3QoKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5ID0gdGhpcy5vbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMucmVxdWVzdEJvZHk7XG4gICAgICAgIGlmIChyZXF1ZXN0Qm9keS5lcnJvcikge1xuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZXIubG9nRXJyb3IoXCJFeGNlcHRpb246IFVwc3RyZWFtIGZhaWxlZCB0byBwYXJzZSBQT1NUOiBcIiArIHJlcXVlc3RCb2R5LmVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxdWVzdEJvZHkuZm9ybURhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcG9zdF9ib2R5OiBlc2NhcGVTdHJpbmcoSlNPTi5zdHJpbmdpZnkocmVxdWVzdEJvZHkuZm9ybURhdGEpKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcXVlc3RCb2R5LnJhdykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwb3N0X2JvZHlfcmF3OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keS5yYXcubWFwKCh4KSA9PiBbXG4gICAgICAgICAgICAgICAgICAgIHguZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgVWludDhUb0Jhc2U2NChuZXcgVWludDhBcnJheSh4LmJ5dGVzKSksXG4gICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge307XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYUhSMGNDMXdiM04wTFhCaGNuTmxjaTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUwzTnlZeTlzYVdJdmFIUjBjQzF3YjNOMExYQmhjbk5sY2k1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkRRU3hQUVVGUExFVkJRVVVzV1VGQldTeEZRVUZGTEdGQlFXRXNSVUZCUlN4TlFVRk5MR2RDUVVGblFpeERRVUZETzBGQlVUZEVMRTFCUVUwc1QwRkJUeXhqUVVGak8wbEJRMUlzTWtKQlFUSkNMRU5CUVhkRE8wbEJRMjVGTEZsQlFWa3NRMEZCUXp0SlFVVTVRaXhaUVVORkxESkNRVUZyUlN4RlFVTnNSU3haUVVGWk8xRkJSVm9zU1VGQlNTeERRVUZETERKQ1FVRXlRaXhIUVVGSExESkNRVUV5UWl4RFFVRkRPMUZCUXk5RUxFbEJRVWtzUTBGQlF5eFpRVUZaTEVkQlFVY3NXVUZCV1N4RFFVRkRPMGxCUTI1RExFTkJRVU03U1VGRlRTeG5Ra0ZCWjBJN1VVRkRja0lzVFVGQlRTeFhRVUZYTEVkQlFVY3NTVUZCU1N4RFFVRkRMREpDUVVFeVFpeERRVUZETEZkQlFWY3NRMEZCUXp0UlFVTnFSU3hKUVVGSkxGZEJRVmNzUTBGQlF5eExRVUZMTEVWQlFVVTdXVUZEY2tJc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFJRVUZSTEVOQlEzaENMRFJEUVVFMFF5eEhRVUZITEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUTJwRkxFTkJRVU03VTBGRFNEdFJRVU5FTEVsQlFVa3NWMEZCVnl4RFFVRkRMRkZCUVZFc1JVRkJSVHRaUVVONFFpeFBRVUZQTzJkQ1FVTk1MRk5CUVZNc1JVRkJSU3haUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03WVVGRE9VUXNRMEZCUXp0VFFVTklPMUZCUTBRc1NVRkJTU3hYUVVGWExFTkJRVU1zUjBGQlJ5eEZRVUZGTzFsQlEyNUNMRTlCUVU4N1owSkJRMHdzWVVGQllTeEZRVUZGTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUXpOQ0xGZEJRVmNzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF6dHZRa0ZEZWtJc1EwRkJReXhEUVVGRExFbEJRVWs3YjBKQlEwNHNZVUZCWVN4RFFVRkRMRWxCUVVrc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0cFFrRkRka01zUTBGQlF5eERRVU5JTzJGQlEwWXNRMEZCUXp0VFFVTklPMUZCUTBRc1QwRkJUeXhGUVVGRkxFTkJRVU03U1VGRFdpeERRVUZETzBOQlEwWWlmUT09IiwiLy8gSW50cnVtZW50YXRpb24gaW5qZWN0aW9uIGNvZGUgaXMgYmFzZWQgb24gcHJpdmFjeWJhZGdlcmZpcmVmb3hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9FRkZvcmcvcHJpdmFjeWJhZGdlcmZpcmVmb3gvYmxvYi9tYXN0ZXIvZGF0YS9maW5nZXJwcmludGluZy5qc1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RydW1lbnRKUyhldmVudElkLCBzZW5kTWVzc2FnZXNUb0xvZ2dlcikge1xuICAgIC8qXG4gICAgICogSW5zdHJ1bWVudGF0aW9uIGhlbHBlcnNcbiAgICAgKiAoSW5saW5lZCBpbiBvcmRlciBmb3IganNJbnN0cnVtZW50cyB0byBiZSBlYXNpbHkgZXhwb3J0YWJsZSBhcyBhIHN0cmluZylcbiAgICAgKi9cbiAgICAvLyBDb3VudGVyIHRvIGNhcCAjIG9mIGNhbGxzIGxvZ2dlZCBmb3IgZWFjaCBzY3JpcHQvYXBpIGNvbWJpbmF0aW9uXG4gICAgY29uc3QgbWF4TG9nQ291bnQgPSA1MDA7XG4gICAgLy8gbG9nQ291bnRlclxuICAgIGNvbnN0IGxvZ0NvdW50ZXIgPSBuZXcgT2JqZWN0KCk7XG4gICAgLy8gUHJldmVudCBsb2dnaW5nIG9mIGdldHMgYXJpc2luZyBmcm9tIGxvZ2dpbmdcbiAgICBsZXQgaW5Mb2cgPSBmYWxzZTtcbiAgICAvLyBUbyBrZWVwIHRyYWNrIG9mIHRoZSBvcmlnaW5hbCBvcmRlciBvZiBldmVudHNcbiAgICBsZXQgb3JkaW5hbCA9IDA7XG4gICAgLy8gT3B0aW9ucyBmb3IgSlNPcGVyYXRpb25cbiAgICBjb25zdCBKU09wZXJhdGlvbiA9IHtcbiAgICAgICAgY2FsbDogXCJjYWxsXCIsXG4gICAgICAgIGdldDogXCJnZXRcIixcbiAgICAgICAgZ2V0X2ZhaWxlZDogXCJnZXQoZmFpbGVkKVwiLFxuICAgICAgICBnZXRfZnVuY3Rpb246IFwiZ2V0KGZ1bmN0aW9uKVwiLFxuICAgICAgICBzZXQ6IFwic2V0XCIsXG4gICAgICAgIHNldF9mYWlsZWQ6IFwic2V0KGZhaWxlZClcIixcbiAgICAgICAgc2V0X3ByZXZlbnRlZDogXCJzZXQocHJldmVudGVkKVwiLFxuICAgIH07XG4gICAgLy8gUm91Z2ggaW1wbGVtZW50YXRpb25zIG9mIE9iamVjdC5nZXRQcm9wZXJ0eURlc2NyaXB0b3IgYW5kIE9iamVjdC5nZXRQcm9wZXJ0eU5hbWVzXG4gICAgLy8gU2VlIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZXh0ZW5kZWRfb2JqZWN0X2FwaVxuICAgIE9iamVjdC5nZXRQcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiAoc3ViamVjdCwgbmFtZSkge1xuICAgICAgICBpZiAoc3ViamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBnZXQgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc3ViamVjdCwgbmFtZSk7XG4gICAgICAgIGxldCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihzdWJqZWN0KTtcbiAgICAgICAgd2hpbGUgKHBkID09PSB1bmRlZmluZWQgJiYgcHJvdG8gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHBkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbmFtZSk7XG4gICAgICAgICAgICBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBkO1xuICAgIH07XG4gICAgT2JqZWN0LmdldFByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgICAgICBpZiAoc3ViamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBnZXQgcHJvcGVydHkgbmFtZXMgZm9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcHJvcHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzdWJqZWN0KTtcbiAgICAgICAgbGV0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHN1YmplY3QpO1xuICAgICAgICB3aGlsZSAocHJvdG8gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHByb3BzID0gcHJvcHMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKSk7XG4gICAgICAgICAgICBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRklYTUU6IHJlbW92ZSBkdXBsaWNhdGUgcHJvcGVydHkgbmFtZXMgZnJvbSBwcm9wc1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfTtcbiAgICAvLyBkZWJvdW5jZSAtIGZyb20gVW5kZXJzY29yZSB2MS42LjBcbiAgICBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGUgPSBmYWxzZSkge1xuICAgICAgICBsZXQgdGltZW91dDtcbiAgICAgICAgbGV0IGFyZ3M7XG4gICAgICAgIGxldCBjb250ZXh0O1xuICAgICAgICBsZXQgdGltZXN0YW1wO1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICBjb25zdCBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBEYXRlLm5vdygpIC0gdGltZXN0YW1wO1xuICAgICAgICAgICAgaWYgKGxhc3QgPCB3YWl0KSB7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgY29uc3QgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBSZWN1cnNpdmVseSBnZW5lcmF0ZXMgYSBwYXRoIGZvciBhbiBlbGVtZW50XG4gICAgZnVuY3Rpb24gZ2V0UGF0aFRvRG9tRWxlbWVudChlbGVtZW50LCB2aXNpYmlsaXR5QXR0ciA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChlbGVtZW50ID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC50YWdOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBcIk5VTEwvXCIgKyBlbGVtZW50LnRhZ05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNpYmxpbmdJbmRleCA9IDE7XG4gICAgICAgIGNvbnN0IHNpYmxpbmdzID0gZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2libGluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSBzaWJsaW5nc1tpXTtcbiAgICAgICAgICAgIGlmIChzaWJsaW5nID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgbGV0IHBhdGggPSBnZXRQYXRoVG9Eb21FbGVtZW50KGVsZW1lbnQucGFyZW50Tm9kZSwgdmlzaWJpbGl0eUF0dHIpO1xuICAgICAgICAgICAgICAgIHBhdGggKz0gXCIvXCIgKyBlbGVtZW50LnRhZ05hbWUgKyBcIltcIiArIHNpYmxpbmdJbmRleDtcbiAgICAgICAgICAgICAgICBwYXRoICs9IFwiLFwiICsgZWxlbWVudC5pZDtcbiAgICAgICAgICAgICAgICBwYXRoICs9IFwiLFwiICsgZWxlbWVudC5jbGFzc05hbWU7XG4gICAgICAgICAgICAgICAgaWYgKHZpc2liaWxpdHlBdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGggKz0gXCIsXCIgKyBlbGVtZW50LmhpZGRlbjtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArPSBcIixcIiArIGVsZW1lbnQuc3R5bGUuZGlzcGxheTtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArPSBcIixcIiArIGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gXCJBXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArPSBcIixcIiArIGVsZW1lbnQuaHJlZjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGF0aCArPSBcIl1cIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaWJsaW5nLm5vZGVUeXBlID09PSAxICYmIHNpYmxpbmcudGFnTmFtZSA9PT0gZWxlbWVudC50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgc2libGluZ0luZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGVscGVyIGZvciBKU09OaWZ5aW5nIG9iamVjdHNcbiAgICBmdW5jdGlvbiBzZXJpYWxpemVPYmplY3Qob2JqZWN0LCBzdHJpbmdpZnlGdW5jdGlvbnMgPSBmYWxzZSkge1xuICAgICAgICAvLyBIYW5kbGUgcGVybWlzc2lvbnMgZXJyb3JzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAob2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnlGdW5jdGlvbnMgPyBvYmplY3QudG9TdHJpbmcoKSA6IFwiRlVOQ1RJT05cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNlZW5PYmplY3RzID0gW107XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqZWN0LCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5naWZ5RnVuY3Rpb25zID8gdmFsdWUudG9TdHJpbmcoKSA6IFwiRlVOQ1RJT05cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgd3JhcHBpbmcgb24gY29udGVudCBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgIGlmIChcIndyYXBwZWRKU09iamVjdFwiIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLndyYXBwZWRKU09iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBTZXJpYWxpemUgRE9NIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UGF0aFRvRG9tRWxlbWVudCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCBzZXJpYWxpemF0aW9uIGN5Y2xlc1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIlwiIHx8IHNlZW5PYmplY3RzLmluZGV4T2YodmFsdWUpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vlbk9iamVjdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcGVuV1BNOiBTRVJJQUxJWkFUSU9OIEVSUk9SOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBcIlNFUklBTElaQVRJT04gRVJST1I6IFwiICsgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ291bnRlckFuZENoZWNrSWZPdmVyKHNjcmlwdFVybCwgc3ltYm9sKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHNjcmlwdFVybCArIFwifFwiICsgc3ltYm9sO1xuICAgICAgICBpZiAoa2V5IGluIGxvZ0NvdW50ZXIgJiYgbG9nQ291bnRlcltrZXldID49IG1heExvZ0NvdW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghKGtleSBpbiBsb2dDb3VudGVyKSkge1xuICAgICAgICAgICAgbG9nQ291bnRlcltrZXldID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvZ0NvdW50ZXJba2V5XSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gRm9yIGdldHMsIHNldHMsIGV0Yy4gb24gYSBzaW5nbGUgdmFsdWVcbiAgICBmdW5jdGlvbiBsb2dWYWx1ZShpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWUsIHZhbHVlLCBvcGVyYXRpb24sIC8vIGZyb20gSlNPcGVyYXRpb24gb2JqZWN0IHBsZWFzZVxuICAgIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncykge1xuICAgICAgICBpZiAoaW5Mb2cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbkxvZyA9IHRydWU7XG4gICAgICAgIGNvbnN0IG92ZXJMaW1pdCA9IHVwZGF0ZUNvdW50ZXJBbmRDaGVja0lmT3ZlcihjYWxsQ29udGV4dC5zY3JpcHRVcmwsIGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSk7XG4gICAgICAgIGlmIChvdmVyTGltaXQpIHtcbiAgICAgICAgICAgIGluTG9nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbXNnID0ge1xuICAgICAgICAgICAgb3BlcmF0aW9uLFxuICAgICAgICAgICAgc3ltYm9sOiBpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogc2VyaWFsaXplT2JqZWN0KHZhbHVlLCBsb2dTZXR0aW5ncy5sb2dGdW5jdGlvbnNBc1N0cmluZ3MpLFxuICAgICAgICAgICAgc2NyaXB0VXJsOiBjYWxsQ29udGV4dC5zY3JpcHRVcmwsXG4gICAgICAgICAgICBzY3JpcHRMaW5lOiBjYWxsQ29udGV4dC5zY3JpcHRMaW5lLFxuICAgICAgICAgICAgc2NyaXB0Q29sOiBjYWxsQ29udGV4dC5zY3JpcHRDb2wsXG4gICAgICAgICAgICBmdW5jTmFtZTogY2FsbENvbnRleHQuZnVuY05hbWUsXG4gICAgICAgICAgICBzY3JpcHRMb2NFdmFsOiBjYWxsQ29udGV4dC5zY3JpcHRMb2NFdmFsLFxuICAgICAgICAgICAgY2FsbFN0YWNrOiBjYWxsQ29udGV4dC5jYWxsU3RhY2ssXG4gICAgICAgICAgICBvcmRpbmFsOiBvcmRpbmFsKyssXG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZW5kKFwibG9nVmFsdWVcIiwgbXNnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3BlbldQTTogVW5zdWNjZXNzZnVsIHZhbHVlIGxvZyFcIik7XG4gICAgICAgICAgICBsb2dFcnJvclRvQ29uc29sZShlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgaW5Mb2cgPSBmYWxzZTtcbiAgICB9XG4gICAgLy8gRm9yIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIGxvZ0NhbGwoaW5zdHJ1bWVudGVkRnVuY3Rpb25OYW1lLCBhcmdzLCBjYWxsQ29udGV4dCwgbG9nU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKGluTG9nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5Mb2cgPSB0cnVlO1xuICAgICAgICBjb25zdCBvdmVyTGltaXQgPSB1cGRhdGVDb3VudGVyQW5kQ2hlY2tJZk92ZXIoY2FsbENvbnRleHQuc2NyaXB0VXJsLCBpbnN0cnVtZW50ZWRGdW5jdGlvbk5hbWUpO1xuICAgICAgICBpZiAob3ZlckxpbWl0KSB7XG4gICAgICAgICAgICBpbkxvZyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IHNwZWNpYWwgYXJndW1lbnRzIGFycmF5IHRvIGEgc3RhbmRhcmQgYXJyYXkgZm9yIEpTT05pZnlpbmdcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbEFyZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBzZXJpYWxBcmdzLnB1c2goc2VyaWFsaXplT2JqZWN0KGFyZywgbG9nU2V0dGluZ3MubG9nRnVuY3Rpb25zQXNTdHJpbmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtc2cgPSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiBKU09wZXJhdGlvbi5jYWxsLFxuICAgICAgICAgICAgICAgIHN5bWJvbDogaW5zdHJ1bWVudGVkRnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3M6IHNlcmlhbEFyZ3MsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgc2NyaXB0VXJsOiBjYWxsQ29udGV4dC5zY3JpcHRVcmwsXG4gICAgICAgICAgICAgICAgc2NyaXB0TGluZTogY2FsbENvbnRleHQuc2NyaXB0TGluZSxcbiAgICAgICAgICAgICAgICBzY3JpcHRDb2w6IGNhbGxDb250ZXh0LnNjcmlwdENvbCxcbiAgICAgICAgICAgICAgICBmdW5jTmFtZTogY2FsbENvbnRleHQuZnVuY05hbWUsXG4gICAgICAgICAgICAgICAgc2NyaXB0TG9jRXZhbDogY2FsbENvbnRleHQuc2NyaXB0TG9jRXZhbCxcbiAgICAgICAgICAgICAgICBjYWxsU3RhY2s6IGNhbGxDb250ZXh0LmNhbGxTdGFjayxcbiAgICAgICAgICAgICAgICBvcmRpbmFsOiBvcmRpbmFsKyssXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VuZChcImxvZ0NhbGxcIiwgbXNnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3BlbldQTTogVW5zdWNjZXNzZnVsIGNhbGwgbG9nOiBcIiArIGluc3RydW1lbnRlZEZ1bmN0aW9uTmFtZSk7XG4gICAgICAgICAgICBsb2dFcnJvclRvQ29uc29sZShlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgaW5Mb2cgPSBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbG9nRXJyb3JUb0NvbnNvbGUoZXJyb3IsIGNvbnRleHQgPSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiT3BlbldQTTogRXJyb3IgbmFtZTogXCIgKyBlcnJvci5uYW1lKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk9wZW5XUE06IEVycm9yIG1lc3NhZ2U6IFwiICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuV1BNOiBFcnJvciBmaWxlbmFtZTogXCIgKyBlcnJvci5maWxlTmFtZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuV1BNOiBFcnJvciBsaW5lIG51bWJlcjogXCIgKyBlcnJvci5saW5lTnVtYmVyKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk9wZW5XUE06IEVycm9yIHN0YWNrOiBcIiArIGVycm9yLnN0YWNrKTtcbiAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuV1BNOiBFcnJvciBjb250ZXh0OiBcIiArIEpTT04uc3RyaW5naWZ5KGNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBIZWxwZXIgdG8gZ2V0IG9yaWdpbmF0aW5nIHNjcmlwdCB1cmxzXG4gICAgZnVuY3Rpb24gZ2V0U3RhY2tUcmFjZSgpIHtcbiAgICAgICAgbGV0IHN0YWNrO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc3RhY2sgPSBlcnIuc3RhY2s7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH1cbiAgICAvLyBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzUyMDIxODVcbiAgICBjb25zdCByc3BsaXQgPSBmdW5jdGlvbiAoc291cmNlLCBzZXAsIG1heHNwbGl0KSB7XG4gICAgICAgIGNvbnN0IHNwbGl0ID0gc291cmNlLnNwbGl0KHNlcCk7XG4gICAgICAgIHJldHVybiBtYXhzcGxpdFxuICAgICAgICAgICAgPyBbc3BsaXQuc2xpY2UoMCwgLW1heHNwbGl0KS5qb2luKHNlcCldLmNvbmNhdChzcGxpdC5zbGljZSgtbWF4c3BsaXQpKVxuICAgICAgICAgICAgOiBzcGxpdDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGdldE9yaWdpbmF0aW5nU2NyaXB0Q29udGV4dChnZXRDYWxsU3RhY2sgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCB0cmFjZSA9IGdldFN0YWNrVHJhY2UoKS50cmltKCkuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIC8vIHJldHVybiBhIGNvbnRleHQgb2JqZWN0IGV2ZW4gaWYgdGhlcmUgaXMgYW4gZXJyb3JcbiAgICAgICAgY29uc3QgZW1wdHlfY29udGV4dCA9IHtcbiAgICAgICAgICAgIHNjcmlwdFVybDogXCJcIixcbiAgICAgICAgICAgIHNjcmlwdExpbmU6IFwiXCIsXG4gICAgICAgICAgICBzY3JpcHRDb2w6IFwiXCIsXG4gICAgICAgICAgICBmdW5jTmFtZTogXCJcIixcbiAgICAgICAgICAgIHNjcmlwdExvY0V2YWw6IFwiXCIsXG4gICAgICAgICAgICBjYWxsU3RhY2s6IFwiXCIsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFjZS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICByZXR1cm4gZW1wdHlfY29udGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyAwLCAxIGFuZCAyIGFyZSBPcGVuV1BNJ3Mgb3duIGZ1bmN0aW9ucyAoZS5nLiBnZXRTdGFja1RyYWNlKSwgc2tpcCB0aGVtLlxuICAgICAgICBjb25zdCBjYWxsU2l0ZSA9IHRyYWNlWzNdO1xuICAgICAgICBpZiAoIWNhbGxTaXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZW1wdHlfY29udGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICAgKiBTdGFjayBmcmFtZSBmb3JtYXQgaXMgc2ltcGx5OiBGVU5DX05BTUVARklMRU5BTUU6TElORV9OTzpDT0xVTU5fTk9cbiAgICAgICAgICpcbiAgICAgICAgICogSWYgZXZhbCBvciBGdW5jdGlvbiBpcyBpbnZvbHZlZCB3ZSBoYXZlIGFuIGFkZGl0aW9uYWwgcGFydCBhZnRlciB0aGUgRklMRU5BTUUsIGUuZy46XG4gICAgICAgICAqIEZVTkNfTkFNRUBGSUxFTkFNRSBsaW5lIDEyMyA+IGV2YWwgbGluZSAxID4gZXZhbDpMSU5FX05POkNPTFVNTl9OT1xuICAgICAgICAgKiBvciBGVU5DX05BTUVARklMRU5BTUUgbGluZSAyMzQgPiBGdW5jdGlvbjpMSU5FX05POkNPTFVNTl9OT1xuICAgICAgICAgKlxuICAgICAgICAgKiBXZSBzdG9yZSB0aGUgcGFydCBiZXR3ZWVuIHRoZSBGSUxFTkFNRSBhbmQgdGhlIExJTkVfTk8gaW4gc2NyaXB0TG9jRXZhbFxuICAgICAgICAgKi9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBzY3JpcHRVcmwgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IHNjcmlwdExvY0V2YWwgPSBcIlwiOyAvLyBmb3IgZXZhbCBvciBGdW5jdGlvbiBjYWxsc1xuICAgICAgICAgICAgY29uc3QgY2FsbFNpdGVQYXJ0cyA9IGNhbGxTaXRlLnNwbGl0KFwiQFwiKTtcbiAgICAgICAgICAgIGNvbnN0IGZ1bmNOYW1lID0gY2FsbFNpdGVQYXJ0c1swXSB8fCBcIlwiO1xuICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByc3BsaXQoY2FsbFNpdGVQYXJ0c1sxXSwgXCI6XCIsIDIpO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uTm8gPSBpdGVtc1tpdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVObyA9IGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgY29uc3Qgc2NyaXB0RmlsZU5hbWUgPSBpdGVtc1tpdGVtcy5sZW5ndGggLSAzXSB8fCBcIlwiO1xuICAgICAgICAgICAgY29uc3QgbGluZU5vSWR4ID0gc2NyaXB0RmlsZU5hbWUuaW5kZXhPZihcIiBsaW5lIFwiKTsgLy8gbGluZSBpbiB0aGUgVVJMIG1lYW5zIGV2YWwgb3IgRnVuY3Rpb25cbiAgICAgICAgICAgIGlmIChsaW5lTm9JZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0VXJsID0gc2NyaXB0RmlsZU5hbWU7IC8vIFRPRE86IHNvbWV0aW1lcyB3ZSBoYXZlIGZpbGVuYW1lIG9ubHksIGUuZy4gWFguanNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjcmlwdFVybCA9IHNjcmlwdEZpbGVOYW1lLnNsaWNlKDAsIGxpbmVOb0lkeCk7XG4gICAgICAgICAgICAgICAgc2NyaXB0TG9jRXZhbCA9IHNjcmlwdEZpbGVOYW1lLnNsaWNlKGxpbmVOb0lkeCArIDEsIHNjcmlwdEZpbGVOYW1lLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjYWxsQ29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBzY3JpcHRVcmwsXG4gICAgICAgICAgICAgICAgc2NyaXB0TGluZTogbGluZU5vLFxuICAgICAgICAgICAgICAgIHNjcmlwdENvbDogY29sdW1uTm8sXG4gICAgICAgICAgICAgICAgZnVuY05hbWUsXG4gICAgICAgICAgICAgICAgc2NyaXB0TG9jRXZhbCxcbiAgICAgICAgICAgICAgICBjYWxsU3RhY2s6IGdldENhbGxTdGFjayA/IHRyYWNlLnNsaWNlKDMpLmpvaW4oXCJcXG5cIikudHJpbSgpIDogXCJcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gY2FsbENvbnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3BlbldQTTogRXJyb3IgcGFyc2luZyB0aGUgc2NyaXB0IGNvbnRleHRcIiwgZS50b1N0cmluZygpLCBjYWxsU2l0ZSk7XG4gICAgICAgICAgICByZXR1cm4gZW1wdHlfY29udGV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBpc09iamVjdChvYmplY3QsIHByb3BlcnR5TmFtZSkge1xuICAgICAgICBsZXQgcHJvcGVydHk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9wZXJ0eSA9IG9iamVjdFtwcm9wZXJ0eU5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9wZXJ0eSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gbnVsbCBpcyB0eXBlIFwib2JqZWN0XCJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZW9mIHByb3BlcnR5ID09PSBcIm9iamVjdFwiO1xuICAgIH1cbiAgICAvLyBMb2cgY2FsbHMgdG8gYSBnaXZlbiBmdW5jdGlvblxuICAgIC8vIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSB3cmFwcGVyIGFyb3VuZCBgZnVuY2Agd2hpY2ggbG9ncyBjYWxsc1xuICAgIC8vIHRvIGBmdW5jYC4gYG9iamVjdE5hbWVgIGFuZCBgbWV0aG9kTmFtZWAgYXJlIHVzZWQgc3RyaWN0bHkgdG8gaWRlbnRpZnlcbiAgICAvLyB3aGljaCBvYmplY3QgbWV0aG9kIGBmdW5jYCBpcyBjb21pbmcgZnJvbSBpbiB0aGUgbG9nc1xuICAgIGZ1bmN0aW9uIGluc3RydW1lbnRGdW5jdGlvbihvYmplY3ROYW1lLCBtZXRob2ROYW1lLCBmdW5jLCBsb2dTZXR0aW5ncykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgY2FsbENvbnRleHQgPSBnZXRPcmlnaW5hdGluZ1NjcmlwdENvbnRleHQobG9nU2V0dGluZ3MubG9nQ2FsbFN0YWNrKTtcbiAgICAgICAgICAgIGxvZ0NhbGwob2JqZWN0TmFtZSArIFwiLlwiICsgbWV0aG9kTmFtZSwgYXJndW1lbnRzLCBjYWxsQ29udGV4dCwgbG9nU2V0dGluZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gTG9nIHByb3BlcnRpZXMgb2YgcHJvdG90eXBlcyBhbmQgb2JqZWN0c1xuICAgIGZ1bmN0aW9uIGluc3RydW1lbnRPYmplY3RQcm9wZXJ0eShvYmplY3QsIG9iamVjdE5hbWUsIHByb3BlcnR5TmFtZSwgbG9nU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKCFvYmplY3QgfHxcbiAgICAgICAgICAgICFvYmplY3ROYW1lIHx8XG4gICAgICAgICAgICAhcHJvcGVydHlOYW1lIHx8XG4gICAgICAgICAgICBwcm9wZXJ0eU5hbWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZXF1ZXN0IHRvIGluc3RydW1lbnRPYmplY3RQcm9wZXJ0eS5cbiAgICAgICAgT2JqZWN0OiAke29iamVjdH1cbiAgICAgICAgb2JqZWN0TmFtZTogJHtvYmplY3ROYW1lfVxuICAgICAgICBwcm9wZXJ0eU5hbWU6ICR7cHJvcGVydHlOYW1lfVxuICAgICAgICBgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTdG9yZSBvcmlnaW5hbCBkZXNjcmlwdG9yIGluIGNsb3N1cmVcbiAgICAgICAgY29uc3QgcHJvcERlc2MgPSBPYmplY3QuZ2V0UHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHlOYW1lKTtcbiAgICAgICAgLy8gUHJvcGVydHkgZGVzY3JpcHRvciBtdXN0IGV4aXN0IHVubGVzcyB3ZSBhcmUgaW5zdHJ1bWVudGluZyBhIG5vbkV4aXN0aW5nIHByb3BlcnR5XG4gICAgICAgIGlmICghcHJvcERlc2MgJiZcbiAgICAgICAgICAgICFsb2dTZXR0aW5ncy5ub25FeGlzdGluZ1Byb3BlcnRpZXNUb0luc3RydW1lbnQuaW5jbHVkZXMocHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlByb3BlcnR5IGRlc2NyaXB0b3Igbm90IGZvdW5kIGZvclwiLCBvYmplY3ROYW1lLCBwcm9wZXJ0eU5hbWUsIG9iamVjdCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gUHJvcGVydHkgZGVzY3JpcHRvciBmb3IgdW5kZWZpbmVkIHByb3BlcnRpZXNcbiAgICAgICAgbGV0IHVuZGVmaW5lZFByb3BWYWx1ZTtcbiAgICAgICAgY29uc3QgdW5kZWZpbmVkUHJvcERlc2MgPSB7XG4gICAgICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkUHJvcFZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkUHJvcFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIC8vIEluc3RydW1lbnQgZGF0YSBvciBhY2Nlc3NvciBwcm9wZXJ0eSBkZXNjcmlwdG9yc1xuICAgICAgICBjb25zdCBvcmlnaW5hbEdldHRlciA9IHByb3BEZXNjID8gcHJvcERlc2MuZ2V0IDogdW5kZWZpbmVkUHJvcERlc2MuZ2V0O1xuICAgICAgICBjb25zdCBvcmlnaW5hbFNldHRlciA9IHByb3BEZXNjID8gcHJvcERlc2Muc2V0IDogdW5kZWZpbmVkUHJvcERlc2Muc2V0O1xuICAgICAgICBsZXQgb3JpZ2luYWxWYWx1ZSA9IHByb3BEZXNjID8gcHJvcERlc2MudmFsdWUgOiB1bmRlZmluZWRQcm9wVmFsdWU7XG4gICAgICAgIC8vIFdlIG92ZXJ3cml0ZSBib3RoIGRhdGEgYW5kIGFjY2Vzc29yIHByb3BlcnRpZXMgYXMgYW4gaW5zdHJ1bWVudGVkXG4gICAgICAgIC8vIGFjY2Vzc29yIHByb3BlcnR5XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3BlcnR5TmFtZSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvcmlnUHJvcGVydHk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxDb250ZXh0ID0gZ2V0T3JpZ2luYXRpbmdTY3JpcHRDb250ZXh0KGxvZ1NldHRpbmdzLmxvZ0NhbGxTdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSA9IGAke29iamVjdE5hbWV9LiR7cHJvcGVydHlOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCBvcmlnaW5hbCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXByb3BEZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB1bmRlZmluZWQgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdQcm9wZXJ0eSA9IHVuZGVmaW5lZFByb3BWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvcmlnaW5hbEdldHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYWNjZXNzb3IgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdQcm9wZXJ0eSA9IG9yaWdpbmFsR2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIHByb3BEZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBkYXRhIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnUHJvcGVydHkgPSBvcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgUHJvcGVydHkgZGVzY3JpcHRvciBmb3IgJHtpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWV9IGRvZXNuJ3QgaGF2ZSBnZXR0ZXIgb3IgdmFsdWU/YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dWYWx1ZShpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWUsIFwiXCIsIEpTT3BlcmF0aW9uLmdldF9mYWlsZWQsIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gTG9nIGBnZXRzYCBleGNlcHQgdGhvc2UgdGhhdCBoYXZlIGluc3RydW1lbnRlZCByZXR1cm4gdmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIC8vICogQWxsIHJldHVybmVkIGZ1bmN0aW9ucyBhcmUgaW5zdHJ1bWVudGVkIHdpdGggYSB3cmFwcGVyXG4gICAgICAgICAgICAgICAgICAgIC8vICogUmV0dXJuZWQgb2JqZWN0cyBtYXkgYmUgaW5zdHJ1bWVudGVkIGlmIHJlY3Vyc2l2ZVxuICAgICAgICAgICAgICAgICAgICAvLyAgIGluc3RydW1lbnRhdGlvbiBpcyBlbmFibGVkIGFuZCB0aGlzIGlzbid0IGF0IHRoZSBkZXB0aCBsaW1pdC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvcmlnUHJvcGVydHkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvZ1NldHRpbmdzLmxvZ0Z1bmN0aW9uR2V0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1ZhbHVlKGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSwgb3JpZ1Byb3BlcnR5LCBKU09wZXJhdGlvbi5nZXRfZnVuY3Rpb24sIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnN0cnVtZW50ZWRGdW5jdGlvbldyYXBwZXIgPSBpbnN0cnVtZW50RnVuY3Rpb24ob2JqZWN0TmFtZSwgcHJvcGVydHlOYW1lLCBvcmlnUHJvcGVydHksIGxvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHByb3RvdHlwZSBhbmQgY29uc3RydWN0b3Igc28gdGhhdCBpbnN0cnVtZW50ZWQgY2xhc3NlcyByZW1haW4gaW50YWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBUaGlzIG1heSBoYXZlIGludHJvZHVjZWQgcHJvdG90eXBlIHBvbGx1dGlvbiBhcyBwZXIgaHR0cHM6Ly9naXRodWIuY29tL29wZW53cG0vT3BlbldQTS9pc3N1ZXMvNDcxXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ1Byb3BlcnR5LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RydW1lbnRlZEZ1bmN0aW9uV3JhcHBlci5wcm90b3R5cGUgPSBvcmlnUHJvcGVydHkucHJvdG90eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnUHJvcGVydHkucHJvdG90eXBlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RydW1lbnRlZEZ1bmN0aW9uV3JhcHBlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ1Byb3BlcnR5LnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1bWVudGVkRnVuY3Rpb25XcmFwcGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvcmlnUHJvcGVydHkgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1NldHRpbmdzLnJlY3Vyc2l2ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nU2V0dGluZ3MuZGVwdGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ1Byb3BlcnR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nVmFsdWUoaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lLCBvcmlnUHJvcGVydHksIEpTT3BlcmF0aW9uLmdldCwgY2FsbENvbnRleHQsIGxvZ1NldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcmlnUHJvcGVydHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIHNldDogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxDb250ZXh0ID0gZ2V0T3JpZ2luYXRpbmdTY3JpcHRDb250ZXh0KGxvZ1NldHRpbmdzLmxvZ0NhbGxTdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSA9IGAke29iamVjdE5hbWV9LiR7cHJvcGVydHlOYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXR1cm5WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCBzZXRzIGZvciBmdW5jdGlvbnMgYW5kIG9iamVjdHMgaWYgZW5hYmxlZFxuICAgICAgICAgICAgICAgICAgICBpZiAobG9nU2V0dGluZ3MucHJldmVudFNldHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gXCJmdW5jdGlvblwiIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09IFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dWYWx1ZShpbnN0cnVtZW50ZWRWYXJpYWJsZU5hbWUsIHZhbHVlLCBKU09wZXJhdGlvbi5zZXRfcHJldmVudGVkLCBjYWxsQ29udGV4dCwgbG9nU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCBuZXcgdmFsdWUgdG8gb3JpZ2luYWwgc2V0dGVyL2xvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFNldHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYWNjZXNzb3IgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gb3JpZ2luYWxTZXR0ZXIuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIHByb3BEZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbkxvZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqZWN0LmlzUHJvdG90eXBlT2YodGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHlOYW1lLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluTG9nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBQcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciAke2luc3RydW1lbnRlZFZhcmlhYmxlTmFtZX0gZG9lc24ndCBoYXZlIHNldHRlciBvciB2YWx1ZT9gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ1ZhbHVlKGluc3RydW1lbnRlZFZhcmlhYmxlTmFtZSwgdmFsdWUsIEpTT3BlcmF0aW9uLnNldF9mYWlsZWQsIGNhbGxDb250ZXh0LCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9nVmFsdWUoaW5zdHJ1bWVudGVkVmFyaWFibGVOYW1lLCB2YWx1ZSwgSlNPcGVyYXRpb24uc2V0LCBjYWxsQ29udGV4dCwgbG9nU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnN0cnVtZW50T2JqZWN0KG9iamVjdCwgaW5zdHJ1bWVudGVkTmFtZSwgbG9nU2V0dGluZ3MpIHtcbiAgICAgICAgLy8gU2V0IHByb3BlcnRpZXNUb0luc3RydW1lbnQgdG8gbnVsbCB0byBmb3JjZSBubyBwcm9wZXJ0aWVzIHRvIGJlIGluc3RydW1lbnRlZC5cbiAgICAgICAgLy8gKHRoaXMgaXMgdXNlZCBpbiB0ZXN0aW5nIGZvciBleGFtcGxlKVxuICAgICAgICBsZXQgcHJvcGVydGllc1RvSW5zdHJ1bWVudDtcbiAgICAgICAgaWYgKGxvZ1NldHRpbmdzLnByb3BlcnRpZXNUb0luc3RydW1lbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXNUb0luc3RydW1lbnQgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChsb2dTZXR0aW5ncy5wcm9wZXJ0aWVzVG9JbnN0cnVtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcHJvcGVydGllc1RvSW5zdHJ1bWVudCA9IE9iamVjdC5nZXRQcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzVG9JbnN0cnVtZW50ID0gbG9nU2V0dGluZ3MucHJvcGVydGllc1RvSW5zdHJ1bWVudDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5TmFtZSBvZiBwcm9wZXJ0aWVzVG9JbnN0cnVtZW50KSB7XG4gICAgICAgICAgICBpZiAobG9nU2V0dGluZ3MuZXhjbHVkZWRQcm9wZXJ0aWVzLmluY2x1ZGVzKHByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIGByZWN1cnNpdmVgIGZsYWcgc2V0IHdlIHdhbnQgdG8gcmVjdXJzaXZlbHkgaW5zdHJ1bWVudCBhbnlcbiAgICAgICAgICAgIC8vIG9iamVjdCBwcm9wZXJ0aWVzIHRoYXQgYXJlbid0IHRoZSBwcm90b3R5cGUgb2JqZWN0LlxuICAgICAgICAgICAgaWYgKGxvZ1NldHRpbmdzLnJlY3Vyc2l2ZSAmJlxuICAgICAgICAgICAgICAgIGxvZ1NldHRpbmdzLmRlcHRoID4gMCAmJlxuICAgICAgICAgICAgICAgIGlzT2JqZWN0KG9iamVjdCwgcHJvcGVydHlOYW1lKSAmJlxuICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZSAhPT0gXCJfX3Byb3RvX19cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0luc3RydW1lbnRlZE5hbWUgPSBgJHtpbnN0cnVtZW50ZWROYW1lfS4ke3Byb3BlcnR5TmFtZX1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0xvZ1NldHRpbmdzID0geyAuLi5sb2dTZXR0aW5ncyB9O1xuICAgICAgICAgICAgICAgIG5ld0xvZ1NldHRpbmdzLmRlcHRoID0gbG9nU2V0dGluZ3MuZGVwdGggLSAxO1xuICAgICAgICAgICAgICAgIG5ld0xvZ1NldHRpbmdzLnByb3BlcnRpZXNUb0luc3RydW1lbnQgPSBbXTtcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50T2JqZWN0KG9iamVjdFtwcm9wZXJ0eU5hbWVdLCBuZXdJbnN0cnVtZW50ZWROYW1lLCBuZXdMb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGluc3RydW1lbnRPYmplY3RQcm9wZXJ0eShvYmplY3QsIGluc3RydW1lbnRlZE5hbWUsIHByb3BlcnR5TmFtZSwgbG9nU2V0dGluZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVHlwZUVycm9yICYmXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJjYW4ndCByZWRlZmluZSBub24tY29uZmlndXJhYmxlIHByb3BlcnR5XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ2Fubm90IGluc3RydW1lbnQgbm9uLWNvbmZpZ3VyYWJsZSBwcm9wZXJ0eTogJHtpbnN0cnVtZW50ZWROYW1lfToke3Byb3BlcnR5TmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ0Vycm9yVG9Db25zb2xlKGVycm9yLCB7IGluc3RydW1lbnRlZE5hbWUsIHByb3BlcnR5TmFtZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eU5hbWUgb2YgbG9nU2V0dGluZ3Mubm9uRXhpc3RpbmdQcm9wZXJ0aWVzVG9JbnN0cnVtZW50KSB7XG4gICAgICAgICAgICBpZiAobG9nU2V0dGluZ3MuZXhjbHVkZWRQcm9wZXJ0aWVzLmluY2x1ZGVzKHByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudE9iamVjdFByb3BlcnR5KG9iamVjdCwgaW5zdHJ1bWVudGVkTmFtZSwgcHJvcGVydHlOYW1lLCBsb2dTZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsb2dFcnJvclRvQ29uc29sZShlcnJvciwgeyBpbnN0cnVtZW50ZWROYW1lLCBwcm9wZXJ0eU5hbWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc2VuZEZhY3RvcnkgPSBmdW5jdGlvbiAoZXZlbnRJZCwgJHNlbmRNZXNzYWdlc1RvTG9nZ2VyKSB7XG4gICAgICAgIGxldCBtZXNzYWdlcyA9IFtdO1xuICAgICAgICAvLyBkZWJvdW5jZSBzZW5kaW5nIHF1ZXVlZCBtZXNzYWdlc1xuICAgICAgICBjb25zdCBfc2VuZCA9IGRlYm91bmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzZW5kTWVzc2FnZXNUb0xvZ2dlcihldmVudElkLCBtZXNzYWdlcyk7XG4gICAgICAgICAgICAvLyBjbGVhciB0aGUgcXVldWVcbiAgICAgICAgICAgIG1lc3NhZ2VzID0gW107XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobXNnVHlwZSwgbXNnKSB7XG4gICAgICAgICAgICAvLyBxdWV1ZSB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaCh7IHR5cGU6IG1zZ1R5cGUsIGNvbnRlbnQ6IG1zZyB9KTtcbiAgICAgICAgICAgIF9zZW5kKCk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBjb25zdCBzZW5kID0gc2VuZEZhY3RvcnkoZXZlbnRJZCwgc2VuZE1lc3NhZ2VzVG9Mb2dnZXIpO1xuICAgIGZ1bmN0aW9uIGluc3RydW1lbnRKUyhKU0luc3RydW1lbnRSZXF1ZXN0cykge1xuICAgICAgICAvLyBUaGUgSlMgSW5zdHJ1bWVudCBSZXF1ZXN0cyBhcmUgc2V0dXAgYW5kIHZhbGlkYXRlZCBweXRob24gc2lkZVxuICAgICAgICAvLyBpbmNsdWRpbmcgc2V0dGluZyBkZWZhdWx0cyBmb3IgbG9nU2V0dGluZ3MuXG4gICAgICAgIC8vIE1vcmUgZGV0YWlscyBhYm91dCBob3cgdGhpcyBmdW5jdGlvbiBpcyBpbnZva2VkIGFyZSBpblxuICAgICAgICAvLyBjb250ZW50L2phdmFzY3JpcHQtaW5zdHJ1bWVudC1jb250ZW50LXNjb3BlLnRzXG4gICAgICAgIEpTSW5zdHJ1bWVudFJlcXVlc3RzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGluc3RydW1lbnRPYmplY3QoZXZhbChpdGVtLm9iamVjdCksIGl0ZW0uaW5zdHJ1bWVudGVkTmFtZSwgaXRlbS5sb2dTZXR0aW5ncyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBUaGlzIHdob2xlIGZ1bmN0aW9uIGdldEluc3RydW1lbnRKUyByZXR1cm5zIGp1c3QgdGhlIGZ1bmN0aW9uIGBpbnN0cnVtZW50SlNgLlxuICAgIHJldHVybiBpbnN0cnVtZW50SlM7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhbk10YVc1emRISjFiV1Z1ZEhNdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdmJHbGlMMnB6TFdsdWMzUnlkVzFsYm5SekxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEdsRlFVRnBSVHRCUVVOcVJTeHZSa0ZCYjBZN1FVRTRRbkJHTEUxQlFVMHNWVUZCVlN4bFFVRmxMRU5CUVVNc1QwRkJaU3hGUVVGRkxHOUNRVUZ2UWp0SlFVTnVSVHM3TzA5QlIwYzdTVUZGU0N4dFJVRkJiVVU3U1VGRGJrVXNUVUZCVFN4WFFVRlhMRWRCUVVjc1IwRkJSeXhEUVVGRE8wbEJRM2hDTEdGQlFXRTdTVUZEWWl4TlFVRk5MRlZCUVZVc1IwRkJSeXhKUVVGSkxFMUJRVTBzUlVGQlJTeERRVUZETzBsQlEyaERMQ3REUVVFclF6dEpRVU12UXl4SlFVRkpMRXRCUVVzc1IwRkJSeXhMUVVGTExFTkJRVU03U1VGRGJFSXNaMFJCUVdkRU8wbEJRMmhFTEVsQlFVa3NUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVWb1Fpd3dRa0ZCTUVJN1NVRkRNVUlzVFVGQlRTeFhRVUZYTEVkQlFVYzdVVUZEYkVJc1NVRkJTU3hGUVVGRkxFMUJRVTA3VVVGRFdpeEhRVUZITEVWQlFVVXNTMEZCU3p0UlFVTldMRlZCUVZVc1JVRkJSU3hoUVVGaE8xRkJRM3BDTEZsQlFWa3NSVUZCUlN4bFFVRmxPMUZCUXpkQ0xFZEJRVWNzUlVGQlJTeExRVUZMTzFGQlExWXNWVUZCVlN4RlFVRkZMR0ZCUVdFN1VVRkRla0lzWVVGQllTeEZRVUZGTEdkQ1FVRm5RanRMUVVOb1F5eERRVUZETzBsQlJVWXNiMFpCUVc5R08wbEJRM0JHTEhsRlFVRjVSVHRKUVVONlJTeE5RVUZOTEVOQlFVTXNjVUpCUVhGQ0xFZEJRVWNzVlVGQlZTeFBRVUZQTEVWQlFVVXNTVUZCU1R0UlFVTndSQ3hKUVVGSkxFOUJRVThzUzBGQlN5eFRRVUZUTEVWQlFVVTdXVUZEZWtJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5dzJRMEZCTmtNc1EwRkJReXhEUVVGRE8xTkJRMmhGTzFGQlEwUXNTVUZCU1N4RlFVRkZMRWRCUVVjc1RVRkJUU3hEUVVGRExIZENRVUYzUWl4RFFVRkRMRTlCUVU4c1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU40UkN4SlFVRkpMRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMUZCUXpORExFOUJRVThzUlVGQlJTeExRVUZMTEZOQlFWTXNTVUZCU1N4TFFVRkxMRXRCUVVzc1NVRkJTU3hGUVVGRk8xbEJRM3BETEVWQlFVVXNSMEZCUnl4TlFVRk5MRU5CUVVNc2QwSkJRWGRDTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8xbEJRMnhFTEV0QlFVc3NSMEZCUnl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzFOQlEzUkRPMUZCUTBRc1QwRkJUeXhGUVVGRkxFTkJRVU03U1VGRFdpeERRVUZETEVOQlFVTTdTVUZGUml4TlFVRk5MRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NWVUZCVlN4UFFVRlBPMUZCUTNwRExFbEJRVWtzVDBGQlR5eExRVUZMTEZOQlFWTXNSVUZCUlR0WlFVTjZRaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEhkRFFVRjNReXhEUVVGRExFTkJRVU03VTBGRE0wUTdVVUZEUkN4SlFVRkpMRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRGFFUXNTVUZCU1N4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExHTkJRV01zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVTXpReXhQUVVGUExFdEJRVXNzUzBGQlN5eEpRVUZKTEVWQlFVVTdXVUZEY2tJc1MwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRzFDUVVGdFFpeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRlRVFzUzBGQlN5eEhRVUZITEUxQlFVMHNRMEZCUXl4alFVRmpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03VTBGRGRFTTdVVUZEUkN4dlJFRkJiMFE3VVVGRGNFUXNUMEZCVHl4TFFVRkxMRU5CUVVNN1NVRkRaaXhEUVVGRExFTkJRVU03U1VGRlJpeHZRMEZCYjBNN1NVRkRjRU1zVTBGQlV5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3haUVVGeFFpeExRVUZMTzFGQlEzUkVMRWxCUVVrc1QwRkJUeXhEUVVGRE8xRkJRMW9zU1VGQlNTeEpRVUZKTEVOQlFVTTdVVUZEVkN4SlFVRkpMRTlCUVU4c1EwRkJRenRSUVVOYUxFbEJRVWtzVTBGQlV5eERRVUZETzFGQlEyUXNTVUZCU1N4TlFVRk5MRU5CUVVNN1VVRkZXQ3hOUVVGTkxFdEJRVXNzUjBGQlJ6dFpRVU5hTEUxQlFVMHNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUjBGQlJ5eFRRVUZUTEVOQlFVTTdXVUZEY0VNc1NVRkJTU3hKUVVGSkxFZEJRVWNzU1VGQlNTeEZRVUZGTzJkQ1FVTm1MRTlCUVU4c1IwRkJSeXhWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJRenRoUVVNeFF6dHBRa0ZCVFR0blFrRkRUQ3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETzJkQ1FVTm1MRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVU3YjBKQlEyUXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlDUVVOdVF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJRenRwUWtGRGRrSTdZVUZEUmp0UlFVTklMRU5CUVVNc1EwRkJRenRSUVVWR0xFOUJRVTg3V1VGRFRDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMWxCUTJZc1NVRkJTU3hIUVVGSExGTkJRVk1zUTBGQlF6dFpRVU5xUWl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETzFsQlEzWkNMRTFCUVUwc1QwRkJUeXhIUVVGSExGTkJRVk1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXp0WlFVTjBReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTzJkQ1FVTmFMRTlCUVU4c1IwRkJSeXhWUVVGVkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMkZCUTI1RE8xbEJRMFFzU1VGQlNTeFBRVUZQTEVWQlFVVTdaMEpCUTFnc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yZENRVU51UXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dGhRVU4yUWp0WlFVVkVMRTlCUVU4c1RVRkJUU3hEUVVGRE8xRkJRMmhDTEVOQlFVTXNRMEZCUXp0SlFVTktMRU5CUVVNN1NVRkZSQ3c0UTBGQk9FTTdTVUZET1VNc1UwRkJVeXh0UWtGQmJVSXNRMEZCUXl4UFFVRlpMRVZCUVVVc2FVSkJRVEJDTEV0QlFVczdVVUZEZUVVc1NVRkJTU3hQUVVGUExFdEJRVXNzVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlR0WlFVTTNRaXhQUVVGUExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTTdVMEZEZUVJN1VVRkRSQ3hKUVVGSkxFOUJRVThzUTBGQlF5eFZRVUZWTEV0QlFVc3NTVUZCU1N4RlFVRkZPMWxCUXk5Q0xFOUJRVThzVDBGQlR5eEhRVUZITEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNN1UwRkRiRU03VVVGRlJDeEpRVUZKTEZsQlFWa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkRja0lzVFVGQlRTeFJRVUZSTEVkQlFVY3NUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhWUVVGVkxFTkJRVU03VVVGREwwTXNTMEZCU3l4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEZGQlFWRXNRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVU3V1VGRGVFTXNUVUZCVFN4UFFVRlBMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlF6VkNMRWxCUVVrc1QwRkJUeXhMUVVGTExFOUJRVThzUlVGQlJUdG5Ra0ZEZGtJc1NVRkJTU3hKUVVGSkxFZEJRVWNzYlVKQlFXMUNMRU5CUVVNc1QwRkJUeXhEUVVGRExGVkJRVlVzUlVGQlJTeGpRVUZqTEVOQlFVTXNRMEZCUXp0blFrRkRia1VzU1VGQlNTeEpRVUZKTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc1QwRkJUeXhIUVVGSExFZEJRVWNzUjBGQlJ5eFpRVUZaTEVOQlFVTTdaMEpCUTI1RUxFbEJRVWtzU1VGQlNTeEhRVUZITEVkQlFVY3NUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJRenRuUWtGRGVrSXNTVUZCU1N4SlFVRkpMRWRCUVVjc1IwRkJSeXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETzJkQ1FVTm9ReXhKUVVGSkxHTkJRV01zUlVGQlJUdHZRa0ZEYkVJc1NVRkJTU3hKUVVGSkxFZEJRVWNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRPMjlDUVVNM1FpeEpRVUZKTEVsQlFVa3NSMEZCUnl4SFFVRkhMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETzI5Q1FVTndReXhKUVVGSkxFbEJRVWtzUjBGQlJ5eEhRVUZITEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1ZVRkJWU3hEUVVGRE8ybENRVU40UXp0blFrRkRSQ3hKUVVGSkxFOUJRVThzUTBGQlF5eFBRVUZQTEV0QlFVc3NSMEZCUnl4RlFVRkZPMjlDUVVNelFpeEpRVUZKTEVsQlFVa3NSMEZCUnl4SFFVRkhMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU03YVVKQlF6VkNPMmRDUVVORUxFbEJRVWtzU1VGQlNTeEhRVUZITEVOQlFVTTdaMEpCUTFvc1QwRkJUeXhKUVVGSkxFTkJRVU03WVVGRFlqdFpRVU5FTEVsQlFVa3NUMEZCVHl4RFFVRkRMRkZCUVZFc1MwRkJTeXhEUVVGRExFbEJRVWtzVDBGQlR5eERRVUZETEU5QlFVOHNTMEZCU3l4UFFVRlBMRU5CUVVNc1QwRkJUeXhGUVVGRk8yZENRVU5xUlN4WlFVRlpMRVZCUVVVc1EwRkJRenRoUVVOb1FqdFRRVU5HTzBsQlEwZ3NRMEZCUXp0SlFVVkVMR2REUVVGblF6dEpRVU5vUXl4VFFVRlRMR1ZCUVdVc1EwRkRkRUlzVFVGQlRTeEZRVU5PTEhGQ1FVRTRRaXhMUVVGTE8xRkJSVzVETERSQ1FVRTBRanRSUVVNMVFpeEpRVUZKTzFsQlEwWXNTVUZCU1N4TlFVRk5MRXRCUVVzc1NVRkJTU3hGUVVGRk8yZENRVU51UWl4UFFVRlBMRTFCUVUwc1EwRkJRenRoUVVObU8xbEJRMFFzU1VGQlNTeFBRVUZQTEUxQlFVMHNTMEZCU3l4VlFVRlZMRVZCUVVVN1owSkJRMmhETEU5QlFVOHNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETzJGQlF6VkVPMWxCUTBRc1NVRkJTU3hQUVVGUExFMUJRVTBzUzBGQlN5eFJRVUZSTEVWQlFVVTdaMEpCUXpsQ0xFOUJRVThzVFVGQlRTeERRVUZETzJGQlEyWTdXVUZEUkN4TlFVRk5MRmRCUVZjc1IwRkJSeXhGUVVGRkxFTkJRVU03V1VGRGRrSXNUMEZCVHl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUlVGQlJTeFZRVUZWTEVkQlFVY3NSVUZCUlN4TFFVRkxPMmRDUVVOb1JDeEpRVUZKTEV0QlFVc3NTMEZCU3l4SlFVRkpMRVZCUVVVN2IwSkJRMnhDTEU5QlFVOHNUVUZCVFN4RFFVRkRPMmxDUVVObU8yZENRVU5FTEVsQlFVa3NUMEZCVHl4TFFVRkxMRXRCUVVzc1ZVRkJWU3hGUVVGRk8yOUNRVU12UWl4UFFVRlBMR3RDUVVGclFpeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZWQlFWVXNRMEZCUXp0cFFrRkRNMFE3WjBKQlEwUXNTVUZCU1N4UFFVRlBMRXRCUVVzc1MwRkJTeXhSUVVGUkxFVkJRVVU3YjBKQlF6ZENMSEZEUVVGeFF6dHZRa0ZEY2tNc1NVRkJTU3hwUWtGQmFVSXNTVUZCU1N4TFFVRkxMRVZCUVVVN2QwSkJRemxDTEV0QlFVc3NSMEZCUnl4TFFVRkxMRU5CUVVNc1pVRkJaU3hEUVVGRE8zRkNRVU12UWp0dlFrRkZSQ3g1UWtGQmVVSTdiMEpCUTNwQ0xFbEJRVWtzUzBGQlN5eFpRVUZaTEZkQlFWY3NSVUZCUlR0M1FrRkRhRU1zVDBGQlR5eHRRa0ZCYlVJc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dHhRa0ZEYmtNN2IwSkJSVVFzSzBKQlFTdENPMjlDUVVNdlFpeEpRVUZKTEVkQlFVY3NTMEZCU3l4RlFVRkZMRWxCUVVrc1YwRkJWeXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVN2QwSkJRMmhFTEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03ZDBKQlEzaENMRTlCUVU4c1MwRkJTeXhEUVVGRE8zRkNRVU5rTzNsQ1FVRk5PM2RDUVVOTUxFOUJRVThzVDBGQlR5eExRVUZMTEVOQlFVTTdjVUpCUTNKQ08ybENRVU5HTzJkQ1FVTkVMRTlCUVU4c1MwRkJTeXhEUVVGRE8xbEJRMllzUTBGQlF5eERRVUZETEVOQlFVTTdVMEZEU2p0UlFVRkRMRTlCUVU4c1MwRkJTeXhGUVVGRk8xbEJRMlFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4blEwRkJaME1zUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXp0WlFVTjBSQ3hQUVVGUExIVkNRVUYxUWl4SFFVRkhMRXRCUVVzc1EwRkJRenRUUVVONFF6dEpRVU5JTEVOQlFVTTdTVUZGUkN4VFFVRlRMREpDUVVFeVFpeERRVUZETEZOQlFWTXNSVUZCUlN4TlFVRk5PMUZCUTNCRUxFMUJRVTBzUjBGQlJ5eEhRVUZITEZOQlFWTXNSMEZCUnl4SFFVRkhMRWRCUVVjc1RVRkJUU3hEUVVGRE8xRkJRM0pETEVsQlFVa3NSMEZCUnl4SlFVRkpMRlZCUVZVc1NVRkJTU3hWUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NWMEZCVnl4RlFVRkZPMWxCUTNaRUxFOUJRVThzU1VGQlNTeERRVUZETzFOQlEySTdZVUZCVFN4SlFVRkpMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzVlVGQlZTeERRVUZETEVWQlFVVTdXVUZETDBJc1ZVRkJWU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0VFFVTnlRanRoUVVGTk8xbEJRMHdzVlVGQlZTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRUUVVOMFFqdFJRVU5FTEU5QlFVOHNTMEZCU3l4RFFVRkRPMGxCUTJZc1EwRkJRenRKUVVWRUxIbERRVUY1UXp0SlFVTjZReXhUUVVGVExGRkJRVkVzUTBGRFppeDNRa0ZCWjBNc1JVRkRhRU1zUzBGQlZTeEZRVU5XTEZOQlFXbENMRVZCUVVVc2FVTkJRV2xETzBsQlEzQkVMRmRCUVdkQ0xFVkJRMmhDTEZkQlFYZENPMUZCUlhoQ0xFbEJRVWtzUzBGQlN5eEZRVUZGTzFsQlExUXNUMEZCVHp0VFFVTlNPMUZCUTBRc1MwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF6dFJRVVZpTEUxQlFVMHNVMEZCVXl4SFFVRkhMREpDUVVFeVFpeERRVU16UXl4WFFVRlhMRU5CUVVNc1UwRkJVeXhGUVVOeVFpeDNRa0ZCZDBJc1EwRkRla0lzUTBGQlF6dFJRVU5HTEVsQlFVa3NVMEZCVXl4RlFVRkZPMWxCUTJJc1MwRkJTeXhIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU5rTEU5QlFVODdVMEZEVWp0UlFVVkVMRTFCUVUwc1IwRkJSeXhIUVVGSE8xbEJRMVlzVTBGQlV6dFpRVU5VTEUxQlFVMHNSVUZCUlN4M1FrRkJkMEk3V1VGRGFFTXNTMEZCU3l4RlFVRkZMR1ZCUVdVc1EwRkJReXhMUVVGTExFVkJRVVVzVjBGQlZ5eERRVUZETEhGQ1FVRnhRaXhEUVVGRE8xbEJRMmhGTEZOQlFWTXNSVUZCUlN4WFFVRlhMRU5CUVVNc1UwRkJVenRaUVVOb1F5eFZRVUZWTEVWQlFVVXNWMEZCVnl4RFFVRkRMRlZCUVZVN1dVRkRiRU1zVTBGQlV5eEZRVUZGTEZkQlFWY3NRMEZCUXl4VFFVRlRPMWxCUTJoRExGRkJRVkVzUlVGQlJTeFhRVUZYTEVOQlFVTXNVVUZCVVR0WlFVTTVRaXhoUVVGaExFVkJRVVVzVjBGQlZ5eERRVUZETEdGQlFXRTdXVUZEZUVNc1UwRkJVeXhGUVVGRkxGZEJRVmNzUTBGQlF5eFRRVUZUTzFsQlEyaERMRTlCUVU4c1JVRkJSU3hQUVVGUExFVkJRVVU3VTBGRGJrSXNRMEZCUXp0UlFVVkdMRWxCUVVrN1dVRkRSaXhKUVVGSkxFTkJRVU1zVlVGQlZTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMU5CUTNaQ08xRkJRVU1zVDBGQlR5eExRVUZMTEVWQlFVVTdXVUZEWkN4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHdERRVUZyUXl4RFFVRkRMRU5CUVVNN1dVRkRhRVFzYVVKQlFXbENMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03VTBGRE1VSTdVVUZGUkN4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRE8wbEJRMmhDTEVOQlFVTTdTVUZGUkN4blFrRkJaMEk3U1VGRGFFSXNVMEZCVXl4UFFVRlBMRU5CUTJRc2QwSkJRV2RETEVWQlEyaERMRWxCUVdkQ0xFVkJRMmhDTEZkQlFXZENMRVZCUTJoQ0xGZEJRWGRDTzFGQlJYaENMRWxCUVVrc1MwRkJTeXhGUVVGRk8xbEJRMVFzVDBGQlR6dFRRVU5TTzFGQlEwUXNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVWaUxFMUJRVTBzVTBGQlV5eEhRVUZITERKQ1FVRXlRaXhEUVVNelF5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RlFVTnlRaXgzUWtGQmQwSXNRMEZEZWtJc1EwRkJRenRSUVVOR0xFbEJRVWtzVTBGQlV5eEZRVUZGTzFsQlEySXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJRenRaUVVOa0xFOUJRVTg3VTBGRFVqdFJRVVZFTEVsQlFVazdXVUZEUml4eFJVRkJjVVU3V1VGRGNrVXNUVUZCVFN4VlFVRlZMRWRCUVdFc1JVRkJSU3hEUVVGRE8xbEJRMmhETEV0QlFVc3NUVUZCVFN4SFFVRkhMRWxCUVVrc1NVRkJTU3hGUVVGRk8yZENRVU4wUWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVOaUxHVkJRV1VzUTBGQlF5eEhRVUZITEVWQlFVVXNWMEZCVnl4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVOQlEzaEVMRU5CUVVNN1lVRkRTRHRaUVVORUxFMUJRVTBzUjBGQlJ5eEhRVUZITzJkQ1FVTldMRk5CUVZNc1JVRkJSU3hYUVVGWExFTkJRVU1zU1VGQlNUdG5Ra0ZETTBJc1RVRkJUU3hGUVVGRkxIZENRVUYzUWp0blFrRkRhRU1zU1VGQlNTeEZRVUZGTEZWQlFWVTdaMEpCUTJoQ0xFdEJRVXNzUlVGQlJTeEZRVUZGTzJkQ1FVTlVMRk5CUVZNc1JVRkJSU3hYUVVGWExFTkJRVU1zVTBGQlV6dG5Ra0ZEYUVNc1ZVRkJWU3hGUVVGRkxGZEJRVmNzUTBGQlF5eFZRVUZWTzJkQ1FVTnNReXhUUVVGVExFVkJRVVVzVjBGQlZ5eERRVUZETEZOQlFWTTdaMEpCUTJoRExGRkJRVkVzUlVGQlJTeFhRVUZYTEVOQlFVTXNVVUZCVVR0blFrRkRPVUlzWVVGQllTeEZRVUZGTEZkQlFWY3NRMEZCUXl4aFFVRmhPMmRDUVVONFF5eFRRVUZUTEVWQlFVVXNWMEZCVnl4RFFVRkRMRk5CUVZNN1owSkJRMmhETEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVN1lVRkRia0lzUTBGQlF6dFpRVU5HTEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVU03VTBGRGRFSTdVVUZCUXl4UFFVRlBMRXRCUVVzc1JVRkJSVHRaUVVOa0xFOUJRVThzUTBGQlF5eEhRVUZITEVOQlExUXNhME5CUVd0RExFZEJRVWNzZDBKQlFYZENMRU5CUXpsRUxFTkJRVU03V1VGRFJpeHBRa0ZCYVVJc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFRRVU14UWp0UlFVTkVMRXRCUVVzc1IwRkJSeXhMUVVGTExFTkJRVU03U1VGRGFFSXNRMEZCUXp0SlFVVkVMRk5CUVZNc2FVSkJRV2xDTEVOQlFVTXNTMEZCU3l4RlFVRkZMRlZCUVdVc1MwRkJTenRSUVVOd1JDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMSFZDUVVGMVFpeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOd1JDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMREJDUVVFd1FpeEhRVUZITEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVNeFJDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMREpDUVVFeVFpeEhRVUZITEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVNMVJDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRGhDUVVFNFFpeEhRVUZITEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVOcVJTeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMSGRDUVVGM1FpeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRSUVVOMFJDeEpRVUZKTEU5QlFVOHNSVUZCUlR0WlFVTllMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zTUVKQlFUQkNMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMU5CUTNKRk8wbEJRMGdzUTBGQlF6dEpRVVZFTEhkRFFVRjNRenRKUVVONFF5eFRRVUZUTEdGQlFXRTdVVUZEY0VJc1NVRkJTU3hMUVVGTExFTkJRVU03VVVGRlZpeEpRVUZKTzFsQlEwWXNUVUZCVFN4SlFVRkpMRXRCUVVzc1JVRkJSU3hEUVVGRE8xTkJRMjVDTzFGQlFVTXNUMEZCVHl4SFFVRkhMRVZCUVVVN1dVRkRXaXhMUVVGTExFZEJRVWNzUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXp0VFFVTnVRanRSUVVWRUxFOUJRVThzUzBGQlN5eERRVUZETzBsQlEyWXNRMEZCUXp0SlFVVkVMREJEUVVFd1F6dEpRVU14UXl4TlFVRk5MRTFCUVUwc1IwRkJSeXhWUVVGVkxFMUJRV01zUlVGQlJTeEhRVUZITEVWQlFVVXNVVUZCVVR0UlFVTndSQ3hOUVVGTkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRMmhETEU5QlFVOHNVVUZCVVR0WlFVTmlMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRaUVVOMFJTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRPMGxCUTFvc1EwRkJReXhEUVVGRE8wbEJSVVlzVTBGQlV5d3lRa0ZCTWtJc1EwRkJReXhaUVVGWkxFZEJRVWNzUzBGQlN6dFJRVU4yUkN4TlFVRk5MRXRCUVVzc1IwRkJSeXhoUVVGaExFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRGFrUXNiMFJCUVc5RU8xRkJRM0JFTEUxQlFVMHNZVUZCWVN4SFFVRkhPMWxCUTNCQ0xGTkJRVk1zUlVGQlJTeEZRVUZGTzFsQlEySXNWVUZCVlN4RlFVRkZMRVZCUVVVN1dVRkRaQ3hUUVVGVExFVkJRVVVzUlVGQlJUdFpRVU5pTEZGQlFWRXNSVUZCUlN4RlFVRkZPMWxCUTFvc1lVRkJZU3hGUVVGRkxFVkJRVVU3V1VGRGFrSXNVMEZCVXl4RlFVRkZMRVZCUVVVN1UwRkRaQ3hEUVVGRE8xRkJRMFlzU1VGQlNTeExRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSVHRaUVVOd1FpeFBRVUZQTEdGQlFXRXNRMEZCUXp0VFFVTjBRanRSUVVORUxEQkZRVUV3UlR0UlFVTXhSU3hOUVVGTkxGRkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRNVUlzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0WlFVTmlMRTlCUVU4c1lVRkJZU3hEUVVGRE8xTkJRM1JDTzFGQlEwUTdPenM3T3pzN08xZEJVVWM3VVVGRFNDeEpRVUZKTzFsQlEwWXNTVUZCU1N4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGRE8xbEJRMjVDTEVsQlFVa3NZVUZCWVN4SFFVRkhMRVZCUVVVc1EwRkJReXhEUVVGRExEWkNRVUUyUWp0WlFVTnlSQ3hOUVVGTkxHRkJRV0VzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRekZETEUxQlFVMHNVVUZCVVN4SFFVRkhMR0ZCUVdFc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdXVUZEZUVNc1RVRkJUU3hMUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZETDBNc1RVRkJUU3hSUVVGUkxFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGVrTXNUVUZCVFN4TlFVRk5MRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRka01zVFVGQlRTeGpRVUZqTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMWxCUTNKRUxFMUJRVTBzVTBGQlV5eEhRVUZITEdOQlFXTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eDVRMEZCZVVNN1dVRkROMFlzU1VGQlNTeFRRVUZUTEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUVVVN1owSkJRM0JDTEZOQlFWTXNSMEZCUnl4alFVRmpMRU5CUVVNc1EwRkJReXh2UkVGQmIwUTdZVUZEYWtZN2FVSkJRVTA3WjBKQlEwd3NVMEZCVXl4SFFVRkhMR05CUVdNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eEZRVUZGTEZOQlFWTXNRMEZCUXl4RFFVRkRPMmRDUVVNdlF5eGhRVUZoTEVkQlFVY3NZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkRiRU1zVTBGQlV5eEhRVUZITEVOQlFVTXNSVUZEWWl4alFVRmpMRU5CUVVNc1RVRkJUU3hEUVVOMFFpeERRVUZETzJGQlEwZzdXVUZEUkN4TlFVRk5MRmRCUVZjc1IwRkJSenRuUWtGRGJFSXNVMEZCVXp0blFrRkRWQ3hWUVVGVkxFVkJRVVVzVFVGQlRUdG5Ra0ZEYkVJc1UwRkJVeXhGUVVGRkxGRkJRVkU3WjBKQlEyNUNMRkZCUVZFN1owSkJRMUlzWVVGQllUdG5Ra0ZEWWl4VFFVRlRMRVZCUVVVc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJUdGhRVU5vUlN4RFFVRkRPMWxCUTBZc1QwRkJUeXhYUVVGWExFTkJRVU03VTBGRGNFSTdVVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRaUVVOV0xFOUJRVThzUTBGQlF5eEhRVUZITEVOQlExUXNNa05CUVRKRExFVkJRek5ETEVOQlFVTXNRMEZCUXl4UlFVRlJMRVZCUVVVc1JVRkRXaXhSUVVGUkxFTkJRMVFzUTBGQlF6dFpRVU5HTEU5QlFVOHNZVUZCWVN4RFFVRkRPMU5CUTNSQ08wbEJRMGdzUTBGQlF6dEpRVVZFTEZOQlFWTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1JVRkJSU3haUVVGWk8xRkJRM0JETEVsQlFVa3NVVUZCVVN4RFFVRkRPMUZCUTJJc1NVRkJTVHRaUVVOR0xGRkJRVkVzUjBGQlJ5eE5RVUZOTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1UwRkRha003VVVGQlF5eFBRVUZQTEV0QlFVc3NSVUZCUlR0WlFVTmtMRTlCUVU4c1MwRkJTeXhEUVVGRE8xTkJRMlE3VVVGRFJDeEpRVUZKTEZGQlFWRXNTMEZCU3l4SlFVRkpMRVZCUVVVN1dVRkRja0lzZDBKQlFYZENPMWxCUTNoQ0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZEUkN4UFFVRlBMRTlCUVU4c1VVRkJVU3hMUVVGTExGRkJRVkVzUTBGQlF6dEpRVU4wUXl4RFFVRkRPMGxCUlVRc1owTkJRV2RETzBsQlEyaERMSGRGUVVGM1JUdEpRVU40UlN4NVJVRkJlVVU3U1VGRGVrVXNkMFJCUVhkRU8wbEJRM2hFTEZOQlFWTXNhMEpCUVd0Q0xFTkJRM3BDTEZWQlFXdENMRVZCUTJ4Q0xGVkJRV3RDTEVWQlEyeENMRWxCUVZNc1JVRkRWQ3hYUVVGM1FqdFJRVVY0UWl4UFFVRlBPMWxCUTB3c1RVRkJUU3hYUVVGWExFZEJRVWNzTWtKQlFUSkNMRU5CUVVNc1YwRkJWeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzFsQlF6RkZMRTlCUVU4c1EwRkRUQ3hWUVVGVkxFZEJRVWNzUjBGQlJ5eEhRVUZITEZWQlFWVXNSVUZETjBJc1UwRkJVeXhGUVVOVUxGZEJRVmNzUlVGRFdDeFhRVUZYTEVOQlExb3NRMEZCUXp0WlFVTkdMRTlCUVU4c1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1VVRkRja01zUTBGQlF5eERRVUZETzBsQlEwb3NRMEZCUXp0SlFVVkVMREpEUVVFeVF6dEpRVU16UXl4VFFVRlRMSGRDUVVGM1FpeERRVU12UWl4TlFVRk5MRVZCUTA0c1ZVRkJhMElzUlVGRGJFSXNXVUZCYjBJc1JVRkRjRUlzVjBGQmQwSTdVVUZGZUVJc1NVRkRSU3hEUVVGRExFMUJRVTA3V1VGRFVDeERRVUZETEZWQlFWVTdXVUZEV0N4RFFVRkRMRmxCUVZrN1dVRkRZaXhaUVVGWkxFdEJRVXNzVjBGQlZ5eEZRVU0xUWp0WlFVTkJMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRMkk3YTBKQlExVXNUVUZCVFR0elFrRkRSaXhWUVVGVk8zZENRVU5TTEZsQlFWazdVMEZETTBJc1EwRkRSaXhEUVVGRE8xTkJRMGc3VVVGRlJDeDFRMEZCZFVNN1VVRkRka01zVFVGQlRTeFJRVUZSTEVkQlFVY3NUVUZCVFN4RFFVRkRMSEZDUVVGeFFpeERRVUZETEUxQlFVMHNSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJRenRSUVVWd1JTeHZSa0ZCYjBZN1VVRkRjRVlzU1VGRFJTeERRVUZETEZGQlFWRTdXVUZEVkN4RFFVRkRMRmRCUVZjc1EwRkJReXhwUTBGQmFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1dVRkJXU3hEUVVGRExFVkJRM0pGTzFsQlEwRXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkRXQ3h0UTBGQmJVTXNSVUZEYmtNc1ZVRkJWU3hGUVVOV0xGbEJRVmtzUlVGRFdpeE5RVUZOTEVOQlExQXNRMEZCUXp0WlFVTkdMRTlCUVU4N1UwRkRVanRSUVVWRUxDdERRVUVyUXp0UlFVTXZReXhKUVVGSkxHdENRVUZyUWl4RFFVRkRPMUZCUTNaQ0xFMUJRVTBzYVVKQlFXbENMRWRCUVVjN1dVRkRlRUlzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlR0blFrRkRVaXhQUVVGUExHdENRVUZyUWl4RFFVRkRPMWxCUXpWQ0xFTkJRVU03V1VGRFJDeEhRVUZITEVWQlFVVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1JVRkJSVHRuUWtGRFlpeHJRa0ZCYTBJc1IwRkJSeXhMUVVGTExFTkJRVU03V1VGRE4wSXNRMEZCUXp0WlFVTkVMRlZCUVZVc1JVRkJSU3hMUVVGTE8xTkJRMnhDTEVOQlFVTTdVVUZGUml4dFJFRkJiVVE3VVVGRGJrUXNUVUZCVFN4alFVRmpMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4SFFVRkhMRU5CUVVNN1VVRkRka1VzVFVGQlRTeGpRVUZqTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eEhRVUZITEVOQlFVTTdVVUZEZGtVc1NVRkJTU3hoUVVGaExFZEJRVWNzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eHJRa0ZCYTBJc1EwRkJRenRSUVVWdVJTeHZSVUZCYjBVN1VVRkRjRVVzYjBKQlFXOUNPMUZCUTNCQ0xFMUJRVTBzUTBGQlF5eGpRVUZqTEVOQlFVTXNUVUZCVFN4RlFVRkZMRmxCUVZrc1JVRkJSVHRaUVVNeFF5eFpRVUZaTEVWQlFVVXNTVUZCU1R0WlFVTnNRaXhIUVVGSExFVkJRVVVzUTBGQlF6dG5Ra0ZEU2l4UFFVRlBPMjlDUVVOTUxFbEJRVWtzV1VGQldTeERRVUZETzI5Q1FVTnFRaXhOUVVGTkxGZEJRVmNzUjBGQlJ5d3lRa0ZCTWtJc1EwRkROME1zVjBGQlZ5eERRVUZETEZsQlFWa3NRMEZEZWtJc1EwRkJRenR2UWtGRFJpeE5RVUZOTEhkQ1FVRjNRaXhIUVVGSExFZEJRVWNzVlVGQlZTeEpRVUZKTEZsQlFWa3NSVUZCUlN4RFFVRkRPMjlDUVVWcVJTeHhRa0ZCY1VJN2IwSkJRM0pDTEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVN2QwSkJRMklzZDBKQlFYZENPM2RDUVVONFFpeFpRVUZaTEVkQlFVY3NhMEpCUVd0Q0xFTkJRVU03Y1VKQlEyNURPM2xDUVVGTkxFbEJRVWtzWTBGQll5eEZRVUZGTzNkQ1FVTjZRaXgxUWtGQmRVSTdkMEpCUTNaQ0xGbEJRVmtzUjBGQlJ5eGpRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zRkNRVU14UXp0NVFrRkJUU3hKUVVGSkxFOUJRVThzU1VGQlNTeFJRVUZSTEVWQlFVVTdkMEpCUXpsQ0xHMUNRVUZ0UWp0M1FrRkRia0lzV1VGQldTeEhRVUZITEdGQlFXRXNRMEZCUXp0eFFrRkRPVUk3ZVVKQlFVMDdkMEpCUTB3c1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGRFdDd3lRa0ZCTWtJc2QwSkJRWGRDTEdkRFFVRm5ReXhEUVVOd1JpeERRVUZETzNkQ1FVTkdMRkZCUVZFc1EwRkRUaXgzUWtGQmQwSXNSVUZEZUVJc1JVRkJSU3hGUVVOR0xGZEJRVmNzUTBGQlF5eFZRVUZWTEVWQlEzUkNMRmRCUVZjc1JVRkRXQ3hYUVVGWExFTkJRMW9zUTBGQlF6dDNRa0ZEUml4UFFVRlBPM0ZDUVVOU08yOUNRVVZFTEN0RVFVRXJSRHR2UWtGREwwUXNNa1JCUVRKRU8yOUNRVU16UkN4elJFRkJjMFE3YjBKQlEzUkVMR3RGUVVGclJUdHZRa0ZEYkVVc1NVRkJTU3hQUVVGUExGbEJRVmtzUzBGQlN5eFZRVUZWTEVWQlFVVTdkMEpCUTNSRExFbEJRVWtzVjBGQlZ5eERRVUZETEdWQlFXVXNSVUZCUlRzMFFrRkRMMElzVVVGQlVTeERRVU5PTEhkQ1FVRjNRaXhGUVVONFFpeFpRVUZaTEVWQlExb3NWMEZCVnl4RFFVRkRMRmxCUVZrc1JVRkRlRUlzVjBGQlZ5eEZRVU5ZTEZkQlFWY3NRMEZEV2l4RFFVRkRPM2xDUVVOSU8zZENRVU5FTEUxQlFVMHNNa0pCUVRKQ0xFZEJRVWNzYTBKQlFXdENMRU5CUTNCRUxGVkJRVlVzUlVGRFZpeFpRVUZaTEVWQlExb3NXVUZCV1N4RlFVTmFMRmRCUVZjc1EwRkRXaXhEUVVGRE8zZENRVU5HTERSR1FVRTBSanQzUWtGRE5VWXNNRWRCUVRCSE8zZENRVU14Unl4SlFVRkpMRmxCUVZrc1EwRkJReXhUUVVGVExFVkJRVVU3TkVKQlF6RkNMREpDUVVFeVFpeERRVUZETEZOQlFWTXNSMEZCUnl4WlFVRlpMRU5CUVVNc1UwRkJVeXhEUVVGRE96UkNRVU12UkN4SlFVRkpMRmxCUVZrc1EwRkJReXhUUVVGVExFTkJRVU1zVjBGQlZ5eEZRVUZGTzJkRFFVTjBReXd5UWtGQk1rSXNRMEZCUXl4VFFVRlRMRU5CUVVNc1YwRkJWenR2UTBGREwwTXNXVUZCV1N4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFTkJRVU03TmtKQlEzUkRPM2xDUVVOR08zZENRVU5FTEU5QlFVOHNNa0pCUVRKQ0xFTkJRVU03Y1VKQlEzQkRPM2xDUVVGTkxFbEJRMHdzVDBGQlR5eFpRVUZaTEV0QlFVc3NVVUZCVVR0M1FrRkRhRU1zVjBGQlZ5eERRVUZETEZOQlFWTTdkMEpCUTNKQ0xGZEJRVmNzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4RlFVTnlRanQzUWtGRFFTeFBRVUZQTEZsQlFWa3NRMEZCUXp0eFFrRkRja0k3ZVVKQlFVMDdkMEpCUTB3c1VVRkJVU3hEUVVOT0xIZENRVUYzUWl4RlFVTjRRaXhaUVVGWkxFVkJRMW9zVjBGQlZ5eERRVUZETEVkQlFVY3NSVUZEWml4WFFVRlhMRVZCUTFnc1YwRkJWeXhEUVVOYUxFTkJRVU03ZDBKQlEwWXNUMEZCVHl4WlFVRlpMRU5CUVVNN2NVSkJRM0pDTzJkQ1FVTklMRU5CUVVNc1EwRkJRenRaUVVOS0xFTkJRVU1zUTBGQlF5eEZRVUZGTzFsQlEwb3NSMEZCUnl4RlFVRkZMRU5CUVVNN1owSkJRMG9zVDBGQlR5eFZRVUZWTEV0QlFVczdiMEpCUTNCQ0xFMUJRVTBzVjBGQlZ5eEhRVUZITERKQ1FVRXlRaXhEUVVNM1F5eFhRVUZYTEVOQlFVTXNXVUZCV1N4RFFVTjZRaXhEUVVGRE8yOUNRVU5HTEUxQlFVMHNkMEpCUVhkQ0xFZEJRVWNzUjBGQlJ5eFZRVUZWTEVsQlFVa3NXVUZCV1N4RlFVRkZMRU5CUVVNN2IwSkJRMnBGTEVsQlFVa3NWMEZCVnl4RFFVRkRPMjlDUVVWb1FpeHZSRUZCYjBRN2IwSkJRM0JFTEVsQlEwVXNWMEZCVnl4RFFVRkRMRmRCUVZjN2QwSkJRM1pDTEVOQlFVTXNUMEZCVHl4aFFVRmhMRXRCUVVzc1ZVRkJWVHMwUWtGRGJFTXNUMEZCVHl4aFFVRmhMRXRCUVVzc1VVRkJVU3hEUVVGRExFVkJRM0JETzNkQ1FVTkJMRkZCUVZFc1EwRkRUaXgzUWtGQmQwSXNSVUZEZUVJc1MwRkJTeXhGUVVOTUxGZEJRVmNzUTBGQlF5eGhRVUZoTEVWQlEzcENMRmRCUVZjc1JVRkRXQ3hYUVVGWExFTkJRMW9zUTBGQlF6dDNRa0ZEUml4UFFVRlBMRXRCUVVzc1EwRkJRenR4UWtGRFpEdHZRa0ZGUkN3MFEwRkJORU03YjBKQlF6VkRMRWxCUVVrc1kwRkJZeXhGUVVGRk8zZENRVU5zUWl4MVFrRkJkVUk3ZDBKQlEzWkNMRmRCUVZjc1IwRkJSeXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenR4UWtGRGFFUTdlVUpCUVUwc1NVRkJTU3hQUVVGUExFbEJRVWtzVVVGQlVTeEZRVUZGTzNkQ1FVTTVRaXhMUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETzNkQ1FVTmlMRWxCUVVrc1RVRkJUU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlRzMFFrRkRPVUlzVFVGQlRTeERRVUZETEdOQlFXTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1dVRkJXU3hGUVVGRk8yZERRVU40UXl4TFFVRkxPelpDUVVOT0xFTkJRVU1zUTBGQlF6dDVRa0ZEU2pzMlFrRkJUVHMwUWtGRFRDeGhRVUZoTEVkQlFVY3NTMEZCU3l4RFFVRkRPM2xDUVVOMlFqdDNRa0ZEUkN4WFFVRlhMRWRCUVVjc1MwRkJTeXhEUVVGRE8zZENRVU53UWl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRE8zRkNRVU5tTzNsQ1FVRk5PM2RDUVVOTUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlExZ3NNa0pCUVRKQ0xIZENRVUYzUWl4blEwRkJaME1zUTBGRGNFWXNRMEZCUXp0M1FrRkRSaXhSUVVGUkxFTkJRMDRzZDBKQlFYZENMRVZCUTNoQ0xFdEJRVXNzUlVGRFRDeFhRVUZYTEVOQlFVTXNWVUZCVlN4RlFVTjBRaXhYUVVGWExFVkJRMWdzVjBGQlZ5eERRVU5hTEVOQlFVTTdkMEpCUTBZc1QwRkJUeXhMUVVGTExFTkJRVU03Y1VKQlEyUTdiMEpCUTBRc1VVRkJVU3hEUVVOT0xIZENRVUYzUWl4RlFVTjRRaXhMUVVGTExFVkJRMHdzVjBGQlZ5eERRVUZETEVkQlFVY3NSVUZEWml4WFFVRlhMRVZCUTFnc1YwRkJWeXhEUVVOYUxFTkJRVU03YjBKQlEwWXNUMEZCVHl4WFFVRlhMRU5CUVVNN1owSkJRM0pDTEVOQlFVTXNRMEZCUXp0WlFVTktMRU5CUVVNc1EwRkJReXhGUVVGRk8xTkJRMHdzUTBGQlF5eERRVUZETzBsQlEwd3NRMEZCUXp0SlFVVkVMRk5CUVZNc1owSkJRV2RDTEVOQlEzWkNMRTFCUVZjc1JVRkRXQ3huUWtGQmQwSXNSVUZEZUVJc1YwRkJkMEk3VVVGRmVFSXNaMFpCUVdkR08xRkJRMmhHTEhkRFFVRjNRenRSUVVONFF5eEpRVUZKTEhOQ1FVRm5ReXhEUVVGRE8xRkJRM0pETEVsQlFVa3NWMEZCVnl4RFFVRkRMSE5DUVVGelFpeExRVUZMTEVsQlFVa3NSVUZCUlR0WlFVTXZReXh6UWtGQmMwSXNSMEZCUnl4RlFVRkZMRU5CUVVNN1UwRkROMEk3WVVGQlRTeEpRVUZKTEZkQlFWY3NRMEZCUXl4elFrRkJjMElzUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXl4RlFVRkZPMWxCUXpGRUxITkNRVUZ6UWl4SFFVRkhMRTFCUVUwc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRUUVVNeFJEdGhRVUZOTzFsQlEwd3NjMEpCUVhOQ0xFZEJRVWNzVjBGQlZ5eERRVUZETEhOQ1FVRnpRaXhEUVVGRE8xTkJRemRFTzFGQlEwUXNTMEZCU3l4TlFVRk5MRmxCUVZrc1NVRkJTU3h6UWtGQmMwSXNSVUZCUlR0WlFVTnFSQ3hKUVVGSkxGZEJRVmNzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhSUVVGUkxFTkJRVU1zV1VGQldTeERRVUZETEVWQlFVVTdaMEpCUTNwRUxGTkJRVk03WVVGRFZqdFpRVU5FTEdkRlFVRm5SVHRaUVVOb1JTeHpSRUZCYzBRN1dVRkRkRVFzU1VGRFJTeFhRVUZYTEVOQlFVTXNVMEZCVXp0blFrRkRja0lzVjBGQlZ5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRPMmRDUVVOeVFpeFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZMRmxCUVZrc1EwRkJRenRuUWtGRE9VSXNXVUZCV1N4TFFVRkxMRmRCUVZjc1JVRkROVUk3WjBKQlEwRXNUVUZCVFN4dFFrRkJiVUlzUjBGQlJ5eEhRVUZITEdkQ1FVRm5RaXhKUVVGSkxGbEJRVmtzUlVGQlJTeERRVUZETzJkQ1FVTnNSU3hOUVVGTkxHTkJRV01zUjBGQlJ5eEZRVUZGTEVkQlFVY3NWMEZCVnl4RlFVRkZMRU5CUVVNN1owSkJRekZETEdOQlFXTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1YwRkJWeXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUXpkRExHTkJRV01zUTBGQlF5eHpRa0ZCYzBJc1IwRkJSeXhGUVVGRkxFTkJRVU03WjBKQlF6TkRMR2RDUVVGblFpeERRVU5rTEUxQlFVMHNRMEZCUXl4WlFVRlpMRU5CUVVNc1JVRkRjRUlzYlVKQlFXMUNMRVZCUTI1Q0xHTkJRV01zUTBGRFppeERRVUZETzJGQlEwZzdXVUZEUkN4SlFVRkpPMmRDUVVOR0xIZENRVUYzUWl4RFFVTjBRaXhOUVVGTkxFVkJRMDRzWjBKQlFXZENMRVZCUTJoQ0xGbEJRVmtzUlVGRFdpeFhRVUZYTEVOQlExb3NRMEZCUXp0aFFVTklPMWxCUVVNc1QwRkJUeXhMUVVGTExFVkJRVVU3WjBKQlEyUXNTVUZEUlN4TFFVRkxMRmxCUVZrc1UwRkJVenR2UWtGRE1VSXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zTUVOQlFUQkRMRU5CUVVNc1JVRkRiRVU3YjBKQlEwRXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkRWaXhuUkVGQlowUXNaMEpCUVdkQ0xFbEJRVWtzV1VGQldTeEZRVUZGTEVOQlEyNUdMRU5CUVVNN2FVSkJRMGc3Y1VKQlFVMDdiMEpCUTB3c2FVSkJRV2xDTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1owSkJRV2RDTEVWQlFVVXNXVUZCV1N4RlFVRkZMRU5CUVVNc1EwRkJRenRwUWtGRE9VUTdZVUZEUmp0VFFVTkdPMUZCUTBRc1MwRkJTeXhOUVVGTkxGbEJRVmtzU1VGQlNTeFhRVUZYTEVOQlFVTXNhVU5CUVdsRExFVkJRVVU3V1VGRGVFVXNTVUZCU1N4WFFVRlhMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNVVUZCVVN4RFFVRkRMRmxCUVZrc1EwRkJReXhGUVVGRk8yZENRVU42UkN4VFFVRlRPMkZCUTFZN1dVRkRSQ3hKUVVGSk8yZENRVU5HTEhkQ1FVRjNRaXhEUVVOMFFpeE5RVUZOTEVWQlEwNHNaMEpCUVdkQ0xFVkJRMmhDTEZsQlFWa3NSVUZEV2l4WFFVRlhMRU5CUTFvc1EwRkJRenRoUVVOSU8xbEJRVU1zVDBGQlR5eExRVUZMTEVWQlFVVTdaMEpCUTJRc2FVSkJRV2xDTEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1owSkJRV2RDTEVWQlFVVXNXVUZCV1N4RlFVRkZMRU5CUVVNc1EwRkJRenRoUVVNNVJEdFRRVU5HTzBsQlEwZ3NRMEZCUXp0SlFVVkVMRTFCUVUwc1YwRkJWeXhIUVVGSExGVkJRVlVzVDBGQlR5eEZRVUZGTEhGQ1FVRnhRanRSUVVNeFJDeEpRVUZKTEZGQlFWRXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRiRUlzYlVOQlFXMURPMUZCUTI1RExFMUJRVTBzUzBGQlN5eEhRVUZITEZGQlFWRXNRMEZCUXp0WlFVTnlRaXh4UWtGQmNVSXNRMEZCUXl4UFFVRlBMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03V1VGRmVrTXNhMEpCUVd0Q08xbEJRMnhDTEZGQlFWRXNSMEZCUnl4RlFVRkZMRU5CUVVNN1VVRkRhRUlzUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUlZJc1QwRkJUeXhWUVVGVkxFOUJRVThzUlVGQlJTeEhRVUZITzFsQlF6TkNMRzlDUVVGdlFqdFpRVU53UWl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzU1VGQlNTeEZRVUZGTEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFpRVU12UXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVOV0xFTkJRVU1zUTBGQlF6dEpRVU5LTEVOQlFVTXNRMEZCUXp0SlFVVkdMRTFCUVUwc1NVRkJTU3hIUVVGSExGZEJRVmNzUTBGQlF5eFBRVUZQTEVWQlFVVXNiMEpCUVc5Q0xFTkJRVU1zUTBGQlF6dEpRVVY0UkN4VFFVRlRMRmxCUVZrc1EwRkJReXh2UWtGQk1rTTdVVUZETDBRc2FVVkJRV2xGTzFGQlEycEZMRGhEUVVFNFF6dFJRVVU1UXl4NVJFRkJlVVE3VVVGRGVrUXNhVVJCUVdsRU8xRkJRMnBFTEc5Q1FVRnZRaXhEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEVsQlFVazdXVUZEZWtNc1owSkJRV2RDTEVOQlEyUXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUlVGRGFrSXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeEZRVU55UWl4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVOcVFpeERRVUZETzFGQlEwb3NRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRUQ3hEUVVGRE8wbEJSVVFzWjBaQlFXZEdPMGxCUTJoR0xFOUJRVThzV1VGQldTeERRVUZETzBGQlEzUkNMRU5CUVVNaWZRPT0iLCIvKipcbiAqIFRpZXMgdG9nZXRoZXIgdGhlIHR3byBzZXBhcmF0ZSBuYXZpZ2F0aW9uIGV2ZW50cyB0aGF0IHRvZ2V0aGVyIGhvbGRzIGluZm9ybWF0aW9uIGFib3V0IGJvdGggcGFyZW50IGZyYW1lIGlkIGFuZCB0cmFuc2l0aW9uLXJlbGF0ZWQgYXR0cmlidXRlc1xuICovXG5leHBvcnQgY2xhc3MgUGVuZGluZ05hdmlnYXRpb24ge1xuICAgIG9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb247XG4gICAgb25Db21taXR0ZWRFdmVudE5hdmlnYXRpb247XG4gICAgcmVzb2x2ZU9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb247XG4gICAgcmVzb2x2ZU9uQ29tbWl0dGVkRXZlbnROYXZpZ2F0aW9uO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm9uQmVmb3JlTmF2aWdhdGVFdmVudE5hdmlnYXRpb24gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlT25CZWZvcmVOYXZpZ2F0ZUV2ZW50TmF2aWdhdGlvbiA9IHJlc29sdmU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9uQ29tbWl0dGVkRXZlbnROYXZpZ2F0aW9uID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uQ29tbWl0dGVkRXZlbnROYXZpZ2F0aW9uID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlc29sdmVkKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGhpcy5vbkJlZm9yZU5hdmlnYXRlRXZlbnROYXZpZ2F0aW9uLFxuICAgICAgICAgICAgdGhpcy5vbkNvbW1pdHRlZEV2ZW50TmF2aWdhdGlvbixcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVpdGhlciByZXR1cm5zIG9yIHRpbWVzIG91dCBhbmQgcmV0dXJucyB1bmRlZmluZWQgb3JcbiAgICAgKiByZXR1cm5zIHRoZSByZXN1bHRzIGZyb20gcmVzb2x2ZWQoKSBhYm92ZVxuICAgICAqXG4gICAgICogQHBhcmFtIG1zXG4gICAgICovXG4gICAgYXN5bmMgcmVzb2x2ZWRXaXRoaW5UaW1lb3V0KG1zKSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZWQoKSxcbiAgICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSksXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dWdVpHbHVaeTF1WVhacFoyRjBhVzl1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDJ4cFlpOXdaVzVrYVc1bkxXNWhkbWxuWVhScGIyNHVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUlVFN08wZEJSVWM3UVVGRFNDeE5RVUZOTEU5QlFVOHNhVUpCUVdsQ08wbEJRMW9zSzBKQlFTdENMRU5CUVhOQ08wbEJRM0pFTERCQ1FVRXdRaXhEUVVGelFqdEpRVU42UkN4elEwRkJjME1zUTBGQlowTTdTVUZEZEVVc2FVTkJRV2xETEVOQlFXZERPMGxCUTNoRk8xRkJRMFVzU1VGQlNTeERRVUZETEN0Q1FVRXJRaXhIUVVGSExFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVN1dVRkROMFFzU1VGQlNTeERRVUZETEhORFFVRnpReXhIUVVGSExFOUJRVThzUTBGQlF6dFJRVU40UkN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOSUxFbEJRVWtzUTBGQlF5d3dRa0ZCTUVJc1IwRkJSeXhKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4RlFVRkZPMWxCUTNoRUxFbEJRVWtzUTBGQlF5eHBRMEZCYVVNc1IwRkJSeXhQUVVGUExFTkJRVU03VVVGRGJrUXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRUQ3hEUVVGRE8wbEJRMDBzVVVGQlVUdFJRVU5pTEU5QlFVOHNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJRenRaUVVOcVFpeEpRVUZKTEVOQlFVTXNLMEpCUVN0Q08xbEJRM0JETEVsQlFVa3NRMEZCUXl3d1FrRkJNRUk3VTBGRGFFTXNRMEZCUXl4RFFVRkRPMGxCUTB3c1EwRkJRenRKUVVWRU96czdPenRQUVV0SE8wbEJRMGtzUzBGQlN5eERRVUZETEhGQ1FVRnhRaXhEUVVGRExFVkJRVVU3VVVGRGJrTXNUVUZCVFN4UlFVRlJMRWRCUVVjc1RVRkJUU3hQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETzFsQlEyeERMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVU3V1VGRFppeEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEU5QlFVOHNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRUUVVOc1JDeERRVUZETEVOQlFVTTdVVUZEU0N4UFFVRlBMRkZCUVZFc1EwRkJRenRKUVVOc1FpeERRVUZETzBOQlEwWWlmUT09IiwiLyoqXG4gKiBUaWVzIHRvZ2V0aGVyIHRoZSB0d28gc2VwYXJhdGUgZXZlbnRzIHRoYXQgdG9nZXRoZXIgaG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgYm90aCByZXF1ZXN0IGhlYWRlcnMgYW5kIGJvZHlcbiAqL1xuZXhwb3J0IGNsYXNzIFBlbmRpbmdSZXF1ZXN0IHtcbiAgICBvbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHM7XG4gICAgb25CZWZvcmVTZW5kSGVhZGVyc0V2ZW50RGV0YWlscztcbiAgICByZXNvbHZlT25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzO1xuICAgIHJlc29sdmVPbkJlZm9yZVNlbmRIZWFkZXJzRXZlbnREZXRhaWxzO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVPbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHMgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbkJlZm9yZVNlbmRIZWFkZXJzRXZlbnREZXRhaWxzID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uQmVmb3JlU2VuZEhlYWRlcnNFdmVudERldGFpbHMgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVzb2x2ZWQoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLm9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyxcbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVTZW5kSGVhZGVyc0V2ZW50RGV0YWlscyxcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVpdGhlciByZXR1cm5zIG9yIHRpbWVzIG91dCBhbmQgcmV0dXJucyB1bmRlZmluZWQgb3JcbiAgICAgKiByZXR1cm5zIHRoZSByZXN1bHRzIGZyb20gcmVzb2x2ZWQoKSBhYm92ZVxuICAgICAqXG4gICAgICogQHBhcmFtIG1zXG4gICAgICovXG4gICAgYXN5bmMgcmVzb2x2ZWRXaXRoaW5UaW1lb3V0KG1zKSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZWQoKSxcbiAgICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSksXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dWdVpHbHVaeTF5WlhGMVpYTjBMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMMnhwWWk5d1pXNWthVzVuTFhKbGNYVmxjM1F1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlMwRTdPMGRCUlVjN1FVRkRTQ3hOUVVGTkxFOUJRVThzWTBGQll6dEpRVU5VTERKQ1FVRXlRaXhEUVVGcFJEdEpRVU0xUlN3clFrRkJLMElzUTBGQmNVUTdTVUZETjBZc2EwTkJRV3RETEVOQlJTOUNPMGxCUTBnc2MwTkJRWE5ETEVOQlJXNURPMGxCUTFZN1VVRkRSU3hKUVVGSkxFTkJRVU1zTWtKQlFUSkNMRWRCUVVjc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlR0WlFVTjZSQ3hKUVVGSkxFTkJRVU1zYTBOQlFXdERMRWRCUVVjc1QwRkJUeXhEUVVGRE8xRkJRM0JFTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTBnc1NVRkJTU3hEUVVGRExDdENRVUVyUWl4SFFVRkhMRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVTdXVUZETjBRc1NVRkJTU3hEUVVGRExITkRRVUZ6UXl4SFFVRkhMRTlCUVU4c1EwRkJRenRSUVVONFJDeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTk1MRU5CUVVNN1NVRkRUU3hSUVVGUk8xRkJRMklzVDBGQlR5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRPMWxCUTJwQ0xFbEJRVWtzUTBGQlF5d3lRa0ZCTWtJN1dVRkRhRU1zU1VGQlNTeERRVUZETEN0Q1FVRXJRanRUUVVOeVF5eERRVUZETEVOQlFVTTdTVUZEVEN4RFFVRkRPMGxCUlVRN096czdPMDlCUzBjN1NVRkRTU3hMUVVGTExFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1JVRkJSVHRSUVVOdVF5eE5RVUZOTEZGQlFWRXNSMEZCUnl4TlFVRk5MRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU03V1VGRGJFTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1JVRkJSVHRaUVVObUxFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1EwRkJReXhWUVVGVkxFTkJRVU1zVDBGQlR5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMU5CUTJ4RUxFTkJRVU1zUTBGQlF6dFJRVU5JTEU5QlFVOHNVVUZCVVN4RFFVRkRPMGxCUTJ4Q0xFTkJRVU03UTBGRFJpSjkiLCJpbXBvcnQgeyBSZXNwb25zZUJvZHlMaXN0ZW5lciB9IGZyb20gXCIuL3Jlc3BvbnNlLWJvZHktbGlzdGVuZXJcIjtcbi8qKlxuICogVGllcyB0b2dldGhlciB0aGUgdHdvIHNlcGFyYXRlIGV2ZW50cyB0aGF0IHRvZ2V0aGVyIGhvbGRzIGluZm9ybWF0aW9uIGFib3V0IGJvdGggcmVzcG9uc2UgaGVhZGVycyBhbmQgYm9keVxuICovXG5leHBvcnQgY2xhc3MgUGVuZGluZ1Jlc3BvbnNlIHtcbiAgICBvbkJlZm9yZVJlcXVlc3RFdmVudERldGFpbHM7XG4gICAgb25Db21wbGV0ZWRFdmVudERldGFpbHM7XG4gICAgcmVzcG9uc2VCb2R5TGlzdGVuZXI7XG4gICAgcmVzb2x2ZU9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscztcbiAgICByZXNvbHZlT25Db21wbGV0ZWRFdmVudERldGFpbHM7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMub25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uQmVmb3JlUmVxdWVzdEV2ZW50RGV0YWlscyA9IHJlc29sdmU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9uQ29tcGxldGVkRXZlbnREZXRhaWxzID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uQ29tcGxldGVkRXZlbnREZXRhaWxzID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFkZFJlc3BvbnNlUmVzcG9uc2VCb2R5TGlzdGVuZXIoZGV0YWlscykge1xuICAgICAgICB0aGlzLnJlc3BvbnNlQm9keUxpc3RlbmVyID0gbmV3IFJlc3BvbnNlQm9keUxpc3RlbmVyKGRldGFpbHMpO1xuICAgIH1cbiAgICByZXNvbHZlZCgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRoaXMub25CZWZvcmVSZXF1ZXN0RXZlbnREZXRhaWxzLFxuICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlZEV2ZW50RGV0YWlscyxcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVpdGhlciByZXR1cm5zIG9yIHRpbWVzIG91dCBhbmQgcmV0dXJucyB1bmRlZmluZWQgb3JcbiAgICAgKiByZXR1cm5zIHRoZSByZXN1bHRzIGZyb20gcmVzb2x2ZWQoKSBhYm92ZVxuICAgICAqXG4gICAgICogQHBhcmFtIG1zXG4gICAgICovXG4gICAgYXN5bmMgcmVzb2x2ZWRXaXRoaW5UaW1lb3V0KG1zKSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZWQoKSxcbiAgICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSksXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dWdVpHbHVaeTF5WlhOd2IyNXpaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUwzTnlZeTlzYVdJdmNHVnVaR2x1WnkxeVpYTndiMjV6WlM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkpRU3hQUVVGUExFVkJRVVVzYjBKQlFXOUNMRVZCUVVVc1RVRkJUU3d3UWtGQk1FSXNRMEZCUXp0QlFVVm9SVHM3UjBGRlJ6dEJRVU5JTEUxQlFVMHNUMEZCVHl4bFFVRmxPMGxCUTFZc01rSkJRVEpDTEVOQlFXbEVPMGxCUXpWRkxIVkNRVUYxUWl4RFFVRTJRenRKUVVNM1JTeHZRa0ZCYjBJc1EwRkJkVUk3U1VGRE0wTXNhME5CUVd0RExFTkJSUzlDTzBsQlEwZ3NPRUpCUVRoQ0xFTkJSVE5DTzBsQlExWTdVVUZEUlN4SlFVRkpMRU5CUVVNc01rSkJRVEpDTEVkQlFVY3NTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJUdFpRVU42UkN4SlFVRkpMRU5CUVVNc2EwTkJRV3RETEVkQlFVY3NUMEZCVHl4RFFVRkRPMUZCUTNCRUxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEwZ3NTVUZCU1N4RFFVRkRMSFZDUVVGMVFpeEhRVUZITEVsQlFVa3NUMEZCVHl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFVkJRVVU3V1VGRGNrUXNTVUZCU1N4RFFVRkRMRGhDUVVFNFFpeEhRVUZITEU5QlFVOHNRMEZCUXp0UlFVTm9SQ3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU5NTEVOQlFVTTdTVUZEVFN3clFrRkJLMElzUTBGRGNFTXNUMEZCT0VNN1VVRkZPVU1zU1VGQlNTeERRVUZETEc5Q1FVRnZRaXhIUVVGSExFbEJRVWtzYjBKQlFXOUNMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03U1VGRGFFVXNRMEZCUXp0SlFVTk5MRkZCUVZFN1VVRkRZaXhQUVVGUExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTTdXVUZEYWtJc1NVRkJTU3hEUVVGRExESkNRVUV5UWp0WlFVTm9ReXhKUVVGSkxFTkJRVU1zZFVKQlFYVkNPMU5CUXpkQ0xFTkJRVU1zUTBGQlF6dEpRVU5NTEVOQlFVTTdTVUZGUkRzN096czdUMEZMUnp0SlFVTkpMRXRCUVVzc1EwRkJReXh4UWtGQmNVSXNRMEZCUXl4RlFVRkZPMUZCUTI1RExFMUJRVTBzVVVGQlVTeEhRVUZITEUxQlFVMHNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJRenRaUVVOc1F5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZPMWxCUTJZc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4RFFVRkRMRlZCUVZVc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdVMEZEYkVRc1EwRkJReXhEUVVGRE8xRkJRMGdzVDBGQlR5eFJRVUZSTEVOQlFVTTdTVUZEYkVJc1EwRkJRenREUVVOR0luMD0iLCJpbXBvcnQgeyBkaWdlc3RNZXNzYWdlIH0gZnJvbSBcIi4vc2hhMjU2XCI7XG5leHBvcnQgY2xhc3MgUmVzcG9uc2VCb2R5TGlzdGVuZXIge1xuICAgIHJlc3BvbnNlQm9keTtcbiAgICBjb250ZW50SGFzaDtcbiAgICByZXNvbHZlUmVzcG9uc2VCb2R5O1xuICAgIHJlc29sdmVDb250ZW50SGFzaDtcbiAgICBjb25zdHJ1Y3RvcihkZXRhaWxzKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2VCb2R5ID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZVJlc3BvbnNlQm9keSA9IHJlc29sdmU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRlbnRIYXNoID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUNvbnRlbnRIYXNoID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFVzZWQgdG8gcGFyc2UgUmVzcG9uc2Ugc3RyZWFtXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IGJyb3dzZXIud2ViUmVxdWVzdC5maWx0ZXJSZXNwb25zZURhdGEoZGV0YWlscy5yZXF1ZXN0SWQudG9TdHJpbmcoKSk7XG4gICAgICAgIGxldCByZXNwb25zZUJvZHkgPSBuZXcgVWludDhBcnJheSgpO1xuICAgICAgICBmaWx0ZXIub25kYXRhID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBkaWdlc3RNZXNzYWdlKGV2ZW50LmRhdGEpLnRoZW4oKGRpZ2VzdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZUNvbnRlbnRIYXNoKGRpZ2VzdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGluY29taW5nID0gbmV3IFVpbnQ4QXJyYXkoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICBjb25zdCB0bXAgPSBuZXcgVWludDhBcnJheShyZXNwb25zZUJvZHkubGVuZ3RoICsgaW5jb21pbmcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRtcC5zZXQocmVzcG9uc2VCb2R5KTtcbiAgICAgICAgICAgIHRtcC5zZXQoaW5jb21pbmcsIHJlc3BvbnNlQm9keS5sZW5ndGgpO1xuICAgICAgICAgICAgcmVzcG9uc2VCb2R5ID0gdG1wO1xuICAgICAgICAgICAgZmlsdGVyLndyaXRlKGV2ZW50LmRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBmaWx0ZXIub25zdG9wID0gKF9ldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlUmVzcG9uc2VCb2R5KHJlc3BvbnNlQm9keSk7XG4gICAgICAgICAgICBmaWx0ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBnZXRSZXNwb25zZUJvZHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3BvbnNlQm9keTtcbiAgICB9XG4gICAgYXN5bmMgZ2V0Q29udGVudEhhc2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRIYXNoO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNtVnpjRzl1YzJVdFltOWtlUzFzYVhOMFpXNWxjaTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUwzTnlZeTlzYVdJdmNtVnpjRzl1YzJVdFltOWtlUzFzYVhOMFpXNWxjaTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGRFFTeFBRVUZQTEVWQlFVVXNZVUZCWVN4RlFVRkZMRTFCUVUwc1ZVRkJWU3hEUVVGRE8wRkJSWHBETEUxQlFVMHNUMEZCVHl4dlFrRkJiMEk3U1VGRFpDeFpRVUZaTEVOQlFYTkNPMGxCUTJ4RExGZEJRVmNzUTBGQmEwSTdTVUZEZEVNc2JVSkJRVzFDTEVOQlFYRkRPMGxCUTNoRUxHdENRVUZyUWl4RFFVRm5RenRKUVVVeFJDeFpRVUZaTEU5QlFUaERPMUZCUTNoRUxFbEJRVWtzUTBGQlF5eFpRVUZaTEVkQlFVY3NTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJReXhQUVVGUExFVkJRVVVzUlVGQlJUdFpRVU14UXl4SlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVkQlFVY3NUMEZCVHl4RFFVRkRPMUZCUTNKRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEwZ3NTVUZCU1N4RFFVRkRMRmRCUVZjc1IwRkJSeXhKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4RlFVRkZPMWxCUTNwRExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1IwRkJSeXhQUVVGUExFTkJRVU03VVVGRGNFTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkZTQ3huUTBGQlowTTdVVUZEYUVNc1RVRkJUU3hOUVVGTkxFZEJRVkVzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4clFrRkJhMElzUTBGRGRrUXNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGRGRFSXNRMEZCUXp0UlFVVlVMRWxCUVVrc1dVRkJXU3hIUVVGSExFbEJRVWtzVlVGQlZTeEZRVUZGTEVOQlFVTTdVVUZEY0VNc1RVRkJUU3hEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkZPMWxCUTNoQ0xHRkJRV0VzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVTdaMEpCUTNoRExFbEJRVWtzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFpRVU5zUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOSUxFMUJRVTBzVVVGQlVTeEhRVUZITEVsQlFVa3NWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU0xUXl4TlFVRk5MRWRCUVVjc1IwRkJSeXhKUVVGSkxGVkJRVlVzUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dFpRVU5zUlN4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzFsQlEzUkNMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zVVVGQlVTeEZRVUZGTEZsQlFWa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRaUVVOMlF5eFpRVUZaTEVkQlFVY3NSMEZCUnl4RFFVRkRPMWxCUTI1Q0xFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRek5DTEVOQlFVTXNRMEZCUXp0UlFVVkdMRTFCUVUwc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eE5RVUZOTEVWQlFVVXNSVUZCUlR0WlFVTjZRaXhKUVVGSkxFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03V1VGRGRrTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1JVRkJSU3hEUVVGRE8xRkJRM1JDTEVOQlFVTXNRMEZCUXp0SlFVTktMRU5CUVVNN1NVRkZUU3hMUVVGTExFTkJRVU1zWlVGQlpUdFJRVU14UWl4UFFVRlBMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU03U1VGRE0wSXNRMEZCUXp0SlFVVk5MRXRCUVVzc1EwRkJReXhqUVVGak8xRkJRM3BDTEU5QlFVOHNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJRenRKUVVNeFFpeERRVUZETzBOQlEwWWlmUT09IiwiLyoqXG4gKiBDb2RlIGZyb20gdGhlIGV4YW1wbGUgYXRcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TdWJ0bGVDcnlwdG8vZGlnZXN0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaWdlc3RNZXNzYWdlKG1zZ1VpbnQ4KSB7XG4gICAgY29uc3QgaGFzaEJ1ZmZlciA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KFwiU0hBLTI1NlwiLCBtc2dVaW50OCk7IC8vIGhhc2ggdGhlIG1lc3NhZ2VcbiAgICBjb25zdCBoYXNoQXJyYXkgPSBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGhhc2hCdWZmZXIpKTsgLy8gY29udmVydCBidWZmZXIgdG8gYnl0ZSBhcnJheVxuICAgIGNvbnN0IGhhc2hIZXggPSBoYXNoQXJyYXlcbiAgICAgICAgLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKVxuICAgICAgICAuam9pbihcIlwiKTsgLy8gY29udmVydCBieXRlcyB0byBoZXggc3RyaW5nXG4gICAgcmV0dXJuIGhhc2hIZXg7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljMmhoTWpVMkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwyeHBZaTl6YUdFeU5UWXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096dEhRVWRITzBGQlJVZ3NUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hoUVVGaExFTkJRVU1zVVVGQmIwSTdTVUZEZEVRc1RVRkJUU3hWUVVGVkxFZEJRVWNzVFVGQlRTeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhUUVVGVExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4dFFrRkJiVUk3U1VGRGRrWXNUVUZCVFN4VFFVRlRMRWRCUVVjc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEZWQlFWVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zSzBKQlFTdENPMGxCUTNwR0xFMUJRVTBzVDBGQlR5eEhRVUZITEZOQlFWTTdVMEZEZEVJc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVU03VTBGRE0wTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zT0VKQlFUaENPMGxCUXpORExFOUJRVThzVDBGQlR5eERRVUZETzBGQlEycENMRU5CUVVNaWZRPT0iLCJleHBvcnQgZnVuY3Rpb24gZW5jb2RlX3V0Zjgocykge1xuICAgIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQocykpO1xufVxuZXhwb3J0IGNvbnN0IGVzY2FwZVN0cmluZyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAvLyBDb252ZXJ0IHRvIHN0cmluZyBpZiBuZWNlc3NhcnlcbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgICB9XG4gICAgcmV0dXJuIGVuY29kZV91dGY4KHN0cik7XG59O1xuZXhwb3J0IGNvbnN0IGVzY2FwZVVybCA9IGZ1bmN0aW9uICh1cmwsIHN0cmlwRGF0YVVybERhdGEgPSB0cnVlKSB7XG4gICAgdXJsID0gZXNjYXBlU3RyaW5nKHVybCk7XG4gICAgLy8gZGF0YTpbPG1lZGlhdHlwZT5dWztiYXNlNjRdLDxkYXRhPlxuICAgIGlmICh1cmwuc3Vic3RyKDAsIDUpID09PSBcImRhdGE6XCIgJiZcbiAgICAgICAgc3RyaXBEYXRhVXJsRGF0YSAmJlxuICAgICAgICB1cmwuaW5kZXhPZihcIixcIikgPiAtMSkge1xuICAgICAgICB1cmwgPSB1cmwuc3Vic3RyKDAsIHVybC5pbmRleE9mKFwiLFwiKSArIDEpICsgXCI8ZGF0YS1zdHJpcHBlZD5cIjtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn07XG4vLyBCYXNlNjQgZW5jb2RpbmcsIGZvdW5kIG9uOlxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTI3MTAwMDEvaG93LXRvLWNvbnZlcnQtdWludDgtYXJyYXktdG8tYmFzZTY0LWVuY29kZWQtc3RyaW5nLzI1NjQ0NDA5IzI1NjQ0NDA5XG5leHBvcnQgY29uc3QgVWludDhUb0Jhc2U2NCA9IGZ1bmN0aW9uICh1OEFycikge1xuICAgIGNvbnN0IENIVU5LX1NJWkUgPSAweDgwMDA7IC8vIGFyYml0cmFyeSBudW1iZXJcbiAgICBsZXQgaW5kZXggPSAwO1xuICAgIGNvbnN0IGxlbmd0aCA9IHU4QXJyLmxlbmd0aDtcbiAgICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgICBsZXQgc2xpY2U7XG4gICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHNsaWNlID0gdThBcnIuc3ViYXJyYXkoaW5kZXgsIE1hdGgubWluKGluZGV4ICsgQ0hVTktfU0laRSwgbGVuZ3RoKSk7XG4gICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHNsaWNlKTtcbiAgICAgICAgaW5kZXggKz0gQ0hVTktfU0laRTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EocmVzdWx0KTtcbn07XG5leHBvcnQgY29uc3QgYm9vbFRvSW50ID0gZnVuY3Rpb24gKGJvb2wpIHtcbiAgICByZXR1cm4gYm9vbCA/IDEgOiAwO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUnlhVzVuTFhWMGFXeHpMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMMnhwWWk5emRISnBibWN0ZFhScGJITXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hWUVVGVkxGZEJRVmNzUTBGQlF5eERRVUZETzBsQlF6TkNMRTlCUVU4c1VVRkJVU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGVrTXNRMEZCUXp0QlFVVkVMRTFCUVUwc1EwRkJReXhOUVVGTkxGbEJRVmtzUjBGQlJ5eFZRVUZWTEVkQlFWRTdTVUZETlVNc2FVTkJRV2xETzBsQlEycERMRWxCUVVrc1QwRkJUeXhIUVVGSExFdEJRVXNzVVVGQlVTeEZRVUZGTzFGQlF6TkNMRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdTMEZEYmtJN1NVRkZSQ3hQUVVGUExGZEJRVmNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTXhRaXhEUVVGRExFTkJRVU03UVVGRlJpeE5RVUZOTEVOQlFVTXNUVUZCVFN4VFFVRlRMRWRCUVVjc1ZVRkRka0lzUjBGQlZ5eEZRVU5ZTEcxQ1FVRTBRaXhKUVVGSk8wbEJSV2hETEVkQlFVY3NSMEZCUnl4WlFVRlpMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03U1VGRGVFSXNjVU5CUVhGRE8wbEJRM0pETEVsQlEwVXNSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NUMEZCVHp0UlFVTTFRaXhuUWtGQlowSTdVVUZEYUVJc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkRja0k3VVVGRFFTeEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eHBRa0ZCYVVJc1EwRkJRenRMUVVNdlJEdEpRVU5FTEU5QlFVOHNSMEZCUnl4RFFVRkRPMEZCUTJJc1EwRkJReXhEUVVGRE8wRkJSVVlzTmtKQlFUWkNPMEZCUXpkQ0xIRklRVUZ4U0R0QlFVTnlTQ3hOUVVGTkxFTkJRVU1zVFVGQlRTeGhRVUZoTEVkQlFVY3NWVUZCVlN4TFFVRnBRanRKUVVOMFJDeE5RVUZOTEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1EwRkJReXh0UWtGQmJVSTdTVUZET1VNc1NVRkJTU3hMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzBsQlEyUXNUVUZCVFN4TlFVRk5MRWRCUVVjc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF6dEpRVU0xUWl4SlFVRkpMRTFCUVUwc1IwRkJSeXhGUVVGRkxFTkJRVU03U1VGRGFFSXNTVUZCU1N4TFFVRnBRaXhEUVVGRE8wbEJRM1JDTEU5QlFVOHNTMEZCU3l4SFFVRkhMRTFCUVUwc1JVRkJSVHRSUVVOeVFpeExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExFVkJRVVVzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4TFFVRkxMRWRCUVVjc1ZVRkJWU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdVVUZEY0VVc1RVRkJUU3hKUVVGSkxFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU5xUkN4TFFVRkxMRWxCUVVrc1ZVRkJWU3hEUVVGRE8wdEJRM0pDTzBsQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03UVVGRGRFSXNRMEZCUXl4RFFVRkRPMEZCUlVZc1RVRkJUU3hEUVVGRExFMUJRVTBzVTBGQlV5eEhRVUZITEZWQlFWVXNTVUZCWVR0SlFVTTVReXhQUVVGUExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGRFSXNRMEZCUXl4RFFVRkRJbjA9IiwiLyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqL1xuLy8gZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qZWQvOTgyODgzI2dpc3Rjb21tZW50LTI0MDMzNjlcbmNvbnN0IGhleCA9IFtdO1xuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIGhleFtpXSA9IChpIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgaS50b1N0cmluZygxNik7XG59XG5leHBvcnQgY29uc3QgbWFrZVVVSUQgPSAoKSA9PiB7XG4gICAgY29uc3QgciA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTYpKTtcbiAgICByWzZdID0gKHJbNl0gJiAweDBmKSB8IDB4NDA7XG4gICAgcls4XSA9IChyWzhdICYgMHgzZikgfCAweDgwO1xuICAgIHJldHVybiAoaGV4W3JbMF1dICtcbiAgICAgICAgaGV4W3JbMV1dICtcbiAgICAgICAgaGV4W3JbMl1dICtcbiAgICAgICAgaGV4W3JbM11dICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICBoZXhbcls0XV0gK1xuICAgICAgICBoZXhbcls1XV0gK1xuICAgICAgICBcIi1cIiArXG4gICAgICAgIGhleFtyWzZdXSArXG4gICAgICAgIGhleFtyWzddXSArXG4gICAgICAgIFwiLVwiICtcbiAgICAgICAgaGV4W3JbOF1dICtcbiAgICAgICAgaGV4W3JbOV1dICtcbiAgICAgICAgXCItXCIgK1xuICAgICAgICBoZXhbclsxMF1dICtcbiAgICAgICAgaGV4W3JbMTFdXSArXG4gICAgICAgIGhleFtyWzEyXV0gK1xuICAgICAgICBoZXhbclsxM11dICtcbiAgICAgICAgaGV4W3JbMTRdXSArXG4gICAgICAgIGhleFtyWzE1XV0pO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRYVnBaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1THk0dUwzTnlZeTlzYVdJdmRYVnBaQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTd3JRa0ZCSzBJN1FVRkZMMElzT0VSQlFUaEVPMEZCUXpsRUxFMUJRVTBzUjBGQlJ5eEhRVUZITEVWQlFVVXNRMEZCUXp0QlFVVm1MRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4SFFVRkhMRVZCUVVVc1EwRkJReXhGUVVGRkxFVkJRVVU3U1VGRE5VSXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzBOQlF5OURPMEZCUlVRc1RVRkJUU3hEUVVGRExFMUJRVTBzVVVGQlVTeEhRVUZITEVkQlFVY3NSVUZCUlR0SlFVTXpRaXhOUVVGTkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWxCUVVrc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZGY2tRc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0SlFVTTFRaXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRPMGxCUlRWQ0xFOUJRVThzUTBGRFRDeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMVFzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOVUxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWQ3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFRc1IwRkJSenRSUVVOSUxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWQ3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFRc1IwRkJSenRSUVVOSUxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWQ3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFRc1IwRkJSenRSUVVOSUxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRWQ3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTFRc1IwRkJSenRSUVVOSUxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRWaXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTFZc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTldMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEVml4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlExWXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVU5ZTEVOQlFVTTdRVUZEU2l4RFFVRkRMRU5CUVVNaWZRPT0iLCIvLyBodHRwczovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRmllbGRfU3ltYm9sX1RhYmxlXG5leHBvcnQgY29uc3QgZGF0ZVRpbWVVbmljb2RlRm9ybWF0U3RyaW5nID0gXCJ5eXl5LU1NLWRkJ1QnSEg6bW06c3MuU1NTWFhcIjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMyTm9aVzFoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMM05qYUdWdFlTNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZKUVN3clJVRkJLMFU3UVVGREwwVXNUVUZCVFN4RFFVRkRMRTFCUVUwc01rSkJRVEpDTEVkQlFVY3NOa0pCUVRaQ0xFTkJRVU1pZlE9PSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHtpbmplY3RKYXZhc2NyaXB0SW5zdHJ1bWVudFBhZ2VTY3JpcHR9IGZyb20gXCJvcGVud3BtLXdlYmV4dC1pbnN0cnVtZW50YXRpb25cIjtcblxuaW5qZWN0SmF2YXNjcmlwdEluc3RydW1lbnRQYWdlU2NyaXB0KHdpbmRvdy5vcGVuV3BtQ29udGVudFNjcmlwdENvbmZpZyB8fCB7fSk7XG5kZWxldGUgd2luZG93Lm9wZW5XcG1Db250ZW50U2NyaXB0Q29uZmlnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9