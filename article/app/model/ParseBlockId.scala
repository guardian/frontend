package model

import scala.util.parsing.combinator.RegexParsers

// This utility class provides functions to parse out a block-id from a given
// get request parameter, or from a block param

object ParseBlockId extends RegexParsers {

  sealed trait ParseBlockResult { def toOption: Option[String] }
  case object InvalidFormat extends ParseBlockResult { val toOption = None }
  case class ParsedBlockId(blockId: String) extends ParseBlockResult { val toOption = Some(blockId) }

  private def withParser: Parser[Unit] = "with:" ^^ { _ => () }
  private def block: Parser[Unit] = "block-" ^^ { _ => () }
  private def id: Parser[String] = "[a-zA-Z0-9]+".r
  private def blockId = block ~> id

  // get Id from page parameter

  def fromPageParam(input: String): ParseBlockResult = {
    def expr: Parser[String] = withParser ~> blockId

    parse(expr, input) match {
      case Success(matched, _) => ParsedBlockId(matched)
      case _                   => InvalidFormat
    }
  }

  // get Id from block id string

  def fromBlockId(input: String): ParseBlockResult = {
    parse(blockId, input) match {
      case Success(matched, _) => ParsedBlockId(matched)
      case _                   => InvalidFormat
    }
  }

}
