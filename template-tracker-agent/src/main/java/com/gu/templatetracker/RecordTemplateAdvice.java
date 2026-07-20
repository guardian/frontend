package com.gu.templatetracker;

import net.bytebuddy.asm.Advice;

/**
 * The advice whose body ByteBuddy inlines at the entry of each instrumented template method.
 *
 * <p>Keep this minimal: only the {@link Advice.OnMethodEnter} method's bytecode is copied into the
 * target. It must reference only types resolvable from the instrumented class's classloader - here
 * just {@link TemplateTracker}, which is loaded by the system classloader (the {@code -javaagent}
 * jar is appended to the system class path) and therefore visible to Play's child application
 * classloader.
 */
public final class RecordTemplateAdvice {

    private RecordTemplateAdvice() {
    }

    @Advice.OnMethodEnter
    public static void onEnter(
        @Advice.Origin("#t") String templateClassName,
        @Advice.AllArguments Object[] args) {
        TemplateTracker.recordRendering(templateClassName, args);
    }
}

