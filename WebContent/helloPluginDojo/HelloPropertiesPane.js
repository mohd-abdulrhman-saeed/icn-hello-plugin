define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "./HelloStrings",
    "dojo/text!./templates/HelloPropertiesPane.html"
], function (declare, _WidgetBase, _TemplatedMixin, domConstruct, domAttr, S, template) {

    /**
     * Table of document properties.
     *   rows     : [{key: "Name", value: "..."}]   (as returned by HelloService mode=props)
     *   language : "en" | "ar"                     (default: current language of HelloStrings)
     * Values are written as plain text nodes, never as HTML.
     */
    return declare("helloPluginDojo.HelloPropertiesPane", [_WidgetBase, _TemplatedMixin], {

        templateString: template,
        rows: null,
        language: null,

        postCreate: function () {
            this.inherited(arguments);
            var language = this.language || S.getLanguage();
            domAttr.set(this.domNode, "dir", S.dir(language));
            domAttr.set(this.domNode, "lang", language);
            this._render(language);
        },

        _render: function (language) {
            domConstruct.empty(this.bodyNode);
            var rows = this.rows || [];
            for (var i = 0; i < rows.length; i++) {
                var tr = domConstruct.create("tr", null, this.bodyNode);
                var th = domConstruct.create("th", null, tr);
                th.appendChild(document.createTextNode(S.propLabel(rows[i].key, language)));
                // dir=auto: an Arabic value aligns right, an English one left
                var td = domConstruct.create("td", { dir: "auto" }, tr);
                td.appendChild(document.createTextNode(rows[i].value));
            }
            this.countNode.appendChild(document.createTextNode(S.t("propsCount", { n: rows.length }, language)));
        }
    });
});
