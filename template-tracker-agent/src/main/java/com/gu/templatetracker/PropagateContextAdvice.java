package com.gu.templatetracker;

import net.bytebuddy.asm.Advice;

/**
 * Advice inlined at the entry of {@code Executor#execute(Runnable)} (and subtypes). It replaces the
 * submitted task with one that carries the current thread's request context to the worker thread.
 *
 * <p>Because it is woven into bootstrap-loaded JDK classes, everything it references
 * ({@link ContextPropagatingRunnable}, and transitively {@link RequestContext}) must also be visible
 * to the bootstrap classloader - which is why {@link TemplateTrackerAgent#premain} appends the agent
 * jar to the bootstrap classloader search.
 */
public final class PropagateContextAdvice {

    private PropagateContextAdvice() {
    }

    @Advice.OnMethodEnter
    public static void onEnter(@Advice.Argument(value = 0, readOnly = false) Runnable task) {
        task = ContextPropagatingRunnable.wrap(task);
    }
}

