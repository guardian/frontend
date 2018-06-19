package services

import controllers.ArticlePage
import model.PageWithStoryPackage
import model.liveblog.{BodyBlock, ImageBlockElement, TextBlockElement}

sealed trait RenderType
case object RemoteRender extends RenderType
case object LocalRender extends RenderType

object RenderingTierPicker {

  private def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a:ArticlePage => true
      case _ => false
    }
  }

  private def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {
    ! page.article.blocks.get.body.exists((block: BodyBlock) => {

      val hasUnsupportedElements: Boolean = block.elements.flatMap {
        case b: TextBlockElement => None
        case b: ImageBlockElement => None
        case b => Some(b)
      }.nonEmpty

      hasUnsupportedElements

    })
  }

  private def isAdFree(page: PageWithStoryPackage): Boolean = {
    page.metadata.sensitive
  }

  def getRenderTierFor(page: PageWithStoryPackage): RenderType = {

    if(hasOnlySupportedElements(page) && isAdFree(page) && isSupportedType(page)){
      RemoteRender
    } else {
      LocalRender
    }

  }

}
