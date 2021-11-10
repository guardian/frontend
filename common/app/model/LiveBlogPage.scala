package model

case class LiveBlogPage(
    article: Article,
    currentPage: LiveBlogCurrentPage,
    related: RelatedContent,
    filterSwitch: Boolean,
    filterKeyEvents: Boolean,
) extends PageWithStoryPackage
