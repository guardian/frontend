package facebookimages

import model.Article
import views.support.{FacebookOpenGraphImage, ImgSrc}


object ArticleWithOpenGraphOverlay {
  def apply(article: Article): Article = {
    article.copy(
      content = article.content.copy(
        metadata = article.content.metadata.copy(
          opengraphPropertiesOverrides = {
            val openGraph = article.content.metadata.opengraphProperties
            openGraph + ("og:image" -> ImgSrc(article.content.rawOpenGraphImage, FacebookOpenGraphImage, true))
          }
        )
      )
    )
  }
}
