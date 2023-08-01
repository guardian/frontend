package services.dotcomrendering

sealed trait RenderType
case object RemoteRender extends RenderType
case object LocalRender extends RenderType
