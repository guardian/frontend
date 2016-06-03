package common

import akka.agent.Agent
import play.api.libs.concurrent.{Akka => PlayAkka}
import scala.concurrent.duration._
import play.api.{Mode, Environment, Play}
import scala.concurrent.ExecutionContext
import akka.actor.ActorSystem

object ExecutionContexts extends ExecutionContexts

trait ExecutionContexts {
  implicit lazy val executionContext: ExecutionContext = play.api.libs.concurrent.Execution.Implicits.defaultContext
  lazy val actorSystem: ActorSystem = PlayAkka.system(Play.current)
  lazy val feedsRecorderExecutionContext: ExecutionContext = PlayAkka.system(Play.current).dispatchers.lookup("akka.actor.feed-recorder")
}

object AkkaAgent extends ExecutionContexts {
  def apply[T](value: T): Agent[T] = Agent(value)
}

class AkkaAsync(env: Environment, actorSystem: ActorSystem) {
  implicit val ec: ExecutionContext = actorSystem.dispatcher

  def apply(body: => Unit): Unit = after(1.second){ body }

  def after1s(body: => Unit): Unit = after(1.second){ body }

  // running scheduled jobs in tests is useless
  // it just results in unexpected data files when you
  // want to check in
  def after(delay: FiniteDuration)(body: => Unit): Unit = if (env.mode != Mode.Test) {
    actorSystem.scheduler.scheduleOnce(delay)(body)
  }
}

object AkkaAsync extends AkkaAsync(
  env = Environment(Play.current.path, Play.current.classloader, Play.current.mode),
  actorSystem = PlayAkka.system(Play.current)
)
