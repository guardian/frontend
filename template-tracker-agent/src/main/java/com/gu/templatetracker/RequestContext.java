package com.gu.templatetracker;

import java.util.Map;

/**
 * A JDK-only carrier for "the request currently being handled on this thread".
 *
 * <p>The context is a plain {@code Map<String, String>} of already-extracted, human-readable fields
 * (request id, HTTP method, controller method, dcr param, ...). We deliberately carry a small,
 * immutable-in-spirit snapshot rather than a rich object: the map rides along inside every
 * queued/in-flight task (see {@link ContextPropagatingRunnable}), so keeping it a handful of short
 * strings avoids pinning heavyweight request state alive across async hops.
 *
 * <p>Using {@code Map} (a JDK type) also means the Play {@code Filter} that writes the context can pass
 * it straight through reflection with no compile-time coupling to the agent.
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

    private static final ThreadLocal<Map<String, String>> CURRENT = new ThreadLocal<>();

    private RequestContext() {
    }

    /** Set the fields describing the request being handled on the current thread. */
    public static void set(Map<String, String> context) {
        CURRENT.set(context);
    }

    /** The request fields associated with the current thread, or {@code null} if none. */
    public static Map<String, String> get() {
        return CURRENT.get();
    }

    /** Remove any request fields associated with the current thread. */
    public static void clear() {
        CURRENT.remove();
    }
}


