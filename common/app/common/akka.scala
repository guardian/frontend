package common

import akka.actor.Cancellable
import akka.agent.Agent
import play.api.libs.concurrent.{ Akka => PlayAkka }
import play.api.Play
import scala.concurrent.duration._

trait ExecutionContexts {
  implicit lazy val executionContext = play.api.libs.concurrent.Execution.Implicits.defaultContext
}

object AkkaAgent {
  def apply[T](value: T) = Agent(value)(PlayAkka.system(Play.current))
}
