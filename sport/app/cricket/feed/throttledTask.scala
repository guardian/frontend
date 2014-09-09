package cricket.feed

import akka.actor.{Props, Actor}
import akka.pattern.{ask, pipe}
import akka.contrib.throttle.{Throttler, TimerBasedThrottler}
import akka.contrib.throttle.Throttler._
import akka.util.Timeout
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.reflect.ClassTag

// ThrottledTask receives code blocks and executes them at a controlled rate, eg a maximum of 1 execution per second.
object ThrottledTask extends common.ExecutionContexts {

  private lazy val throttler = actorSystem.actorOf(Props(classOf[TimerBasedThrottler], 1.msgsPerSecond), name = "cricket-throttle")
  private lazy val taskRunner = actorSystem.actorOf(Props(classOf[ThrottledTask]), name = "cricket-task-runner")

  // This can be big because the rate limit is so low for Pa.
  implicit val timeout = Timeout(30.seconds)

  private case class ExecuteTask(task: () => Future[Any])

  def apply[T](task: => Future[T])(implicit tag: ClassTag[T]): Future[T] = {
    // SetTarget needs to be done only once, but doing it here
    // means the actors are created when they are used.
    ThrottledTask.throttler ! Throttler.SetTarget(Some(taskRunner))
    (throttler ? ExecuteTask(() => task)).mapTo[T]
  }
}

class ThrottledTask extends Actor with common.ExecutionContexts {

  override def receive = {
    case exec: ThrottledTask.ExecuteTask => {
      exec.task() pipeTo sender()
    }
  }
}