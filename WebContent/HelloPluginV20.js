console.log("HelloPluginV20.js (HelloPlugin 2.0.0) loaded");

require([
    "dojo/_base/lang",
    "dijit/Dialog",
    "ecm/model/Request",
    "ecm/widget/dialog/MessageDialog",
    "helloPluginDojo/HelloStrings",
    "helloPluginDojo/HelloPropertiesPane"
], function (lang, Dialog, Request, MessageDialog, S, HelloPropertiesPane) {

    function showMessage(text) {
        new MessageDialog({ text: String(text) }).show();
    }

    // Action of the document context menu (HelloAction.getActionFunction)
    lang.setObject("helloAction", function (repository, items, callback, teamspace, resultSet, parameterMap) {

        var L = S.getLanguage();

        if (!items || items.length === 0) {
            showMessage(S.errorText({ errorCode: "NO_DOC" }, L));
            return;
        }

        var item = items[0];

        Request.invokePluginService("HelloPlugin", "HelloService", {
            requestParams: {
                mode: "props",
                docId: item.id,
                repositoryId: repository ? repository.id : ""
            },
            requestCompleteCallback: function (response) {
                if (!response) { showMessage(S.errorText({ errorCode: "EMPTY" }, L)); return; }
                if (response.errorCode || response.error) { showMessage(S.errorText(response, L)); return; }
                if (!response.properties) { showMessage(S.errorText({ errorCode: "FORMAT" }, L)); return; }

                var pane = new HelloPropertiesPane({ rows: response.properties, language: L });

                var dialog = new Dialog({
                    title: S.t("propsTitle", null, L),
                    content: pane.domNode,
                    dir: S.dir(L),
                    lang: L,
                    onHide: function () {
                        pane.destroyRecursive();
                        this.destroyRecursive();
                    }
                });
                dialog.show();
            }
        });
    });
});
