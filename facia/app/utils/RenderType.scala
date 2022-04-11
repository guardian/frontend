package utils

sealed trait RenderType
case object RemoteRender extends RenderType
case object LocalRender extends RenderType
