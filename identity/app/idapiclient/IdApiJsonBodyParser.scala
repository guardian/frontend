package idapiclient

import client.parser.JsonBodyParser
import net.liftweb.json.JsonAST.JValue
import client.Error
import com.gu.identity.model.{Error => IdApiError}

class IdApiJsonBodyParser extends JsonBodyParser {
  override def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error] = {
    val idApiErrors = (json \ "errors").extract[List[IdApiError]]
    idApiErrors.map(idApiError => Error(idApiError.message, idApiError.description, statusCode))
  }
}
