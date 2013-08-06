package common

import akka.actor.Props
import akka.camel.Consumer
import scala.reflect.ClassTag
import play.api.libs.concurrent.Akka
import play.api.Play

trait Job extends Consumer with Logging with implicits.Strings {
  val name: String = getClass.getSimpleName
  val cron: String
  val metric: TimingMetricLogging

  lazy val endpointUri = "quartz://jobs/%s?cron=%s" format (name, cron.urlEncoded)

  def receive = {
    case _ =>
      log.info("Starting job: %s" format name)
      metric.measure { run() }
      log.info("Completed job: %s" format name)
  }

  def run()
}

class JobScheduler[T <: Job: ClassTag] extends Logging {
  def start() {
    val clazz = implicitly[ClassTag[T]].runtimeClass.getSimpleName
    log.info("Scheduling job: %s" format clazz)
    Akka.system(Play.current).actorOf(Props[T])
  }

  def stop() { }
}

