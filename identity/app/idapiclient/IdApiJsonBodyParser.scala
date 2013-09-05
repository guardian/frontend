package idapiclient

import client.parser.{JodaJsonSerializer, JsonBodyParser}
import net.liftweb.json.JsonAST.JValue
import client.Error
import com.gu.identity.model.{Error => IdApiError, LiftJsonConfig}
import utils.SafeLogging

class IdApiJsonBodyParser extends JsonBodyParser with SafeLogging {
  override implicit val formats = LiftJsonConfig.formats + new JodaJsonSerializer

  override def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error] = {
    try {
      val idApiErrors = (json \ "errors").extract[List[IdApiError]]
      idApiErrors.map(idApiError => Error(idApiError.message, idApiError.description, statusCode, idApiError. context))
    } catch {
      case e: Throwable => {
        logger.error("Error extracting error from API response", e)
        List(Error("Error extracting error from API response", "The identity api returned some invalid json in its error message:" + e.getMessage))
      }
    }
  }
}
