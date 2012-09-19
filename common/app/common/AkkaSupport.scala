package common

import akka.actor.{ ActorSystem, Cancellable }
import akka.agent.Agent
import akka.util.Duration
import akka.util.duration._
import play.api.libs.concurrent.{ Akka => PlayAkka }
import play.api.Play
import java.util.concurrent.{ Executors, TimeUnit }

trait AkkaSupport {
  object play_akka {
    def system(): ActorSystem = PlayAkka.system(Play.current)
    def uptime(): Long = system().uptime

    object dispatcher {
      val actions = system().dispatchers.lookup("play.akka.actor.actions-dispatcher")
      val promises = system().dispatchers.lookup("play.akka.actor.promises-dispatcher")
      val websockets = system().dispatchers.lookup("play.akka.actor.websockets-dispatcher")
      val default = system().dispatchers.lookup("play.akka.actor.default-dispatcher")
    }

    object scheduler {
      def every(duration: Duration, initialDelay: Duration = 0 seconds)(block: => Unit): Cancellable = {
        system().scheduler.schedule(initialDelay, duration) { block }
      }

      def once(block: => Unit): Cancellable = {
        system().scheduler.scheduleOnce(0 seconds) { block }
      }
    }

    def agent[T](value: T): Agent[T] = Agent(value)(play_akka.system())
  }
}

trait PlainOldScheduling {
  //Akka sometimes deadlocks during startup if we try schedule things there
  //so use this as a bootstrap mechanism
  //https://groups.google.com/forum/?fromgroups=#!topic/play-framework/yO8GsBLzGGY
  object executor {
    def scheduleOnce(delay: Long, timeUnit: TimeUnit)(block: => Unit) {
      val executor = Executors.newSingleThreadScheduledExecutor()
      executor.schedule(new Runnable() {
        override def run() {
          block
          executor.shutdown()
        }
      }, delay, timeUnit)
    }
  }
}

