package crosswords

import play.api.{Application, GlobalSettings}

trait TodaysCrosswordGridLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    TodaysCrosswordGrid.start()
  }

  override def onStop(app: Application): Unit = {
    super.onStop(app)
    TodaysCrosswordGrid.stop()
  }
}
