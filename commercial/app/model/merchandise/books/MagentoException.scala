package model.commercial.books

import common.Logging
import play.api.libs.json.{JsError, JsSuccess, JsValue}

case class MagentoException(code: Int, message: String)

object MagentoException extends Logging {

  def apply(json: JsValue): Option[MagentoException] = {
    val error = (json \ "messages" \ "error")(0)

    val parseResult = for {
      code <- (error \ "code").validate[Int]
      message <- (error \ "message").validate[String]
    } yield {
      MagentoException(code, message)
    }

    parseResult match {
      case JsError(e) =>
        log.error(s"MagentoException failed to parse $json: ${JsError.toJson(e).toString()}")
        None
      case JsSuccess(magentoException, _) => Some(magentoException)
    }
  }

}
