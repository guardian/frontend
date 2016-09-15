package controllers

import contentapi.ContentApiClient

// If you add to this, don't forget the one in dev-build
class ItemController(contentApiClient: ContentApiClient,
                     articleController: ArticleController,
                     faciaDraftController: FaciaDraftController,
                     galleryController: GalleryController,
                     mediaController: MediaController,
                     interactiveController: InteractiveController,
                     imageContentController: ImageContentController
                    ) extends ItemResponseController(
  contentApiClient,
  articleController,
  galleryController,
  mediaController,
  interactiveController,
  imageContentController,
  faciaDraftController
)
