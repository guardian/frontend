package model.liveblog

import scala.util.parsing.combinator.RegexParsers

object ParseBlockId extends RegexParsers {

  sealed trait ParseResult { def toOption: Option[String] }
  case object InvalidFormat extends ParseResult { val toOption = None }
  case class ParsedBlockId(blockId: String) extends ParseResult { val toOption = Some(blockId) }

  private def withParser: Parser[Unit] = "with:" ^^ { _ => () }
  private def block: Parser[Unit] = "block-" ^^ { _ => () }
  private def id: Parser[String] = "[a-zA-Z0-9]+".r
  private def blockId = block ~> id

  def fromPageParam(input: String): ParseResult = {
    def expr: Parser[String] = withParser ~> blockId

    parse(expr, input) match {
      case Success(matched, _) => ParsedBlockId(matched)
      case _ => InvalidFormat
    }
  }

  def fromBlockId(input: String): ParseResult = {
    parse(blockId, input) match {
      case Success(matched, _) => ParsedBlockId(matched)
      case _ => InvalidFormat
    }
  }
}
