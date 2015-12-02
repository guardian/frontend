package crosswords

import play.api.{Application, GlobalSettings, Play, Mode}

trait TodaysCrosswordGridLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    if(Play.current.mode != Mode.Test) {
      TodaysCrosswordGrid.start()
    }
  }

  override def onStop(app: Application): Unit = {
    super.onStop(app)
    TodaysCrosswordGrid.stop()
  }
}
