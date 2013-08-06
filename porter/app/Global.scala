import common.Jobs
import jobs._
import play.api.GlobalSettings

object Global extends GlobalSettings  {
  override def onStart(app: play.api.Application) {
    super.onStart(app)

    Jobs.schedule[AnalyticsLoadJob]
    Jobs.schedule[FastlyCloudwatchLoadJob]
  }
}
