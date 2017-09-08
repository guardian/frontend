package cricket.feed

import akka.actor.{Actor, ActorSystem, Props}
import akka.pattern.{ask, pipe}
import akka.contrib.throttle.{TimerBasedThrottler, Throttler => AkkaThrottler}
import akka.contrib.throttle.Throttler._
import akka.util.Timeout

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.reflect.ClassTag

class CricketThrottler(actorSystem: ActorSystem) {
  val actor = actorSystem.actorOf(Props(classOf[TimerBasedThrottler], 1.msgsPerSecond), name = "cricket-throttle")
  val taskRunner = actorSystem.actorOf(Props(classOf[ThrottledTask]), name = "cricket-task-runner")

  // SetTarget needs to be done only once
  actor ! AkkaThrottler.SetTarget(Some(taskRunner))
}

// ThrottledTask receives code blocks and executes them at a controlled rate, eg a maximum of 1 execution per second.
object ThrottledTask {

  // This can be big because the rate limit is so low for Pa.
  implicit val timeout = Timeout(30.seconds)

  private case class ExecuteTask(task: () => Future[Any])

  def apply[T](task: => Future[T])(implicit tag: ClassTag[T], throttler: CricketThrottler, executionContext: ExecutionContext): Future[T] = {
    (throttler.actor ? ExecuteTask(() => task)).mapTo[T]
  }
}

class ThrottledTask extends Actor {

  import context.dispatcher

  override def receive = {
    case exec: ThrottledTask.ExecuteTask =>
      exec.task() pipeTo sender()
  }
}
