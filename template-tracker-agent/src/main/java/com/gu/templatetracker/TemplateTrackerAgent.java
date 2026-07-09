package com.gu.templatetracker;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatcher;
import net.bytebuddy.matcher.ElementMatchers;

import java.io.File;
import java.lang.instrument.Instrumentation;
import java.util.jar.JarFile;

/**
 * A JVM agent that records, once per JVM, the first time each Twirl template is rendered.
 * This is useful during the frontend -> DCAR migration in order to understand:
 * - which templates are still being used and therefore needs migrating to DCAR
 * - which templates aren't used and could be removed from the codebase
 * <p>
 * It is wired into the service via {@code -javaagent:.../template-tracker-agent.jar}
 * The JVM calls {@link #premain} before the application's {@code main}, i.e.
 * before Play boots and before any {@code views.html.*} template class is loaded.
 * <p>
 * The instrumentation is deliberately small: it inlines a single call at the entry of each
 * template's {@code apply}/{@code render} method, which delegates to {@link TemplateTracker} where a
 * first-seen {@link java.util.Set} membership check makes every render after the first essentially free.
 */
public final class TemplateTrackerAgent {

    private TemplateTrackerAgent() {
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

    public static void premain(String args, Instrumentation instrumentation) {
        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Installing Twirl template usage tracker\"}");

        // MUST happen first: makes RequestContext / ContextPropagatingRunnable visible to the
        // bootstrap-loaded JDK executor classes we instrument below, and gives them a single identity
        // shared with Play's application classloader. Doing this before any of those classes are
        // referenced guarantees there is exactly one RequestContext (and one ThreadLocal).
        appendAgentJarToBootstrap(instrumentation);

        // 1. Record the first render of each Twirl template, tagged with the current request context.
        new AgentBuilder.Default()
            .type(TWIRL_TEMPLATE_MATCHER)
            .transform(RECORD_TEMPLATE_TRANSFORMER)
            .installOn(instrumentation);

        // 2. Propagate the request context across thread hops by instrumenting every Executor.
        //    RETRANSFORMATION lets us weave already-loaded JDK executors; disableClassFormatChanges
        //    keeps the transform to method-body inlining only, which retransformation of JDK classes
        //    allows. `ignore(none())` lifts the default guard that would otherwise skip JDK types.
        new AgentBuilder.Default()
            .disableClassFormatChanges()
            .with(AgentBuilder.RedefinitionStrategy.RETRANSFORMATION)
            .ignore(ElementMatchers.none())
            .type(EXECUTOR_MATCHER)
            .transform(PROPAGATE_CONTEXT_TRANSFORMER)
            .installOn(instrumentation);
    }

    /**
     * Append this agent jar to the bootstrap classloader search so that the context-carrier classes
     * are visible both to the JDK executor classes we instrument and to Play's application
     * classloader. We locate the jar via {@code TemplateTrackerAgent} (already loaded, and not shared
     * state) rather than via the carrier classes, so we don't accidentally load a second copy of them
     * on the system classloader before the bootstrap entry is in place.
     */
    private static void appendAgentJarToBootstrap(Instrumentation instrumentation) {
        try {
            File agentJar = new File(
                TemplateTrackerAgent.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            instrumentation.appendToBootstrapClassLoaderSearch(new JarFile(agentJar));
        } catch (Exception e) {
            System.err.println(
                "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Could not append agent jar to bootstrap "
                    + "classloader; cross-thread request-context propagation will be disabled\"}");
            e.printStackTrace();
        }
    }
}

