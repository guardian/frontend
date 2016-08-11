package controllers

// If you add to this, don't forget the one in dev-build
class ItemController(articleController: ArticleController, faciaDraftController: FaciaDraftController) extends ItemResponseController(
  articleController,
  GalleryController,
  MediaController,
  InteractiveController,
  ImageContentController,
  faciaDraftController
)
