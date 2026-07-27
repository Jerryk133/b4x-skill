# Platform: B4A (Android)

Everything here is **B4A only**. In shared modules, wrap it in `#If B4A … #End If`.

## Project shape (new projects)

- Use **B4XPages** (`B4XMainPage`), not Activities.
- Don't add the Starter service to new B4XPages projects. Put shared singletons in
  `Main.Process_Globals` and `Application_Error` in the Main module.

## Manifest / build attributes

Set in the **Manifest Editor** or as `#…` attributes in Main:

```b4x
' B4A only — common attributes (in Main)
#ApplicationLabel: My App
#VersionCode: 1
#VersionName: 1.0
#SupportedOrientations: unspecified   ' or portrait / landscape
#TargetSdkVersion: 34                 ' Android 14 baseline in recent B4A
#BridgeLogger: True
```

Android 14+ requires an explicit foreground-service type if you run a foreground service,
and stricter background limits — another reason new UI projects lean on B4XPages instead
of long-lived services.

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
