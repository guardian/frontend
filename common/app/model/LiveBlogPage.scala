package model

import com.gu.contentapi.client.model.v1.Blocks

case class LiveBlogPage(
    article: Article,
    currentPage: LiveBlogCurrentPage,
    related: RelatedContent,
    filterKeyEvents: Boolean,
    blocks: Blocks,
) extends PageWithStoryPackage
