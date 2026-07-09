package com.gu.templatetracker;

import java.io.IOException;
import java.nio.file.Path;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds the set of Twirl templates seen so far in this JVM and logs each one the first time it is
 */
public final class TemplateTracker {

    private static final Set<String> SEEN = ConcurrentHashMap.newKeySet();
    private static SimpleLogger logger = new SimpleLogger(Path.of("../logs/twirl-usage.log"));

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public static void recordRendering(String rawClassName) {
        String template = normalise(rawClassName);
        // After the first sighting of a template, `add` returns false and we do nothing further -
        // so the hot path for high-traffic templates is a single concurrent-set membership check.
        if (SEEN.add(template)) {
            // The request that triggered this render, as seeded by the Play filter and carried across
            // any thread hops by the executor instrumentation. May be null if the render happened
            // outside a request (startup, background job) or before the context could propagate.
            String request = RequestContext.get();
            try {
                logger.log("{" +
                    "\"marker\":\"TEMPLATE_FIRST_SEEN\"," +
                    "\"template\":\"" + jsonEscape(template) + "\", " +
                    "\"request\":" + (request == null ? "null" : "\"" + jsonEscape(request) + "\"") + ", " +
                    "\"timestamp\":\"" + formatter.format(ZonedDateTime.now()) + "\"" +
                    "}");
            } catch (IOException e) {
                // not much we can do, so let's print the error in stderr at least
                e.printStackTrace();
            }
        }
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

