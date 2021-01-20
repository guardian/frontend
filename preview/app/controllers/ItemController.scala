package controllers

import contentapi.ContentApiClient
import play.api.mvc.ControllerComponents

// If you add to this, don't forget the one in dev-build
class ItemController(
    contentApiClient: ContentApiClient,
    articleController: ArticleController,
    faciaDraftController: FaciaDraftController,
    galleryController: GalleryController,
    mediaController: MediaController,
    interactiveController: InteractiveController,
    imageContentController: ImageContentController,
)(controllerComponents: ControllerComponents)
    extends ItemResponseController(
      contentApiClient,
      controllerComponents,
      articleController,
      galleryController,
      mediaController,
      interactiveController,
      imageContentController,
      faciaDraftController,
    )
