package renderers

import com.eclipsesource.schema._
import com.eclipsesource.schema.drafts.Version7
import com.eclipsesource.schema.drafts.Version7._
import com.gu.contentapi.client.model.v1.Blocks
import com.osinka.i18n.Lang
import conf.Configuration
import controllers.ArticlePage
import model.{Cached, PageWithStoryPackage}
import model.Cached.RevalidatableResult
import model.dotcomponents.DotcomponentsDataModel
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.io.Source

class RemoteRenderer {

  private[this] val SCHEMA = "schema/dotcomponentsDataModelV2.jsonschema"

  private[this] def validate(model: DotcomponentsDataModel) = {
    val rawschema: String = Source.fromResource(SCHEMA).getLines.mkString("\n")
    val schema = Json.fromJson[SchemaType](Json.parse(rawschema)).get
    val validator = new SchemaValidator(Some(Version7))(Lang.Default)
    validator.validate(schema, DotcomponentsDataModel.toJson(model))
  }

  private[this] def get(
    ws:WSClient,
    payload: String,
    article: PageWithStoryPackage,
    endpoint: String
  )(implicit request: RequestHeader): Future[Result] = {

    ws.url(endpoint)
      .withRequestTimeout(2000.millis)
      .addHttpHeaders("Content-Type" -> "application/json")
      .post(payload)
      .map(response => {
        response.status match {
          case 200 =>
            Cached(article)(RevalidatableResult.OkDotcomponents(Html(response.body)))
          case _ =>
            throw new Exception(response.body)
        }
      })
  }


  def getAMPArticle(ws: WSClient, payload: String, page: PageWithStoryPackage, blocks: Blocks)(implicit request: RequestHeader): Future[Result] = {
    val dataModel: DotcomponentsDataModel = DotcomponentsDataModel.fromArticle(page, request, blocks)
    val dataString: String = DotcomponentsDataModel.toJsonString(dataModel)

    validate(dataModel) match {
      case JsSuccess(_,_) => get(ws, dataString, page, Configuration.rendering.AMPArticleEndpoint)
      case JsError(e) => Future.failed(new Exception(Json.prettyPrint(JsError.toJson(e))))
    }

  }

  def getArticle(ws:WSClient, path: String, page: PageWithStoryPackage,  blocks: Blocks)(implicit request: RequestHeader): Future[Result] = {
    val dataModel: DotcomponentsDataModel = DotcomponentsDataModel.fromArticle(page, request, blocks)
    val dataString: String = DotcomponentsDataModel.toJsonString(dataModel)

    validate(dataModel) match {
      case JsSuccess(_,_) => get(ws, dataString, page, Configuration.rendering.renderingEndpoint)
      case JsError(e) => Future.failed(new Exception(Json.prettyPrint(JsError.toJson(e))))
    }
  }

}

object RemoteRenderer {
  def apply(): RemoteRenderer = new RemoteRenderer()
}
