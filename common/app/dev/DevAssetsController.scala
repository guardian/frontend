package dev

import common.ExecutionContexts
import java.io.File
import play.api.libs.MimeTypes
import play.api.mvc._
import play.api.libs.iteratee.Enumerator

object DevAssetsController extends Controller with ExecutionContexts {

  def at(path: String): Action[AnyContent] = Action {
    val contentType: Option[String] = MimeTypes.forFileName(path) map { mime =>
      // Add charset for text types
      if (MimeTypes.isText(mime)) s"${mime}; charset=utf-8" else mime
    }

    // Css maps must come from static/target
    val resolved = if (path.endsWith(".css.map") || path.endsWith(".js.map")) {
      new File(s"static/target/$path").toURI.toURL
    } else {
      new File(s"static/hash/$path").toURI.toURL
    }

    SimpleResult(
      ResponseHeader(OK, Map(CONTENT_TYPE -> contentType.getOrElse(BINARY))),
      Enumerator.fromStream(resolved.openStream())
    )
  }
}