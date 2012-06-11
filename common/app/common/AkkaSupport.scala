package common

import play.api.libs.concurrent.{ Akka => PlayAkka }
import play.api.Play

trait AkkaSupport {
  object akka {
    val system = PlayAkka.system(Play.current)
    def uptime(): Long = system.uptime

    object dispatcher {
      val actions = system.dispatchers.lookup("play.akka.actor.actions-dispatcher")
      val promises = system.dispatchers.lookup("play.akka.actor.promises-dispatcher")
      val websockets = system.dispatchers.lookup("play.akka.actor.websockets-dispatcher")
      val default = system.dispatchers.lookup("play.akka.actor.default-dispatcher")
    }
  }
}
