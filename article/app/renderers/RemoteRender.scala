package renderers

import conf.Configuration
import controllers.ArticlePage
import model.Cached.RevalidatableResult
import model.dotcomponents.DotcomponentsDataModel
import model.{ApplicationContext, Cached}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import com.eclipsesource.schema._
import com.eclipsesource.schema.drafts.Version7
import com.osinka.i18n.{Lang, Messages}
import play.api.libs.json._

import Version7._

import scala.io.{BufferedSource, Source}

class RemoteRender(implicit context: ApplicationContext) {

  val SCHEMA = "schema/dotcomponentsDataModelV1.jsonschema"

  def remoteRenderArticle(ws:WSClient, payload: String, article: ArticlePage)(implicit request: RequestHeader): Future[Result] = ws.url(Configuration.rendering.renderingEndpoint)
    .withRequestTimeout(2000.millis)
    .addHttpHeaders("Content-Type" -> "application/json")
    .post(payload)
    .map(response => {
      response.status match {
        case 200 =>
          Cached(article)(RevalidatableResult.Ok(Html(response.body)))
        case _ =>
          throw new Exception(response.body)
      }
    })

  private def validate(model: DotcomponentsDataModel) = {
    val rawschema: String = Source.fromResource(SCHEMA).getLines.mkString("\n")
    val schema = Json.fromJson[SchemaType](Json.parse(rawschema)).get
    val validator = new SchemaValidator(Some(Version7))(Lang.Default)
    validator.validate(schema, DotcomponentsDataModel.toJson(model))
  }

  def render(ws:WSClient, path: String, article: ArticlePage)(implicit request: RequestHeader): Future[Result] = {

    val dataModel: DotcomponentsDataModel = DotcomponentsDataModel.fromArticle(article, request)
    val dataString: String = DotcomponentsDataModel.toJsonString(dataModel)

    validate(dataModel) match {
      case JsSuccess(_,_) => remoteRenderArticle(ws, dataString, article)
      case JsError(e) => throw new Exception(Json.prettyPrint(JsError.toJson(e)))
    }

  }

}
