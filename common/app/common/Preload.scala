package common

import model.ApplicationIdentity

object Preload {

  val articleDefaultPreloads = Seq("content.css", "javascripts/graun.standard.js", "javascripts/graun.commercial.js")
  val faciaDefaultPreloads = Seq("content.css", "javascripts/graun.standard.js", "javascripts/graun.commercial.js")

  val config: Map[ApplicationIdentity, Seq[String]] = Map(
    ApplicationIdentity("article") -> articleDefaultPreloads,
    ApplicationIdentity("facia") -> faciaDefaultPreloads
  )
}
