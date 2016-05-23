package facebookimages

import model.Article
import views.support.{FacebookOpenGraphImage, ImgSrc}


object ArticleWithOpenGraphOverlay {
  def apply(article: Article): Article = {
    val openGraphProps = article.content.metadata.opengraphProperties

    val ogUrl = {
      openGraphProps.get("og:url").map{ url =>
        Seq("og:url" -> s"$url?page=facebookOverlayVariant")
      }.getOrElse(Nil).toMap
    }
    
    article.copy(
      content = article.content.copy(
        metadata = article.content.metadata.copy(
          opengraphPropertiesOverrides = {
            openGraphProps ++
            ogUrl ++
            Map("og:image" -> ImgSrc(article.content.rawOpenGraphImage, FacebookOpenGraphImage, true))
          }
        )
      )
    )
  }
}
