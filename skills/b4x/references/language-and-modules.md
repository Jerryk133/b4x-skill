# Language & Modules

All examples here are shared-code (`' B4X`) unless labelled otherwise.

## Modules and where variables live

B4X has several module kinds, and they use **different global blocks**. Getting this
wrong is the single most common structural error.

| Module kind      | Global block      | Notes |
|------------------|-------------------|-------|
| Code module (`Main`, custom code modules) | `Sub Process_Globals` | One instance per process. `Public` here = accessible via `ModuleName.Var`. |
| Class module (incl. **B4XMainPage** and other B4XPages) | `Sub Class_Globals` | One block per instance. **`Process_Globals` is not valid here.** |
| Activity (legacy B4A only) | `Sub Globals` (+ `Process_Globals`) | Avoid in new projects — use B4XPages. |
| Service (legacy) | `Sub Process_Globals` | Starter service is legacy; not needed by B4XPages. |

**Rule:** process-wide singletons (a shared `SQL` object, app settings) go in
**`Main.Process_Globals`** and are referenced as `Main.SQL1`. State that belongs to one
page goes in that page's **`Class_Globals`**.

```b4x
' B4X — Main is a CODE module
Sub Process_Globals
    Public SQL1 As SQL          ' shared singleton, referenced as Main.SQL1
End Sub
```

```b4x
' B4X — B4XMainPage is a CLASS module
Sub Class_Globals
    Private Root As B4XView
    Private xui As XUI
    Private mUserName As String  ' state that belongs to this page only
End Sub
```

> Views must never be process-global (memory-leak risk). Keep them page/class scoped.

## Variable declaration & scope

`Dim` is used **inside subs**; `Private`/`Public` are used **in the globals blocks**.
Objects are **not** auto-initialized — a bare `Dim m As Map` must be `.Initialize`d (or
created via a factory like `CreateMap`) before use.

```b4x
' B4X
Dim name As String = "John"       ' inside a Sub
Dim a, b, c As Int                ' several of one type
Dim days() As String = Array As String("Mon", "Tue", "Wed")

Private Const MAX_SIZE As Int = 100   ' in a globals block

Dim m As Map                      ' NOT usable yet
m.Initialize                      ' now it is
```

### Types (structures)

Declared **in a globals block**, never inline in a sub.

```b4x
' B4X — put this in Process_Globals / Class_Globals
Type Person(FirstName As String, LastName As String, Age As Int)
```

```b4x
' B4X — using it in a sub
Dim user As Person
user.Initialize      ' user types must be initialized too
user.FirstName = "John"
```

### Primitive types

| Type    | Size   | Range |
|---------|--------|-------|
| Boolean | –      | True / False |
| Byte    | 8-bit  | -128 … 127 |
| Short   | 16-bit | -32768 … 32767 |
| Int     | 32-bit | ±2.14e9 |
| Long    | 64-bit | ±9.22e18 |
| Float   | 32-bit | ~1.4e-45 … 3.4e38 |
| Double  | 64-bit | ~4.9e-324 … 1.79e308 |
| String  | –      | variable |
| Char    | –      | single character |

## Operators

| Category | Operators |
|----------|-----------|
| Math | `+ - * /  Mod  Power(x,y)` |
| Relational | `=`  `<>`  `>`  `<`  `>=`  `<=`  (equality is `=`, inequality is `<>`) |
| Boolean | `And`  `Or`  `Not(x)` — **`Not` is a function**, needs parentheses |
| String join | `&` — **not `+`** |

There is no `++`, `+=`, `==`, `!=`, or `? :` in B4X. Write `i = i + 1`, `<>`, `=`, and
use `IIf` for inline conditionals.

## Control flow

```b4x
' B4X
If cond Then
    ...
Else If cond2 Then
    ...
Else
    ...
End If                     ' NOT "EndIf"; "Else If" is two words

If cond Then a = 1 Else a = 0      ' single-line form
```

`IIf` is an inline conditional expression. **Both arguments are evaluated** (it is a
function call, not lazy) — never put a side-effect or a possibly-invalid access in an
`IIf` branch:

```b4x
' B4X — safe: both branches are cheap and always valid
Label1.Text = IIf(score >= 60, "Pass", "Fail")

' BAD: list.Get(0) still runs even when the list is empty
Dim first As Object = IIf(list.Size > 0, list.Get(0), "none")
```

```b4x
' B4X
Select value
    Case 1, 2, 3
        ...
    Case Else
        ...
End Select

For i = 0 To 10
    ...
Next

For i = 10 To 0 Step -1
    ...
Next

For Each item As String In list
    ...
Next

Do While cond
    ...
Loop

Do Until cond
    ...
Loop
```

## Subs

```b4x
' B4X
Sub CalcTotal(price As Double, tax As Double) As Double
    Return price * (1 + tax)
End Sub

Dim result As Double = CalcTotal(100, 0.08)
```

Note: it is `Sub ... End Sub` with an optional `As <ReturnType>` — there is no
`Function`/`End Function` keyword.

## Initialized / NotInitialized (current object check)

```b4x
' B4X — current (v13.3+) form
If Initialized(map1) Then ...
If NotInitialized(map1) Then map1.Initialize

' Older, verbose equivalent still seen in old code:
If map1.IsInitialized Then ...
```

## Strings

```b4x
' B4X
Dim s As String = "Hello World"
s.Length
s.SubString2(0, 5)           ' "Hello"
s.IndexOf("l")               ' 2
s.Contains("World")          ' True
s.Replace("World", "Universe")
s.ToLowerCase
s.Trim
s.EqualsIgnoreCase("hello world")
```

### Smart strings (multi-line + interpolation)

Delimited by `$"..."$`. Interpolation is `{expr}`. **Number formatting uses
`$minIntegers.maxFractions{expr}$`** and date/time use `$date{...}$` / `$time{...}$`.

```b4x
' B4X
Dim name As String = "John"
Dim age As Int = 30
Log($"Hello {name}, you are {age} years old"$)

Log($"Value: $0.2{123.456}"$)   ' Value: 123.46  (min 0 int digits, max 2 fractions)
Log($"ID: $3.0{5}"$)            ' ID: 005         (min 3 int digits, 0 fractions)

Log($"Today: $date{DateTime.Now}"$)
Log($"Time: $time{DateTime.Now}"$)

Dim query As String = $"SELECT * FROM users
WHERE age > 18
ORDER BY name"$                 ' multi-line, no quote escaping
```

> The old `${0.2}(123.456)` form seen in some snippets is **wrong** and won't compile.

### StringBuilder / CSBuilder

```b4x
' B4X — many concatenations
Dim sb As StringBuilder
sb.Initialize
sb.Append("First").Append(CRLF).Append("Second")
Dim out As String = sb.ToString
```

```b4x
' B4X — rich text; use the XUI font factories, not Typeface (B4A-only)
Dim cs As CSBuilder
cs.Initialize
cs.Color(xui.Color_Red).Append("Red ")
cs.Bold.Append("Bold ")
cs.Font(xui.CreateFontAwesome(20)).Append(Chr(0xF015))   ' cross-platform icon font
cs.PopAll
Label1.Text = cs
```

> `Typeface.FONTAWESOME` is **B4A only**. In shared code use
> `xui.CreateFontAwesome(size)` / `xui.CreateMaterialIcons(size)`.

## Collections

```b4x
' B4X — List
Dim list As List
list.Initialize
list.Add(item)
list.AddAll(Array As String("a", "b"))
Dim n As Int = list.Size
For Each item As Object In list
    ...
Next
list.Sort(True)   ' ascending
```

```b4x
' B4X — Map. CreateMap builds AND initializes in one step.
Dim settings As Map = CreateMap("language": "English", "theme": "Dark")

' Or explicitly:
Dim m As Map
m.Initialize
m.Put("key", value)
If m.ContainsKey("key") Then ...
For Each k As String In m.Keys
    Dim v As Object = m.Get(k)
Next
```

> Maps do **not** preserve insertion order in general. Use `B4XOrderedMap` when order
> matters.

`CreateMap(...)` is a core built-in and the idiomatic way to make an initialized map.
Some builds also offer list/collection helpers (`CreateList`, `EmptyList`, `EmptyMap`,
`MergeLists`, `CopyOnWriteList`, …) via recent B4XCollections — **verify the exact
signature against your installed version** before relying on them; the universally safe
list idiom is `Dim l As List : l.Initialize : l.AddAll(Array As String(...))`.
