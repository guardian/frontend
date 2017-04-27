package controllers

import model.ApplicationContext
import play.api.mvc.Result

trait ResultWithPreload {
  final implicit class RichResult(self: Result) {

    def withPreload(files: Seq[String])(implicit context: ApplicationContext): Result = {
      val (jsFiles, cssFiles) = files.partition(_.endsWith(".js"))
      val preloadFilesCss = cssFiles.map(cssFile =>
        s"<${conf.Static(common.Assets.css.projectCss(Some(cssFile.stripSuffix(".css"))))}>; rel=preload; as=style; nopush"
      )
      val preloadFilesJs = jsFiles.map(file => s"<${conf.Static(file)}>; rel=preload; as=script; nopush")
      val preloadFiles = (preloadFilesCss ++ preloadFilesJs).mkString(",")
      self.withHeaders("Link" -> preloadFiles)
    }

  }
}