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

A server has no form. The app type is chosen when the project is created — **File → New →
Non-UI Application** — not by an attribute. (`#Region` only folds a block in the editor;
it sets nothing.)

```b4x
' B4J only — minimal REST server
Sub Process_Globals
    Private srvr As Server
    Private pool As ConnectionPool     ' NOT a single shared SQL object — see below
End Sub

Sub AppStart (Args() As String)
    pool.Initialize("org.sqlite.JDBC", "jdbc:sqlite:/path/data.db", "", "")
    srvr.Initialize("srvr")
    srvr.Port = 8080
    srvr.AddHandler("/api/status", "StatusHandler", False)
    srvr.Start
    Log("Server started")
    StartMessageLoop        ' keep the process alive (headless)
End Sub
```

### Threading: the third `AddHandler` argument

`AddHandler(Path, Class, SingleThreadHandler)` — the Boolean is *"whether this handler
should always run in the main thread"*.

| Value | Meaning | Database access |
|-------|---------|-----------------|
| `False` | handler runs on **worker threads**, concurrently | must take a connection from a `ConnectionPool` per request and close it |
| `True` | handler always runs on the main thread | a single shared `SQL` object is safe |

**A global `SQL` object shared by `False` handlers is a real bug**, not a style problem.
Concurrent use of one connection corrupts behaviour without any compile error, so it
survives testing and fails under load. This is the one place where the general advice in
`data-and-io.md` — keep the database in `Main.Process_Globals` — does not apply.

```b4x
' B4J only — inside a multithreaded handler
Dim sql As SQL = pool.GetConnection
Try
    Dim rs As ResultSet = sql.ExecQuery2("SELECT name FROM users WHERE id = ?", _
        Array As Object(userId))
    Do While rs.NextRow
        Log(rs.GetString("name"))
    Loop
    rs.Close
Catch
    Log(LastException.Message)
End Try
sql.Close                  ' returns it to the pool — always
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

' req.InputStream reads the raw request body
Dim tr As TextReader
tr.Initialize2(req.InputStream, "UTF8")
Dim body As String = tr.ReadAll        ' ReadAll closes the stream
```

- **jServer** provides `Server`, `ServletRequest`, `ServletResponse`, WebSocket support.
- **jRDC2** is the ready-made remote-database connector (SQL over HTTP) if you're exposing
  a DB rather than hand-writing handlers.
- WebSocket handlers use the `WebSocket` object with `ws.Initialize` + `Wait For` events.

## Data folder

`xui.SetDataFolder("MyApp")` is **required on B4J** before `xui.DefaultFolder`
(`File.DirData`) is valid.
