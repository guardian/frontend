import java.nio.file.Path
import scala.meta.internal.semanticdb.SymbolInformation

case class SymbolInFile(symbol: SymbolInformation, filePath: SourceRef)

object DeadCodeDetector {
  def symbolContainingLogic(symbolInFile: SymbolInFile): Boolean = {
    val kind = symbolInFile.symbol.kind
    kind.isObject ||
    kind.isClass ||
    kind.isTrait ||
    kind.isInterface ||
    kind.isMethod ||
    kind.isField
  }

  def findMethodOwnerClass(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Option[SymbolInformation] = {
    if (symbolInFile.symbol.kind.isMethod) {
      val classDefinitionSymbol = symbolInFile.symbol.symbol.replaceFirst("\\#.*\\(.*\\)\\.$", "#")
      semanticDB.findDefinition(SemanticDBSymbol(classDefinitionSymbol)) match {
        case Some((_, definition)) => Some(definition)
        case _                     => None
      }
    } else None
  }

  def findMethodCompanionObject(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Option[SymbolInformation] = {
    if (symbolInFile.symbol.kind.isMethod) {
      val objectDefinitionSymbol = symbolInFile.symbol.symbol.replaceFirst("\\.[\\w`<>\\$]+\\(.*\\)\\.$", ".")
      semanticDB.findDefinition(SemanticDBSymbol(objectDefinitionSymbol)) match {
        case Some((_, definition)) if definition.kind.isObject => Some(definition)
        case _                                                 => None
      }
    } else None
  }

  val CASE_CLASS_UTILITY_METHODS = Set(
    "canEqual",
    "copy",
    "productArity",
    "productElement",
    "productElementName",
    "productIterator",
    "productPrefix",
  )

  val COMPANION_OBJECT_UTILITY_METHODS = Set(
    "apply",
    "unapply",
    "writeReplace",
  )
  // from the semantic db spec, case classes and objects have the 8th bit of the properties field set to 1
  val CASE_MODIFIER = 0x80
  val IMPLICIT_MODIFIER = 0x20

  def isCaseClassUtilityMethod(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Boolean = {
    if (symbolInFile.symbol.symbol.startsWith("metrics/CountDataPoint.`")) {
      println(s"Found CountDataPoint constructor default parameter: ${symbolInFile.symbol}")
    }
    val caseClassUtilityMethod = findMethodOwnerClass(symbolInFile, semanticDB) match {
      case Some(definition) =>
        definition.kind.isClass && (definition.properties & CASE_MODIFIER) != 0 &&
        (CASE_CLASS_UTILITY_METHODS.contains(symbolInFile.symbol.displayName) ||
          symbolInFile.symbol.displayName.matches("copy\\$default\\$\\d+"))
      case _ => false
    }
    val companionUtilityMethod = findMethodCompanionObject(symbolInFile, semanticDB) match {
      case Some(definition) =>
        definition.kind.isObject && (COMPANION_OBJECT_UTILITY_METHODS.contains(symbolInFile.symbol.displayName) ||
          symbolInFile.symbol.displayName.matches("(apply|<init>)\\$default\\$\\d+"))
      case _ => false
    }
    val caseObjectUtilityMethod = findMethodCompanionObject(symbolInFile, semanticDB) match {
      case Some(definition) =>
        definition.kind.isObject && (definition.properties & CASE_MODIFIER) != 0 &&
        CASE_CLASS_UTILITY_METHODS.contains(symbolInFile.symbol.displayName)
      case _ => false
    }

    caseClassUtilityMethod || companionUtilityMethod || caseObjectUtilityMethod
  }

  val NON_LOGIC_FILE = Set(
    "dev/javascript/JavaScriptReverseRoutes.scala",
    "main/router/RoutesPrefix.scala",
    "controllers/ReverseRoutes.scala",
    "project/Dependencies.scala",
  )

  def isNoneLogicFile(symbolInFile: SymbolInFile): Boolean =
    NON_LOGIC_FILE.exists(file => symbolInFile.filePath.file.contains(file))

  def isTwirlTemplate(symbolInFile: SymbolInFile): Boolean =
    symbolInFile.filePath.file.endsWith(".template.scala")

  def isTestFile(symbolInFile: SymbolInFile): Boolean =
    symbolInFile.filePath.file.contains("/test/")

  // Code may look unused if it's overriding a method from an external library
  // like play filters or anything susceptible to being called from outside our codebase
  def isOverridingExternalMethod(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Boolean =
    symbolInFile.symbol.overriddenSymbols.exists { overriddenSymbol =>
      // check if this overridden symbol is defined in an external library (i.e., not in our codebase)
      semanticDB.getOccurrences(SemanticDBSymbol(overriddenSymbol)).isEmpty
    }

  // Some case classes aren't directly referenced, though their companion object is
  def indirectlyUsed(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Boolean = {
    if (symbolInFile.symbol.kind.isClass && (symbolInFile.symbol.properties & CASE_MODIFIER) != 0) {
      val companionObject = symbolInFile.symbol.symbol.dropRight(1) + "."
      semanticDB.getOccurrences(SemanticDBSymbol(companionObject)).filter(_._2.role.isReference).nonEmpty
    } else false
  }

  // unfortunately implicit symbols aren't referenced in the semantic db so we can't account for them being unused.
  def isImplicitSymbol(symbolInFile: SymbolInFile): Boolean =
    (symbolInFile.symbol.properties & IMPLICIT_MODIFIER) != 0

  def main(args: Array[String]): Unit = {

    val semanticDB = SourceLoader.loadSemanticDB(Path.of("."))

    semanticDB.findDefinition(SemanticDBSymbol("metrics/CountDataPoint#time.")).foreach { case (file, definition) =>
      println(s"Found CountDataPoint.time definition in ${file}: ${definition}")
    }

    val deadSymbols = semanticDB.allDocuments
      .flatMap { case (file, document) =>
        document.symbols.map(symbolInfo => SymbolInFile(symbolInfo, file))
      }
      .filterNot(isTestFile)
      .filterNot(isNoneLogicFile)
      .filterNot(isTwirlTemplate)
      .filter(symbolContainingLogic)
      .filterNot(isCaseClassUtilityMethod(_, semanticDB))
      .filterNot(isOverridingExternalMethod(_, semanticDB))
      .filter { symbolInFile =>
        val symbols: Seq[String] = Seq(symbolInFile.symbol.symbol) ++ symbolInFile.symbol.overriddenSymbols
        symbols
          .map(SemanticDBSymbol.apply)
          .flatMap(semanticDB.getOccurrences)
          .filter(_._2.role.isReference) // exclude definitions
          .isEmpty
      }
      .filterNot(indirectlyUsed(_, semanticDB))
      .filterNot(isImplicitSymbol)

    println(s"Found ${deadSymbols.size} potentially dead symbols.")

    deadSymbols
      .take(200)
      .foreach { case SymbolInFile(symbol, file) =>
        println(s"${symbol.symbol} in ${file}")
      }

  }
}
