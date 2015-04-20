package ab_headlines

import conf.Configuration
import play.api.{Application, GlobalSettings}

trait ABTHeadlinesLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    if (Configuration.facia.spreadsheetKey.isDefined) {
      ABTestHeadlines.start()
    }
    super.onStart(app)
  }

  override def onStop(app: Application): Unit = {
    if (Configuration.facia.spreadsheetKey.isDefined) {
      ABTestHeadlines.stop()
    }
    super.onStop(app)
  }
}
