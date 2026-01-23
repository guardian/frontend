package common

import java.util.TimeZone
import model.ApplicationContext
import org.quartz.impl.StdSchedulerFactory
import org.quartz._
import play.api.Mode.Test

import scala.collection.mutable
import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.concurrent.duration.Duration
import scala.util.{Failure, Success}

object JobsState {
  implicit val global: ExecutionContextExecutor = scala.concurrent.ExecutionContext.global
  val jobs = mutable.Map[String, () => Future[_]]()
  val outstanding = Box(Map[String, Int]().withDefaultValue(0))
}

class FunctionJob extends Job with GuLogging {
  import JobsState._
  def execute(context: JobExecutionContext): Unit = {
    val name = context.getJobDetail.getKey.getName
    val f = jobs(name)
    if (outstanding.get()(name) > 0) {
      log.warn(s"didn't run scheduled job $name because the previous one is still in progress")
    } else {
      log.debug(s"Running job: $name")
      outstanding.send(map => map.updated(name, map(name) + 1))
      f().onComplete {
        case Success(_) =>
          outstanding.send(map => map.updated(name, map(name) - 1))
          log.debug(s"Finished job: $name")
        case Failure(t) =>
          outstanding.send(map => map.updated(name, map(name) - 1))
          log.error(s"An error has occured during job $name", t)
      }
    }
  }
}

class JobScheduler(context: ApplicationContext) extends GuLogging {
  import JobsState._

  val scheduler = StdSchedulerFactory.getDefaultScheduler

  scheduler.start()

  // TODO delete this function and make easy to understand function(s)
  def schedule(name: String, cron: String)(block: => Unit): Unit = {
    schedule(name, CronScheduleBuilder.cronSchedule(new CronExpression(cron)))(
      Future(block),
    ) // TODO make a version to take a future
  }

  def scheduleWeekdayJob(name: String, minute: Int, hour: Int, timeZone: TimeZone)(block: => Future[Unit]): Unit = {
    schedule(
      name,
      CronScheduleBuilder.cronSchedule(new CronExpression(s"0 $minute $hour ? * MON-FRI")).inTimeZone(timeZone),
    )(block)
  }

  private def schedule(name: String, schedule: => CronScheduleBuilder)(block: => Future[Unit]): Unit = {
    // running cron scheduled jobs in tests is useless
    // it just results in unexpected data files when you
    // want to check in
    if (context.environment.mode != Test) {
      log.debug(s"Scheduling $name")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build(),
      )
    }
  }

  def scheduleEveryNMinutes(name: String, intervalInMinutes: Int)(block: => Future[_]): Unit = {
    if (context.environment.mode != Test) {
      val schedule =
        DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule().withIntervalInMinutes(intervalInMinutes)
      log.debug(s"Scheduling $name to run every $intervalInMinutes minutes")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build(),
      )
    }
  }

  def scheduleEvery(name: String, interval: Duration)(block: => Future[Unit]): Unit = {
    if (context.environment.mode != Test) {
      val schedule =
        DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule().withIntervalInSeconds(interval.toSeconds.toInt)
      log.debug(s"Scheduling $name to run every ${interval.toSeconds} seconds")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build(),
      )
    }
  }

  def deschedule(name: String): Unit = {
    log.debug(s"Descheduling $name")
    jobs.remove(name)
    scheduler.deleteJob(new JobKey(name))
  }
}
