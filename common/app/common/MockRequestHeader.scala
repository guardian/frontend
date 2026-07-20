package common

import play.api.libs.typedmap.{TypedEntry, TypedKey, TypedMap}
import play.api.mvc.request.{RemoteConnection, RequestTarget}
import play.api.mvc.{Headers, RequestHeader}
import play.api.routing.HandlerDef

class MockRequestHeader(
    controller: String,
    method: String,
) extends RequestHeader {
  override def connection: RemoteConnection = RemoteConnection("", false, None)
  override def method: String = "GET"
  override def target: RequestTarget = RequestTarget("", "", Map.empty)
  override def version: String = ""
  override def headers: Headers = Headers.create()
  override def attrs: TypedMap = TypedMap(
    TypedEntry(
      TypedKey("RequestTarget"),
      HandlerDef(
        classLoader = this.getClass.getClassLoader,
        routerPackage = "mock",
        controller = controller,
        method = method,
        parameterTypes = Seq.empty,
        verb = "GET",
        path = "/mock/path",
      ),
    ),
  )
}
