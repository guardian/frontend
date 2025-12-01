package model

import com.gu.contentapi.client.model.v1.Blocks

case class ArticlePage(article: Article, related: RelatedContent, blocks: Blocks) extends PageWithStoryPackage
