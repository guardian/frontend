package com.gu.templatetracker;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.description.method.MethodDescription;
import net.bytebuddy.description.method.MethodList;
import net.bytebuddy.description.modifier.SyntheticState;
import net.bytebuddy.description.modifier.Visibility;
import net.bytebuddy.description.type.TypeDescription;
import net.bytebuddy.dynamic.ClassFileLocator;
import net.bytebuddy.matcher.ElementMatcher;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.instrument.Instrumentation;
import java.util.Map;

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

    // ByteBuddy inlines advice by reading the advice class's *bytecode* via a ClassFileLocator. The
    // default locator uses the advice class's own classloader - but our advice classes are defined by
    // the *bootstrap* loader (we append the agent jar there), and the bootstrap loader doesn't expose
    // them as readable resources, so the default fails with:
    //   "Could not locate class file for com.gu.templatetracker.RecordTemplateAdvice".
    // The agent jar is also on the *system* classpath (that's how -javaagent attaches it - the same
    // source that read the advice on main), so we read the advice bytecode from there explicitly.
    private static final ClassFileLocator ADVICE_LOCATOR = ClassFileLocator.ForClassLoader.ofSystemLoader();

    // We define a "Twirl template" as: classes under views.html.* that are subtypes of play.twirl.api.Template* (Template0..Template22).
    private static ElementMatcher TWIRL_TEMPLATE_MATCHER = ElementMatchers.<net.bytebuddy.description.type.TypeDescription>nameStartsWith("views.html.")
        .and(ElementMatchers.hasSuperType(ElementMatchers.nameStartsWith("play.twirl.api.Template")));

    // This transformer inlines `TemplateTracker.recordRendering` (via RecordTemplateAdvice) at the entry of each template's `apply` and `render` methods.
    private static AgentBuilder.Transformer RECORD_TEMPLATE_TRANSFORMER = (builder, typeDescription, classLoader, module, protectionDomain) ->
        builder.visit(
            Advice.to(RecordTemplateAdvice.class, ADVICE_LOCATOR)
                .on(ElementMatchers.named("apply").or(ElementMatchers.named("render"))));

    // Any type that is an Executor: ThreadPoolExecutor, ForkJoinPool (Scala's default EC), Pekko
    // dispatchers, the CAPI/WS client pools, etc. Instrumenting `execute(Runnable)` on all of them is
    // what lets the request context follow a logical request across every async hop.
    private static ElementMatcher<net.bytebuddy.description.type.TypeDescription> EXECUTOR_MATCHER =
        ElementMatchers.hasSuperType(ElementMatchers.named("java.util.concurrent.Executor"));

    // Replaces the submitted Runnable with a context-carrying one (see PropagateContextAdvice).
    private static final ElementMatcher.Junction<MethodDescription> EXECUTE_METHOD_MATCHER =
        ElementMatchers.named("execute")
            .and(ElementMatchers.takesArguments(1))
            .and(ElementMatchers.takesArgument(0, Runnable.class));

    private static AgentBuilder.Transformer PROPAGATE_CONTEXT_TRANSFORMER = (builder, typeDescription, classLoader, module, protectionDomain) -> {
        // DIAGNOSTIC: a "[Byte Buddy] TRANSFORM ..." line only tells us the *type* matched - not that
        // any method was actually woven (e.g. the java.util.concurrent.Executor interface matches but
        // its abstract execute() gets nothing). Log the concrete execute(Runnable) methods we actually
        // instrument, so we can confirm whether the hot executors (ThreadPoolExecutor, ForkJoinPool,
        // Pekko dispatchers) really get the advice. Remove once propagation is verified.
        MethodList<?> matched = typeDescription.getDeclaredMethods().filter(EXECUTE_METHOD_MATCHER);
        if (!matched.isEmpty()) {
            System.out.println(
                "{\"marker\":\"TEMPLATE_TRACKER_DEBUG\",\"message\":\"weaving execute(Runnable)\",\"type\":\""
                    + typeDescription.getName() + "\",\"methods\":" + matched.size() + "}");
        }
        return builder.visit(Advice.to(PropagateContextAdvice.class, ADVICE_LOCATOR).on(EXECUTE_METHOD_MATCHER));
    };

    // In Scala 2.13 every Future combinator (map/flatMap/transform/onComplete/recover/...) is backed by
    // one Runnable class: scala.concurrent.impl.Promise$Transformation. It is constructed on the thread
    // that *registers* the callback (which still holds the request context) and only later handed to an
    // executor - frequently by a foreign thread that never carried the context (e.g. the async-HTTP I/O
    // thread completing a CAPI lookup). Instrumenting it lets the context ride on the callback itself,
    // which is what actually bridges the async gap that submit-time executor capture cannot.
    private static ElementMatcher<TypeDescription> FUTURE_TRANSFORMATION_MATCHER =
        ElementMatchers.named("scala.concurrent.impl.Promise$Transformation");

    // The synthetic field the two advices use to stash the captured context on each Transformation.
    private static final String CONTEXT_FIELD = "templateTrackerContext";

    private static AgentBuilder.Transformer FUTURE_CONTEXT_TRANSFORMER =
        (builder, typeDescription, classLoader, module, protectionDomain) -> builder
            // Per-instance storage for the registration-time context. Adding a field is a class-format
            // change, so this block must weave the class on load (no retransformation) - fine, since the
            // Scala runtime only loads Transformation once the app boots, i.e. after premain.
            .defineField(CONTEXT_FIELD, Map.class, Visibility.PUBLIC, SyntheticState.SYNTHETIC)
            .visit(Advice.to(CaptureFutureContextAdvice.class, ADVICE_LOCATOR).on(ElementMatchers.isConstructor()))
            .visit(Advice.to(RestoreFutureContextAdvice.class, ADVICE_LOCATOR)
                .on(ElementMatchers.named("run").and(ElementMatchers.takesArguments(0))));

    /**
     * Install the two instrumentations. Called by {@link TemplateTrackerAgent#premain} only after the
     * bootstrap append, so this class (and ByteBuddy) load via the bootstrap loader.
     *
     * @param bootstrapReady whether the carrier classes were successfully appended to the bootstrap
     *                       classloader; the executor propagation is only installed when {@code true}.
     */
    public static void install(Instrumentation instrumentation, boolean bootstrapReady) {
        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Installer reached; installing instrumentation\"}");

        // 1. Record the first render of each Twirl template, tagged with the current request context.
        //    Independent of the bootstrap append (it only needs TemplateTracker), so we always install it.
        //    DIAGNOSTIC: the listener prints a "[Byte Buddy] TRANSFORM ..." line per woven class and a
        //    "[Byte Buddy] ERROR ..." line for any weaving failure, so we can see whether the Twirl
        //    templates are actually matched/transformed.
        new AgentBuilder.Default()
            .with(AgentBuilder.Listener.StreamWriting.toSystemOut().withTransformationsOnly())
            .type(TWIRL_TEMPLATE_MATCHER)
            .transform(RECORD_TEMPLATE_TRANSFORMER)
            .installOn(instrumentation);

        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Template recording instrumentation installed\"}");

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
            // DIAGNOSTIC: mirror block 1's listener so we can see whether executors are actually woven.
            // withTransformationsOnly() keeps onTransformation + onError but drops the (very noisy under
            // ignore(none())) discovery/complete events, so we get one "[Byte Buddy] TRANSFORM ..." line
            // per woven Executor and a "[Byte Buddy] ERROR ..." line for every silent weaving failure.
            new AgentBuilder.Default()
                .with(AgentBuilder.Listener.StreamWriting.toSystemOut().withTransformationsOnly())
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

        // 3. Bridge the async gap that (2) structurally cannot: capture the request context when a Scala
        //    Future callback is *registered* (on the request thread) and restore it when it *runs*, by
        //    instrumenting scala.concurrent.impl.Promise$Transformation. This is what makes the context
        //    visible at render time when the render sits behind an async boundary (e.g. a CAPI lookup),
        //    where the completing thread never carried the context. Also only meaningful when the
        //    carrier classes are on the bootstrap loader.
        //    DIAGNOSTIC: the listener prints a "[Byte Buddy] TRANSFORM scala.concurrent.impl.Promise$Transformation"
        //    line confirming the class was woven (and any "[Byte Buddy] ERROR ..." if it was already
        //    loaded at premain, in which case the on-load field addition would miss it).
        if (bootstrapReady) {
            new AgentBuilder.Default()
                .with(AgentBuilder.Listener.StreamWriting.toSystemOut().withTransformationsOnly())
                .type(FUTURE_TRANSFORMATION_MATCHER)
                .transform(FUTURE_CONTEXT_TRANSFORMER)
                .installOn(instrumentation);
        }
    }
}

