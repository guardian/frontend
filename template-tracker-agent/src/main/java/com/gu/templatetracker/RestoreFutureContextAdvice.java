package com.gu.templatetracker;

import net.bytebuddy.asm.Advice;

import java.util.Map;

/**
 * Advice inlined around {@code scala.concurrent.impl.Promise$Transformation#run()}. The context that
 * {@link CaptureFutureContextAdvice} stashed on this instance at construction (the thread that
 * registered the callback) is re-installed on the current worker thread for the duration of
 * {@code run()} - i.e. while the user's {@code map}/{@code flatMap}/... body (and therefore any Twirl
 * render it triggers) executes - then unwound afterwards.
 *
 * <p>This is what actually bridges the async gap: it does not matter which thread completed the source
 * promise or on which dispatcher the continuation runs; the context rides on the Transformation itself.
 */
public final class RestoreFutureContextAdvice {

    private RestoreFutureContextAdvice() {
    }

    /**
     * @return the context that was on this thread before we overwrote it, handed to {@link #onExit} via
     *         {@link Advice.Enter}; {@code null} when there was nothing to restore (either no captured
     *         context, or the thread was already context-free).
     */
    @Advice.OnMethodEnter
    public static Map<String, String> onEnter(
            @Advice.FieldValue("templateTrackerContext") Map<String, String> stored) {
        if (stored == null) {
            return null;
        }
        Map<String, String> previous = RequestContext.get();
        RequestContext.set(stored);
        return previous;
    }

    @Advice.OnMethodExit(onThrowable = Throwable.class)
    public static void onExit(
            @Advice.Enter Map<String, String> previous,
            @Advice.FieldValue("templateTrackerContext") Map<String, String> stored) {
        // Only unwind if we installed something on enter. `stored` is still readable here, so we use it
        // (rather than `previous`, which is legitimately null when the thread was context-free) to tell
        // "we set the context" apart from "there was nothing to set".
        if (stored == null) {
            return;
        }
        if (previous != null) {
            RequestContext.set(previous);
        } else {
            RequestContext.clear();
        }
    }
}

