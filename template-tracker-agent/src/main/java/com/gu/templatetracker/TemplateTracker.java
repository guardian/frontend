package com.gu.templatetracker;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds the set of Twirl templates seen so far in this JVM and logs each one the first time it is
 * rendered.
 *
 * <p>This class is loaded by the system classloader (it lives in the {@code -javaagent} jar) so it
 * is shared across the whole application and visible to the woven {@code views.html.*} classes.
 *
 * <p>The PoC logs to stdout as a single structured JSON line so the ELK pipeline can pick it up.
 * We intentionally do not use the application's {@code GuLogging}: that lives in the {@code common}
 * module on Play's application classloader and is not (cleanly) reachable from an agent on the
 * system classloader without coupling the two together. If we later productionise this, the
 * delegate target can be swapped for a registry in {@code common} that emits via {@code GuLogging}
 * + CloudWatch + S3/Athena.
 */
public final class TemplateTracker {

    private static final Set<String> SEEN = ConcurrentHashMap.newKeySet();

    private TemplateTracker() {}

    public static void recordFirstSeen(String rawClassName) {
        String template = normalise(rawClassName);
        // After the first sighting of a template, `add` returns false and we do nothing further -
        // so the hot path for high-traffic templates is a single concurrent-set membership check.
        if (SEEN.add(template)) {
            System.out.println(
                "{\"marker\":\"TEMPLATE_FIRST_SEEN\",\"template\":\"" + template + "\"}");
        }
    }

    /** Scala {@code object}s compile to a {@code Foo$} class; strip the trailing {@code $}. */
    private static String normalise(String className) {
        if (className != null && className.endsWith("$")) {
            return className.substring(0, className.length() - 1);
        }
        return className;
    }
}

