package com.training.icn;

import java.util.Locale;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import com.ibm.ecm.extension.Plugin;
import com.ibm.ecm.extension.PluginAction;
import com.ibm.ecm.extension.PluginFeature;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

/**
 * Hello Plugin 2.0.0
 *  - HelloService : lists folders/documents and reads document properties from FileNet
 *  - HelloAction  : document context-menu action that shows the properties
 *  - HelloFeature : side-bar feature with a two-pane browser (Arabic / English)
 *
 * Ids (HelloPlugin, HelloService, HelloAction, HelloFeature) must never change:
 * ICN stores desktop and menu configuration against them.
 */
public class HelloPlugin extends Plugin {

    static final String VERSION = "2.0.0";

    private static final Logger LOG = Logger.getLogger(HelloPlugin.class.getName());

    @Override public String getId() { return "HelloPlugin"; }

    @Override
    public String getName(Locale locale) {
        return HelloText.pick(locale, "Hello Plugin", "\u0625\u0636\u0627\u0641\u0629 Hello");
    }

    @Override public String getVersion() { return VERSION; }

    // Versioned resource names: a new name defeats the browser cache
    @Override public String getScript() { return "HelloPluginV20.js"; }
    @Override public String getCSSFileName() { return "HelloPluginV20.css"; }

    // Dojo module = folder name under WebContent
    @Override public String getDojoModule() { return "helloPluginDojo"; }

    @Override
    public PluginService[] getServices() {
        return new PluginService[] { new HelloService() };
    }

    @Override
    public PluginAction[] getActions() {
        return new PluginAction[] { new HelloAction() };
    }

    @Override
    public PluginFeature[] getFeatures() {
        return new PluginFeature[] { new HelloFeature() };
    }

    @Override
    public void applicationInit(HttpServletRequest request, PluginServiceCallbacks callbacks) throws Exception {
        LOG.info("HelloPlugin " + VERSION + " initialized");
    }
}
