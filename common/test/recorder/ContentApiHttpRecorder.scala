package recorder

import java.nio.charset.StandardCharsets

import contentapi.{Response => ContentApiResponse}

trait ContentApiHttpRecorder extends HttpRecorder[ContentApiResponse] {

  def toResponse(str: String) = {
    if (str.startsWith("Error:")) {
      ContentApiResponse(Array.empty, str.replace("Error:", "").toInt, "")
    } else {
      ContentApiResponse(str.getBytes(StandardCharsets.UTF_8), 200, "")
    }
  }

  def fromResponse(response: ContentApiResponse) = {
    if (response.status == 200) {
      new String(response.body, StandardCharsets.UTF_8)
    } else {
      s"Error:${response.status}"
    }
  }
}
