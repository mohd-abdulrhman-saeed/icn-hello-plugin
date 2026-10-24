package com.training.icn;

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.filenet.api.collection.DocumentSet;
import com.filenet.api.collection.FolderSet;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

/**
 * HelloService 2.0.0
 *
 * mode=list  (folderPath, repositoryId)
 *     -> {"path":..,"truncated":..,"max":50,"folders":[{"name":..,"path":..}],"documents":[{"id":..,"name":..}]}
 * mode=props (docId, repositoryId)            (default mode)
 *     -> {"properties":[{"key":..,"value":..}]}      keys: Name, Created, Creator, MajorVersion, MimeType, Size
 * on failure
 *     -> {"errorCode":"BAD_REQUEST"|"SERVER","error":"technical detail"}
 *
 * The service returns codes and keys, never display text: the browser translates
 * them (Arabic / English) in HelloStrings.js.
 */
public class HelloService extends PluginService {

    private static final Logger LOG = Logger.getLogger(HelloService.class.getName());
    private static final Pattern GUID = Pattern.compile("\\{[0-9A-Fa-f\\-]{36}\\}");
    private static final String[] PROPS = {
        "Name", "DateCreated", "Creator", "MajorVersionNumber", "MimeType", "ContentSize"
    };
    private static final int MAX_ROWS = 50;

    @Override
    public String getId() { return "HelloService"; }

    @Override
    public void execute(PluginServiceCallbacks callbacks,
                        HttpServletRequest request,
                        HttpServletResponse response) throws Exception {

        String mode   = request.getParameter("mode");
        String docId  = request.getParameter("docId");
        String repoId = request.getParameter("repositoryId");
        if (mode == null || mode.length() == 0) { mode = "props"; }
        String json;

        try {
            if ("list".equals(mode)) {
                json = listFolder(callbacks, repoId, request.getParameter("folderPath"));
            } else if ("props".equals(mode)) {
                json = "{\"properties\":[" + readDocument(callbacks, repoId, docId) + "]}";
            } else {
                throw new IllegalArgumentException("Unknown mode: " + mode);
            }
        } catch (IllegalArgumentException e) {
            LOG.log(Level.WARNING, "HelloService bad request: mode=" + mode + " - " + e.getMessage());
            json = error("BAD_REQUEST", e.getMessage());
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "HelloService failed: mode=" + mode + " docId=" + docId, e);
            json = error("SERVER", describe(e));
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store");
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }

    // ---- mode=list -------------------------------------------------------

    private String listFolder(PluginServiceCallbacks callbacks, String repoId, String folderPath) throws Exception {
        if (repoId == null || repoId.length() == 0) {
            throw new IllegalArgumentException("Missing repositoryId");
        }
        String path = (folderPath == null || folderPath.trim().length() == 0) ? "/" : folderPath.trim();
        // Factory.Folder.fetchInstance(os, String, ...) needs a leading slash; without it
        // the text is read as a class name ("Class ... not found")
        if (!path.startsWith("/")) { path = "/" + path; }

        Subject subject = callbacks.getP8Subject(repoId);
        UserContext.get().pushSubject(subject);
        try {
            ObjectStore os = callbacks.getP8ObjectStore(repoId);

            Folder folder;
            if ("/".equals(path)) {
                folder = os.get_RootFolder();
            } else {
                folder = Factory.Folder.fetchInstance(os, path, null);
            }
            folder.fetchProperties(new String[] { "ContainedDocuments", "SubFolders" });

            boolean truncated = false;

            // sub folders
            StringBuilder folderRows = new StringBuilder();
            int folderCount = 0;
            FolderSet subs = folder.get_SubFolders();
            Iterator fit = subs.iterator();
            while (fit.hasNext()) {
                if (folderCount >= MAX_ROWS) { truncated = true; break; }
                Folder sub = (Folder) fit.next();
                sub.fetchProperties(new String[] { "FolderName", "PathName" });
                if (folderCount > 0) { folderRows.append(','); }
                folderRows.append("{\"name\":\"").append(escape(sub.get_FolderName()))
                          .append("\",\"path\":\"").append(escape(sub.get_PathName())).append("\"}");
                folderCount++;
            }

            // documents
            StringBuilder docRows = new StringBuilder();
            int docCount = 0;
            DocumentSet docs = folder.get_ContainedDocuments();
            Iterator dit = docs.iterator();
            while (dit.hasNext()) {
                if (docCount >= MAX_ROWS) { truncated = true; break; }
                Document d = (Document) dit.next();
                d.fetchProperties(new String[] { "Id", "Name" });
                Id id = d.getProperties().getIdValue("Id");
                String name = d.getProperties().getStringValue("Name");
                if (docCount > 0) { docRows.append(','); }
                docRows.append("{\"id\":\"").append(escape(String.valueOf(id)))
                       .append("\",\"name\":\"").append(escape(name)).append("\"}");
                docCount++;
            }

            LOG.info("HelloService: list path=" + path + " folders=" + folderCount
                     + " docs=" + docCount + " truncated=" + truncated);

            return "{\"path\":\"" + escape(path) + "\",\"truncated\":" + truncated
                 + ",\"max\":" + MAX_ROWS
                 + ",\"folders\":[" + folderRows + "],\"documents\":[" + docRows + "]}";
        } finally {
            UserContext.get().popSubject();
        }
    }

    // ---- mode=props ------------------------------------------------------

    private String readDocument(PluginServiceCallbacks callbacks, String repoId, String docId) throws Exception {
        if (docId == null || repoId == null || repoId.length() == 0) {
            throw new IllegalArgumentException("Missing docId or repositoryId");
        }

        // item.id of P8 documents looks like: Class,{GUID},{GUID} - try the GUIDs from the last one
        Matcher m = GUID.matcher(docId);
        List<String> guids = new ArrayList<String>();
        while (m.find()) { guids.add(m.group()); }
        if (guids.isEmpty()) {
            throw new IllegalArgumentException("No GUID found in id");
        }

        Subject subject = callbacks.getP8Subject(repoId);
        UserContext.get().pushSubject(subject);
        try {
            ObjectStore os = callbacks.getP8ObjectStore(repoId);

            Exception last = null;
            for (int i = guids.size() - 1; i >= 0; i--) {
                try {
                    Document doc = Factory.Document.fetchInstance(os, new Id(guids.get(i)), null);
                    doc.fetchProperties(PROPS);
                    LOG.info("HelloService: fetched using GUID #" + (i + 1) + " of " + guids.size());

                    String name    = doc.getProperties().getStringValue("Name");
                    Date created   = doc.getProperties().getDateTimeValue("DateCreated");
                    String creator = doc.getProperties().getStringValue("Creator");
                    Integer major  = doc.getProperties().getInteger32Value("MajorVersionNumber");
                    String mime    = doc.getProperties().getStringValue("MimeType");
                    Double size    = doc.getProperties().getFloat64Value("ContentSize");

                    return row("Name", name) + "," + row("Created", formatDate(created))
                         + "," + row("Creator", creator) + "," + row("MajorVersion", major)
                         + "," + row("MimeType", mime) + "," + row("Size", formatSize(size));
                } catch (Exception e) {
                    last = e;
                    LOG.info("HelloService: GUID #" + (i + 1) + " failed: " + e.getClass().getName());
                }
            }
            throw last;
        } finally {
            UserContext.get().popSubject();
        }
    }

    // ---- helpers ---------------------------------------------------------

    private static String formatDate(Date d) {
        if (d == null) { return ""; }
        // server time zone; SimpleDateFormat is not thread-safe, so one per call
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(d);
    }

    private static String formatSize(Double size) {
        return size == null ? "" : String.valueOf(size.longValue());
    }

    private static String error(String code, String detail) {
        return "{\"errorCode\":\"" + code + "\",\"error\":\"" + escape(detail) + "\"}";
    }

    private static String describe(Exception e) {
        String msg = e.getMessage();
        String text = e.getClass().getSimpleName() + (msg == null ? "" : ": " + msg);
        return text.length() > 200 ? text.substring(0, 200) : text;
    }

    private static String row(String key, Object value) {
        return "{\"key\":\"" + escape(key) + "\",\"value\":\""
             + escape(value == null ? "" : String.valueOf(value)) + "\"}";
    }

    private static String escape(String s) {
        if (s == null) { return ""; }
        StringBuilder sb = new StringBuilder(s.length() + 16);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '"':  sb.append("\\\""); break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
}
