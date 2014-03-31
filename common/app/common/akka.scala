package common

import akka.agent.Agent
import play.api.libs.concurrent.{Akka => PlayAkka}
import scala.concurrent.duration._
import play.api.Play
<<<<<<< HEAD
import scala.concurrent.ExecutionContext
import akka.actor.ActorSystem
import Play.current
=======
import play.api.Play.current
>>>>>>> d0128e4bfc447073c4fd28285dc6b71476ef28ea

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

  // running scheduled jobs in tests is useless
  // it just results in unexpected data files when you
  // want to check in
  def after(delay: FiniteDuration)(body: => Unit): Unit = if (!Play.isTest) {
    PlayAkka.system(Play.current).scheduler.scheduleOnce(delay) { body }
  }
}