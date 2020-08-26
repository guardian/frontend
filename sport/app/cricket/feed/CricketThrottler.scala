package cricket.feed

import java.util.concurrent.TimeUnit

import akka.NotUsed
import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.pattern.{ask, pipe}
import akka.stream.scaladsl.{Sink, Source}
import akka.stream.{Materializer, OverflowStrategy, ThrottleMode}
import akka.util.Timeout

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.reflect.ClassTag

case class CricketThrottledTask[+T](task: () => Future[T])

class CricketThrottlerActor()(implicit materializer: Materializer) extends Actor {
  import context.dispatcher

  private case class TaskWithSender[+T](sender: ActorRef, task: () => Future[T])

  val throttler: ActorRef = Source
    .actorRef[CricketThrottledTask[Nothing]](bufferSize = 1024, OverflowStrategy.dropNew)
    .throttle(1, 500.millisecond, 1, ThrottleMode.Shaping)
    .to(Sink.actorRef(self, NotUsed))
    .run()

  override def receive: PartialFunction[Any, Unit] = {
    case toBeThrottled: CricketThrottledTask[Any] => throttler ! TaskWithSender(sender, toBeThrottled.task)
    case throttled: TaskWithSender[Any]           => throttled.task() pipeTo throttled.sender
  }
}

class CricketThrottler(actorSystem: ActorSystem, materializer: Materializer) {
  private val cricketThrottlerActor: ActorRef = actorSystem.actorOf(Props(new CricketThrottlerActor()(materializer)))

  def throttle[T](task: () => Future[T])(implicit ec: ExecutionContext, tag: ClassTag[T]): Future[T] = {
    // we have a long timeout to allow for the large number of requests to be made when the app starts up, at 1s/request
    implicit val timeout: Timeout = Timeout(120, TimeUnit.SECONDS)
    (cricketThrottlerActor ? CricketThrottledTask(task)).mapTo[T]
  }
}
