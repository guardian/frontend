package http

import org.apache.pekko.stream.Materializer
import play.api.mvc.{Filter, RequestHeader, Result}
import play.api.routing.Router

import java.lang.invoke.{MethodHandle, MethodHandles, MethodType}
import java.util.{LinkedHashMap => JLinkedHashMap, Map => JMap}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

/** Seeds the template-tracker's request context (the JVM agent's `com.gu.templatetracker.RequestContext`)
  * with a small map of fields describing the current request, so that when a Twirl template is rendered -
  * possibly on a different thread - the agent can attribute that render back to the request that
  * triggered it.
  *
  * We set the context on the request thread just before invoking the action. The agent instruments
  * `java.util.concurrent.Executor#execute(Runnable)` so the context is then carried across every async
  * hop (CAPI lookup, future continuations, ...) to whichever thread ends up doing the render.
  *
  * The link to the agent is made reflectively on purpose:
  *   - `common` needs no compile/runtime dependency on the agent jar (which is attached at runtime via
  *     `-javaagent` and lives on the bootstrap classloader), and
  *   - everything degrades to a no-op when the agent isn't attached (local dev, tests, CI), so this
  *     filter is safe to leave permanently wired in.
  *
  * The context is a `java.util.Map[String, String]` - a JDK type, so it crosses the reflective boundary
  * into the bootstrap-loaded agent with no shared application types.
  */
class TemplateContextFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {

  override def apply(next: RequestHeader => Future[Result])(rh: RequestHeader): Future[Result] = {
    TemplateContextFilter.setContext(describe(rh))
    try
      // The synchronous prefix of the action runs on this thread with the context set, capturing it
      // into the first task it submits; the executor instrumentation carries it from there.
      next(rh)
    finally
      // Clear immediately so we don't leak the context onto this pooled thread once the synchronous
      // prefix has returned. The value already rode off inside the wrapped Runnable(s).
      TemplateContextFilter.clearContext()
  }

  private def describe(rh: RequestHeader): JMap[String, String] = {
    // LinkedHashMap so the fields log in a stable, readable order.
    val context = new JLinkedHashMap[String, String]()
    context.put("requestId", rh.headers.get("x-request-id").getOrElse("-"))
    context.put("method", rh.method)
    context.put("host", rh.host)
    // rh.uri already includes both the path and the query string.
    context.put("uri", rh.uri)
    // The `dcr` query param forces legacy (Twirl) vs DCR rendering. We normalise to the known values
    // (`true` / `false` / `apps`), collapse any other value to `other`, and record `absent` when the
    // param is missing - so we always log it, and the agent dedupes on a small, bounded set.
    context.put("dcr", rh.getQueryString("dcr") match {
      case Some(value @ ("true" | "false" | "apps")) => value
      case Some(_)                                    => "other"
      case None                                       => "absent"
    })
    // The routed action, present once routing has run (absent for e.g. asset or unmatched routes).
    // The agent also dedupes on this, so a template shared by many actions is captured once per action.
    rh.attrs.get(Router.Attrs.HandlerDef).foreach { handler =>
      context.put("controllerMethod", s"${handler.controller}.${handler.method}")
    }
    context
  }
}

object TemplateContextFilter {

  // Resolve RequestContext.set(Map) / RequestContext.clear() once, as MethodHandles. Absent agent ->
  // None -> no-ops. Class.forName uses this (child application) classloader, which delegates
  // parent-first and so resolves the single bootstrap-loaded copy installed by the agent.
  private val (setHandle: Option[MethodHandle], clearHandle: Option[MethodHandle]) =
    try {
      val cls = Class.forName("com.gu.templatetracker.RequestContext")
      val lookup = MethodHandles.lookup()
      val set = lookup.findStatic(cls, "set", MethodType.methodType(classOf[Unit], classOf[JMap[_, _]]))
      val clear = lookup.findStatic(cls, "clear", MethodType.methodType(classOf[Unit]))
      (Some(set), Some(clear))
    } catch {
      case NonFatal(_) => (None, None)
    }

  // We invoke via `invokeWithArguments` (a regular varargs method, not a signature-polymorphic
  // `invoke`/`invokeExact`) so the call is clean and robust from Scala; it does the argument
  // adaptation internally.
  private def setContext(context: JMap[String, String]): Unit =
    setHandle.foreach { h =>
      try { h.invokeWithArguments(context); () }
      catch { case NonFatal(_) => () }
    }

  private def clearContext(): Unit =
    clearHandle.foreach { h =>
      try { h.invokeWithArguments(); () }
      catch { case NonFatal(_) => () }
    }
}


