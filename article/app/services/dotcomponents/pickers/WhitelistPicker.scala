package services.dotcomponents.pickers
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader
import services.dotcomponents.{RemoteRender, LocalRender, RenderType}

class WhitelistPicker extends RenderTierPickerStrategy {

  // no real need for this list be config, hardcoding is fine for now

  val whitelist = List(
    "money/2017/mar/10/ministers-to-criminalise-use-of-ticket-tout-harvesting-software"
  )

  override def getRenderTierFor(page: PageWithStoryPackage, request: RequestHeader): RenderType = {

    if(whitelist.contains(page.metadata.id)){
      RemoteRender
    } else {
      LocalRender
    }

  }
}
