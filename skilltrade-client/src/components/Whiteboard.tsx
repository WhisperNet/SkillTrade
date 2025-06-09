import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "./ui/button"
import { X, Trash2, Palette, Eraser } from "lucide-react"
import buildClient from "../../api/client"

interface DrawingAction {
  id: string
  type: "draw" | "clear"
  userId: string
  userName: string
  timestamp: Date
  data?: {
    x: number
    y: number
    prevX?: number
    prevY?: number
    color: string
    brushSize: number
  }
}

interface WhiteboardProps {
  sessionId: string
  userId: string
  currentUserName: string
  otherUserName: string
  onClose: () => void
}

export default function Whiteboard({
  sessionId,
  userId,
  currentUserName,
  otherUserName,
  onClose,
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(2)
  const [error, setError] = useState("")
  const [isEraserMode, setIsEraserMode] = useState(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastActionTimeRef = useRef<Date | null>(null)
  const isInitialLoadRef = useRef(true)

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#800000",
    "#000080",
  ]

  // Get effective drawing settings based on mode
  const getDrawingSettings = () => {
    if (isEraserMode) {
      return {
        color: "#FFFFFF", // White color to erase
        size: Math.max(brushSize * 2, 10), // Larger size for erasing
      }
    }
    return {
      color: currentColor,
      size: brushSize,
    }
  }

  // Toggle between pen and eraser
  const toggleEraser = () => {
    setIsEraserMode(!isEraserMode)
  }

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Set canvas background to white
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set drawing properties
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  // Send drawing action to backend
  const sendDrawingAction = async (type: "draw" | "clear", data?: any) => {
    try {
      const client = buildClient({ req: undefined })
      const response = await client.post(`/api/connections/active/${sessionId}/whiteboard`, {
        type,
        data,
      })

      const action = response.data
      lastActionTimeRef.current = new Date(action.timestamp)
      setError("")
    } catch (err: any) {
      console.error("Failed to send drawing action:", err)
      setError("Failed to sync drawing")
    }
  }

  // Fetch and apply drawing actions
  const fetchDrawingActions = async (since?: Date) => {
    try {
      const client = buildClient({ req: undefined })
      const params = since ? `?since=${since.toISOString()}` : ""
      const response = await client.get(`/api/connections/active/${sessionId}/whiteboard${params}`)

      const actions: DrawingAction[] = response.data.map((action: any) => ({
        ...action,
        timestamp: new Date(action.timestamp),
      }))

      if (actions.length > 0) {
        applyDrawingActions(actions, since !== undefined)
        lastActionTimeRef.current = actions[actions.length - 1].timestamp
      }

      setError("")
    } catch (err: any) {
      console.error("Failed to fetch drawing actions:", err)
      setError("Failed to load whiteboard")
    }
  }

  // Apply drawing actions to canvas
  const applyDrawingActions = (actions: DrawingAction[], isUpdate: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // If it's initial load, clear the canvas first
    if (!isUpdate) {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    actions.forEach(action => {
      if (action.type === "clear") {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (action.type === "draw" && action.data) {
        ctx.strokeStyle = action.data.color
        ctx.lineWidth = action.data.brushSize

        ctx.beginPath()
        if (action.data.prevX !== undefined && action.data.prevY !== undefined) {
          ctx.moveTo(action.data.prevX, action.data.prevY)
          ctx.lineTo(action.data.x, action.data.y)
        } else {
          ctx.moveTo(action.data.x, action.data.y)
          ctx.lineTo(action.data.x, action.data.y)
        }
        ctx.stroke()
      }
    })
  }

  // Mouse event handlers
  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const settings = getDrawingSettings()

      setIsDrawing(true)

      // Draw a dot for single click
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = settings.color
        ctx.lineWidth = settings.size
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      // Send drawing action
      sendDrawingAction("draw", {
        x,
        y,
        color: settings.color,
        brushSize: settings.size,
      })
    },
    [currentColor, brushSize, isEraserMode, sessionId]
  )

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const settings = getDrawingSettings()

      const ctx = canvas.getContext("2d")
      if (ctx) {
        const prevX = e.clientX - rect.left - e.movementX
        const prevY = e.clientY - rect.top - e.movementY

        ctx.strokeStyle = settings.color
        ctx.lineWidth = settings.size
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()

        // Send drawing action
        sendDrawingAction("draw", {
          x,
          y,
          prevX,
          prevY,
          color: settings.color,
          brushSize: settings.size,
        })
      }
    },
    [isDrawing, currentColor, brushSize, isEraserMode, sessionId]
  )

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  // Clear whiteboard
  const clearWhiteboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    await sendDrawingAction("clear")
  }

  // Polling for updates
  useEffect(() => {
    // Initial fetch
    fetchDrawingActions()

    // Set up polling every 1 second
    pollingRef.current = setInterval(() => {
      if (lastActionTimeRef.current) {
        fetchDrawingActions(lastActionTimeRef.current)
      }
    }, 1000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [sessionId])

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shared Whiteboard</h3>
          <p className="text-sm text-gray-600">Drawing with {otherUserName}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tools */}
      <div className="p-4 border-b bg-gray-50 flex items-center gap-4 flex-wrap">
        {/* Drawing Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={!isEraserMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEraserMode(false)}
            className="flex items-center gap-1"
          >
            <Palette className="h-3 w-3" />
            Pen
          </Button>
          <Button
            variant={isEraserMode ? "default" : "outline"}
            size="sm"
            onClick={toggleEraser}
            className="flex items-center gap-1"
          >
            <Eraser className="h-3 w-3" />
            Eraser
          </Button>
        </div>

        {/* Color Picker (only show in pen mode) */}
        {!isEraserMode && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Color:</span>
            <div className="flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Brush/Eraser Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{isEraserMode ? "Eraser" : "Brush"} Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-600 w-6">
            {isEraserMode ? Math.max(brushSize * 2, 10) : brushSize}
          </span>
        </div>

        {/* Clear Button */}
        <Button onClick={clearWhiteboard} variant="outline" size="sm" className="ml-auto">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className={`block ${isEraserMode ? "cursor-grab" : "cursor-crosshair"}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {error && (
          <div className="text-center text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {isEraserMode
            ? "Click and drag to erase • Switch to pen mode to draw"
            : "Click and drag to draw • Use eraser to remove • Changes sync automatically"}
        </div>
      </div>
    </div>
  )
}
