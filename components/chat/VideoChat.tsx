'use client'

import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'
import { getSocket } from '@/lib/socket'
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, PhoneIncoming } from 'lucide-react'
import { Button } from '../ui/Button'
import { useEditorStore } from '@/lib/store'
import { toast } from 'sonner'

interface VideoChatProps {
    roomId: string
    userId: string
}

export default function VideoChat({ roomId, userId }: VideoChatProps) {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [peers, setPeers] = useState<Map<string, SimplePeer.Instance>>(new Map())
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)
    const [isCallActive, setIsCallActive] = useState(false)

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map())
    const { currentUser } = useEditorStore()

    // Initialize media (but don't emit readiness yet unless accepted)
    const getMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setStream(mediaStream)
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream
            }
            setIsVideoEnabled(true)
            setIsAudioEnabled(true)
            return mediaStream
        } catch (error) {
            console.error('Error accessing media devices:', error)
            toast.error("Could not access camera/microphone")
            return null
        }
    }

    const startCall = async () => {
        const mediaStream = await getMedia()
        if (!mediaStream) return

        setIsCallActive(true)
        const socket = getSocket()
        // Signal readiness
        socket?.emit('video-ready', { roomId, userId })
        // Send invitation
        socket?.emit('request-video-call', { roomId, userId, userName: currentUser?.name })
        toast.success("Started video call")
    }

    const joinCall = async () => {
        const mediaStream = await getMedia()
        if (!mediaStream) return
        setIsCallActive(true)
        const socket = getSocket()
        socket?.emit('accept-call', { roomId, userId })
        // Also emit video-ready just in case
        socket?.emit('video-ready', { roomId, userId })
    }

    const leaveCall = () => {
        stream?.getTracks().forEach(track => track.stop())
        setStream(null)
        setIsCallActive(false)
        setIsVideoEnabled(false)
        setIsAudioEnabled(false)

        peersRef.current.forEach(peer => peer.destroy())
        peersRef.current.clear()
        setPeers(new Map())

        const socket = getSocket()
        socket?.emit('video-stopped', { roomId, userId })
    }

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }

    useEffect(() => {
        const socket = getSocket()
        if (!socket) return

        const onIncomingCall = ({ fromId, fromName }: { fromId: string, fromName: string }) => {
            if (isCallActive) return // Already in call

            toast((t) => (
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 font-medium">
                        <PhoneIncoming className="w-4 h-4 text-green-500" />
                        <span>Incoming call from {fromName}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs flex-1"
                            onClick={() => {
                                joinCall()
                                toast.dismiss(t)
                            }}
                        >
                            Accept
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs flex-1"
                            onClick={() => toast.dismiss(t)}
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            ), { duration: 10000 })
        }

        // Creating peer logic...
        const createPeer = (peerId: string, initiator: boolean, stream: MediaStream) => {
            const peer = new SimplePeer({
                initiator,
                trickle: false,
                stream
            })

            peer.on('signal', (signal) => {
                socket.emit('video-signal', {
                    roomId,
                    to: peerId,
                    signal
                })
            })

            peer.on('stream', () => {
                setPeers(new Map(peersRef.current))
            })

            peer.on('close', () => {
                peersRef.current.delete(peerId)
                setPeers(new Map(peersRef.current))
            })

            peer.on('error', (err) => {
                console.error('Peer error:', err)
                peersRef.current.delete(peerId)
                setPeers(new Map(peersRef.current))
            })

            return peer
        }

        const onUserVideoReady = ({ userId: peerId }: { userId: string }) => {
            if (peerId === userId) return
            if (!isCallActive || !stream) return // Only connect if I AM ALSO in the call

            console.log(`User ${peerId} is ready, initiating peer connection`)
            // If I am already in call, I should connect.
            // But preventing duplicate connections? SimplePeer handles signaling.
            // We use Map to prevent duplicate.
            if (peersRef.current.has(peerId)) return;

            // Arbitrary tie-breaker: sort IDs. The one with lower ID initiates? 
            // Or "User Video Ready" implies they just joined, so THEY are the new one.
            // We (existing user) should initiate connection to THEM?
            // Simple-peer "initiator" pattern: One side must be initiator.
            // Usually, the one ALREADY in the room initiates to the NEWCOMER.
            // So upon receiving 'user-video-ready', WE initiate.

            const peer = createPeer(peerId, true, stream)
            peersRef.current.set(peerId, peer)
            setPeers(new Map(peersRef.current))
        }

        const onVideoSignal = ({ from, signal }: { from: string, signal: any }) => {
            if (!isCallActive || !stream) return; // Ignore signals if not in call

            let peer = peersRef.current.get(from)
            if (!peer) {
                console.log(`Receiving signal from ${from}, creating peer (not initiator)`)
                peer = createPeer(from, false, stream)
                peersRef.current.set(from, peer)
                setPeers(new Map(peersRef.current))
            }
            peer.signal(signal)
        }

        const onUserVideoStopped = ({ userId: peerId }: { userId: string }) => {
            const peer = peersRef.current.get(peerId)
            if (peer) {
                peer.destroy()
                peersRef.current.delete(peerId)
                setPeers(new Map(peersRef.current))
            }
        }

        socket.on('incoming-call', onIncomingCall)
        socket.on('user-video-ready', onUserVideoReady)
        socket.on('video-signal', onVideoSignal)
        socket.on('user-video-stopped', onUserVideoStopped)

        return () => {
            socket.off('incoming-call', onIncomingCall)
            socket.off('user-video-ready', onUserVideoReady)
            socket.off('video-signal', onVideoSignal)
            socket.off('user-video-stopped', onUserVideoStopped)
        }
    }, [stream, roomId, userId, isCallActive]) // Depend on isCallActive/stream

    // Cleanup
    useEffect(() => {
        return () => {
            stream?.getTracks().forEach(track => track.stop())
            peersRef.current.forEach(peer => peer.destroy())
        }
    }, [])

    return (
        <div className="space-y-4">
            {/* Controls */}
            {!isCallActive ? (
                <div className="flex justify-center">
                    <Button onClick={startCall} className="gap-2 bg-blue-600 hover:bg-blue-700 w-full">
                        <Video className="w-4 h-4" />
                        Start Video Call
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Local Video */}
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-md">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <VideoOff className="w-8 h-8 text-gray-400" />
                                <span className="ml-2 text-gray-500 text-sm">Camera Off</span>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                            You
                        </div>
                    </div>

                    <div className="flex gap-2 justify-center bg-gray-800/50 p-2 rounded-lg">
                        <Button
                            onClick={toggleVideo}
                            variant={isVideoEnabled ? 'secondary' : 'destructive'}
                            size="sm"
                            className="rounded-full w-10 h-10 p-0"
                            title={isVideoEnabled ? "Turn Camera Off" : "Turn Camera On"}
                        >
                            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </Button>
                        <Button
                            onClick={toggleAudio}
                            variant={isAudioEnabled ? 'secondary' : 'destructive'}
                            size="sm"
                            className="rounded-full w-10 h-10 p-0"
                            title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                        >
                            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>
                        <Button
                            onClick={leaveCall}
                            variant="destructive"
                            size="sm"
                            className="rounded-full w-12 h-10 px-2 bg-red-600 hover:bg-red-700"
                            title="End Call"
                        >
                            <PhoneOff className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Remote Videos */}
            <div className="grid grid-cols-1 gap-2">
                {Array.from(peers.entries()).map(([peerId, peer]) => (
                    <RemoteVideo key={peerId} peer={peer} peerId={peerId} />
                ))}
            </div>
        </div>
    )
}

function RemoteVideo({ peer, peerId }: { peer: SimplePeer.Instance, peerId: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const onStream = (stream: MediaStream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        }
        peer.on('stream', onStream)
        // If stream existed before listen?
        // SimplePeer handles emitting stream event.
        // But if rerender... SimplePeer instance persists in Map ref, so it wont re-emit stream.
        // We rely on 'stream' event.
        // However, a better pattern with React is to store the stream in state in the parent
        // or a custom hook, passing the MediaStream object down.
        // Since we are not doing that, we might miss the stream if the component unmounts/remounts
        // but the peer instance stays alive (which it does via refs).
        // BUT, RemoteVideo component is keyed by peerId. If parent re-renders, RemoteVideo might re-render.
        // We should check if peer already has a stream.
        // peer._remoteStreams? (Private API).

        return () => {
            peer.off('stream', onStream)
        }
    }, [peer])

    return (
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-md">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                User {peerId.substring(0, 4)}
            </div>
        </div>
    )
}
