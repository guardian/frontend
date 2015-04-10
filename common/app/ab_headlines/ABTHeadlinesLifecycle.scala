package ab_headlines

import play.api.{Application, GlobalSettings}

trait ABTHeadlinesLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    ABTestHeadlines.start()
    super.onStart(app)
  }

  override def onStop(app: Application): Unit = {
    ABTestHeadlines.stop()
    super.onStop(app)
  }
}
