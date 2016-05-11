package crosswords

import common.ApplicationMode
import play.api.{Application, GlobalSettings, Mode}

trait TodaysCrosswordGridLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    if(ApplicationMode.mode != Mode.Test) {
      TodaysCrosswordGrid.start()
    }
  }

  override def onStop(app: Application): Unit = {
    super.onStop(app)
    TodaysCrosswordGrid.stop()
  }
}
