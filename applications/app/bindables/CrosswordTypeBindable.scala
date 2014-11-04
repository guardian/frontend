package bindables

import play.api.mvc.PathBindable
import com.gu.crosswords.api.client.models.{Type => CrosswordType}

class CrosswordTypeBindable extends PathBindable[CrosswordType] {
  override def bind(key: String, value: String): Either[String, CrosswordType] =
    CrosswordType.fromString(value) match {
      case Some(crosswordType) => Right(crosswordType)
      case None => Left(s"$value is not a valid crossword type")
    }

  override def unbind(key: String, value: CrosswordType): String =
    CrosswordType.byType(value)
}
