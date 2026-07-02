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
    private static SimpleLogger logger = null;

    private TemplateTracker() {
        this.logger = new SimpleLogger(Path.of("../logs/twirl-usage.log"));
    }

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public static void recordRendering(String rawClassName) {
        String template = normalise(rawClassName);
        // After the first sighting of a template, `add` returns false and we do nothing further -
        // so the hot path for high-traffic templates is a single concurrent-set membership check.
        if (SEEN.add(template)) {
            try {
                logger.log("{" +
                    "\"marker\":\"TEMPLATE_FIRST_SEEN\"," +
                    "\"template\":\"" + template + "\", " +
                    "\"timestamp\":\"" + formatter.format(ZonedDateTime.now()) + "\"" +
                    "}");
            } catch (IOException e) {
                // not much we can do, so let's print the error in stderr at least
                e.printStackTrace();
            }
        }
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

