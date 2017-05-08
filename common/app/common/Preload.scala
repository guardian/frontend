package common

import model.ApplicationIdentity

object Preload {

  val articleDefaultPreloads: Seq[PreloadAsset] = Seq(CssPreloadAsset("content.css"), JsPreloadAsset("javascripts/graun.standard.js"), JsPreloadAsset("javascripts/graun.commercial.js"))
  val faciaDefaultPreloads: Seq[PreloadAsset] = Seq(CssPreloadAsset("content.css"), JsPreloadAsset("javascripts/graun.standard.js"), JsPreloadAsset("javascripts/graun.commercial.js"))

  val config: Map[ApplicationIdentity, Seq[PreloadAsset]] = Map(
    ApplicationIdentity("article") -> articleDefaultPreloads,
    ApplicationIdentity("facia") -> faciaDefaultPreloads
  )
}
