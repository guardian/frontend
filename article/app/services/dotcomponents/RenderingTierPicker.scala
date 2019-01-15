package services.dotcomponents

import implicits.Requests._
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader

class RenderingTierPicker {

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {

    if(request.isAmp) {
      AMPPicker.getTier(page)
    } else {
      ArticlePicker.getTier(page)
    }

  }

}

object RenderingTierPicker {
  def apply(): RenderingTierPicker = new RenderingTierPicker()
}
