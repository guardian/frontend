package controllers

import com.google.inject.Inject
import common.ExecutionContexts
import play.api.mvc.{Action, Controller}
import services.ReturnUrlVerifier
import utils.SafeLogging

class SyncedPreferencesController @Inject() (returnUrlVerifier: ReturnUrlVerifier)
  extends Controller with ExecutionContexts with SafeLogging {

  def saveContentItem = Action { implicit request =>

    logger.info("+++ Saving Content Item");
    returnUrlVerifier.getVerifiedReturnUrl(request) match {
      case Some(returnUrl) =>
        logger.info("Will try to save content: %s".format(returnUrl) )
        SeeOther(returnUrl)
      case _ =>
        logger.info("Could not get verified return url")
        SeeOther(returnUrlVerifier.defaultReturnUrl)
    }
  }

}
