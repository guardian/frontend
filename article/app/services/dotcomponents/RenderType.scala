package services.dotcomponents

sealed trait RenderType
case object DotcomRendering extends RenderType
case object DotcomRenderingAMP extends RenderType
case object FrontendLegacyAMP extends RenderType
case object FrontendLegacy extends RenderType
case object PressedArticle extends RenderType
