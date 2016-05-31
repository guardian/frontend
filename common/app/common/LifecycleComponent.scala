package common

import play.api.inject.ApplicationLifecycle
import play.api.{GlobalSettings, Application}

import scala.concurrent.ExecutionContext

trait LifecycleComponent {
  def start(): Unit
}

trait BackwardCompatibleLifecycleComponents extends GlobalSettings {
  def lifecycleComponents(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext): List[LifecycleComponent]
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    val appLifecycle = app.injector.instanceOf[ApplicationLifecycle]
    lifecycleComponents(appLifecycle)(app.actorSystem.dispatcher).foreach(_.start())
  }
}
