package com.gu.templatetracker;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatcher;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.instrument.Instrumentation;

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

    public static void premain(String args, Instrumentation instrumentation) {
        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Installing Twirl template usage tracker\"}");

        new AgentBuilder.Default()
            .type(TWIRL_TEMPLATE_MATCHER)
            .transform(RECORD_TEMPLATE_TRANSFORMER)
            .installOn(instrumentation);
    }
}

