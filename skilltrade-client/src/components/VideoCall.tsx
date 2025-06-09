import { useEffect, useState, useRef } from "react"
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng"
import { Button } from "./ui/button"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Palette } from "lucide-react"
import Whiteboard from "./Whiteboard"
import buildClient from "../../api/client"

interface VideoCallProps {
  appId: string
  channelName: string
  token: string
  uid: number
  role: "host" | "audience"
  onLeave: () => void
  currentUserName: string
  otherUserName: string
  sessionId: string
  userId: string
}

export default function VideoCall({
  appId,
  channelName,
  token,
  uid,
  role,
  onLeave,
  currentUserName,
  otherUserName,
  sessionId,
  userId,
}: VideoCallProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null)
  const [localTracks, setLocalTracks] = useState<{
    videoTrack: ICameraVideoTrack | null
    audioTrack: IMicrophoneAudioTrack | null
  }>({
    videoTrack: null,
    audioTrack: null,
  })
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)

  // Use refs to store current track references for cleanup
  const localTracksRef = useRef(localTracks)
  localTracksRef.current = localTracks

  const clientRef = useRef(client)
  clientRef.current = client

  // Clear whiteboard function
  const clearWhiteboard = async () => {
    try {
      const client = buildClient({ req: undefined })
      await client.post(`/api/connections/active/${sessionId}/whiteboard`, {
        type: "clear",
      })
      console.log("Whiteboard cleared successfully")
    } catch (error) {
      console.error("Failed to clear whiteboard:", error)
    }
  }

  useEffect(() => {
    const init = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
      setClient(agoraClient)

      // Handle user published events
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType)
        if (mediaType === "video") {
          setRemoteUsers(prev => {
            const existingUser = prev.find(u => u.uid === user.uid)
            if (existingUser) {
              return prev.map(u => (u.uid === user.uid ? user : u))
            }
            return [...prev, user]
          })
        }
        if (mediaType === "audio") {
          user.audioTrack?.play()
        }
      })

      // Handle user left events
      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
        }
      })

      // Handle user left channel
      agoraClient.on("user-left", user => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
      })

      // Join the channel
      await agoraClient.join(appId, channelName, token, uid)
      setIsJoined(true)

      // Create and publish local tracks for both users (two-way interaction)
      try {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        setLocalTracks({ audioTrack, videoTrack })
        await agoraClient.publish([audioTrack, videoTrack])
      } catch (error) {
        console.error("Failed to create local tracks:", error)
      }
    }

    init()

    return () => {
      // Cleanup function using refs to get current values
      const cleanup = async () => {
        if (localTracksRef.current.audioTrack) {
          localTracksRef.current.audioTrack.close()
        }
        if (localTracksRef.current.videoTrack) {
          localTracksRef.current.videoTrack.close()
        }
        if (clientRef.current) {
          await clientRef.current.leave()
        }
      }
      cleanup()
    }
  }, [appId, channelName, token, uid])

  const handleLeaveCall = async () => {
    // Clear whiteboard before leaving call
    await clearWhiteboard()

    // Clean up tracks before leaving
    if (localTracks.audioTrack) {
      localTracks.audioTrack.close()
    }
    if (localTracks.videoTrack) {
      localTracks.videoTrack.close()
    }
    if (client) {
      await client.leave()
    }

    // Reset state
    setLocalTracks({ audioTrack: null, videoTrack: null })
    setRemoteUsers([])
    setClient(null)
    setIsJoined(false)

    // Call parent's onLeave
    onLeave()
  }

  const toggleAudio = () => {
    if (localTracks.audioTrack) {
      const newMutedState = !isAudioMuted
      localTracks.audioTrack.setEnabled(!newMutedState)
      setIsAudioMuted(newMutedState)
    }
  }

  const toggleVideo = () => {
    if (localTracks.videoTrack) {
      const newMutedState = !isVideoMuted
      localTracks.videoTrack.setEnabled(!newMutedState)
      setIsVideoMuted(newMutedState)
    }
  }

  const toggleWhiteboard = () => {
    setShowWhiteboard(!showWhiteboard)
  }

  const getUserLabel = (isLocalUser: boolean) => {
    if (isLocalUser) {
      return role === "host" ? "Teaching" : "Learning"
    } else {
      return role === "host" ? "Learning" : "Teaching"
    }
  }

  const getUserName = (isLocalUser: boolean) => {
    return isLocalUser ? currentUserName : otherUserName
  }

  return (
    <div className="relative w-full h-full bg-gray-900 flex">
      {/* Video Section */}
      <div className={`${showWhiteboard ? "w-1/2" : "w-full"} transition-all duration-300`}>
        {/* Two-User Video Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 h-full">
          {/* Local Video */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {localTracks.videoTrack ? (
              <div
                ref={el => {
                  if (el && localTracks.videoTrack) {
                    localTracks.videoTrack.play(el)
                  }
                }}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera not available</p>
                </div>
              </div>
            )}

            {/* Local User Info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <div className="text-sm font-medium">{getUserName(true)}</div>
              <div className="text-xs text-blue-300">You • {getUserLabel(true)}</div>
            </div>

            {/* Mute Indicators */}
            <div className="absolute top-4 right-4 flex gap-2">
              {isAudioMuted && (
                <div className="bg-red-500 text-white p-1 rounded">
                  <MicOff className="h-4 w-4" />
                </div>
              )}
              {isVideoMuted && (
                <div className="bg-red-500 text-white p-1 rounded">
                  <VideoOff className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {remoteUsers.length > 0 && remoteUsers[0].videoTrack ? (
              <div
                ref={el => {
                  if (el && remoteUsers[0]?.videoTrack) {
                    remoteUsers[0].videoTrack.play(el)
                  }
                }}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  {isJoined ? (
                    <>
                      <Video className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Waiting for {otherUserName} to join...</p>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Connecting...</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Remote User Info */}
            {remoteUsers.length > 0 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                <div className="text-sm font-medium">{getUserName(false)}</div>
                <div className="text-xs text-green-300">{getUserLabel(false)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Whiteboard Section */}
      {showWhiteboard && (
        <div className="w-1/2 border-l border-gray-700">
          <Whiteboard
            sessionId={sessionId}
            userId={userId}
            currentUserName={currentUserName}
            otherUserName={otherUserName}
            onClose={() => setShowWhiteboard(false)}
          />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black bg-opacity-50 px-6 py-3 rounded-full backdrop-blur-sm">
        <Button
          variant={isAudioMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleAudio}
          disabled={!localTracks.audioTrack}
          className="rounded-full"
        >
          {isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          variant={isVideoMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleVideo}
          disabled={!localTracks.videoTrack}
          className="rounded-full"
        >
          {isVideoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>

        <Button
          variant={showWhiteboard ? "default" : "secondary"}
          size="icon"
          onClick={toggleWhiteboard}
          className="rounded-full"
        >
          <Palette className="h-4 w-4" />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleLeaveCall}
          className="rounded-full"
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${isJoined ? "bg-green-400" : "bg-yellow-400"}`}
          ></div>
          {isJoined ? "Connected" : "Connecting..."}
        </div>
      </div>
    </div>
  )
}
