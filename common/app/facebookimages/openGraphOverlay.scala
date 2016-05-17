package facebookimages

import model.Article
import views.support.{FacebookOpenGraphImage, ImgSrc}

/**
  * Created by kate_whalen on 16/05/2016.
  */
object openGraphOverlay {
  def overlayImage(article: Article): Article = {
    article.copy(
      content = article.content.copy(
        metadata = article.content.metadata.copy(
          opengraphPropertiesOverrides = {
            val openGraph = article.content.metadata.opengraphProperties
            openGraph ++ Map("og:image" -> ImgSrc(article.content.rawOpenGraphImage, FacebookOpenGraphImage, true))
          }
        )
      )
    )
  }
}
