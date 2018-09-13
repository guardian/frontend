package services.dotcomponents.pickers

import model.PageWithStoryPackage
import play.api.mvc.RequestHeader
import services.dotcomponents.RenderType

trait RenderTierPickerStrategy {
  def getRenderTierFor(page: PageWithStoryPackage, request: RequestHeader): RenderType
}
