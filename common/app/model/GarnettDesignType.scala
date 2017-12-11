package model

import com.gu.contentapi.client.utils.DesignType

object GarnettDesignType {
  final implicit class RichGarnettDesignType(maybeDesignType: Option[DesignType]) {
    lazy val orDefault: DesignType = maybeDesignType.getOrElse(com.gu.contentapi.client.utils.Article)
    lazy val nameOrDefault: String = orDefault.toString.toLowerCase
  }
}
