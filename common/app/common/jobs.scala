package common

import org.quartz.impl.StdSchedulerFactory
import org.quartz._
import scala.collection.mutable
import play.api.Play
import Play.current

object Jobs extends Logging {
  private val scheduler = StdSchedulerFactory.getDefaultScheduler()
  private val jobs = mutable.Map[String, () => Unit]()

  class FunctionJob extends Job {
    def execute(context: JobExecutionContext) {
      val f = jobs(context.getJobDetail.getKey.getName)
      f()
    }
  }

  scheduler.start()

  def schedule(name: String, cron: String)(block: => Unit) {
    // running cron scheduled jobs in tests is useless
    // it just results in unexpected data files when you
    // want to check in
    if (!Play.isTest) {
      log.info(s"Scheduling $name")
      jobs.put(name, () => block)

      val schedule = CronScheduleBuilder.cronSchedule(new CronExpression(cron))

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
