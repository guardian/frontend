import conf.Filters
import frontpress.ToolPressQueueWorker
import liveblogs.LatestBlocks
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(
  Filters.common: _*
)
with ConfigAgentLifecycle {
  override def onStart(app: play.api.Application) {
    super.onStart(app)
    ToolPressQueueWorker.start()
    LatestBlocks.start()
  }

  override def onStop(app: play.api.Application): Unit = {
    LatestBlocks.stop()
    super.onStop(app)
  }
}
