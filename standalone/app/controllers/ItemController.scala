package controllers

import contentapi.ContentApiClient

// If you add to this, don't forget the one in dev-build
class ItemController(articleController: ArticleController,
                     faciaDraftController: FaciaDraftController,
                     contentApiClient: ContentApiClient
                    ) extends ItemResponseController(
  articleController,
  new GalleryController(contentApiClient),
  new MediaController(contentApiClient),
  new InteractiveController(contentApiClient),
  ImageContentController,
  faciaDraftController
)
