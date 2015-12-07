package controllers.commercial

import model.{MetaData, GuardianContentTypes, NoCache, Cached}
import play.api.libs.json.{JsString, JsValue}
import play.api.mvc._
import conf.Configuration

case class TestPage(specifiedKeywords : List[String] = Nil) extends model.StandalonePage {

  val isNetworkFront: Boolean = false
  val contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section
  private val webTitle = "Commercial components"

  val allTheKeywords = webTitle :: specifiedKeywords
  val capitalisedKeywords = (allTheKeywords).map(_.capitalize).mkString(",")
  val lowerCaseKeywords = (allTheKeywords).map(_.toLowerCase).mkString(",")

  val newMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(capitalisedKeywords),
    "keywordIds" -> JsString(lowerCaseKeywords),
    "contentType" -> JsString(contentType)
  )

  override val metadata = MetaData.make(
    id = "1234567",
    description = None,
    section = "Comercial components test page",
    webTitle = webTitle,
    analyticsName = "analytics name",
    isFront = true,
    contentType = contentType,
    javascriptConfigOverrides = newMetaData)

  val navSection: String = "Commercial"
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

