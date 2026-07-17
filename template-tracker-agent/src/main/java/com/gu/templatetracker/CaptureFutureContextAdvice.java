package com.gu.templatetracker;

import net.bytebuddy.asm.Advice;

import java.util.Map;

/**
 * Advice inlined at the <em>exit</em> of every {@code scala.concurrent.impl.Promise$Transformation}
 * constructor. In Scala 2.13 that single class is the {@link Runnable} behind <em>every</em> {@code Future}
 * combinator - {@code map}, {@code flatMap}, {@code transform}, {@code onComplete}, {@code recover}, etc.
 * It is constructed on the thread that <em>registers</em> the callback (which still carries the request
 * context), and only later handed to an {@code Executor} - often from a thread that never carried the
 * context (e.g. the async-HTTP I/O thread that completes a CAPI lookup).
 *
 * <p>That timing is exactly why capturing at {@code Executor#execute} submit time fails: by then the
 * context is gone. Capturing it here, at construction, and stashing it on the Transformation instance
 * (see the synthetic {@code templateTrackerContext} field added by the installer) lets it survive the
 * async gap so {@link RestoreFutureContextAdvice} can put it back around {@code run()}.
 *
 * <p>References only the JDK and {@link RequestContext}, so it is safe to inline into the
 * bootstrap-visible Scala runtime class.
 */
public final class CaptureFutureContextAdvice {

    private CaptureFutureContextAdvice() {
    }

    @Advice.OnMethodExit
    public static void onConstructed(
            @Advice.FieldValue(value = "templateTrackerContext", readOnly = false) Map<String, String> stored) {
        // Snapshot the registering thread's context (null when there is no request in flight - the
        // vast majority of Futures - in which case restore is a no-op).
        stored = RequestContext.get();
    }
}

