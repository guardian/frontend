import jobs._
import play.api.GlobalSettings

object Global extends GlobalSettings  {
  val jobs = List(
    new JobScheduler[AnalyticsLoadJob]
  )

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    jobs foreach { _.start() }
  }

  override def onStop(app: play.api.Application) {
    jobs foreach { _.stop() }
    super.onStop(app)
  }
}
