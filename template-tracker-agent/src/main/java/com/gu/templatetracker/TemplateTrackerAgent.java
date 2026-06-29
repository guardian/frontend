package com.gu.templatetracker;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.instrument.Instrumentation;

/**
 * A JVM agent that records, once per JVM, the first time each Twirl template is rendered.
 *
 * <p>It is wired into the host application via {@code -javaagent:.../template-tracker-agent.jar}
 * (see the {@code discussion} module in {@code build.sbt}). The JVM calls {@link #premain} before
 * the application's {@code main}, i.e. before Play boots and before any {@code views.html.*}
 * template class is loaded - so every template is woven naturally as it is first class-loaded.
 *
 * <p>The instrumentation is deliberately tiny: it inlines a single call at the entry of each
 * template's {@code apply}/{@code render} method, which delegates to {@link TemplateTracker} where a
 * first-seen {@link java.util.Set} membership check makes every render after the first essentially free.
 */
public final class TemplateTrackerAgent {

    private TemplateTrackerAgent() {
    }

    public static void premain(String args, Instrumentation instrumentation) {
        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"installing Twirl template usage tracker\"}");

        new AgentBuilder.Default()
            // Only consider compiled Twirl templates: classes under views.html.* that are
            // subtypes of play.twirl.api.Template* (Template0..Template22). This excludes the
            // many anonymous-function classes Scala generates inside a template
            // (e.g. views.html.fragments.articleBody$$anonfun$...), which also live under
            // views.html.* and also have an `apply` method, but are not templates.
            .type(
                ElementMatchers.<net.bytebuddy.description.type.TypeDescription>nameStartsWith("views.html.")
                    .and(ElementMatchers.hasSuperType(ElementMatchers.nameStartsWith("play.twirl.api.Template"))))
            .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
                builder.visit(
                    Advice.to(RecordTemplateAdvice.class)
                        .on(ElementMatchers.named("apply").or(ElementMatchers.named("render")))))
            .installOn(instrumentation);
    }
}

