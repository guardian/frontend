package com.gu.templatetracker;

import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Wraps a {@link Runnable} so that the request context captured at <em>submit</em> time (on the
 * thread that hands the task to an executor) is restored around {@link #run()} on the <em>worker</em>
 * thread, then cleaned up afterwards.
 *
 * <p>On its own this only bridges a single executor hop. The trick is that every executor on the
 * request path is instrumented (see {@link PropagateContextAdvice}) to wrap tasks this way, so the
 * context forms an unbroken chain:
 *
 * <pre>
 *   thread A (filter sets context)
 *     -&gt; submit CAPI task            (context captured here)
 *        -&gt; thread B runs it, restores context
 *           -&gt; future completes, submits the render continuation (context captured again)
 *              -&gt; thread C runs it, restores context
 *                 -&gt; Twirl render reads RequestContext.get()  == the original request
 * </pre>
 *
 * <p>Like {@link RequestContext} it references only the JDK, so it can be loaded by the bootstrap
 * classloader alongside the JDK executor classes it is woven into.
 */
public final class ContextPropagatingRunnable implements Runnable {

    // DIAGNOSTIC: log the first time we actually capture a context at an executor submit, to confirm
    // that propagation starts at all (and on which thread). Remove once propagation is verified.
    private static final AtomicBoolean CAPTURE_LOGGED = new AtomicBoolean(false);

    // DIAGNOSTIC: log the first time execute(Runnable) is intercepted at all - BEFORE the null-context
    // early return below - so we can tell "execute was never woven/called" (this never prints) apart
    // from "execute is woven and called, but the context was null on this hop" (this prints with
    // hasContext=false while CAPTURE_LOGGED stays silent). Remove once propagation is verified.
    private static final AtomicBoolean INTERCEPT_LOGGED = new AtomicBoolean(false);

    private final Runnable delegate;
    private final Map<String, String> capturedContext;

    private ContextPropagatingRunnable(Runnable delegate, Map<String, String> capturedContext) {
        this.delegate = delegate;
        this.capturedContext = capturedContext;
    }

    /**
     * Wrap {@code delegate} so it carries the current thread's request context. Returns the delegate
     * unchanged when there is nothing to carry, or it is already wrapped, keeping overhead off the
     * hot path for the (vast majority of) tasks that have no associated request.
     */
    public static Runnable wrap(Runnable delegate) {
        if (INTERCEPT_LOGGED.compareAndSet(false, true)) {
            System.out.println(
                "{\"marker\":\"TEMPLATE_TRACKER_DEBUG\",\"message\":\"First execute() interception (context may be null)\","
                    + "\"thread\":\"" + Thread.currentThread().getName() + "\",\"hasContext\":"
                    + (RequestContext.get() != null) + "}");
        }
        if (delegate == null || delegate instanceof ContextPropagatingRunnable) {
            return delegate;
        }
        Map<String, String> context = RequestContext.get();
        if (context == null) {
            return delegate;
        }
        if (CAPTURE_LOGGED.compareAndSet(false, true)) {
            System.out.println(
                "{\"marker\":\"TEMPLATE_TRACKER_DEBUG\",\"message\":\"First context capture at executor submit\","
                    + "\"thread\":\"" + Thread.currentThread().getName() + "\",\"context\":\"" + context + "\"}");
        }
        return new ContextPropagatingRunnable(delegate, context);
    }

    @Override
    public void run() {
        Map<String, String> previous = RequestContext.get();
        RequestContext.set(capturedContext);
        try {
            delegate.run();
        } finally {
            if (previous != null) {
                RequestContext.set(previous);
            } else {
                RequestContext.clear();
            }
        }
    }
}



