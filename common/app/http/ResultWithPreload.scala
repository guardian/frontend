package http

import model.ApplicationContext
import play.api.mvc.Result

trait ResultWithPreload {
  final implicit class RichResult(self: Result) {

    val linkHeaderKey = "Link"

    def withPreload(files: Seq[String])(implicit context: ApplicationContext): Result = {
      if (files.nonEmpty) {
        val (jsFiles, cssFiles) = files.partition(_.endsWith(".js"))
        val preloadFilesCss = cssFiles.map(cssFile =>
          s"<${conf.Static(common.Assets.css.projectCss(Some(cssFile.stripSuffix(".css"))))}>; rel=preload; as=style; nopush"
        )
        val preloadFilesJs = jsFiles.map(file => s"<${conf.Static(file)}>; rel=preload; as=script; nopush")
        val preloadFiles = (preloadFilesCss ++ preloadFilesJs).mkString(",")
        val linkHeaderValue = self.header.headers.get(linkHeaderKey).map(_ ++ s",$preloadFiles") getOrElse preloadFiles
        self.withHeaders(linkHeaderKey -> linkHeaderValue)
      } else self
    }
  }
}