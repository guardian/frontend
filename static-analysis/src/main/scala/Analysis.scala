import java.nio.file.Path
import scala.meta.internal.semanticdb.{SymbolInformation, SymbolOccurrence}

object Analysis {

  def isViewsDefinition(symbolInfo: SymbolInformation, file: SourceRef): Boolean =
    symbolInfo.symbol.startsWith("views/html/") && (symbolInfo.kind.isMethod || symbolInfo.kind.isObject)

  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("./article"))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("./article"))

    val callHierarchyBuilder = new CallHierarchyBuilder(sources, semanticDB)
    val callHierarchies = callHierarchyBuilder
      .buildCallHierarchy(isViewsDefinition)

    callHierarchies.foreach(node => CallHierarchy.printCallHierarchy(node, indent = ""))

    // for each hierarchy, create a twirl template file to controller method mapping
    // a twirl template is defined as a file that ends in .template.scala
    // a controller is defined as any file called from a router/Routes file
    def isTwirlTemplate(methodRef: MethodRef): Boolean = methodRef.file.file.endsWith(".template.scala")
    def isRouter(methodRef: MethodRef): Boolean = methodRef.symbolName.symbolName.startsWith("router/Routes")
    def isController(callers: Seq[CallHierarchy]): Boolean = callers.exists(caller => isRouter(caller.callee))
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

    val mappings = callHierarchies
      .flatMap { node =>
        val (templates, controllers) = recursivelyMap(node, Nil, Nil)
        // cartesian product of templates and controllers
        for {
          template <- templates
          controller <- controllers
        } yield (controller, template)
      }
      .distinctBy(i => i._1.symbolName.symbolName + "->" + i._2.symbolName.symbolName)
      .sortBy(entry => entry._1.symbolName.symbolName + "->" + entry._2.symbolName.symbolName)

    mappings.foreach { case (controller, template) =>
      println(s"${controller.symbolName} -> ${template.symbolName}")
    }
  }

}
