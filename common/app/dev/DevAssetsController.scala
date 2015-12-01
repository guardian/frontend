package dev

import common.ExecutionContexts
import java.io.File
import play.api.libs.MimeTypes
import play.api.mvc._
import play.api.libs.iteratee.Enumerator
import play.Play

object DevAssetsController extends Controller with ExecutionContexts {

  def at(path: String): Action[AnyContent] = Action { implicit request =>
    val contentType: Option[String] = MimeTypes.forFileName(path) map { mime =>
      // Add charset for text types
      if (MimeTypes.isText(mime)) s"${mime}; charset=utf-8" else mime
    }

    val hashFile = new File(s"static/hash/$path")

    val resolved = if (hashFile.exists()) {
      hashFile.toURI.toURL
    } else {
      new File(s"static/src/$path").toURI.toURL
    }

    Result(
      ResponseHeader(OK, Map(CONTENT_TYPE -> contentType.getOrElse(BINARY))),
      Enumerator.fromStream(resolved.openStream())
    )
  }

  def surveys(file: String): Action[AnyContent] =
    controllers.Assets.at(path = "/public/surveys", file, aggressiveCaching = false)
}
