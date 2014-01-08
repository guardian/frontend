## Template Deduping

Deduping of items in the template work through a shared instance of `TemplateDeduping` for each request.
This object is added implicitly when the templates get called. Make sure the implicit can resolve a `TemplateDeduping` instance from somewhere within the call context.

Deduping is page wide, meaning that an item appearing at the top of the page may not appear at the bottom of the page.
It works by explicitly specifying how many items you want to have deduped when calling. If no number is specified, then all items will be considered for deduping.

For example, if you had two lists of 10 items each, and you asked each list to be deduped by 5. The first 5 of each list will not appear twice anywhere within what has been asked to be deduped. Outside of the 5, duplicates can occur.

Do not forget that each request has it's own scope of `TemplateDeduping`. At the time of writing, `show more` were separate requests to `Facia` and would return what was already on the page; it is the javascript which dedupes at this stage.

Collections are also deduped individually for repetitions.

#### Example

```
@(config: Config, collection: Collection, style: Container, containerIndex: Int)(implicit request: RequestHeader, templateDeduping: TemplateDeduping)
@defining(templateDeduping(5, collection.items)) { items =>

}
```
