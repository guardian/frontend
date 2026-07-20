package com.gu.templatetracker;

import java.io.IOException;
import java.nio.file.Path;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds the set of (template, dcr, method) combinations seen so far in this JVM and logs each
 * combination the first time it is rendered.
 *
 * <p>The template arguments (which include an implicit {@code play.api.mvc.RequestHeader} for most
 * templates) are inspected reflectively, because {@code RequestHeader} is loaded by Play's child
 * classloader and is therefore not referenceable from this agent's classes on the system classloader.
 */
public final class TemplateTracker {

    private static final Set<String> SEEN = ConcurrentHashMap.newKeySet();
    private static SimpleLogger logger = new SimpleLogger(Path.of("../logs/twirl-usage.log"));

    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Fully-qualified name of the Play type we look for among the template arguments.
     */
    private static final String REQUEST_HEADER_TYPE = "play.api.mvc.RequestHeader";

    /**
     * The standardised query param whose value we want to capture.
     */
    private static final String DCR_QUERY_PARAM = "dcr";

    /**
     * dcr value used when no RequestHeader argument was passed to the template.
     */
    private static final String DCR_UNKNOWN = "unknown";

    /**
     * dcr value used when a RequestHeader is present but the query param is missing.
     */
    private static final String DCR_ABSENT = "absent";

    /**
     * dcr value used when the query param is present but not one of the expected values.
     */
    private static final String DCR_OTHER = "other";

    /**
     * The set of expected {@code dcr} query param values.
     */
    private static final Set<String> ALLOWED_DCR_VALUES = Set.of("true", "false", "apps");

    /**
     * method value used when no RequestHeader argument was passed to the template.
     */
    private static final String METHOD_UNKNOWN = "unknown";

    /**
     * method value used for any HTTP method outside the expected set.
     */
    private static final String METHOD_OTHER = "OTHER";

    /**
     * The set of expected HTTP methods.
     */
    private static final Set<String> ALLOWED_METHODS = Set.of("GET", "POST", "PUT");

    /**
     * controller value used when no RequestHeader argument was passed to the template, or when the
     * request carries no routing {@code HandlerDef} (e.g. templates rendered outside a routed request).
     */
    private static final String CONTROLLER_UNKNOWN = "unknown";

    public static void recordRendering(String rawClassName, Object[] args) {
        String template = normalise(rawClassName);

        // The RequestHeader lives in Play's child classloader, so we can only touch it via
        // reflection - see #requestHeaderMethod / #deduceDcr.
        Object request = findRequestHeader(args);
        String dcr = deduceDcr(request);
        String method = deduceMethod(request);
        String controller = deduceController(request);

        // De-duplicate on the (template, dcr, method, controller) tuple so we capture each distinct combination once
        String dedupeKey = template + "|" + dcr + "|" + method + "|" + controller;

        // After the first sighting of a combination, `add` returns false and we do nothing further -
        // so the hot path for high-traffic templates is a single concurrent-set membership check: cheap and fast
        if (SEEN.add(dedupeKey)) {
            try {
                logger.log("{" +
                    "\"marker\":\"TEMPLATE_FIRST_SEEN\"," +
                    "\"template\":\"" + template + "\", " +
                    "\"dcr\":\"" + dcr + "\", " +
                    "\"method\":\"" + method + "\", " +
                    "\"controller\":\"" + controller + "\", " +
                    "\"timestamp\":\"" + formatter.format(ZonedDateTime.now()) + "\"" +
                    "}");
            } catch (IOException e) {
                // not much we can do, so let's print the error in stderr at least
                e.printStackTrace();
            }
        }
    }

    /**
     * Find the first argument that is (a subtype of) {@link #REQUEST_HEADER_TYPE}, or {@code null}
     * if none of the arguments is a RequestHeader. We match by type name rather than by position
     * because the implicit parameter order is not guaranteed across templates and there's not compilation
     * guarantee that the RequestHeader will be provided at all.
     */
    private static Object findRequestHeader(Object[] args) {
        if (args == null) {
            return null;
        }
        for (Object arg : args) {
            if (arg != null && isRequestHeader(arg.getClass())) {
                return arg;
            }
        }
        return null;
    }

    /**
     * Walk the class hierarchy (superclasses and interfaces) looking for {@link #REQUEST_HEADER_TYPE}.
     * RequestHeader is a Scala trait so it shows up as an implemented interface on the concrete class.
     */
    private static boolean isRequestHeader(Class<?> type) {
        if (type == null) {
            return false;
        }
        if (REQUEST_HEADER_TYPE.equals(type.getName())) {
            return true;
        }
        for (Class<?> iface : type.getInterfaces()) {
            if (isRequestHeader(iface)) {
                return true;
            }
        }
        return isRequestHeader(type.getSuperclass());
    }

    /**
     * Deduce the {@code dcr} query param value from the request:
     * <ul>
     *   <li>{@code "unknown"} - no RequestHeader argument was passed to the template</li>
     *   <li>{@code "absent"} - RequestHeader present but no {@code dcr} query param</li>
     *   <li>{@code "true"} / {@code "false"} / {@code "apps"} - the expected values</li>
     *   <li>{@code "other"} - the param is present but holds an unexpected value</li>
     * </ul>
     * The return value is always from this closed set, so it needs no JSON escaping.
     */
    private static String deduceDcr(Object request) {
        if (request == null) {
            return DCR_UNKNOWN;
        }
        try {
            // scala.Option<String> RequestHeader.getQueryString(String key)
            Object option = request.getClass()
                .getMethod("getQueryString", String.class)
                .invoke(request, DCR_QUERY_PARAM);
            if (option == null) {
                return DCR_ABSENT;
            }
            boolean empty = (boolean) option.getClass().getMethod("isEmpty").invoke(option);
            if (empty) {
                return DCR_ABSENT;
            }
            Object value = option.getClass().getMethod("get").invoke(option);
            String raw = String.valueOf(value);
            return ALLOWED_DCR_VALUES.contains(raw) ? raw : DCR_OTHER;
        } catch (ReflectiveOperationException | RuntimeException e) {
            // Reflection shouldn't fail, but if it does we don't want to break rendering.
            return DCR_UNKNOWN;
        }
    }

    /**
     * The HTTP method of the request, normalised to one of {@code GET} / {@code POST} / {@code PUT},
     * {@code "OTHER"} for anything else, or {@code "unknown"} when there is no RequestHeader argument
     * (or reflection unexpectedly fails). The return value is always from this closed set, so it
     * needs no JSON escaping.
     */
    private static String deduceMethod(Object request) {
        if (request == null) {
            return METHOD_UNKNOWN;
        }
        try {
            // String RequestHeader.method()
            Object method = request.getClass().getMethod("method").invoke(request);
            if (method == null) {
                return METHOD_UNKNOWN;
            }
            String raw = String.valueOf(method).toUpperCase();
            return ALLOWED_METHODS.contains(raw) ? raw : METHOD_OTHER;
        } catch (ReflectiveOperationException | RuntimeException e) {
            return METHOD_UNKNOWN;
        }
    }

    /**
     * The fully-qualified controller action that handled the request - i.e. the routing
     * {@code HandlerDef}'s controller class name plus its action method, e.g.
     * {@code controllers.Application.index}. Returns {@code "unknown"} when there is no RequestHeader
     * argument, no {@code HandlerDef} on the request, or reflection unexpectedly fails.
     *
     * <p>This mirrors what {@code common.RequestLogger} does in Scala:
     * <pre>request.attrs.get(Router.Attrs.HandlerDef).map(h =&gt; h.controller + "." + h.method)</pre>
     * but everything is done reflectively, and the Play types are resolved via the request object's
     * own (child) classloader.
     */
    private static String deduceController(Object request) {
        if (request == null) {
            return CONTROLLER_UNKNOWN;
        }
        try {
            ClassLoader cl = request.getClass().getClassLoader();

            // The routing info lives under the HandlerDef key: play.api.routing.Router.Attrs.HandlerDef
            // (`Router$Attrs$` is the compiled name of the `Router.Attrs` Scala object).
            Class<?> attrsHolder = Class.forName("play.api.routing.Router$Attrs$", false, cl);
            Object attrsModule = attrsHolder.getField("MODULE$").get(null);
            Object handlerDefKey = attrsHolder.getMethod("HandlerDef").invoke(attrsModule);

            // scala.Option<HandlerDef> TypedMap.get(TypedKey<HandlerDef> key)
            Object typedMap = request.getClass().getMethod("attrs").invoke(request);
            Class<?> typedKeyClass = Class.forName("play.api.libs.typedmap.TypedKey", false, cl);
            Object option = typedMap.getClass()
                .getMethod("get", typedKeyClass)
                .invoke(typedMap, handlerDefKey);
            if (option == null) {
                return CONTROLLER_UNKNOWN;
            }
            boolean empty = (boolean) option.getClass().getMethod("isEmpty").invoke(option);
            if (empty) {
                return CONTROLLER_UNKNOWN;
            }

            Object handlerDef = option.getClass().getMethod("get").invoke(option);
            Object controller = handlerDef.getClass().getMethod("controller").invoke(handlerDef);
            Object action = handlerDef.getClass().getMethod("method").invoke(handlerDef);
            return controller + "." + action;
        } catch (ReflectiveOperationException | RuntimeException e) {
            return CONTROLLER_UNKNOWN;
        }
    }


    /**
     * Scala {@code object}s compile to a {@code Foo$} class; strip the trailing {@code $}.
     */
    private static String normalise(String className) {
        if (className != null && className.endsWith("$")) {
            return className.substring(0, className.length() - 1);
        }
        return className;
    }
}

