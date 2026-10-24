define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/on",
    "ecm/model/Request",
    "ecm/widget/layout/_LaunchBarPane",
    "./HelloStrings",
    "./HelloPropertiesPane",
    "dojo/text!./templates/HelloFeature.html"
], function (declare, lang, domConstruct, domClass, domAttr, on, Request, _LaunchBarPane, S, HelloPropertiesPane, template) {

    console.log("HelloFeature.js v2.0.0 loaded");

    var REQUEST_TIMEOUT_MS = 60000;

    /**
     * Hello Feature: two boxes side by side.
     *   first box  : folders and documents (browse by clicking a folder, "Up" goes to the parent)
     *   second box : properties of the selected document
     * Arabic and English are switchable at run time; the page direction follows the language.
     *
     * Every text on the screen is produced from state + language (see _applyLanguage),
     * so switching the language redraws everything without calling the server again.
     */
    return declare("helloPluginDojo.HelloFeature", [_LaunchBarPane], {

        templateString: template,
        widgetsInTemplate: true,

        _lang: null,
        _statusFn: null,        // function(language) -> text of the status line
        _list: null,            // last folder listing: {folders, documents, repositoryId, truncated, max}
        _props: null,           // state of the properties box (see _renderProps)
        _propsPane: null,
        _selectedId: null,
        _selectedRow: null,
        _listToken: 0,          // a late answer of an older request is ignored
        _propsToken: 0,

        postCreate: function () {
            this.logEntry("postCreate");
            this.inherited(arguments);
            this._lang = S.getLanguage();
            this._statusFn = this._textFn("notLoaded");
            this._applyLanguage();
            this.logExit("postCreate");
        },

        destroy: function () {
            this._destroyPropsPane();
            this.inherited(arguments);
        },

        // ICN calls this when the user opens the feature
        loadContent: function () {
            this.logEntry("loadContent");
            if (!this.isLoaded) {
                this._load();
            }
            this.needReset = false;
            this.logExit("loadContent");
        },

        // ICN calls this to discard already loaded content
        reset: function () {
            this.logEntry("reset");
            this._listToken++;
            this._list = null;
            this._renderRows();
            this._setStatus(this._textFn("notLoaded"));
            this._clearProps();
            this.isLoaded = false;
            this.needReset = false;
            this.logExit("reset");
        },

        // ---- language ------------------------------------------------------

        _onLangEn: function () { this._changeLanguage("en"); },
        _onLangAr: function () { this._changeLanguage("ar"); },

        _changeLanguage: function (code) {
            S.setLanguage(code);
            this._lang = S.getLanguage();
            this._applyLanguage();
        },

        _applyLanguage: function () {
            var L = this._lang;
            domAttr.set(this.domNode, "dir", S.dir(L));
            domAttr.set(this.domNode, "lang", L);

            this.titleNode.textContent = S.t("featureTitle", null, L);
            this.langLabelNode.textContent = S.t("language", null, L);
            this.langEnNode.textContent = S.t("langEnglish", null, L);
            this.langArNode.textContent = S.t("langArabic", null, L);
            domClass.toggle(this.langEnNode, "helloLangActive", L === "en");
            domClass.toggle(this.langArNode, "helloLangActive", L === "ar");

            this.browserTitleNode.textContent = S.t("browserTitle", null, L);
            this.pathLabelNode.textContent = S.t("folderPath", null, L);
            this.loadBtnNode.textContent = S.t("load", null, L);
            this.upBtnNode.textContent = S.t("up", null, L);
            this.thTypeNode.textContent = S.t("colType", null, L);
            this.thNameNode.textContent = S.t("colName", null, L);
            this.thPathIdNode.textContent = S.t("colPathId", null, L);

            this._renderStatus();
            this._renderRows();
            this._renderProps();
        },

        // ---- status line ---------------------------------------------------

        // returns a function that builds a message in whatever language is current
        _textFn: function (key, params) {
            return function (L) { return S.t(key, params, L); };
        },

        _errorFn: function (response) {
            return function (L) { return S.errorText(response, L); };
        },

        _setStatus: function (fn) {
            this._statusFn = fn;
            this._renderStatus();
        },

        _renderStatus: function () {
            this.statusNode.textContent = this._statusFn ? this._statusFn(this._lang) : "";
        },

        _startTimer: function (onTimeout) {
            var self = this;
            return setTimeout(function () {
                if (!self._destroyed) { onTimeout(); }
            }, REQUEST_TIMEOUT_MS);
        },

        // ---- folders and documents (first box) -------------------------------

        _onLoadClick: function () {
            this._load();
        },

        _onUpClick: function () {
            var p = (this.pathNode.value || "/").replace(/\/+$/, "");
            var i = p.lastIndexOf("/");
            this._load(i <= 0 ? "/" : p.substring(0, i));
        },

        _getRepositoryId: function () {
            var desktop = window.ecm && ecm.model && ecm.model.desktop;
            if (!desktop) { return null; }
            var repository = desktop.getDefaultRepository ? desktop.getDefaultRepository() : null;
            if (repository && repository.id) { return repository.id; }
            return desktop.getDefaultRepositoryId ? desktop.getDefaultRepositoryId() : null;
        },

        // path is optional: a folder row passes its own path, the Load button passes nothing
        _load: function (path) {
            var repositoryId = this._getRepositoryId();
            if (!repositoryId) {
                this._setStatus(this._errorFn({ errorCode: "NO_REPO" }));
                return;
            }
            var folderPath = (typeof path === "string" && path.length > 0) ? path : (this.pathNode.value || "/");
            var token = ++this._listToken;
            this._setStatus(this._textFn("loading"));

            var timer = this._startTimer(lang.hitch(this, function () {
                if (token === this._listToken) { this._setStatus(this._errorFn({ errorCode: "TIMEOUT" })); }
            }));

            Request.invokePluginService("HelloPlugin", "HelloService", {
                requestParams: {
                    mode: "list",
                    folderPath: folderPath,
                    repositoryId: repositoryId
                },
                requestCompleteCallback: lang.hitch(this, function (response) {
                    clearTimeout(timer);
                    if (this._destroyed || token !== this._listToken) { return; }
                    if (!response) { this._setStatus(this._errorFn({ errorCode: "EMPTY" })); return; }
                    if (response.errorCode || response.error) { this._setStatus(this._errorFn(response)); return; }
                    if (!response.documents) { this._setStatus(this._errorFn({ errorCode: "FORMAT" })); return; }

                    var folders = response.folders || [];
                    var documents = response.documents;
                    var truncated = !!response.truncated;
                    var max = response.max || 50;

                    this.pathNode.value = response.path;
                    this._clearProps();   // the old selection belongs to the previous folder
                    this._list = {
                        folders: folders,
                        documents: documents,
                        repositoryId: repositoryId,
                        truncated: truncated,
                        max: max
                    };
                    this._renderRows();

                    this._setStatus(function (L) {
                        var text = S.t("summary", { folders: folders.length, docs: documents.length }, L);
                        if (truncated) { text += S.t("truncated", { max: max }, L); }
                        return text;
                    });
                    this.isLoaded = true;
                })
            });
        },

        _sortByName: function (items, L) {
            return items.slice().sort(function (a, b) {
                return String(a.name).localeCompare(String(b.name), L);
            });
        },

        _addRow: function (cssClass, type, name, extra) {
            var tr = domConstruct.create("tr", { "class": cssClass }, this.listBodyNode);
            domConstruct.create("td", null, tr).appendChild(document.createTextNode(type));
            domConstruct.create("td", { dir: "auto" }, tr).appendChild(document.createTextNode(name));
            domConstruct.create("td", { dir: "ltr" }, tr).appendChild(document.createTextNode(extra));
            return tr;
        },

        _renderRows: function () {
            domConstruct.empty(this.listBodyNode);
            this._selectedRow = null;
            if (!this._list) { return; }

            var L = this._lang;
            var repositoryId = this._list.repositoryId;
            var folders = this._sortByName(this._list.folders, L);
            var documents = this._sortByName(this._list.documents, L);
            var i, tr;

            for (i = 0; i < folders.length; i++) {
                tr = this._addRow("helloFolderRow", S.t("typeFolder", null, L), folders[i].name, folders[i].path);
                on(tr, "click", lang.hitch(this, "_load", folders[i].path));
            }
            for (i = 0; i < documents.length; i++) {
                tr = this._addRow("helloDocRow", S.t("typeDocument", null, L), documents[i].name, documents[i].id);
                on(tr, "click", lang.hitch(this, "_selectDocument", documents[i], repositoryId, tr));
                if (documents[i].id === this._selectedId) { this._markSelected(tr); }
            }
        },

        _markSelected: function (tr) {
            if (this._selectedRow) { domClass.remove(this._selectedRow, "helloRowSelected"); }
            this._selectedRow = tr;
            if (tr) { domClass.add(tr, "helloRowSelected"); }
        },

        // ---- document properties (second box) --------------------------------
        // this._props is one of:
        //   null                                  -> hint "select a document"
        //   {kind:"loading", name}
        //   {kind:"error",   name, fn}            fn(language) -> text
        //   {kind:"rows",    name, rows}

        _destroyPropsPane: function () {
            if (this._propsPane) {
                this._propsPane.destroyRecursive();
                this._propsPane = null;
            }
        },

        _clearProps: function () {
            this._propsToken++;
            this._selectedId = null;
            this._markSelected(null);
            this._props = null;
            this._renderProps();
        },

        _renderProps: function () {
            var L = this._lang;
            var p = this._props;
            this._destroyPropsPane();

            if (p && p.kind === "rows") {
                this.propsTitleNode.textContent = p.name;   // text only, never HTML
                this.propsMsgNode.textContent = "";
                this._propsPane = new HelloPropertiesPane({ rows: p.rows, language: L });
                this._propsPane.placeAt(this.propsBodyNode);
            } else if (p && p.kind === "loading") {
                this.propsTitleNode.textContent = p.name;
                this.propsMsgNode.textContent = S.t("loading", null, L);
            } else if (p && p.kind === "error") {
                this.propsTitleNode.textContent = p.name;
                this.propsMsgNode.textContent = p.fn(L);
            } else {
                this.propsTitleNode.textContent = S.t("propsTitle", null, L);
                this.propsMsgNode.textContent = S.t("propsHint", null, L);
            }
        },

        _showPropsError: function (doc, fn) {
            this._props = { kind: "error", name: doc.name, fn: fn };
            this._renderProps();
        },

        _selectDocument: function (doc, repositoryId, tr) {
            var token = ++this._propsToken;
            this._selectedId = doc.id;
            this._markSelected(tr);
            this._props = { kind: "loading", name: doc.name };
            this._renderProps();

            var timer = this._startTimer(lang.hitch(this, function () {
                if (token === this._propsToken) { this._showPropsError(doc, this._errorFn({ errorCode: "TIMEOUT" })); }
            }));

            Request.invokePluginService("HelloPlugin", "HelloService", {
                requestParams: {
                    mode: "props",
                    docId: doc.id,
                    repositoryId: repositoryId
                },
                requestCompleteCallback: lang.hitch(this, function (response) {
                    clearTimeout(timer);
                    if (this._destroyed || token !== this._propsToken) { return; }
                    if (!response) { this._showPropsError(doc, this._errorFn({ errorCode: "EMPTY" })); return; }
                    if (response.errorCode || response.error) { this._showPropsError(doc, this._errorFn(response)); return; }
                    if (!response.properties) { this._showPropsError(doc, this._errorFn({ errorCode: "FORMAT" })); return; }

                    this._props = { kind: "rows", name: doc.name, rows: response.properties };
                    this._renderProps();
                })
            });
        }
    });
});
