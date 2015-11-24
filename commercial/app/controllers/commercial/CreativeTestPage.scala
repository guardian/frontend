package controllers.commercial

import model.{MetaData, GuardianContentTypes, NoCache, Cached}
import play.api.libs.json.{JsString, JsValue}
import play.api.mvc._
import conf.Configuration

case class TestPage(specifiedKeywords : List[String] = Nil) extends model.StandalonePage {

  lazy val contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

  override val metadata = MetaData.make(
    id = "1234567",
    description = None,
    section = "Comercial components test page",
    webTitle = "Commercial components",
    analyticsName = "analytics name",
    isFront = true,
    contentType = contentType,
    javascriptConfigOverrides = newMetaData)

  lazy val navSection: String = "Commercial"

  lazy val newMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(capitalisedKeywords),
    "keywordIds" -> JsString(lowerCaseKeywords),
    "contentType" -> JsString(contentType)
  )

  lazy val allTheKeywords = metadata.webTitle :: specifiedKeywords

  lazy val capitalisedKeywords = (allTheKeywords).map(_.capitalize).mkString(",")
  lazy val lowerCaseKeywords = (allTheKeywords).map(_.toLowerCase).mkString(",")

  val isNetworkFront: Boolean = false
}

object CreativeTestPage extends Controller {
  def allComponents(keyword : List[String]) = Action{ implicit request =>
    if(Configuration.environment.stage == "dev" || Configuration.environment.stage == "code") {
      Ok(views.html.debugger.allcreatives(TestPage(keyword)))
    } else {
      NotFound
    }
  }
}

