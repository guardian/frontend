package common

import akka.agent.Agent
import play.api.libs.concurrent.{Akka => PlayAkka}
import scala.concurrent.duration._
import play.api.Play
import scala.concurrent.ExecutionContext
import akka.actor.ActorSystem
import Play.current

trait ExecutionContexts {
  implicit lazy val executionContext: ExecutionContext = play.api.libs.concurrent.Execution.Implicits.defaultContext
  lazy val actorSystem: ActorSystem = PlayAkka.system
  lazy val memcachedExecutionContext: ExecutionContext = PlayAkka.system.dispatchers.lookup("play.akka.actor.memcached")
}

object AkkaAgent {
  def apply[T](value: T) = Agent(value)(PlayAkka.system(Play.current))
}

object AkkaAsync extends ExecutionContexts {

  def apply(body: => Unit): Unit = after(1.second){ body }

  def after(delay: FiniteDuration)(body: => Unit): Unit = {
    PlayAkka.system(Play.current).scheduler.scheduleOnce(delay) { body }
  }
}