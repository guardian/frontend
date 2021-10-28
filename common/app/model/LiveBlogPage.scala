package model

case class LiveBlogPage(
    article: Article,
    currentPage: LiveBlogCurrentPage,
    related: RelatedContent,
    shouldFilter: Boolean,
    filterKeyEvents: Boolean,
) extends PageWithStoryPackage
