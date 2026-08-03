# Platform: B4A (Android)

Everything here is **B4A only**. In shared modules, wrap it in `#If B4A … #End If`.

## Project shape (new projects)

- Use **B4XPages** (`B4XMainPage`), not Activities.
- Don't add the Starter service to new B4XPages projects. Put shared singletons in
  `Main.Process_Globals` and `Application_Error` in the Main module.

## Project attributes vs the Manifest Editor

These are **two different places** and mixing them is a common generated-code error.
`#…` attributes go in Main; manifest entries go in the Manifest Editor (Project →
Manifest Editor), which is a separate pane, not a code module.

```b4x
' B4A only — project attributes, in Main
#ApplicationLabel: My App
#VersionCode: 1
#VersionName: 1.0
#SupportedOrientations: unspecified   ' or portrait / landscape
#BridgeLogger: True
```

**`minSdkVersion` and `targetSdkVersion` are not project attributes.** They live in the
Manifest Editor:

```
' B4A only — Manifest Editor, NOT Main
AddManifestText(<uses-sdk android:minSdkVersion="21" android:targetSdkVersion="36"/>)
```

Google Play has required `targetSdkVersion 36` for new apps and updates since
**31 August 2026** (35 to stay installable for new users on newer devices). Targeting 36
turns on edge-to-edge — see the next section, because it changes how layouts behave.

Android 14+ requires an explicit foreground-service type if you run a foreground service,
and stricter background limits — another reason new UI projects lean on B4XPages instead
of long-lived services.

## Edge-to-edge (targetSdkVersion 36+)

At `targetSdkVersion 36` the app draws under the status and navigation bars and **there
is no opt-out**. Content anchored to the top or bottom of a Designer layout will sit
underneath the system bars unless insets are handled.

Handling insets arrived in **B4A 13.7**. What you do depends on the project shape:

```b4x
' B4A only — B4XPages: nothing to do, insets are handled for you.
' Only for genuinely full-screen apps (games, video):
B4XPages.HandleInsets = False
```

```b4x
' B4A only — legacy Activity projects, in EVERY activity. Requires the IME library.
ime.Initialize("ime")
root = xui.CreatePanel("")
Dim Content As Rect = ime.GetContentRect
Activity.AddView(root, Content.Left, Content.Top, Content.Width, Content.Height)
```

`#EdgeToEdgeOldDevices` turns E2E on for older devices too, which is recommended so you
get one layout behaviour instead of two. Note that `enableOnBackInvokedCallback` defaults
to `False`.

This is the strongest practical argument for rule 1 of this skill: a B4XPages project
needed no changes for targetSdk 36, while an Activity project needs the block above in
every activity.

## Runtime permissions (mandatory on Android 6+/10+)

"Dangerous" permissions (location, camera, external storage, etc.) must be requested at
runtime, or the app crashes/denies silently on modern Android. In B4XPages the result
comes back through `B4XPage_PermissionResult`.

```b4x
' B4A only
#If B4A
Private rp As RuntimePermissions
rp.CheckAndRequest(rp.PERMISSION_ACCESS_FINE_LOCATION)
Wait For B4XPage_PermissionResult (Permission As String, Result As Boolean)
If Result Then
    ' granted — proceed
Else
    ' denied — degrade gracefully
End If
#End If
```

`RuntimePermissions` requires the **RuntimePermissions** library. Some permissions also
need a manifest declaration; add those in the Manifest Editor.

## JavaObject (native Android APIs)

```b4x
' B4A only
Dim jo As JavaObject
jo.InitializeStatic("android.os.Build")
Log(jo.GetField("MODEL"))

jo.InitializeNewInstance("java.lang.String", Array("Hello"))
Dim r As Object = jo.RunMethod("methodName", Array(arg1, arg2))
Dim v As Object = jo.GetField("fieldName")
jo.SetField("fieldName", newValue)

' wrap an existing view and attach a native listener
Dim vjo As JavaObject = SomeView
Dim e As Object = vjo.CreateEvent("android.view.View.OnTouchListener", "MyEvent", False)
vjo.RunMethod("setOnTouchListener", Array(e))
```

> `android.*`, `Typeface.*`, `Cursor`, `Activity.*` are all B4A-only. If you see them in
> "cross-platform" code, that code is mislabelled.

## B4A-only view casts

```b4x
' B4A only
myView.As(Label).Padding = Array As Int(5dip, 0, 5dip, 0)
Button1.Tag = 1
```

## Scheduling

Prefer `StartReceiverAt` / `StartReceiverAtExact` over the older
`StartServiceAt` / `StartServiceAtExact` for scheduled wake-ups.
