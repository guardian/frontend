package idapiclient

import client.parser.JsonBodyParser
import net.liftweb.json.JsonAST.JValue
import client.Error
import com.gu.identity.model.{Error => IdApiError}
import utils.SafeLogging

class IdApiJsonBodyParser extends JsonBodyParser with SafeLogging {
  override def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error] = {
    try {
      val idApiErrors = (json \ "errors").extract[List[IdApiError]]
      idApiErrors.map(idApiError => Error(idApiError.message, idApiError.description, statusCode))
    } catch {
      case e: Throwable => {
        logger.error("Error extracting error from API response", e)
        List(Error("Error extracting error from API response", e.getMessage))
      }
    }
  }
}
