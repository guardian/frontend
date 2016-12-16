package model

import play.api.Environment

case class ApplicationContext(environment: Environment, applicationIdentity: ApplicationIdentity) {
  val isPreview = applicationIdentity.name == "preview"
}
