package services.dotcomponents.pickers

import controllers.ArticlePage
import model.PageWithStoryPackage
import model.liveblog.{BlockElement, ImageBlockElement, TextBlockElement}
import play.api.mvc.RequestHeader
import services.dotcomponents.{LocalRender, RemoteRender, RenderType}
import views.support.Commercial

class SimplePagePicker extends RenderTierPickerStrategy {

  // each function should ideally only check a single value, so that
  // we can just remove the lines over time as we support more.

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

  private def isNotImmersive(page: PageWithStoryPackage): Boolean = ! page.item.isImmersive

  private def isNotLiveBlog(page:PageWithStoryPackage): Boolean = ! page.item.isLiveBlog

  private def isNotAReview(page:PageWithStoryPackage): Boolean = ! page.item.tags.isReview

  private def isNotAGallery(page:PageWithStoryPackage): Boolean = ! page.item.tags.isGallery
  
  def getRenderTierFor(page: PageWithStoryPackage, request: RequestHeader): RenderType = {

    val canRemotelyRender = isSupportedType(page) &&
      hasBlocks(page) &&
      hasOnlySupportedElements(page) &&
      isDiscussionDisabled(page) &&
      isAdFree(page, request) &&
      isNotImmersive(page) &&
      isNotLiveBlog(page) &&
      isNotAReview(page) &&
      isNotAGallery(page)

    if(canRemotelyRender){
      RemoteRender
    } else {
      LocalRender
    }

  }

}

