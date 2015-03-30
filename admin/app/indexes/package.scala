import com.gu.contentapi.client.model.TagsResponse

package object indexes {
  implicit class RichTagsResponse(tagsResponse: TagsResponse) {
    def isLastPage = tagsResponse.currentPage >= tagsResponse.pages
  }
}
