package services

import controllers.ArticlePage
import model.PageWithStoryPackage
import model.liveblog.{BlockElement, ImageBlockElement, TextBlockElement}
import play.api.mvc.RequestHeader
import views.support.Commercial

sealed trait RenderType
case object RemoteRender extends RenderType
case object LocalRender extends RenderType

object RenderingTierPicker {

  private def isDiscussionDisabled(page: PageWithStoryPackage): Boolean = {
    (! page.article.content.trail.isCommentable) && page.article.content.trail.isClosedForComments
  }

  private def hasBlocks(page: PageWithStoryPackage): Boolean = {
    page.article.blocks match {
      case Some(b) => b.body.nonEmpty
      case None => false
    }
  }

  private def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a:ArticlePage => true
      case _ => false
    }
  }

  private def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {
    def unsupportedElement(blockElement: BlockElement) = blockElement match {
      case _: TextBlockElement => false
      case _: ImageBlockElement => false
      case _ => true
    }

    !page.article.blocks.exists(_.body.exists(_.elements.exists(unsupportedElement)))
  }

  private def isAdFree(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    page.item.content.shouldHideAdverts || Commercial.isAdFree(request)
  }

  def getRenderTierFor(page: PageWithStoryPackage, request: RequestHeader): RenderType = {

    val canRemotelyRender = isSupportedType(page) &&
      hasBlocks(page) &&
      hasOnlySupportedElements(page) &&
      isDiscussionDisabled(page) &&
      isAdFree(page, request)

    if(canRemotelyRender){
      RemoteRender
    } else {
      LocalRender
    }

  }

}
