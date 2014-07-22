package controllers.commercial

import model.{GuardianContentTypes, NoCache, Cached}
import play.api.mvc._
import conf.Configuration

object TestPage extends model.MetaData  {

  override lazy val id: String = "1234567"
  override lazy val description: Option[String] = None
  override lazy val section: String = "Comercial components test page"
  lazy val navSection: String = "Commercial"
  override lazy val analyticsName: String = "analytics name"
  override lazy val webTitle: String = "Commercial components"
  override lazy val title: Option[String] = None

  override lazy val isFront = true

  override lazy val metaData: Map[String, Any] = super.metaData ++ faciaPageMetaData
  lazy val faciaPageMetaData: Map[String, Any] = newMetaData

  lazy val newMetaData: Map[String, Any] = Map(
    "keywords" -> webTitle.capitalize,
    "content-type" -> contentType
  )

  val isNetworkFront: Boolean = false

  override lazy val contentType: String =   if (isNetworkFront) GuardianContentTypes.NETWORK_FRONT else GuardianContentTypes.SECTION

}

object CreativeTestPage extends Controller {
  def allComponents() = Action{ implicit request =>
    if(Configuration.environment.stage == "dev" || Configuration.environment.stage == "code") {
      Ok(views.html.debugger.allcreatives(TestPage))
    } else {
      NotFound
    }
  }
}

