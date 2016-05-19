import com.gu.contentapi.client.model.v1.TagsResponse

package object indexes {
  implicit class RichTagsResponse(tagsResponse: TagsResponse) {
    def isLastPage = tagsResponse.currentPage >= tagsResponse.pages
  }
}
