package services.dotcomponents

import com.gu.contentapi.client.model.v1.{Blocks => APIBlocks}
import implicits.Requests._
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader


class RenderingTierPicker {

  def getTier(page: PageWithStoryPackage, blocks: APIBlocks)(implicit request: RequestHeader): RenderType = {

    if(request.isAmp) {
      AMPPicker.getTier(page, blocks)
    } else {
      ArticlePicker.getTier(page)
    }

  }

}

object RenderingTierPicker {
  def apply(): RenderingTierPicker = new RenderingTierPicker()
}
