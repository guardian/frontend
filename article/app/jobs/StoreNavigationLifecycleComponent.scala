package jobs

import app.LifecycleComponent
import conf.Configuration
import navigation.{EditionNavLinks, NavLink, NavigationData}
import play.api.libs.json.{JsValue, Json}
import services.S3

import scala.concurrent.ExecutionContext

case class Data()

class StoreNavigationLifecycleComponent(implicit executionContext: ExecutionContext) extends LifecycleComponent{


  /**
    * Pushes Navigation data from NavLinks.scala into S3
    */
  override def start(): Unit = {

    implicit val navlinkWrites = Json.writes[NavLink]
    implicit val editionNavLinksWrites = Json.writes[EditionNavLinks]
    implicit val navlinksInterfaceWrites = Json.writes[NavigationData]

    val data = NavigationData()
    val json: JsValue = Json.toJson(data)

    S3.putPrivate(
      key = s"${Configuration.environment.stage}/navigation.json",
      value = json.toString(),
      contentType = "application/json"
    )


  }


}
