package com.gu.templatetracker;

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

    private final Runnable delegate;
    private final String capturedContext;

    private ContextPropagatingRunnable(Runnable delegate, String capturedContext) {
        this.delegate = delegate;
        this.capturedContext = capturedContext;
    }

    /**
     * Wrap {@code delegate} so it carries the current thread's request context. Returns the delegate
     * unchanged when there is nothing to carry, or it is already wrapped, keeping overhead off the
     * hot path for the (vast majority of) tasks that have no associated request.
     */
    public static Runnable wrap(Runnable delegate) {
        if (delegate == null || delegate instanceof ContextPropagatingRunnable) {
            return delegate;
        }
        String context = RequestContext.get();
        if (context == null) {
            return delegate;
        }
        return new ContextPropagatingRunnable(delegate, context);
    }

    @Override
    public void run() {
        String previous = RequestContext.get();
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

