package http

import org.apache.pekko.stream.Materializer
import play.api.mvc.{Filter, RequestHeader, Result}

import java.lang.reflect.Method
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

/** Seeds the template-tracker's request context (the JVM agent's `com.gu.templatetracker.RequestContext`)
  * with a human-readable description of the current request, so that when a Twirl template is rendered -
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

  private def describe(rh: RequestHeader): String = {
    val requestId = rh.headers.get("x-request-id").getOrElse("-")
    // rh.uri already includes both the path and the query string.
    s"${rh.method} ${rh.host}${rh.uri} [request-id=$requestId]"
  }
}

object TemplateContextFilter {

  // Resolve RequestContext.set(String) / RequestContext.clear() once. Absent agent -> None -> no-ops.
  // Class.forName uses this (child application) classloader, which delegates parent-first and so
  // resolves the single bootstrap-loaded copy installed by the agent.
  private val (setMethod: Option[Method], clearMethod: Option[Method]) =
    try {
      val cls = Class.forName("com.gu.templatetracker.RequestContext")
      (Some(cls.getMethod("set", classOf[String])), Some(cls.getMethod("clear")))
    } catch {
      case NonFatal(_) => (None, None)
    }

  private def setContext(description: String): Unit =
    setMethod.foreach { m =>
      try m.invoke(null, description)
      catch { case NonFatal(_) => () }
    }

  private def clearContext(): Unit =
    clearMethod.foreach { m =>
      try m.invoke(null)
      catch { case NonFatal(_) => () }
    }
}

