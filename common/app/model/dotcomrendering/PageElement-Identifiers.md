( document id: 03feb394-a17d-4430-8384-edd1891e0d01 )

Q: What is this id? A: This document is mentionned in a couple of comments in the frontend source code. The comments mention that one should look up that id in a string search to find it. 

## PageElement Identifiers

This document explains why `elementId` was introduced as attribute of `PageElement`s and DCR's `BlockElement`s

### Introduction

`trait PageElement` models the objects that the backend ("backend" here refers to the frontend Scala code) sends to DCR for rendering. In the DCR Data Object (the JSON object sent to DCR), they are referred to as `BlockElement`s. For instance 

```
model.dotcomrendering.pageElements.TextBlockElement
```

### PageElement Identifiers

Due to historical reasons a few `PageElement`s have a field called `id`, for instance

```
case class MediaAtomBlockElement(
    id: String,
    title: String,
    ...
```

but this `id`, as mentionned above, a CAPI id, and should be seen as metadata about the original data that the PageElement represents. 

The general situation is that not all `BlockElement`s from CAPI have a naturally defined unique identifier. Moreover, `PageElement`s are more general than content held in CAPI. 

(Indeed, as much as there should be a 121 correspondance between `PageElement`s in the backend, `BlockElement`s in the DCR data model, and ideally, DCR React Components, there is no direct correspondance between CAPI elements and `PageElement`s. This decision was taken by the Dotcom team at the time to free the design of DCR from inefficiencies in the CAPI data model.)

### Introducing an artificial identifier for PageElement

In Feb 2021, the DCR team (the dotcom team at the time was, at least in the mind of Pascal, split between "the DCR team" and "the backend team", himself) requested that PageElements be given an identifier that would help with rendering, notably to be used for DOM reconciliation during React rendering. The problem was that React list rendering required elements to have unique ids.

Although DCR itself could be responsible to provide those ids (until this point it actually did using integer indices), the backend accepted to provide one, called `elementId`. 

We then moved from serving, say, `TextBlockElement` like this:   

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

1. The backend type `trait PageElement`, does not itself enforces the presence of `elementId`, this attribute is added (at the time these lines are written), as per this PR [https://github.com/guardian/frontend/pull/23562](https://github.com/guardian/frontend/pull/23562), using a "data enhancer" applied to the JSON representation of the DCR data object. This choice, may come across as a bit hacky, but was made on the basis that the `elementId` attribute is a courtesy provided by the backend to DCR, and is not a real property of the data, at least as seen by the backend.

2. The initial implementation uses UUIDs, but in essence any reasonably unique string can do. 

3. The value of `elementId` for each element is, as per original implementation, randomly chosen at each generation of the DCR data object. In any case, there is no 1-2-1 mapping between `PageElement`s or `BlockElement`s and those values. 

### Main Media Elements renderId

Main media elements also carry an `elementId`. It is added using the same method we use for `BlockElement`s.
