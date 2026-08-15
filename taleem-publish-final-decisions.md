# Taleem Content Compiler — Final Decisions

## 1. Core purpose

`taleem-publish` is a **content compiler**.

Its job is to take the hand-made, immutable Taleem source content and compile it into the canonical Taleem Library data representation.

It is NOT:

- a database management tool
- a backup system
- a sync tool
- a server-management tool
- an educational quality authority
- a spelling checker
- a media-management system
- a monolithic "fix everything" utility

Core rule:

> If everything required for compilation is technically valid, the compiler works. If compilation itself cannot be completed, it stops and explains why.

Other checks and utilities may exist around the compiler.

## 2. Public Publisher API

The public API is intentionally tiny:

```js
const publisher = new TaleemPublish(courseName);
const compiled = await publisher.publish();
```

There are no other required public Publisher methods at this stage.

The constructor establishes the course-bound compilation context.

`publish()` is the compilation operation.

## 3. Course definition

`course.json` is:

- hand-made
- authoritative
- immutable
- the glue connecting the course, groupings, and content
- never modified by the compiler
- never deleted from by compiler modules

The Publisher is constructed for one course.

Conceptually:

```text
new TaleemPublish(courseName)
        ↓
course.json
        ↓
immutable CourseContext
```

## 4. Publish modules

The compiler may internally use **publish modules**.

A publish module:

- receives the course context
- performs one specific task
- may inspect the complete course/content universe
- should not mutate `course.json`
- should remain independently replaceable/extensible

Examples:

- slide timing checks
- slide health checks
- missing asset checks
- SVG checks
- spelling checks
- authoring-discipline checks

These are not automatically compiler failures.

## 5. Compiler errors vs content-quality checks

The Publisher breaks only for problems that prevent technical compilation.

Examples:

- malformed/invalid required source structure
- impossible compilation
- invalid data required by the canonical content contract
- source corruption that prevents compilation

Educational or production-quality issues are separate concerns:

- spelling/grammar
- educational quality
- poor slide design
- long lines
- suspicious timings
- missing images/audio
- incomplete content
- missing physical content
- other authoring-quality issues

`course.json` may contain more declared items than physically produced content. Missing physical content is therefore not inherently a compilation failure.

## 6. Compiler and database adaptor are separate

```text
Taleem source
    ↓
TaleemPublish compiler
    ↓
compiled Taleem data
    ↓
DB adaptor
    ↓
Taleem database
```

`TaleemPublish` does not know or care whether persistence uses SQLite, PostgreSQL, MongoDB, or another storage mechanism.

The DB adaptor owns persistence-specific concerns.

## 7. Publisher contract

The Publisher compiles each Library item into the canonical Taleem Library data:

```js
{
  (slug,
    title,
    description,
    thumbnail,
    type,
    body,
    courseId,
    groupingId,
    sortOrder);
}
```

`courseId`, `groupingId`, and `sortOrder` are part of the Taleem content/domain representation, not merely SQLite/Prisma details.

## 8. Database-owned fields

Persistence-specific fields remain outside the Publisher contract:

```text
id
createdAt
updatedAt
```

The DB adaptor handles these.

## 9. Compiler-injected fields

Some fields can be supplied to every compiled record by the Publisher/compiler rather than repeated in every source file.

Examples:

- `allowCommunication`
- `status`

These are compiler defaults/configuration rather than required repeated source fields.

## 10. Source status

`status` also has an internal compiler meaning.

A source item can be marked as draft/being worked on:

```text
source item
    ↓
status = DRAFT
    ↓
skip compilation
```

A draft item is not compiled into a Library record.

For compiled/live content, the output Library record can receive the compiler's default output status, normally:

```text
PUBLISHED
```

Therefore:

```text
source status → compiler decision: compile or skip
output status → value placed on compiled Library record
```

## 11. Core publish pipeline

Conceptually:

```text
course.json
    ↓
iterate course items
    ↓
read source
    ↓
compile content
    ↓
normalize to canonical Taleem content
    ↓
wrap for the required presentation/content type
    ↓
produce Library-content record
```

The compiler converts established source contracts into established Taleem content representation.

Examples:

### Article

```text
article.md
    ↓
front matter + Markdown body
    ↓
compile article
    ↓
wrap article representation
    ↓
Library record
```

### Player/deck

```text
JSON
    ↓
read established JSON/deck representation
    ↓
wrap for player/presentation
    ↓
Library record
```

### SVG

```text
SVG
    ↓
use as visual content
    ↓
Library record
```

## 12. Articles

Markdown is the preferred source format for new articles.

Existing HTML articles do not need immediate rewriting.

Preferred source:

```text
article.md
```

with front matter plus Markdown body.

Use an established front-matter parser such as `gray-matter`; the parser handles syntax while Taleem defines the article contract.

## 13. SVG strategy

SVG is treated as an **image** in the presentation system for now.

No SVG animation system, SVG editor, or theme transformation is being built now.

SVG is:

- immutable in presentation
- author-controlled
- theme-independent
- displayed like an image

## 14. SVG canvas contract

Educational SVGs use a fixed 16:9 canvas:

```svg
<svg xmlns="http://www.w3.org/2000/svg"
     width="1600"
     height="900"
     viewBox="0 0 1600 900">
```

The fixed requirement is the 1600×900 canvas. Internal composition is free.

## 15. SVG philosophy

SVG should be preferred whenever an educational visual can reasonably be represented as vector graphics:

- graphs
- data representations
- Venn diagrams
- real number lines
- sets and relationships
- coordinate systems
- geometry
- charts
- scientific schematics

Raster remains appropriate for photographs, scans, screenshots, and inherently raster artwork.

Principle:

> **Vector-first educational graphics.**

## 16. SVG generation

Do not create a Taleem SVG DSL.

SVG already has an established vocabulary, and building a custom DSL risks recreating a graphics library such as D3.

AI should receive educational context and produce ordinary SVG text.

Samples are preferred to a large premature template specification.

## 17. SVG samples and grid

Allow 2–3 common visual compositions to emerge naturally from production rather than defining a large template system now.

Samples can teach:

- spacing
- typography
- hierarchy
- margins
- density
- colors
- composition
- educational style

A consistent coordinate/grid discipline is useful for AI-generated SVGs. The grid is infrastructure, not a template.

## 18. SVG and Apps

Static SVG and interactive Apps remain separate concerns.

Static SVG:

```text
SVG → treated as image
```

Interactive App:

```text
controls + state + dynamic SVG
```

For Apps, SVG can later serve as the display layer, with D3.js used to manipulate/render it.

This does not change the static SVG architecture.

## 19. Content formats

Current simple philosophy:

```text
JSON       → structured content / decks
Markdown   → prose/articles
SVG        → educational visual content
```

## 20. Thumbnail inheritance

Current rule:

```text
item thumbnail
    ↓ if absent
grouping thumbnail
    ↓ if absent
course thumbnail
```

## 21. Sort order

`sortOrder` is part of the compiled Taleem content contract.

The source/course organization determines the intended order. The compiler outputs it so large content sets do not require manual UI reordering.

## 22. Scale

The system is designed with a realistic range of roughly:

```text
10 courses × ~1,000 items = ~10,000 items
```

with possible growth toward 20,000, 30,000, or 50,000 items.

The database is not the main challenge at this scale. Content organization and integrity are.

## 23. Publisher vs publish modules

The Publisher is the stable compiler/runtime.

Publish modules are single-purpose tools that can inspect the course context, such as:

- slide timing
- slide health
- missing assets
- SVG validity
- spelling
- authoring discipline

The Publisher should not become a monolith.

## 24. Final architecture

```text
HAND-MADE course.json
        +
SOURCE CONTENT
        ↓
TaleemPublish compiler
        ↓
canonical Taleem Library data
        ↓
DB adaptor
        ↓
Taleem database
```

The compiler is stable because it is based on established canonical contracts:

- course.json
- Library schema
- deck schema
- slide schema
- article contract
- SVG/content contracts

Changing educational checking rules should not require changing the compiler. Changing storage technology should not require changing the compiler.

## 25. Final public API

```js
const publisher = new TaleemPublish(courseName);
const compiled = await publisher.publish();
```

That is the API.

Everything else is internal machinery or separate tooling.

> **TaleemPublish compiles. The DB adaptor persists. Publish modules check. course.json defines the course. Source files contain the content.**
