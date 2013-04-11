package common

import akka.actor.{ ActorSystem, Cancellable }
import akka.agent.Agent

import play.api.libs.concurrent.{ Akka => PlayAkka }
import play.api.Play
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration._


trait AkkaSupport {

  object play_akka {

    def system(): ActorSystem = PlayAkka.system(Play.current)

    def uptime(): Long = system().uptime

    object dispatcher {

      // TODO check if we still need these
      val actions = system().dispatchers.lookup("play.akka.actor.actions-dispatcher")
      val promises = system().dispatchers.lookup("play.akka.actor.promises-dispatcher")
      val websockets = system().dispatchers.lookup("play.akka.actor.websockets-dispatcher")
      val default = system().dispatchers.lookup("play.akka.actor.default-dispatcher")
    }

    object scheduler {

      def every(duration: FiniteDuration, initialDelay: FiniteDuration = 5.seconds)(block: => Unit): Cancellable = {
        system().scheduler.schedule(initialDelay, duration) { block }
      }

      def once(block: => Unit): Cancellable = {
        system().scheduler.scheduleOnce(0.seconds) { block }
      }
    }

    def agent[T](value: T) = Agent(value)(system())
  }
}