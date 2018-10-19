package services.dotcomponents

import experiments.{ActiveExperiments, Control, DotcomponentsRendering, Excluded, Participant}
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader
import services.dotcomponents.pickers.{RenderTierPickerStrategy, SimplePagePicker, WhitelistPicker}
import implicits.Requests._

class RenderingTierPicker {

  val picker: RenderTierPickerStrategy = new SimplePagePicker()
  val whitelist: RenderTierPickerStrategy = new WhitelistPicker()

  def logRequest(msg:String, results:List[(String, Boolean)])(implicit request: RequestHeader): Unit =
    DotcomponentsLogger().withRequestHeaders(request).results(msg, results)

  def getRenderTierFor(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {

    // all requests with ?guui automatically get remotely rendered

    if(request.isGuui) {
      return RemoteRender
    }

    // log out whenever we find a supported article, for metrics purposes

    val (pickerResult, isSupported) = picker.getRenderTierFor(page, request)
    val (whitelistResult, isOnWhiteList) = whitelist.getRenderTierFor(page, request)

    isSupported match {
      case RemoteRender => logRequest("Article was remotely renderable", pickerResult)
      case _ => logRequest("Article was only locally renderable", pickerResult)
    }

    // only use remote if supported article AND is on the whitelist

    val supportedAndWhitelisted = List(isSupported, isOnWhiteList).forall(_ == RemoteRender)

    // We use dotcomponents if we are in the AB test, and are supported

    ActiveExperiments.groupFor(DotcomponentsRendering) match {
      case Participant if supportedAndWhitelisted => RemoteRender
      case Participant => LocalRender
      case Control => LocalRender
      case Excluded => LocalRender
    }

  }

}
