package com.gu.templatetracker;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatcher;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.instrument.Instrumentation;

/**
 * Holds all the ByteBuddy wiring, deliberately split out of {@link TemplateTrackerAgent}.
 *
 * <p><strong>Why a separate class?</strong> The agent appends its own jar - ByteBuddy included - to the
 * bootstrap classloader (so the JDK executor classes we instrument can see the carrier classes). Once
 * that happens, any ByteBuddy class is resolved parent-first and therefore <em>defined by the
 * bootstrap loader</em>. The catch is that {@link TemplateTrackerAgent} is defined by the system
 * loader, so if <em>it</em> referenced ByteBuddy types they could be defined by the system loader
 * <em>before</em> the append runs - notably during its own static-init or bytecode verification. That
 * would leave two copies of e.g. {@code ElementMatcher} (system + bootstrap) and the JVM would reject
 * the mismatch with a {@code LinkageError: loader constraint violation}.
 *
 * <p>Keeping every ByteBuddy reference in this class avoids that: {@code premain} names no ByteBuddy
 * type, so verifying it can't load one; and the {@code invokestatic} that calls {@link #install} is
 * resolved lazily, at execution time - i.e. <em>after</em> the append. By then the jar is on the
 * bootstrap, so this class and all the ByteBuddy classes it touches are defined once, by the bootstrap
 * loader.
 */
public final class TemplateTrackerInstaller {

    private TemplateTrackerInstaller() {
    }

    // We define a "Twirl template" as: classes under views.html.* that are subtypes of play.twirl.api.Template* (Template0..Template22).
    private static ElementMatcher TWIRL_TEMPLATE_MATCHER = ElementMatchers.<net.bytebuddy.description.type.TypeDescription>nameStartsWith("views.html.")
        .and(ElementMatchers.hasSuperType(ElementMatchers.nameStartsWith("play.twirl.api.Template")));

    // This transformer inlines `TemplateTracker.recordRendering` (via RecordTemplateAdvice) at the entry of each template's `apply` and `render` methods.
    private static AgentBuilder.Transformer RECORD_TEMPLATE_TRANSFORMER = (builder, typeDescription, classLoader, module, protectionDomain) ->
        builder.visit(
            Advice.to(RecordTemplateAdvice.class)
                .on(ElementMatchers.named("apply").or(ElementMatchers.named("render"))));

    // Any type that is an Executor: ThreadPoolExecutor, ForkJoinPool (Scala's default EC), Pekko
    // dispatchers, the CAPI/WS client pools, etc. Instrumenting `execute(Runnable)` on all of them is
    // what lets the request context follow a logical request across every async hop.
    private static ElementMatcher<net.bytebuddy.description.type.TypeDescription> EXECUTOR_MATCHER =
        ElementMatchers.hasSuperType(ElementMatchers.named("java.util.concurrent.Executor"));

    // Replaces the submitted Runnable with a context-carrying one (see PropagateContextAdvice).
    private static AgentBuilder.Transformer PROPAGATE_CONTEXT_TRANSFORMER = (builder, typeDescription, classLoader, module, protectionDomain) ->
        builder.visit(
            Advice.to(PropagateContextAdvice.class)
                .on(ElementMatchers.named("execute")
                    .and(ElementMatchers.takesArguments(1))
                    .and(ElementMatchers.takesArgument(0, Runnable.class))));

    /**
     * Install the two instrumentations. Called by {@link TemplateTrackerAgent#premain} only after the
     * bootstrap append, so this class (and ByteBuddy) load via the bootstrap loader.
     *
     * @param bootstrapReady whether the carrier classes were successfully appended to the bootstrap
     *                       classloader; the executor propagation is only installed when {@code true}.
     */
    public static void install(Instrumentation instrumentation, boolean bootstrapReady) {
        // 1. Record the first render of each Twirl template, tagged with the current request context.
        //    Independent of the bootstrap append (it only needs TemplateTracker), so we always install it.
        new AgentBuilder.Default()
            .type(TWIRL_TEMPLATE_MATCHER)
            .transform(RECORD_TEMPLATE_TRANSFORMER)
            .installOn(instrumentation);

        // 2. Propagate the request context across thread hops by instrumenting every Executor.
        //    RETRANSFORMATION lets us weave already-loaded JDK executors; disableClassFormatChanges
        //    keeps the transform to method-body inlining only, which retransformation of JDK classes
        //    allows. `ignore(none())` lifts the default guard that would otherwise skip JDK types.
        //
        //    Only install this when the bootstrap append succeeded: the woven advice references
        //    ContextPropagatingRunnable / RequestContext, so if those classes aren't on the bootstrap
        //    classloader the JDK executors would throw NoClassDefFoundError on their hottest path. When
        //    the append failed we simply skip propagation - templates are still recorded, just without
        //    a request attached once the render crosses a thread boundary.
        if (bootstrapReady) {
            new AgentBuilder.Default()
                .disableClassFormatChanges()
                .with(AgentBuilder.RedefinitionStrategy.RETRANSFORMATION)
                .ignore(ElementMatchers.none())
                .type(EXECUTOR_MATCHER)
                .transform(PROPAGATE_CONTEXT_TRANSFORMER)
                .installOn(instrumentation);
        } else {
            System.err.println(
                "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Skipping executor instrumentation; "
                    + "cross-thread request-context propagation is disabled\"}");
        }
    }
}

