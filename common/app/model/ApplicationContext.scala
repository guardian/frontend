package model

import play.api.Environment

case class DCRContextCommercialConfigurationFragment(isPreview: Boolean)

case class ApplicationContext(environment: Environment, applicationIdentity: ApplicationIdentity) {
  val isPreview = applicationIdentity.name == "preview"
}

object ApplicationContext {
  def contextCommercialConfigurationFragmentForDotcomRendering(context: ApplicationContext) : DCRContextCommercialConfigurationFragment = {
    DCRContextCommercialConfigurationFragment(context.isPreview)
  }
}
