package helpers

import org.scalatest.matchers.{MatchResult, Matcher}

import scala.util.Try

class FailAsMatcher[E <: Throwable](t: Class[E]) extends Matcher[Try[Any]] {
  def apply(theTry: Try[Any]) =
    MatchResult(
      theTry.isFailure && (theTry.failed.get.getClass == t),
      s"did not fail as a '$t' (but a '${theTry.failed.get.getClass}' instead)",
      s"did fail as a '$t'"
    )
}

trait ExceptionMatcher {
  def failAs[E <: Throwable](t: Class[E]) = new FailAsMatcher[E](t)
}


