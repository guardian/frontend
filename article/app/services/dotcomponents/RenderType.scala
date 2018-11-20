package services.dotcomponents

sealed trait RenderType
case object RemoteRender extends RenderType
case object RemoteRenderAMP extends RenderType
case object LocalRender extends RenderType
