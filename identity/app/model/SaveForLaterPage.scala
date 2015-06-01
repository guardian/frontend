package model

case class SaveForLaterPage(savedArticles: List[Content], totalArticlesSaved: Int, totalPages: Int, pageNum: Int, prevPage: Option[String], nextPage: Option[String]  )
