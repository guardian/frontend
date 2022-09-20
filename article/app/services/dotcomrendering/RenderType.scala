package services.dotcomrendering

sealed trait RenderType
case object RemoteRender extends RenderType
case object RemoteRenderAMP extends RenderType
case object LocalRenderAmp extends RenderType
case object LocalRenderArticle extends RenderType
case object PressedArticle extends RenderType
