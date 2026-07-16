package com.gu.templatetracker;

import java.io.IOException;
import java.nio.file.Path;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds the set of Twirl templates seen so far in this JVM and logs each one the first time it is
 */
public final class TemplateTracker {

    private static final Set<String> SEEN = ConcurrentHashMap.newKeySet();
    private static SimpleLogger logger = new SimpleLogger(Path.of("../logs/twirl-usage.log"));

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    // Fields of the request context we dedupe on (in addition to the template itself), so a template
    // shared by many callers is captured once per distinct caller rather than only on its very first
    // render across the whole JVM:
    //   - the routed controller action (e.g. "controllers.FooController.bar"), and
    //   - the `dcr` query param that forces legacy vs DCR rendering
    //     ("true"/"false"/"apps"/"other"/"absent").
    private static final String CONTROLLER_METHOD_KEY = "controllerMethod";
    private static final String DCR_KEY = "dcr";

    public static void recordRendering(String rawClassName) {
        String template = normalise(rawClassName);
        // The request that triggered this render, as seeded by the Play filter and carried across any
        // thread hops by the executor instrumentation. May be null if the render happened outside a
        // request (startup, background job) or before the context could propagate.
        Map<String, String> request = RequestContext.get();
        String controllerMethod = request == null ? null : request.get(CONTROLLER_METHOD_KEY);
        String dcr = request == null ? null : request.get(DCR_KEY);

        // Dedupe on (template, controller method, dcr). '\u0000' can't appear in any value, so it is
        // an unambiguous separator.
        String seenKey = template + '\u0000'
            + (controllerMethod == null ? "" : controllerMethod) + '\u0000'
            + (dcr == null ? "" : dcr);
        // After the first sighting of a (template, action, dcr) tuple, `add` returns false and we do
        // nothing further - so the hot path is a single concurrent-set membership check.
        if (SEEN.add(seenKey)) {
            try {
                logger.log("{" +
                    "\"marker\":\"TEMPLATE_FIRST_SEEN\"," +
                    "\"template\":\"" + jsonEscape(template) + "\"," +
                    "\"request\":" + renderContext(request) + "," +
                    "\"timestamp\":\"" + formatter.format(ZonedDateTime.now()) + "\"" +
                    "}");
            } catch (IOException e) {
                // not much we can do, so let's print the error in stderr at least
                e.printStackTrace();
            }
        }
    }

    /**
     * Render the request context map as a JSON object (or the literal {@code null} when there is no
     * context). Keys and values are escaped; a null value is emitted as the JSON literal {@code null}.
     */
    private static String renderContext(Map<String, String> context) {
        if (context == null || context.isEmpty()) {
            return "null";
        }
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : context.entrySet()) {
            if (!first) {
                sb.append(',');
            }
            first = false;
            sb.append('"').append(jsonEscape(entry.getKey())).append("\":");
            String value = entry.getValue();
            if (value == null) {
                sb.append("null");
            } else {
                sb.append('"').append(jsonEscape(value)).append('"');
            }
        }
        return sb.append('}').toString();
    }

    /**
     * Minimal JSON string escaping for the values we hand-roll into the log line (template class
     * names and request URLs, which can legitimately contain quotes, backslashes or control chars).
     */
    private static String jsonEscape(String value) {
        StringBuilder sb = new StringBuilder(value.length() + 16);
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
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

    /**
     * Scala {@code object}s compile to a {@code Foo$} class; strip the trailing {@code $}.
     */
    private static String normalise(String className) {
        if (className != null && className.endsWith("$")) {
            return className.substring(0, className.length() - 1);
        }
        return className;
    }
}

