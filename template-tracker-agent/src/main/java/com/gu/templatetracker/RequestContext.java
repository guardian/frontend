package com.gu.templatetracker;

/**
 * A JDK-only carrier for "the request currently being handled on this thread".
 *
 * <p>This class lives in the agent jar which we append to the <em>bootstrap</em> classloader (see
 * {@link TemplateTrackerAgent#premain}). That gives it a single identity that is visible to:
 * <ul>
 *   <li>Play's child application classloader - so a Play {@code Filter} can write the context, and</li>
 *   <li>bootstrap-loaded JDK classes (e.g. {@code java.util.concurrent.*}) - so we can propagate the
 *       context across thread hops by instrumenting {@link java.util.concurrent.Executor}.</li>
 * </ul>
 *
 * <p>It deliberately references <strong>only</strong> the JDK: were it to touch any Play/{@code common}
 * type it could not be loaded by the bootstrap classloader, and the agent (a classloading ancestor of
 * the app) could not see it.
 */
public final class RequestContext {

    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    private RequestContext() {
    }

    /** Set the description of the request being handled on the current thread. */
    public static void set(String description) {
        CURRENT.set(description);
    }

    /** The request description associated with the current thread, or {@code null} if none. */
    public static String get() {
        return CURRENT.get();
    }

    /** Remove any request description associated with the current thread. */
    public static void clear() {
        CURRENT.remove();
    }
}

