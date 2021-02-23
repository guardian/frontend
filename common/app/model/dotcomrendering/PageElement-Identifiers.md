( document id: 03feb394-a17d-4430-8384-edd1891e0d01 )

This document present the conventions around the use of IDs for `PageElements` and DCR's `BlockElements`

### Introduction

`trait PageElement` and its members model the objects the backend send to DCR for rendering. In the DCR data object, they are referred to as `BlockElement`s, for instance 

```
model.dotcomrendering.pageElements.TextBlockElement
```

### The State of PageElement Identifiers

`BlockElement` do not per se have a neturally defined identifier. This is because although some of them correspond to CAPI elements who have a natural identifer, for instance atoms, PageElements are more general than content held in CAPI. 

Due to historical reasons a few `PageElement`s have a field called `id`, for instance

```
case class MediaAtomBlockElement(
    id: String,
    title: String,
    ...
```

but this `id` should be seen as metadata about the original data the PageElement represents. 

In Feb 2021, the DCR team requested that PageElements be given an identifier that would help with rendering, notably to be used for DOM reconciliation during React rendering. Although DCR itself could be responsible to provide them (ultil this point it actually did using integer indices), the backend accepted to provide one, called `elementId`. 

We then moved to serving, say, `TextBlockElement` like this:   

```
{
  "_type": "model.dotcomrendering.pageElements.TextBlockElement",
  "html": "<p>Something</p>"
}
```

to this:

```
{
  "elementId": "ae4e4580-dd0b-4aed-a958-f9ba6aa79ca2",
  "_type": "model.dotcomrendering.pageElements.TextBlockElement",
  "html": "<p>Something</p>"
}
```

*NB*:

1. The backend type `trait PageElement`, does not itself enforces the presence of `elementId`, this attribute is added (at the time these lines are written), as per this [https://github.com/guardian/frontend/pull/23562](https://github.com/guardian/frontend/pull/23562) , using a data enhancer applied to the JSON representation of the DCR data object. This choice was made on the basis that the `elementId` is a courtesy provided to DCR by the backend and not a real property of the data as seen by the backend


2. The initial implementation uses UUIDs, but the contract is that any reasonably unique string can do 

3. The value of `elementId` for each element is, as per original implementation, randomly chosen at each generation. In any case, there is no 1-2-1 mapping between `PageElement`s / `BlockElement`s and those values. 
