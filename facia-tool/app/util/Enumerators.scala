package util

import play.api.libs.iteratee.Enumerator
import play.api.templates.Html
import org.apache.commons.lang.StringEscapeUtils
import play.api.libs.json.{Json, Writes}
import scala.concurrent.Future
import common.ExecutionContexts

object Enumerators extends ExecutionContexts {
  implicit class RichEnumeratorWithWrites[A: Writes](enumerator: Enumerator[A]) {
    /** Writes each value into JSON */
    def toJValue = enumerator.map(implicitly[Writes[A]].writes)

    def toJsonStrings = toJValue.map(Json.stringify)
  }

  implicit class RichStringEnumerator(enumerator: Enumerator[String]) {
    /** For use with Comet.
      *
      * todo: provide some validation that the function name is valid in JavaScript, and if it isn't throw an error.
      */
    def toJavaScriptCallback(functionName: String) = {
      enumerator map { data =>
        Html(s"""<script>$functionName("${StringEscapeUtils.escapeJavaScript(data)}");</script>""")
      }
    }
  }

  /** Sequentially enumerate the results of applying f to each element of as */
  def enumerate[A, B](as: Seq[A])(f: A => Future[B]) = Enumerator.unfoldM(as) {
    case first :: rest => f(first) map { b => Some(rest -> b) }
    case Nil => Future.successful(None)
  }
}
