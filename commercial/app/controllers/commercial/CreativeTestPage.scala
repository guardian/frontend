package controllers.commercial

import conf.Configuration
import model.{GuardianContentTypes, MetaData, SectionSummary}
import play.api.libs.json.{JsString, JsValue}
import play.api.mvc._

case class TestPage(specifiedKeywords : List[String] = Nil) extends model.StandalonePage {

  val isNetworkFront: Boolean = false
  val contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section
  private val webTitle = "Commercial components"

  val allTheKeywords = webTitle :: specifiedKeywords
  val capitalisedKeywords = (allTheKeywords).map(_.capitalize).mkString(",")
  val lowerCaseKeywords = (allTheKeywords).map(_.toLowerCase).mkString(",")

  val newMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(capitalisedKeywords),
    "keywordIds" -> JsString(lowerCaseKeywords)
  )

  override val metadata = MetaData.make(
    id = "1234567",
    description = None,
    section = Some(SectionSummary.fromId("Comercial components test page")),
    webTitle = webTitle,
    analyticsName = "analytics name",
    isFront = true,
    contentType = contentType,
    javascriptConfigOverrides = newMetaData)

  val navSection: String = "Commercial"
}

class CreativeTestPage extends Controller {
  def allComponents(keyword : List[String]) = Action{ implicit request =>
    if(Configuration.environment.stage == "dev" || Configuration.environment.stage == "code") {
      Ok(views.html.debugger.allcreatives(TestPage(keyword)))
    } else {
      NotFound
    }
  }
}

object CreativeTestPage extends CreativeTestPage

