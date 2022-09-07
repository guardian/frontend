package jobs

import app.LifecycleComponent
import conf.Configuration
import navigation.NavigationData
import services.S3

import scala.concurrent.ExecutionContext

case class Data()

class StoreNavigationLifecycleComponent(implicit executionContext: ExecutionContext) extends LifecycleComponent {

  /**
    * Pushes Navigation data from NavLinks.scala into S3
    */
  override def start(): Unit = {

    if (Configuration.environment.stage.equalsIgnoreCase("DEVINFRA")) {
      return
    }

    S3.putPrivate(
      key = s"${Configuration.environment.stage}/navigation.json",
      value = NavigationData.nav.toString(),
      contentType = "application/json",
    )

  }

}
