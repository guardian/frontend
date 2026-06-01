import java.nio.file.Files.writeString
import java.nio.file.Path
import scala.meta.internal.semanticdb.{SymbolInformation, SymbolOccurrence}

object Analysis {

  def isViewsDefinition(symbolInfo: SymbolInformation, file: SourceRef): Boolean =
    symbolInfo.symbol.startsWith("views/html/") && (symbolInfo.kind.isMethod || symbolInfo.kind.isObject)

  def isTwirlTemplate(methodRef: MethodRef): Boolean = methodRef.file.file.endsWith(".template.scala")
  def isRouter(methodRef: MethodRef): Boolean = methodRef.symbolName.symbolName.startsWith("router/Routes")
  def isController(callers: Seq[CallHierarchy]): Boolean = callers.exists(caller => isRouter(caller.callee))

  // for each hierarchy, create a mapping from the twirl template to the controller
  // a twirl template is defined as any symbol in a file that ends in .template.scala
  // a controller is defined as any method called from within a router/Routes file
  def recursivelyMap(
      node: CallHierarchy,
      templates: List[MethodRef],
      controllers: List[MethodRef],
  ): (List[MethodRef], List[MethodRef]) = node match {
    case CallHierarchyCycle(_)                            => (templates, controllers)
    case CallHierarchyEntryPoint(_)                       => (templates, controllers)
    case CallHierarchyNode(callee, _) if isRouter(callee) => (templates, controllers)
    case CallHierarchyNode(callee, callers)               =>
      val newTemplates = if (isTwirlTemplate(callee)) callee :: templates else templates
      val newControllers = if (isController(callers)) callee :: controllers else controllers
      callers.foldLeft((newTemplates, newControllers)) { case ((accTemplates, accControllers), caller) =>
        recursivelyMap(caller, accTemplates, accControllers)
      }
  }

  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("."))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("."))

    val callHierarchyBuilder = new CallHierarchyBuilder(sources, semanticDB)
    val callHierarchies = callHierarchyBuilder
      .buildCallHierarchy(isViewsDefinition)

    val mappings = callHierarchies
      .flatMap { node =>
        val (templates, controllers) = recursivelyMap(node, Nil, Nil)
        // cartesian product of templates and controllers
        // This is because in a single call hierarchy you could have multiple templates and multiple controllers
        for {
          template <- templates
          controller <- controllers
        } yield (controller, template)
      }
      // with all the distinct possibilities, we deduplicate and sort for easier handling
      .distinctBy(i => i._1.symbolName.symbolName + "->" + i._2.symbolName.symbolName)
      .sortBy(entry => entry._1.symbolName.symbolName + "->" + entry._2.symbolName.symbolName)

    val csvContent = mappings.map { case (controller, template) =>
      val controllerLocation =
        s"${controller.file}:${controller.occurrence.range.map(r => s"${r.startLine}:${r.startCharacter}").getOrElse("unknown")}"
      val templateLocation =
        s"${template.file}:${template.occurrence.range.map(r => s"${r.startLine}:${r.startCharacter}").getOrElse("unknown")}"
      s"${controller.symbolName};${controllerLocation};${template.symbolName};${templateLocation};"
    }
    val csvHeader = "Controller Symbol;Controller Location;Template Symbol;Template Location;"
    val csvOutput = (csvHeader +: csvContent).mkString("\n")
    val outputPath = Path.of("controller_template_mappings.csv")
    writeString(outputPath, csvOutput)
  }

}
