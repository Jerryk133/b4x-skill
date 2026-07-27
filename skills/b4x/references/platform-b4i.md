# Platform: B4i (iOS)

Everything here is **B4i only**. In shared modules wrap in `#If B4i … #End If`. Most UI
should be shared XUI/B4XPages; drop to native only where iOS differs.

## Build & signing

B4i compiles on a Mac builder — either a local Mac (Xcode) or the **hosted builder**
(a remote Mac service). You need an Apple developer account, provisioning profiles and
certificates configured in the IDE before a build succeeds. There is no equivalent to
B4A's local-only build.

## Common build attributes

```b4x
' B4i only (in Main)
#ApplicationLabel: My App
#Version: 1.0
#MinVersion: 13
#ATSEnabled: True        ' App Transport Security — HTTPS enforced unless you add exceptions
#SupportedOrientations: 2   ' portrait/landscape codes
```

`#ATSEnabled: True` means plain-HTTP requests are blocked; use HTTPS or declare explicit
ATS exceptions in the build settings.

## NativeObject (native iOS APIs)

The iOS analogue of B4A's JavaObject. Method names include the Objective-C colons.

```b4x
' B4i only
Dim no As NativeObject
no.Initialize("NSLocale")
Dim lang As String = no.RunMethod("preferredLanguages", Null) _
    .RunMethod("objectAtIndex:", Array(0)).AsString

Dim v As Object = no.GetField("fieldName")
no.SetField("fieldName", value)

' color conversion between B4i colors and UIColor
Dim uic As Object = no.ColorToUIColor(xui.Color_Red)
Dim c As Int = no.UIColorToColor(uic)
```

## Platform notes

- Default data folder is `File.DirDocuments` (returned by `xui.DefaultFolder`).
- Native cross-platform switches use `B4XSwitch`; the underlying B4i control is a Switch.
- `xui.Scale` is `1` on B4i (as on B4J); B4A is where density scaling actually varies.
- Runtime permissions differ from Android: iOS shows system prompts on first use of a
  capability, driven by usage-description keys in the build settings, not by an explicit
  `CheckAndRequest` call.
