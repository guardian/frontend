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
    //   - the routed controller action (e.g. "controllers.FooController.bar"),
    //   - the `dcr` query param that forces legacy vs DCR rendering
    //     ("true"/"false"/"apps"/"other"/"absent"), and
    //   - the HTTP method.
    private static final String CONTROLLER_METHOD_KEY = "controllerMethod";
    private static final String DCR_KEY = "dcr";
    private static final String METHOD_KEY = "method";
    private static final String SAMPLE_URI_KEY = "sampleUri";

    public static void recordRendering(String rawClassName) {
        String template = normalise(rawClassName);
        // The request that triggered this render, as seeded by the TemplateContextFilter and carried across any
        // thread hops by the executor instrumentation. The context (or any individual field) may be
        // absent if the render happened outside a request (startup, background job) or before the
        // context could propagate - in which case that field is logged as JSON null.
        Map<String, String> request = RequestContext.get();
        String method = field(request, METHOD_KEY);
        String controllerMethod = field(request, CONTROLLER_METHOD_KEY);
        String dcr = field(request, DCR_KEY);
        String sampleUri = field(request, SAMPLE_URI_KEY);

        // Dedupe on (template, controller method, dcr, http method).
        String seenKey = template + '|'
            + (controllerMethod == null ? "" : controllerMethod) + '|'
            + (dcr == null ? "" : dcr) + '|'
            + (method == null ? "" : method);
        // After the first sighting of this tuple, `add` returns false and we do nothing further - so
        // the hot path is a single concurrent-set membership check.
        if (SEEN.add(seenKey)) {
            try {
                logger.log("{" +
                    "\"marker\":\"TEMPLATE_FIRST_SEEN\"," +
                    "\"template\":\"" + jsonEscape(template) + "\"," +
                    "\"method\":" + jsonStringOrNull(method) + "," +
                    "\"controllerMethod\":" + jsonStringOrNull(controllerMethod) + "," +
                    "\"dcr\":" + jsonStringOrNull(dcr) + "," +
                    "\"sampleUri\":" + jsonStringOrNull(sampleUri) + "," +
                    "\"timestamp\":\"" + formatter.format(ZonedDateTime.now()) + "\"" +
                    "}");
            } catch (IOException e) {
                // not much we can do, so let's print the error in stderr at least
                e.printStackTrace();
            }
        }
    }

    /**
     * The value for {@code key}, or {@code null} when there is no context or the field is absent.
     */
    private static String field(Map<String, String> context, String key) {
        return context == null ? null : context.get(key);
    }

    /**
     * Render a string field as a quoted, escaped JSON string, or the JSON literal {@code null}.
     */
    private static String jsonStringOrNull(String value) {
        return value == null ? "null" : "\"" + jsonEscape(value) + "\"";
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
                case '"':
                    sb.append("\\\"");
                    break;
                case '\\':
                    sb.append("\\\\");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
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

