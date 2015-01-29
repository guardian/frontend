package business

import play.api.{GlobalSettings, Application}

trait StocksDataLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    StocksData.start()
  }

  override def onStop(app: Application): Unit = {
    StocksData.stop()
    super.onStop(app)
  }
}
