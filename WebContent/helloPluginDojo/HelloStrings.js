/**
 * HelloStrings - all display text of Hello Plugin, in English and Arabic.
 *
 * Language choice (first match wins):
 *   1. the language the user picked with the language buttons (kept in localStorage)
 *   2. the Dojo / ICN locale of the page
 *   3. the browser language
 *   4. English
 */
define(["dojo/_base/kernel"], function (kernel) {

    var STORE_KEY = "helloPlugin.language";
    var SUPPORTED = { en: true, ar: true };

    var STRINGS = {
        en: {
            featureTitle: "Hello Feature",
            language: "Language:",
            langEnglish: "English",
            langArabic: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",

            browserTitle: "Folders and documents",
            folderPath: "Folder path:",
            load: "Load",
            up: "Up",
            notLoaded: "Not loaded yet",
            loading: "Loading...",
            colType: "Type",
            colName: "Name",
            colPathId: "Path / Id",
            typeFolder: "Folder",
            typeDocument: "Document",
            summary: "{folders} folders, {docs} documents",
            truncated: " (first {max} of each kind only)",

            propsTitle: "Document properties",
            propsHint: "Select a document to see its properties",
            propsCount: "{n} properties",
            "prop.Name": "Name",
            "prop.Created": "Created",
            "prop.Creator": "Creator",
            "prop.MajorVersion": "Major version",
            "prop.MimeType": "Mime type",
            "prop.Size": "Size (bytes)",

            errPrefix: "Error: ",
            "err.BAD_REQUEST": "Invalid request",
            "err.SERVER": "Server error",
            "err.TIMEOUT": "No response from the server",
            "err.EMPTY": "Empty response",
            "err.FORMAT": "Unexpected response format",
            "err.NO_REPO": "No default repository found",
            "err.NO_DOC": "No document selected"
        },
        ar: {
            featureTitle: "\u0645\u064a\u0632\u0629 Hello",
            language: "\u0627\u0644\u0644\u063a\u0629:",
            langEnglish: "English",
            langArabic: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",

            browserTitle: "\u0627\u0644\u0645\u062c\u0644\u062f\u0627\u062a \u0648\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a",
            folderPath: "\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u062c\u0644\u062f:",
            load: "\u062a\u062d\u0645\u064a\u0644",
            up: "\u0625\u0644\u0649 \u0627\u0644\u0623\u0639\u0644\u0649",
            notLoaded: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u0645\u064a\u0644 \u0628\u0639\u062f",
            loading: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",
            colType: "\u0627\u0644\u0646\u0648\u0639",
            colName: "\u0627\u0644\u0627\u0633\u0645",
            colPathId: "\u0627\u0644\u0645\u0633\u0627\u0631 / \u0627\u0644\u0645\u0639\u0631\u0651\u0641",
            typeFolder: "\u0645\u062c\u0644\u062f",
            typeDocument: "\u0645\u0633\u062a\u0646\u062f",
            summary: "\u0627\u0644\u0645\u062c\u0644\u062f\u0627\u062a: {folders} \u2014 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a: {docs}",
            truncated: " (\u0623\u0648\u0644 {max} \u0645\u0646 \u0643\u0644 \u0646\u0648\u0639 \u0641\u0642\u0637)",

            propsTitle: "\u062e\u0635\u0627\u0626\u0635 \u0627\u0644\u0645\u0633\u062a\u0646\u062f",
            propsHint: "\u0627\u062e\u062a\u0631 \u0645\u0633\u062a\u0646\u062f\u064b\u0627 \u0644\u0639\u0631\u0636 \u062e\u0635\u0627\u0626\u0635\u0647",
            propsCount: "\u0639\u062f\u062f \u0627\u0644\u062e\u0635\u0627\u0626\u0635: {n}",
            "prop.Name": "\u0627\u0644\u0627\u0633\u0645",
            "prop.Created": "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0646\u0634\u0627\u0621",
            "prop.Creator": "\u0627\u0644\u0645\u0646\u0634\u0626",
            "prop.MajorVersion": "\u0631\u0642\u0645 \u0627\u0644\u0625\u0635\u062f\u0627\u0631 \u0627\u0644\u0631\u0626\u064a\u0633\u064a",
            "prop.MimeType": "\u0646\u0648\u0639 \u0627\u0644\u0645\u062d\u062a\u0648\u0649",
            "prop.Size": "\u0627\u0644\u062d\u062c\u0645 (\u0628\u0627\u064a\u062a)",

            errPrefix: "\u062e\u0637\u0623: ",
            "err.BAD_REQUEST": "\u0637\u0644\u0628 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d",
            "err.SERVER": "\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645",
            "err.TIMEOUT": "\u0644\u0627 \u062a\u0648\u062c\u062f \u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u0645\u0646 \u0627\u0644\u062e\u0627\u062f\u0645",
            "err.EMPTY": "\u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u0641\u0627\u0631\u063a\u0629",
            "err.FORMAT": "\u0635\u064a\u063a\u0629 \u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639\u0629",
            "err.NO_REPO": "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u062f\u0639 \u0627\u0641\u062a\u0631\u0627\u0636\u064a",
            "err.NO_DOC": "\u0644\u0645 \u064a\u062a\u0645 \u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0646\u062f"
        }
    };

    var current = null;

    function has(table, key) {
        return Object.prototype.hasOwnProperty.call(table, key);
    }

    // "ar-SA" / "ar_sa" / "AR" -> "ar"; unsupported -> null
    function normalize(value) {
        if (!value) { return null; }
        var code = String(value).toLowerCase().split(/[-_]/)[0];
        return SUPPORTED[code] ? code : null;
    }

    function readStored() {
        try { return normalize(window.localStorage.getItem(STORE_KEY)); } catch (e) { return null; }
    }

    function writeStored(code) {
        try { window.localStorage.setItem(STORE_KEY, code); } catch (e) { /* storage blocked: keep in memory only */ }
    }

    function detect() {
        return readStored()
            || normalize(kernel.locale)
            || normalize(window.navigator && window.navigator.language)
            || "en";
    }

    var api = {

        getLanguage: function () {
            if (!current) { current = detect(); }
            return current;
        },

        setLanguage: function (code) {
            var normalized = normalize(code);
            if (!normalized) { return; }
            current = normalized;
            writeStored(normalized);
        },

        // "rtl" for Arabic, "ltr" otherwise
        dir: function (language) {
            return (language || api.getLanguage()) === "ar" ? "rtl" : "ltr";
        },

        // t("summary", {folders: 2, docs: 5}, "ar")
        t: function (key, params, language) {
            var table = STRINGS[language || api.getLanguage()] || STRINGS.en;
            var text;
            if (has(table, key)) { text = table[key]; }
            else if (has(STRINGS.en, key)) { text = STRINGS.en[key]; }
            else { text = key; }
            if (params) {
                text = text.replace(/\{(\w+)\}/g, function (match, name) {
                    return has(params, name) ? String(params[name]) : match;
                });
            }
            return text;
        },

        // label of a property row, by the key the service returns (Name, Created, ...)
        propLabel: function (key, language) {
            var table = STRINGS[language || api.getLanguage()] || STRINGS.en;
            return has(table, "prop." + key) ? table["prop." + key] : key;
        },

        // text for a failed call: response = {errorCode, error} from HelloService, or {errorCode:"TIMEOUT"}
        errorText: function (response, language) {
            var code = response && response.errorCode ? response.errorCode : "SERVER";
            var table = STRINGS[language || api.getLanguage()] || STRINGS.en;
            var key = has(table, "err." + code) ? "err." + code : "err.SERVER";
            var detail = response && response.error ? " (" + response.error + ")" : "";
            return api.t("errPrefix", null, language) + api.t(key, null, language) + detail;
        }
    };

    return api;
});
