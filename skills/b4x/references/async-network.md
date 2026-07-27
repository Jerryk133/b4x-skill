# Async, Resumable Subs & Networking

Any sub containing `Sleep` or `Wait For` becomes a **resumable sub**: it yields control,
lets the UI update / the event arrive, then resumes.

## Sleep

```b4x
' B4X — non-blocking pause; UI updates during it
For i = 1 To 100
    Label1.Text = i
    Sleep(100)      ' 100 ms
Next
```

`Sleep(0)` is the modern replacement for the deprecated `DoEvents`.

## Wait For

`Wait For` suspends until a named event fires. **Always add the Sender filter** —
`Wait For (senderObject) EventName(...)` — so that concurrent operations don't resume the
wrong sub.

```b4x
' B4X
Dim sf As Object = xui.Msgbox2Async("Delete?", "Title", "Yes", "", "No", Null)
Wait For (sf) Msgbox_Result (Result As Int)   ' (sf) = only this dialog resumes us
If Result = xui.DialogResponse_Positive Then
    ' delete
End If
```

### Returning a value from a resumable sub

```b4x
' B4X
Sub Button1_Click
    Wait For (Sum(1, 2)) Complete (Result As Int)
    Log("Result: " & Result)
End Sub

Sub Sum(a As Int, b As Int) As ResumableSub
    Sleep(100)
    Return a + b
End Sub
```

### Sleep vs CallSubDelayed — not interchangeable

- `Sleep(x)` / `Wait For` suspend the **current** resumable sub and resume it in place.
- `CallSubDelayed` / `CallSubDelayed2` invoke **another** sub (possibly in another module)
  asynchronously; the caller does **not** wait for a return value.

Use `Sleep(x)` to defer *within the same flow*. Use `CallSubDelayed` to hand off to a
different sub/module (e.g. raising a custom-view event to its owner). Don't reach for
`CallSubDelayed` just to "wait" — that's what `Sleep`/`Wait For` are for, and it's what
lets you get a return value via `ResumableSub`.

## HttpJob — robust pattern

Network calls fail (timeouts, no connectivity, non-2xx). Always check `job.Success`,
read `job.ErrorMessage` on failure, and **call `job.Release` on both paths**.

```b4x
' B4X — robust async HTTP
Dim job As HttpJob
job.Initialize("", Me)
job.Download("https://api.example.com/data")
Wait For (job) JobDone(job As HttpJob)
If job.Success Then
    Dim result As String = job.GetString      ' or job.GetBitmap / job.GetInputStream
    ' ... use result
Else
    Log("HTTP error: " & job.ErrorMessage)
End If
job.Release        ' ALWAYS — success AND failure
```

Requires the **OkHttpUtils2** library (`HttpJob`, `OkHttpClient`). For POST:

```b4x
' B4X
job.PostString("https://api.example.com/items", $"{"name":"John"}"$)
job.GetRequest.SetContentType("application/json")
```

## Timer

```b4x
' B4X
Private Timer1 As Timer
Timer1.Initialize("Timer1", 1000)   ' 1 second
Timer1.Enabled = True

Sub Timer1_Tick
    ' fires every second while enabled
End Sub
```

Prefer `Sleep`/`Wait For` loops for one-off delays; use `Timer` for genuine recurring
ticks.
