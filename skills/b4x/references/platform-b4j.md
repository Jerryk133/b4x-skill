# Platform: B4J (Desktop & Server)

Everything here is **B4J only**. B4J covers two very different worlds: JavaFX desktop apps
**and** headless servers / REST APIs. The desktop UI is a fallback for XUI; the server
side has no XUI at all.

## Desktop UI (JavaFX)

B4J's entry is a code module `Main` with `AppStart`. Even for UI you can (and for reuse,
should) drive most screens through B4XPages + XUI; drop to raw JavaFX (`Pane`, `Node`,
`fx`) only when a control has no XUI equivalent.

```b4x
' B4J only — classic AppStart
Sub Process_Globals
    Private fx As JFX
    Private MainForm As Form
End Sub

Sub AppStart (Form1 As Form, Args() As String)
    MainForm = Form1
    MainForm.RootPane.LoadLayout("Main")   ' Visual Designer layout
    MainForm.Show
End Sub
```

Useful build attributes:

```b4x
' B4J only (in Main)
#MainFormWidth: 600
#MainFormHeight: 400
#PackagerProperty: IconFile = icon.png
#MergeLibraries: True        ' bundle libs into the packaged jar
```

`setMouseTransparent`, `Pane`, `Node`, `fx.*` are JavaFX (B4J-only). Do not present them
as cross-platform.

## Headless / server apps

For a server there is no form. Set `#Region` app type to non-UI and run a jServer.

```b4x
' B4J only — minimal REST server
Sub Process_Globals
    Private srvr As Server
End Sub

Sub AppStart (Args() As String)
    srvr.Initialize("srvr")
    srvr.Port = 8080
    srvr.AddHandler("/api/status", "StatusHandler", False)
    srvr.Start
    Log("Server started")
    StartMessageLoop        ' keep the process alive (headless)
End Sub
```

### Handler module (one class per route)

A handler is a class implementing `Handle(req, resp)`. Build JSON with `JSONGenerator`
(you can't cast a Map straight to a generator):

```b4x
' B4J only — StatusHandler class
Sub Class_Globals
End Sub

Public Sub Initialize
End Sub

Public Sub Handle(req As ServletRequest, resp As ServletResponse)
    Dim respMap As Map = CreateMap("status": "ok", "timestamp": DateTime.Now)

    Dim gen As JSONGenerator
    gen.Initialize(respMap)

    resp.ContentType = "application/json"
    resp.Write(gen.ToString)
End Sub
```

Read query/body:

```b4x
' B4J only
Dim name As String = req.GetParameter("name")
Dim body As String = req.InputStream ...        ' via TextReader / File helpers
```

- **jServer** provides `Server`, `ServletRequest`, `ServletResponse`, WebSocket support.
- **jRDC2** is the ready-made remote-database connector (SQL over HTTP) if you're exposing
  a DB rather than hand-writing handlers.
- WebSocket handlers use the `WebSocket` object with `ws.Initialize` + `Wait For` events.

## Data folder

`xui.SetDataFolder("MyApp")` is **required on B4J** before `xui.DefaultFolder`
(`File.DirData`) is valid.
