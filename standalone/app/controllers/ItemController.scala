package controllers

import contentapi.ContentApiClient

// If you add to this, don't forget the one in dev-build
class ItemController(articleController: ArticleController,
                     faciaDraftController: FaciaDraftController,
                     galleryController: GalleryController,
                     mediaController: MediaController,
                     interactiveController: InteractiveController
                    ) extends ItemResponseController(
  articleController,
  galleryController,
  mediaController,
  interactiveController,
  ImageContentController,
  faciaDraftController
)
