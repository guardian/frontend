package common

import org.quartz.impl.StdSchedulerFactory
import org.quartz._
import scala.collection.mutable

object Jobs {
  private val scheduler = StdSchedulerFactory.getDefaultScheduler()
  private val jobs = mutable.Map[String, () => Unit]()

  class FunctionJob extends Job {
    def execute(context: JobExecutionContext) {
      val f = jobs(context.getJobDetail.getKey.getName)
      f()
    }
  }

  scheduler.start()

  def schedule(name: String, cron: String, metric: TimingMetricLogging)(block: => Unit) {
    jobs.put(name, () => block)

    val schedule = CronScheduleBuilder.cronSchedule(new CronExpression(cron))

    scheduler.scheduleJob(
      JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
      TriggerBuilder.newTrigger().withSchedule(schedule).build()
    )
  }

  def deschedule(name: String) {
    jobs.remove(name)
    scheduler.deleteJob(new JobKey(name))
  }
}

