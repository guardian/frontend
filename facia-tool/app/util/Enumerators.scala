package util

import play.api.libs.iteratee.{Concurrent, Enumerator}
import play.api.libs.iteratee.Concurrent.Channel
import rx.lang.scala.{Observer, Observable}
import play.api.templates.Html
import org.apache.commons.lang.StringEscapeUtils
import play.api.libs.json.{Json, Writes}

object Enumerators {
  private class ChannelObserver[A](chan: Channel[A]) extends Observer[A] {
    override def onNext(a: A): Unit = chan.push(a)
    override def onError(error: Throwable): Unit = chan.end(error)
    override def onCompleted(): Unit = chan.end()
  }

  implicit class RichEnumeratorCompanion(companion: Enumerator.type) {
    def fromObservable[A](observable: Observable[A]) =
      Concurrent.unicast[A](onStart = { chan =>
        observable.subscribe(new ChannelObserver[A](chan))
      })
  }

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
        Html(s"<script>$functionName(\"${StringEscapeUtils.escapeJavaScript(data)}\")</script>")
      }
    }
  }
}
