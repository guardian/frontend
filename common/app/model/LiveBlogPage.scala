package model

case class LiveBlogPage(article: Article, currentPage: LiveBlogCurrentPage, related: RelatedContent)
    extends PageWithStoryPackage
