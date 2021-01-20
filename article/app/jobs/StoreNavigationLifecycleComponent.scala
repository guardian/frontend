package jobs

import app.LifecycleComponent
import conf.Configuration
import navigation.{EditionNavLinks, NavLink, NavigationData}
import play.api.libs.json.{JsValue, Json}
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

    implicit val navlinkWrites = Json.writes[NavLink]
    implicit val editionNavLinksWrites = Json.writes[EditionNavLinks]
    implicit val navlinksInterfaceWrites = Json.writes[NavigationData]

    val nav: JsValue = Json.toJson(NavigationData())

    S3.putPrivate(
      key = s"${Configuration.environment.stage}/navigation.json",
      value = nav.toString(),
      contentType = "application/json",
    )

  }

}
