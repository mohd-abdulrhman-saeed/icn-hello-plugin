lib: compile-time libraries, NOT part of the plugin and NOT committed to Git.
build.bat adds every jar found here to the javac classpath.
Needed classes: com.ibm.ecm.extension.Plugin, javax.servlet.http.HttpServletRequest, com.filenet.api.core.Factory.
Fill it with setup-lib.bat on the ICN server, or copy the jars by hand.
These jars belong to IBM: never push them to GitHub.
