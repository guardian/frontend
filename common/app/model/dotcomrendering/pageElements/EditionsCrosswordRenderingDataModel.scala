package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.Crossword
import model.dotcomrendering.DotcomRenderingDataModel
import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import org.apache.thrift.protocol.TSimpleJSONProtocol
import org.apache.thrift.transport.TIOStreamTransport
import play.api.libs.json.{JsValue, Json, OWrites, Writes}

case class EditionsCrosswordRenderingDataModel(
    quick: Crossword,
    cryptic: Crossword,
)

object EditionsCrosswordRenderingDataModel {
  // we Json.parse this into a JsValue to ensure we get the raw JSON
  // from the Content API rather than a Json.stringified version
  private def contentApiToJsonValue(crossword: Crossword): JsValue = {
    val protocolFactory = new TSimpleJSONProtocol.Factory

    val buffer = new java.io.ByteArrayOutputStream
    val protocol = protocolFactory.getProtocol(new TIOStreamTransport(buffer))

    Crossword.encode(crossword, protocol)
    Json.parse(new String(buffer.toByteArray, "UTF-8"))
  }
  implicit val writes: Writes[EditionsCrosswordRenderingDataModel] =
    new Writes[EditionsCrosswordRenderingDataModel] {
      def writes(model: EditionsCrosswordRenderingDataModel) = {
        Json.obj(
          "quick" -> contentApiToJsonValue(model.quick),
          "cryptic" -> contentApiToJsonValue(model.cryptic),
        )
      }
    }
  def toJson(model: EditionsCrosswordRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(withoutNull(jsValue))
  }
}
