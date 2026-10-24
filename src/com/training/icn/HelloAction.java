package com.training.icn;

import java.util.Locale;
import com.ibm.ecm.extension.PluginAction;

public class HelloAction extends PluginAction {

    @Override
    public String getId() { return "HelloAction"; }

    @Override
    public String getName(Locale locale) {
        return HelloText.pick(locale, "Hello Action", "\u0625\u062c\u0631\u0627\u0621 Hello");
    }

    @Override
    public String getIcon() { return ""; }

    @Override
    public String getPrivilege() { return ""; }

    @Override
    public boolean isMultiDoc() { return false; }

    // JavaScript function defined in HelloPluginV20.js
    @Override
    public String getActionFunction() { return "helloAction"; }

    @Override
    public String getServerTypes() { return "p8"; }

    @Override
    public String[] getMenuTypes() { return new String[] { "DocumentContextMenu" }; }
}
