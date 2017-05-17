package liveblog

import model.{Article, RelatedContent}

case class LiveBlogPage(article: Article, currentPage: LiveBlogCurrentPage, related: RelatedContent) extends PageWithStoryPackage
