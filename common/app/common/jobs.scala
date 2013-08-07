package common

import akka.actor.{ActorRef, Actor, Props}
import akka.camel.Consumer
import scala.reflect.ClassTag
import play.api.Play
import play.api.libs.concurrent.Akka

trait Job extends Consumer with Logging with implicits.Strings {
  val name: String = getClass.getSimpleName
  val cron: String
  val metric: TimingMetricLogging

  lazy val endpointUri = s"quartz://jobs/$name?cron=${cron.urlEncoded}"

  override def preStart() {
    log.info("Scheduling job: %s" format name)
    super.preStart()
  }

  def receive = {
    case _ =>
      log.info("Starting job: %s" format name)
      metric.measure { run() }
      log.info("Completed job: %s" format name)
  }

  def run()
}

object Jobs {
  def schedule[T <: Job: ClassTag]() = Akka.system(Play.current).actorOf(Props[T])
  def schedule(actor: => Actor) = Akka.system(Play.current).actorOf(Props(actor))
  def deschedule(actor: ActorRef) { Akka.system(Play.current).stop(actor) }
}

