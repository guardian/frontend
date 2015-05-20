package controllers.commercial

import model.{GuardianContentTypes, NoCache, Cached}
import play.api.libs.json.{JsString, JsValue}
import play.api.mvc._
import conf.Configuration

class TestPage(specifiedKeywords : List[String] = Nil) extends model.MetaData  {

  override lazy val id: String = "1234567"
  override lazy val description: Option[String] = None
  override lazy val section: String = "Comercial components test page"
  lazy val navSection: String = "Commercial"
  override lazy val analyticsName: String = "analytics name"
  override lazy val webTitle: String = "Commercial components"
  override lazy val title: Option[String] = None

  override lazy val isFront = true

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ faciaPageMetaData
  lazy val faciaPageMetaData: Map[String, JsValue] = newMetaData

  lazy val newMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(capitalisedKeywords),
    "keywordIds" -> JsString(lowerCaseKeywords),
    "contentType" -> JsString(contentType)
  )

  lazy val allTheKeywords = webTitle :: specifiedKeywords

  lazy val capitalisedKeywords = (allTheKeywords).map(_.capitalize).mkString(",")
  lazy val lowerCaseKeywords = (allTheKeywords).map(_.toLowerCase).mkString(",")

  val isNetworkFront: Boolean = false

  override lazy val contentType: String =   if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

}

object CreativeTestPage extends Controller {
  def allComponents(keyword : List[String]) = Action{ implicit request =>
    if(Configuration.environment.stage == "dev" || Configuration.environment.stage == "code") {
      Ok(views.html.debugger.allcreatives(new TestPage(keyword)))
    } else {
      NotFound
    }
  }
}

