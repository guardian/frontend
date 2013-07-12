package jobs

import common.{ TimingMetricLogging, AkkaSupport, Logging }
import akka.actor.Props
import akka.camel.Consumer
import scala.reflect.ClassTag

trait Job extends Consumer with AkkaSupport with Logging with implicits.Strings {
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

class JobScheduler[T <: Job: ClassTag] extends AkkaSupport with Logging {
  def start() {
    val clazz = implicitly[ClassTag[T]].runtimeClass.getSimpleName
    log.info("Scheduling job: %s" format clazz)
    play_akka.system().actorOf(Props[T])
  }

  def stop() { }
}

