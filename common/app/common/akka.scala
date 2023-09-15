package common

import scala.concurrent.duration._
import play.api.{Environment => PlayEnv, Mode}

import scala.concurrent.ExecutionContext
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}

class PekkoAsync(env: PlayEnv, pekkoActorSystem: PekkoActorSystem) {
  implicit val ec: ExecutionContext = pekkoActorSystem.dispatcher

  // "apply" isn't expressive and doesn't explain what it does.
  // If you were considering using that function, use after1s instead as it doesn't leave any ambiguity.
  def apply(body: => Unit): Unit = after1s(body)

  def after1s(body: => Unit): Unit = after(1.second) { body }

  // running scheduled jobs in tests is useless
  // it just results in unexpected data files when you
  // want to check in
  def after(delay: FiniteDuration)(body: => Unit): Unit =
    if (env.mode != Mode.Test) {
      pekkoActorSystem.scheduler.scheduleOnce(delay)(body)
    }
}
