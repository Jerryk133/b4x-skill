# B4XPages & XUI

## B4XPages (mandatory for new UI projects)

B4XPages makes B4A behave like B4J/B4i and removes Android Activity lifecycle pain.
The entry class is **`B4XMainPage`** (a **class** module → uses `Class_Globals`).

From B4A 13.7 it also handles system-bar insets, so a B4XPages project needed no layout
changes for the edge-to-edge enforcement that `targetSdkVersion 36` brings. Set
`B4XPages.HandleInsets = False` only for genuinely full-screen apps. Activity-based
projects have to position content manually in every activity — see `platform-b4a.md`.

### Lifecycle events

| Event | When |
|-------|------|
| `B4XPage_Created(Root As B4XView)` | Once, before the page is first shown |
| `B4XPage_Appear` | Each time the page becomes visible |
| `B4XPage_Disappear` | When it stops being visible |
| `B4XPage_Background` / `B4XPage_Foreground` | App leaves / returns to foreground |
| `B4XPage_CloseRequest As ResumableSub` | User tries to close (Back key / close button). **Return `True` to allow, `False` to block.** |
| `B4XPage_Resize(Width As Int, Height As Int)` | Page resized (B4J/B4i) |

```b4x
' B4X — CloseRequest is resumable and returns a Boolean
Private Sub B4XPage_CloseRequest As ResumableSub
    Dim sf As Object = xui.Msgbox2Async("Exit?", "Confirm", "Yes", "", "No", Null)
    Wait For (sf) Msgbox_Result (Result As Int)
    Return (Result = xui.DialogResponse_Positive)
End Sub
```

### Navigation & instances

A page must **exist as an instance** before you show it. `AddPage` registers an
already-created instance; `AddPageAndCreate` creates it for you.

```b4x
' B4X — create the instance, then register it
Dim p2 As Page2       ' Page2 is a class module implementing the page
p2.Initialize
B4XPages.AddPage("Page2", p2)
B4XPages.ShowPage("Page2")

' Or in one call:
B4XPages.AddPageAndCreate("Page2", Page2)   ' where Page2 here is a fresh instance you dim/pass
```

Common API:

```b4x
' B4X
B4XPages.ShowPage("Page2")
B4XPages.ClosePage(Me)
B4XPages.SetTitle(Me, "My Title")
B4XPages.HandleInsets = False                    ' B4A 13.7+, full-screen apps only
Dim mp As B4XMainPage = B4XPages.MainPage        ' the main page instance
Dim id As String = B4XPages.GetPageId(Me)
```

### Minimal B4XMainPage skeleton

```b4x
' B4X
Sub Class_Globals
    Private Root As B4XView
    Private xui As XUI
End Sub

Public Sub Initialize
End Sub

Private Sub B4XPage_Created(Root1 As B4XView)
    Root = Root1
    Root.LoadLayout("MainPage")     ' load the Visual Designer layout
End Sub
```

## Visual Designer & Anchors (preferred over code-built UI)

Roughly 80% of B4X UI is built in the **Visual Designer**: you create a layout file, add
views, and set **Anchors** + a **Designer Script** so one layout adapts to all screen
sizes. Do **not** build static UI in code.

- Load a layout with `panel.LoadLayout("LayoutName")`.
- Use **Anchors** (Left/Right/Top/Bottom/HorizontalCenter/VerticalCenter) instead of
  hard-coded positions.
- Put `AutoScaleAll` at the top of the General (or variant) Designer Script so views and
  fonts scale by density.
- Use the **`%x` / `%y`** designer-script units (percent of parent) and **`dip`** in
  code for density-independent sizes.

```text
' Designer Script (General) — pseudo, edited in the IDE
AutoScaleAll
Button1.Width = 40%x
Button1.HorizontalCenter = 50%x
```

**When code-built UI is correct:** dynamic list rows, generated grids/keyboards, and
custom views. There, adding views in code is the intended pattern — see
`custom-views-and-libraries.md`.

## XUI core

```b4x
' B4X
Private xui As XUI
```

### B4XView (cross-platform view)

Use `B4XView` instead of `Panel`/`Pane`/`Button`/`Label`/`ImageView` in shared code.

```b4x
' B4X
myView.Color = xui.Color_Red
myView.SetColorAndBorder(bgColor, borderWidth, borderColor, cornerRadius)
myView.Width = 200dip : myView.Height = 100dip
myView.Left = 10dip   : myView.Top = 10dip
myView.Visible = True : myView.Enabled = True
myView.SetVisibleAnimated(500, False)
Dim bmp As B4XBitmap = myView.Snapshot
myView.LoadLayout("LayoutName")
```

> Not every `B4XView` member is meaningful for every underlying view. `.Text`,
> `.TextColor`, `.TextSize` apply to text views (Label/Button/EditText); `.Text` on a
> plain panel/pane is meaningless. `.NumberOfViews` / `.GetView(i)` only make sense for
> container views. Cast with `.As(...)` when you need a type-specific property:

```b4x
' B4X
myView.As(B4XView).Text = "hi"            ' fine if it's a text view
myView.As(Label).Padding = Array As Int(5dip, 0, 5dip, 0)   ' B4A-only cast
```

### Cross-platform view equivalents

| Platform view | Use instead (shared) |
|---------------|----------------------|
| Button / Label / Panel / ImageView | `B4XView` |
| ListView (B4A) / TableView (B4i) | `xCustomListView` |
| Spinner / Picker / ComboBox | `B4XComboBox` |
| CheckBox (B4A) / Switch (B4i/B4J) | `B4XSwitch` |
| SeekBar / Slider | `B4XSeekbar` |
| EditText / TextField | `B4XFloatTextField` |

### B4XCanvas (drawing)

```b4x
' B4X
Private cvs As B4XCanvas
cvs.Initialize(somePanel)
cvs.DrawLine(x1, y1, x2, y2, xui.Color_Red, 3)
cvs.DrawCircle(cx, cy, r, xui.Color_Green, False, 2)
cvs.DrawText("Hi", x, y, font, xui.Color_Black, "LEFT")
cvs.Invalidate          ' must call to show the drawing
cvs.Release             ' when done — no parentheses
```

### B4XBitmap

```b4x
' B4X
Dim bmp As B4XBitmap = xui.LoadBitmap(File.DirAssets, "image.jpg")
Dim resized As B4XBitmap = bmp.Resize(100, 100, True)
Dim cropped As B4XBitmap = bmp.Crop(left, top, w, h)

Dim out As OutputStream = File.OpenOutput(xui.DefaultFolder, "image.png", False)
bmp.WriteToStream(out, 100, "PNG")
out.Close
```

### B4XFont / B4XRect / B4XPath

```b4x
' B4X
Dim font As B4XFont = xui.CreateDefaultFont(16)
Dim boldF As B4XFont = xui.CreateDefaultBoldFont(16)
Dim faF As B4XFont  = xui.CreateFontAwesome(20)   ' FontAwesome glyphs start 0xF
Dim miF As B4XFont  = xui.CreateMaterialIcons(20) ' Material glyphs start 0xE

Dim rect As B4XRect
rect.Initialize(left, top, right, bottom)   ' also: Width, Height, CenterX, CenterY

Dim path As B4XPath
path.Initialize(x, y)
path.LineTo(x2, y2)
```

### XUI process helpers

```b4x
' B4X
xui.Color_RGB(r, g, b)
xui.Color_ARGB(a, r, g, b)
xui.IsB4A : xui.IsB4i : xui.IsB4J   ' runtime check — see note below
xui.Scale                       ' 1 on B4i/B4J
xui.DefaultFolder               ' see the note below
xui.SetDataFolder("AppName")    ' required on B4J before using DefaultFolder
```

> **Runtime vs compile-time branching.** `xui.IsB4A / IsB4i / IsB4J` are *runtime*
> booleans — all branches must still compile on every platform, so they can't guard
> platform-specific types or APIs. Use `#If B4A … #End If` for that: it's a *compile-time*
> directive, so the excluded code is never parsed. Rule: `#If` for platform APIs,
> `xui.IsB4A` for platform-dependent values and layout tweaks.

> **`xui.DefaultFolder` is the app's private data folder** (B4A: `DirInternal`,
> B4i: `DirDocuments`, B4J: `DirData`). It is **not** a drop-in replacement for
> `DirCache`/`DirTemp` (transient data) or for user-facing storage. For files the user
> should see or pick, use a content chooser / save-as flow, not `DefaultFolder`.

### Dialogs (non-modal — always with Wait For)

```b4x
' B4X
Dim sf As Object = xui.Msgbox2Async("Delete?", "Title", "Yes", "Cancel", "No", Null)
Wait For (sf) Msgbox_Result (Result As Int)
If Result = xui.DialogResponse_Positive Then
    ' Yes
End If
```

For richer, fully customizable dialogs use the **B4XDialogs** library
(`Dim dialog As B4XDialog : dialog.Initialize(Root)` … `Wait For (…) Complete (…)`),
which is cross-platform — prefer it over hand-rolled modal dialogs.
