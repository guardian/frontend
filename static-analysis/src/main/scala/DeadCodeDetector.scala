import java.nio.file.Path
import scala.meta.internal.semanticdb.{MethodSignature, SymbolInformation, TypeRef}

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
      val classDefinitionSymbol = symbolInFile.symbol.symbol.replaceFirst("\\#[^#]*(\\(.*\\))?\\.$", "#")
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
    "javascript/JavaScriptReverseRoutes.scala",
    "main/router/RoutesPrefix.scala",
    "/ReverseRoutes.scala",
    "project/Dependencies.scala",
    "AppLoader.scala",
  )

  def isNonLogicFile(symbolInFile: SymbolInFile): Boolean = {
    NON_LOGIC_FILE.exists(file => symbolInFile.filePath.file.contains(file)) ||
    symbolInFile.filePath.file.matches(".*/\\w+Controllers\\.scala$")
  }

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
  def isCaseClassInstantiatedByCompanion(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Boolean = {
    if (symbolInFile.symbol.kind.isClass && (symbolInFile.symbol.properties & CASE_MODIFIER) != 0) {
      val companionObject = symbolInFile.symbol.symbol.dropRight(1) + "."
      semanticDB.getOccurrences(SemanticDBSymbol(companionObject)).filter(_._2.role.isReference).nonEmpty
    } else false
  }

  // We consider that an object is used if any of its members are referenced,
  // or if all of its members are implicit (since they could be used without an explicit reference)
  def isObjectMethodsReferenced(symbolInFile: SymbolInFile, semanticDB: SemanticDB): Boolean = {
    if (symbolInFile.symbol.kind.isObject) {
      val candidates = semanticDB.allOccurrenceSymbols.filter { s =>
        s.startsWith(symbolInFile.symbol.symbol) && s != symbolInFile.symbol.symbol
      }

      val anySymbolReferenced = candidates.exists { candidate =>
        semanticDB.getOccurrences(SemanticDBSymbol(candidate)).exists { case (_, occurrence) =>
          occurrence.role.isReference
        }
      }
      val allSymbolsImplicits = candidates.forall { candidate =>
        semanticDB.findDefinition(SemanticDBSymbol(candidate)).exists { case (_, definition) =>
          (definition.properties & IMPLICIT_MODIFIER) != 0
        }
      }
      anySymbolReferenced || allSymbolsImplicits
    } else false
  }

  // unfortunately implicit symbols aren't referenced in the semantic db so we can't account for them being unused.
  def isImplicitSymbol(symbolInFile: SymbolInFile): Boolean =
    (symbolInFile.symbol.properties & IMPLICIT_MODIFIER) != 0

  // Some symbols aren't being used, but also aren't actionable. We don't know what they are nor where they are
  // Not enough of a low hanging fruit to dig deeper
  def isMysteriousSymbol(symbolInFile: SymbolInFile): Boolean = {
    symbolInFile.symbol.symbol.matches("^local\\d+$")
  }

  val SERIALISING_REFERENCES = Set(
    "play/api/libs/json/OWrites#",
    "play/api/libs/json/OFormat#",
    "play/api/libs/json/Writes#",
    "play/api/libs/json/Format#",
  )
  def buildListOfSerialisedClasses(semanticDB: SemanticDB): Set[String] = {
    semanticDB.allDocuments
      .flatMap(_._2.symbols)
      .filter(_.kind.isMethod)
      .map(_.signature)
      .collect {
        case MethodSignature(_, _, TypeRef(_, returnType, Seq(TypeRef(_, paramType, _))), _)
            if SERIALISING_REFERENCES.contains(returnType) =>
          paramType
      }
      .toSet
  }

  def isSerialisedCaseClassAttribute(
      symbolInFile: SymbolInFile,
      serialisedCaseClasses: Set[String],
      semanticDB: SemanticDB,
  ): Boolean = {
    if (symbolInFile.symbol.kind.isMethod) {
      findMethodOwnerClass(symbolInFile, semanticDB) match {
        case Some(definition) =>
          if (definition.kind.isClass && (definition.properties & CASE_MODIFIER) != 0) {
            serialisedCaseClasses.contains(definition.symbol)
          } else false
        case _ => false
      }
    } else false
  }

  def main(args: Array[String]): Unit = {

    val semanticDB = SourceLoader.loadSemanticDB(Path.of("."))

    val serialisedCaseClasses = buildListOfSerialisedClasses(semanticDB)

    val deadSymbols = semanticDB.allDocuments
      .flatMap { case (file, document) =>
        document.symbols.map(symbolInfo => SymbolInFile(symbolInfo, file))
      }
      .filterNot(isTestFile)
      .filterNot(isNonLogicFile)
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
      .filterNot(isCaseClassInstantiatedByCompanion(_, semanticDB))
      .filterNot(isObjectMethodsReferenced(_, semanticDB))
      .filterNot(isImplicitSymbol)
      .filterNot(isMysteriousSymbol)
      .filterNot(isSerialisedCaseClassAttribute(_, serialisedCaseClasses, semanticDB))

    println(s"Found ${deadSymbols.size} potentially dead symbols.")

    deadSymbols
      .sortBy(_.filePath.file)
      .foreach { case SymbolInFile(symbol, file) =>
        val refLocation =
          semanticDB.getOccurrences(SemanticDBSymbol(symbol.symbol)).find(_._2.role.isDefinition).flatMap(_._2.range)
        println(s"${symbol.symbol} in ${file}@${refLocation.getOrElse("unknown")}")
      }

  }
}
