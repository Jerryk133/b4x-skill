# Data & I/O — SQLite, Files, JSON

## SQLite

### Where the SQL object lives

A shared database belongs in `Main.Process_Globals` (referenced as `Main.SQL1`), or in
one page's `Class_Globals` if no other module needs it. It is **not** put in a Starter
service in new B4XPages projects.

> **This assumes one thread touches the database.** It holds for B4A, B4i and B4J UI
> apps. It does **not** hold for a B4J server with multithreaded handlers — a single
> `SQL` object shared across concurrent requests is a genuine bug. Use a
> `ConnectionPool`, take a connection per request and close it; see `platform-b4j.md`.

### Initializing — and copying a prepared DB (order matters!)

**Critical bug to avoid:** if you call `Initialize(..., True)` (CreateIfNecessary = True)
*before* checking `File.Exists`, an empty DB file is created, `File.Exists` then returns
True, and your prepared database in `DirAssets` **never gets copied**. Always copy first,
then initialize with `CreateIfNecessary = False`.

```b4x
' B4X — correct order: copy the prepared DB first, THEN initialize
Private Const DB_NAME As String = "mydb.db"

#If B4J
    xui.SetDataFolder("MyApp")      ' required on B4J before DefaultFolder is valid
#End If

If File.Exists(xui.DefaultFolder, DB_NAME) = False Then
    File.Copy(File.DirAssets, DB_NAME, xui.DefaultFolder, DB_NAME)
End If

#If B4J
    SQL1.InitializeSQLite(xui.DefaultFolder, DB_NAME, False)
#Else
    SQL1.Initialize(xui.DefaultFolder, DB_NAME, False)
#End If
```

If you want SQLite to create a fresh empty DB when none exists (no prepared asset), then
`CreateIfNecessary = True` is correct and you skip the copy block entirely.

### CRUD

Static DDL has no data values → plain `ExecNonQuery` is fine. Anything with **data
values** must be parameterized with `ExecNonQuery2` / `ExecQuery2` and
**`Array As Object(...)`** (so numbers stay numbers, `Null` stays `Null`).

```b4x
' B4X — DDL: no user data, plain ExecNonQuery is correct
SQL1.ExecNonQuery("CREATE TABLE IF NOT EXISTS users " & _
    "(ID INTEGER PRIMARY KEY, Name TEXT, Age INTEGER)")

' B4X — INSERT: list columns explicitly, parameterize values, use Array As Object
SQL1.ExecNonQuery2("INSERT INTO users (Name, Age) VALUES (?, ?)", _
    Array As Object("John", 30))

' B4X — UPDATE
SQL1.ExecNonQuery2("UPDATE users SET Age = ? WHERE Name = ?", _
    Array As Object(31, "John"))

' B4X — SELECT
Dim rs As ResultSet = SQL1.ExecQuery2("SELECT ID, Name, Age FROM users WHERE Age > ?", _
    Array As Object(25))
Do While rs.NextRow
    Dim id As Long = rs.GetLong("ID")
    Dim name As String = rs.GetString("Name")
    Dim age As Int = rs.GetInt("Age")
Loop
rs.Close       ' always close the ResultSet

' B4X — DELETE
SQL1.ExecNonQuery2("DELETE FROM users WHERE ID = ?", Array As Object(id))
```

Why explicit columns: `INSERT INTO users VALUES (...)` breaks the moment the schema
changes (added column, reordered). Naming columns is robust and self-documenting.

### Rules

- Use **`ResultSet`** (cross-platform), not `Cursor` (B4A-only).
- Wrap bulk writes in a transaction — ~10× faster:

```b4x
' B4X
SQL1.BeginTransaction
Try
    For i = 1 To 1000
        SQL1.ExecNonQuery2("INSERT INTO users (Name, Age) VALUES (?, ?)", _
            Array As Object("User" & i, Rnd(18, 65)))
    Next
    SQL1.TransactionSuccessful
Catch
    Log(LastException.Message)
End Try
SQL1.EndTransaction
```

### Async queries (resumable)

```b4x
' B4X — batch write
For i = 1 To 1000
    SQL1.AddNonQueryToBatch("INSERT INTO users (Name, Age) VALUES (?, ?)", _
        Array As Object("User" & i, Rnd(18, 65)))
Next
Dim sf As Object = SQL1.ExecNonQueryBatch("SQL")
Wait For (sf) SQL_NonQueryComplete (Success As Boolean)

' B4X — async read
Dim sf2 As Object = SQL1.ExecQueryAsync("SQL", "SELECT * FROM users", Null)
Wait For (sf2) SQL_QueryComplete (Success As Boolean, rs As ResultSet)
If Success Then
    Do While rs.NextRow
        ' process
    Loop
    rs.Close
End If
```

## Files I/O

```b4x
' B4X — location
xui.SetDataFolder("MyApp")            ' B4J requirement
Dim dir As String = xui.DefaultFolder ' private app data (see caveat in b4xpages-and-xui.md)

If File.Exists(dir, "f.txt") Then ...
Dim text As String = File.ReadString(dir, "f.txt")
Dim list As List = File.ReadList(dir, "f.txt")
Dim map As Map = File.ReadMap(dir, "f.txt")
File.WriteString(dir, "f.txt", text)
File.Copy(srcDir, srcFile, dstDir, dstFile)
File.Delete(dir, "f.txt")
```

For simple key/value app settings, prefer the **KeyValueStore** library over hand-writing
a settings map to disk — it handles serialization and typing for you. Use
`TextReader`/`TextWriter` only when you need a specific non-UTF-8 encoding; for plain
UTF-8 use `File.ReadString`/`File.ReadList`, and for network streams use `AsyncStreams`.

## JSON

Everyday B4X: `JSONParser` to read, `JSONGenerator` to write, `CreateMap` to build the
object literally.

```b4x
' B4X — parse
Dim parser As JSONParser
parser.Initialize(jsonText)
Dim root As Map = parser.NextObject
Dim items As List = root.Get("items")
For Each item As Map In items
    Log(item.Get("name"))
Next
```

```b4x
' B4X — generate (initialize the generator WITH the map, then ToString)
Dim gen As JSONGenerator
gen.Initialize(CreateMap( _
    "name": "John", _
    "roles": Array As String("admin", "user")))
Dim jsonString As String = gen.ToString
```

> You cannot cast a `Map` straight to `JSONGenerator` (e.g. `map.As(JSONGenerator)` is
> invalid). Always `gen.Initialize(map)` then `gen.ToString`.

For serializing arbitrary B4X objects between B4X apps (not for external APIs), use
`B4XSerializator` instead of JSON.
