package controllers

import play.api.mvc.Result

trait ResultHelper {
  final implicit class RichResult(self: Result) {
    def withPreload(cssFiles: List[String], jsFiles: List[String]): Result = {
      val preloadFilesCss = cssFiles.map(file => s"<${conf.Static(file)}>; rel=preload; as=style; nopush")
      val preloadFilesJs = jsFiles.map(file => s"<${conf.Static(file)}>; rel=preload; as=script; nopush")
      val preloadFiles = (preloadFilesCss ++ preloadFilesJs).mkString(",")
      self.withHeaders("Link" -> preloadFiles)
    }

  }
}