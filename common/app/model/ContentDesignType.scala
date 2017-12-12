package model

import com.gu.contentapi.client.utils.DesignType

object ContentDesignType {
  final implicit class RichContentDesignType(maybeDesignType: Option[DesignType]) {
    lazy val orDefault: DesignType = maybeDesignType.getOrElse(com.gu.contentapi.client.utils.Article)
    lazy val nameOrDefault: String = orDefault.toString.toLowerCase
  }
}
