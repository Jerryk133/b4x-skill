# Custom Views & Libraries

Custom views are one of the few places where **building UI in code is correct** (the
other being dynamic list content). A custom view is a class module that either draws into
a base panel or composes existing views.

## XUI custom view template

```b4x
' B4X
#DesignerProperty: Key: Max, DisplayName: Max Value, FieldType: Int, DefaultValue: 100
#Event: ValueChanged(Value As Int)

Sub Class_Globals
    Private mEventName As String        'ignore
    Private mCallBack As Object         'ignore
    Public mBase As B4XView             'ignore
    Private xui As XUI                  'ignore
    Private mMax As Int
    Private mCurrentValue As Int        ' declare every field you reference
End Sub

Public Sub Initialize(Callback As Object, EventName As String)
    mEventName = EventName
    mCallBack = Callback
End Sub

' Called when the view is placed via the Visual Designer
Public Sub DesignerCreateView(Base As Object, Lbl As Label, Props As Map)
    mBase = Base
    mBase.Tag = Me
    mMax = Props.GetDefault("Max", 100)
End Sub

' Called when you create the view from code
Public Sub AddToParent(Parent As B4XView, Left As Int, Top As Int, Width As Int, Height As Int)
    mBase = xui.CreatePanel("")
    Parent.AddView(mBase, Left, Top, Width, Height)
    mBase.Tag = Me
    mMax = 100
End Sub

Public Sub setValue(v As Int)
    mCurrentValue = v
    RaiseValueChanged
End Sub

Private Sub RaiseValueChanged
    If xui.SubExists(mCallBack, mEventName & "_ValueChanged", 1) Then
        CallSubDelayed2(mCallBack, mEventName & "_ValueChanged", mCurrentValue)
    End If
End Sub
```

Notes:
- Fields flagged `'ignore` are the standard custom-view boilerplate the IDE won't warn
  about; every other field you use (like `mCurrentValue`, `mMax`) must be declared.
- The view raises events to its owner with `CallSubDelayed2` after checking
  `xui.SubExists`, so it doesn't crash if the owner didn't implement the handler.
- Add the view via `Parent.AddView(mBase, l, t, w, h)`. Don't follow that with a
  redundant `SetLayoutAnimated` at the same coordinates — `AddView` already positions it;
  use `SetLayoutAnimated` only when you actually want an animated move/resize afterwards.

## Building a .b4xlib

1. Create `manifest.txt`:

```text
Version=1.0
Author=YourName
B4J.DependsOn=jXUI
B4A.DependsOn=XUI
B4i.DependsOn=iXUI
```

2. Zip the module(s) + manifest with a `.b4xlib` extension.
3. Copy to `AdditionalLibraries\B4X\`.
4. In the IDE, right-click the Libraries tab → **Refresh**, then tick the library.

## AdditionalLibraries layout

```text
AdditionalLibraries/
├── B4A/        # B4A: .jar + .xml
├── B4i/        # B4i: .xml
├── B4J/        # B4J: .jar + .xml
├── B4X/        # cross-platform *.b4xlib
└── Snippets/   # code snippets
```
