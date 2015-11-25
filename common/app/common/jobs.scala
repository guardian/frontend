package common

import java.util.TimeZone
import java.util.concurrent.atomic.AtomicInteger

import org.quartz.impl.StdSchedulerFactory
import org.quartz._
import scala.collection.mutable
import play.api.Play
import Play.current

object Jobs extends Logging {
  implicit val global = scala.concurrent.ExecutionContext.global
  private val scheduler = StdSchedulerFactory.getDefaultScheduler()
  private val jobs = mutable.Map[String, () => Unit]()
  private val outstanding = akka.agent.Agent(Map[String,Int]().withDefaultValue(0))

  class FunctionJob extends Job {
    def execute(context: JobExecutionContext) {
      val name = context.getJobDetail.getKey.getName
      val f = jobs(name)
      if (outstanding.get()(name) > 0) {
        log.warn(s"didn't run scheduled job $name because the previous one is still in progress")
      } else {
        log.info(s"Running job: $name")
        outstanding.send(map => map.updated(name, map(name) + 1))
        try {
          f()
        } finally {
          outstanding.send(map => map.updated(name, map(name) - 1))
          log.info(s"Finished job: $name")
        }
      }
    }
  }

  scheduler.start()

  def schedule(name: String, cron: String)(block: => Unit): Unit = {
    schedule(name, CronScheduleBuilder.cronSchedule(new CronExpression(cron)))(block)
  }

  def schedule(name: String, cron: String, timeZone: TimeZone)(block: => Unit): Unit = {
    schedule(name,
      CronScheduleBuilder.cronSchedule(new CronExpression(cron)).inTimeZone(timeZone))(block)
  }

  def schedule(name: String, schedule: => CronScheduleBuilder)(block: => Unit): Unit = {
    // running cron scheduled jobs in tests is useless
    // it just results in unexpected data files when you
    // want to check in
    if (!Play.isTest) {
      log.info(s"Scheduling $name")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build()
      )
    }
  }

  def scheduleEveryNMinutes(name: String, intervalInMinutes: Int)(block: => Unit): Unit = {
    if (!Play.isTest) {
      val schedule = DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule().withIntervalInMinutes(intervalInMinutes)
      log.info(s"Scheduling $name to run every $intervalInMinutes minutes")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build()
      )
    }
  }

  def scheduleEveryNSeconds(name: String, intervalInSeconds: Int)(block: => Unit): Unit = {
    if (!Play.isTest) {
      val schedule = DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule().withIntervalInSeconds(intervalInSeconds)
      log.info(s"Scheduling $name to run every $intervalInSeconds minutes")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build()
      )
    }
  }

  def deschedule(name: String) {
    log.info(s"Descheduling $name")
    jobs.remove(name)
    scheduler.deleteJob(new JobKey(name))
  }
}
