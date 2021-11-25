package model

case class LiveBlogPage(
    article: Article,
    currentPage: LiveBlogCurrentPage,
    related: RelatedContent,
    filterKeyEvents: Boolean,
    pinnedBlockSwitch: Boolean,
) extends PageWithStoryPackage
