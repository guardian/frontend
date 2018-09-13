package services.dotcomponents

import experiments.{ActiveExperiments, Control, DotcomponentsRendering, Excluded, Participant}
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader
import services.dotcomponents.pickers.{RenderTierPickerStrategy, SimplePagePicker, WhitelistPicker}
import implicits.Requests._

object RenderingTierPicker {

  // todo: use injection for this
  val picker: RenderTierPickerStrategy = new SimplePagePicker()

  def getRenderTierFor(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {

    // all requests with ?guui automatically get remotely rendered

    if(request.isGuui) {
      return RemoteRender
    }

    // otherwise check if we are in the AB test, and are a supported article according to the picker

    val isSupported = picker.getRenderTierFor(page, request)

    ActiveExperiments.groupFor(DotcomponentsRendering) match {
      case Participant => isSupported
      case Control => LocalRender
      case Excluded => LocalRender
    }

  }

}
