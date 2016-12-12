package commercial.controllers

import conf.Configuration
import model.{ApplicationContext, GuardianContentTypes, MetaData, SectionSummary}
import play.api.libs.json.{JsString, JsValue}
import play.api.mvc._

case class TestPage(specifiedKeywords : List[String] = Nil) extends model.StandalonePage {

  val isNetworkFront: Boolean = false
  val contentType = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section
  private val webTitle = "Commercial components"

  val allTheKeywords = webTitle :: specifiedKeywords
  val capitalisedKeywords = allTheKeywords.map(_.capitalize).mkString(",")
  val lowerCaseKeywords = allTheKeywords.map(_.toLowerCase).mkString(",")

  val newMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(capitalisedKeywords),
    "keywordIds" -> JsString(lowerCaseKeywords)
  )

  override val metadata = MetaData.make(
    id = "1234567",
    description = None,
    section = Some(SectionSummary.fromId("Comercial components test page")),
    webTitle = webTitle,
    isFront = true,
    contentType = contentType,
    javascriptConfigOverrides = newMetaData)

  val navSection: String = "Commercial"
}

class CreativeTestPage (implicit context: ApplicationContext) extends Controller {
  import context._
  def allComponents(keyword : List[String]) = Action{ implicit request =>
    if(Configuration.environment.stage.toLowerCase == "dev" || Configuration.environment.stage.toLowerCase == "code") {
      Ok(views.html.debugger.allcreatives(TestPage(keyword)))
    } else {
      NotFound
    }
  }
}

