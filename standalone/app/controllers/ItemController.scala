package controllers

// If you add to this, don't forget the one in dev-build
object ItemController extends ItemResponseController(
  ArticleController,
  GalleryController,
  MediaController,
  InteractiveController,
  ImageContentController,
  FaciaDraftController
)
