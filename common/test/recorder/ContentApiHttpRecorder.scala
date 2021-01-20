package recorder

import com.gu.contentapi.client.model.v1.ErrorResponse
import com.gu.contentapi.client.thrift.ThriftDeserializer
import contentapi.{Response => ContentApiResponse}

import scala.util.Try

trait ContentApiHttpRecorder extends HttpRecorder[ContentApiResponse] {

  override def toResponse(b: Array[Byte]): ContentApiResponse = {
    val errorResponse = Try(ThriftDeserializer.deserialize(b, ErrorResponse)).toOption
    errorResponse map { response =>
      if (response.status == "ok") {
        ContentApiResponse(b, 200, "")
      } else {
        val statusCode = response.message match {
          case "requested page is beyond the number of available pages"                         => 400
          case "Content API does not support paging this far. Please change page or page-size." => 400
          case "The requested resource could not be found."                                     => 404
          case "The requested resource has expired for rights reason."                          => 410
          case _                                                                                => 500
        }
        ContentApiResponse(b, statusCode, response.message)
      }
    } getOrElse {
      ContentApiResponse(b, 200, "")
    }
  }

  override def fromResponse(response: ContentApiResponse): Array[Byte] = response.body
}
