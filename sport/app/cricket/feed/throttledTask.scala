package cricket.feed

import akka.actor.{Actor, ActorSystem, Props}
import akka.pattern.{ask, pipe}
import akka.contrib.throttle.{Throttler => AkkaThrottler, TimerBasedThrottler}
import akka.contrib.throttle.Throttler._
import akka.util.Timeout
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.reflect.ClassTag

class CricketThrottler(actorSystem: ActorSystem) {
  val actor = actorSystem.actorOf(Props(classOf[TimerBasedThrottler], 1.msgsPerSecond), name = "cricket-throttle")
  val taskRunner = actorSystem.actorOf(Props(classOf[ThrottledTask]), name = "cricket-task-runner")

  // SetTarget needs to be done only once
  actor ! AkkaThrottler.SetTarget(Some(taskRunner))
}

// ThrottledTask receives code blocks and executes them at a controlled rate, eg a maximum of 1 execution per second.
object ThrottledTask extends common.ExecutionContexts {

  // This can be big because the rate limit is so low for Pa.
  implicit val timeout = Timeout(30.seconds)

  private case class ExecuteTask(task: () => Future[Any])

  def apply[T](task: => Future[T])(implicit tag: ClassTag[T], throttler: CricketThrottler): Future[T] = {
    (throttler.actor ? ExecuteTask(() => task)).mapTo[T]
  }
}

class ThrottledTask extends Actor with common.ExecutionContexts {

  override def receive: PartialFunction[Any, Unit] = {
    case exec: ThrottledTask.ExecuteTask =>
      exec.task() pipeTo sender()
  }
}
