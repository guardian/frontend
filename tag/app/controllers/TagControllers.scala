package controllers

import com.softwaremill.macwire._
import contentapi.{ContentApiClient, SectionsLookUp}
import model.ApplicationContext
import play.api.mvc.ControllerComponents

trait TagControllers {
  def contentApiClient: ContentApiClient
  def sectionsLookUp: SectionsLookUp
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext

  lazy val allTagController = wire[AllTagController]
  lazy val latestTagController = wire[LatestTagController]
  lazy val tagController = wire[TagController]
}
