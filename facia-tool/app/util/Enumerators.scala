package util

import play.api.libs.iteratee.Enumerator
import org.apache.commons.lang.StringEscapeUtils
import play.api.libs.json.{Json, Writes}
import scala.concurrent.Future
import common.ExecutionContexts

object Enumerators extends ExecutionContexts {
  /** Sequentially enumerate the results of applying f to each element of as */
  def enumerate[A, B](as: Seq[A])(f: A => Future[B]) = Enumerator.unfoldM(as) {
    case first :: rest => f(first) map { b => Some(rest -> b) }
    case Nil => Future.successful(None)
  }
}
