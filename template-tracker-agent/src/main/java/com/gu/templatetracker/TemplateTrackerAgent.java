package com.gu.templatetracker;

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
 * <p>
 * This class references <strong>no ByteBuddy type</strong> on purpose: it appends its own jar (which
 * bundles ByteBuddy) to the bootstrap classloader, after which ByteBuddy must be defined solely by the
 * bootstrap loader. All ByteBuddy wiring therefore lives in {@link TemplateTrackerInstaller}, which is
 * only referenced <em>after</em> the append - see that class for the full rationale.
 */
public final class TemplateTrackerAgent {

    private TemplateTrackerAgent() {
    }

    public static void premain(String args, Instrumentation instrumentation) {
        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Installing Twirl template usage tracker\"}");

        // MUST happen first: makes RequestContext / ContextPropagatingRunnable visible to the
        // bootstrap-loaded JDK executor classes we instrument below, and gives them a single identity
        // shared with Play's application classloader. Doing this before any of those classes are
        // referenced guarantees there is exactly one RequestContext (and one ThreadLocal).
        boolean bootstrapReady = appendAgentJarToBootstrap(instrumentation);

        // Delegate all ByteBuddy work to TemplateTrackerInstaller. This is an ordinary static call, so
        // it is resolved lazily at execution time - i.e. after the append above - which means the
        // installer and every ByteBuddy class it references are defined by the bootstrap loader (a
        // single copy), rather than being loaded by the system loader before the append.
        TemplateTrackerInstaller.install(instrumentation, bootstrapReady);
    }

    /**
     * Append this agent jar to the bootstrap classloader search so that the context-carrier classes
     * are visible both to the JDK executor classes we instrument and to Play's application
     * classloader. We locate the jar via {@code TemplateTrackerAgent} (already loaded, and not shared
     * state) rather than via the carrier classes, so we don't accidentally load a second copy of them
     * on the system classloader before the bootstrap entry is in place.
     *
     * @return {@code true} if the jar was appended and the carrier classes are now bootstrap-visible;
     *         {@code false} if not (in which case the caller must not install the executor advice).
     */
    private static boolean appendAgentJarToBootstrap(Instrumentation instrumentation) {
        try {
            File agentJar = new File(
                TemplateTrackerAgent.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            instrumentation.appendToBootstrapClassLoaderSearch(new JarFile(agentJar));
            return true;
        } catch (Exception e) {
            System.err.println(
                "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Could not append agent jar to bootstrap "
                    + "classloader; cross-thread request-context propagation will be disabled\"}");
            e.printStackTrace();
            return false;
        }
    }
}

