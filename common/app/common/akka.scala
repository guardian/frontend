package common

import akka.agent.Agent
import play.api.libs.concurrent.{Akka => PlayAkka}
import scala.concurrent.duration._
import play.api.Play
import scala.concurrent.ExecutionContext
import akka.actor.ActorSystem
import play.api.Play.current

object ExecutionContexts extends ExecutionContexts

trait ExecutionContexts {
  implicit lazy val executionContext: ExecutionContext = play.api.libs.concurrent.Execution.Implicits.defaultContext
  lazy val actorSystem: ActorSystem = PlayAkka.system
  lazy val memcachedExecutionContext: ExecutionContext = PlayAkka.system.dispatchers.lookup("akka.actor.memcached")
  lazy val feedsRecorderExecutionContext: ExecutionContext = PlayAkka.system.dispatchers.lookup("akka.actor.feed-recorder")
}

object AkkaAgent extends ExecutionContexts {
  def apply[T](value: T): Agent[T] = Agent(value)
}

object AkkaAsync extends ExecutionContexts {

  def apply(body: => Unit): Unit = after(1.second){ body }

  // running scheduled jobs in tests is useless
  // it just results in unexpected data files when you
  // want to check in
  def after(delay: FiniteDuration)(body: => Unit): Unit = if (!Play.isTest) {
    PlayAkka.system(Play.current).scheduler.scheduleOnce(delay) { body }
  }
}
