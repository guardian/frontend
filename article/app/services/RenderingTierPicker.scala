package services

import controllers.ArticlePage
import model.PageWithStoryPackage
import model.liveblog.{BodyBlock, ImageBlockElement, TextBlockElement}

sealed trait RenderType
case object RemoteRender extends RenderType
case object LocalRender extends RenderType

object RenderingTierPicker {

  private def isUnSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a:ArticlePage => false
      case _ => true
    }
  }

  private def hasUnsupportedElements(page: PageWithStoryPackage): Boolean = {
    page.article.blocks.get.body.exists((block: BodyBlock) => {

      val hasUnsupportedElements: Boolean = block.elements.flatMap {
        case b: TextBlockElement => None
        case b: ImageBlockElement => None
        case b => Some(b)
      }.nonEmpty

      hasUnsupportedElements

    })
  }

  private def canHaveAds(page: PageWithStoryPackage): Boolean = {
    ! page.metadata.sensitive
  }

  def getRenderTierFor(page: PageWithStoryPackage): RenderType = {

    if(hasUnsupportedElements(page) || canHaveAds(page) || isUnSupportedType(page)){
      LocalRender
    } else {
      RemoteRender
    }

  }

}
