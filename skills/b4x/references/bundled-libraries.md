# Libraries That Ship With B4X

These come with the IDE. They are not forum downloads — they only need ticking in the
Libraries tab. Reaching for a third-party library, or hand-rolling something from this
list, is usually the wrong answer.

> Which libraries ship, and under which names, is **per platform and per IDE version**.
> This list was checked against a B4A install; confirm availability before assuming a
> given entry exists in B4J or B4i. Some are B4A-only by nature (`NB6`, `FileProvider`).

The point of this file is **recall, not reference**: knowing that a thing exists so you
suggest it. It deliberately does not list signatures, because they change.

## Data and collections

| Library | For |
|---------|-----|
| `B4XCollections` | `B4XOrderedMap`, `B4XSet`, `B4XBitSet`, `B4XCache`, `B4XBytesBuilder`, `CopyOnWriteList` / `CopyOnWriteMap`, `B4XComparatorSort` |
| `ListOfArrays` | tabular data in memory — see below |
| `KeyValueStore` | key/value persistence without writing SQL |
| `Xml2Map` | XML into a `Map`, and `Map2Xml` back out |
| `SQL`, `JSON` | see `data-and-io.md` |

## UI

| Library | For |
|---------|-----|
| `XUI Views` | `B4XComboBox`, `B4XSwitch`, `B4XSeekBar`, `B4XFloatTextField`, `B4XImageView`, `B4XPlusMinus`, `B4XRadioButton`, `SwiftButton`, `ScrollingLabel`, and the **`B4XDialog`** dialog templates (input, list, search, date, colour, signature) |
| `xCustomListView` | the list view to use; never B4A `ListView` or B4i `TableView` |
| `PreoptimizedCLV` | xCustomListView variant for very large lists |
| `B4XTable` | scrollable, sortable data table |
| `B4XDrawer` | sliding navigation drawer |
| `B4XPreferencesDialog` | settings screens without building them by hand |
| `BCTextEngine` | rich/formatted text rendering |
| `BCToast` | toast-style messages |
| `B4XFormatter` | number formatting with per-range rules; `Format`, `FormatLabel` |

## Media, device, platform

| Library | For |
|---------|-----|
| `MediaChooser` | picking images and video |
| `SimpleMediaManager` | async bitmap loading and request management |
| `ExoPlayer` | video and audio playback — **not** `VideoView` |
| `NB6` | notification builder (B4A) |
| `FileProvider` | sharing files with other apps (B4A) |
| `OkHttpUtils2` | `HttpJob` — see `async-network.md` |
| `X2`, `XUI2D` | 2D game framework |

## ListOfArrays (LoA)

Tabular data held in memory: every row is an object array, all rows the same length.
Loosely modelled on dataframes. Use it instead of a `List` of `Map`s, or parallel arrays,
when the data is genuinely a table — it has sorting, filtering, grouping, row and column
manipulation and CSV conversion.

```b4x
' B4X
Dim table As ListOfArrays = LOAUtils.CreateEmpty(Array("Animal type", "Name"))
table.AddRow(Array("Dog", "Buddy"))
Dim cats As ListOfArrays = table.GetRowsByValue("Animal type", "Cat")
```

Entry points live in `LOAUtils`: `CreateEmpty`, `CreateFromListOfMaps`, `CreateFrom1DList`,
`CreateFromMap`, and the `Wrap…` family. `LOASet` handles set operations.

> **LoA is newer than most of this list and was still pre-1.0 when this was written, with
> roughly 70 public subs across its three modules.** Suggest it, but do not write LoA code
> from memory — read the installed version's API first.

## Before generating code against any of these

The failure mode is inventing a plausible member that does not exist. Two habits prevent
it:

1. Check the API rather than recalling it. Signature details are easy to get subtly wrong.
2. For a `.b4xlib`, the shipped file is a zip of B4X source — read it. A tool that lists
   only Subs will miss a `Public` variable declared in `Process_Globals`, so an empty
   search result is not evidence that a member is absent.
