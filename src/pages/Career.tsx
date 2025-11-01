import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { Model as MapModel } from '../models/Map'
import { Model as Car1Model } from '../models/Car1'
import * as THREE from 'three'
import type { CarState } from '../carPhysics'
import { updateCarPhysics, getGroundHeight, updateVerticalPhysics } from '../carPhysics'

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

interface CarControllerProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onPositionChange?: (position: THREE.Vector3) => void
  onRotationChange?: (rotation: number) => void
  onTireMarksUpdate?: (marks: TireMark[]) => void
  mapRef?: React.RefObject<THREE.Group | null>
}

// Camera follow component
function CameraFollow({ target }: { target: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree()
  const cameraOffset = useRef(new THREE.Vector3(0, 112, -300)) // Camera position behind car
  const targetPosition = useRef(new THREE.Vector3())
  const currentPosition = useRef(new THREE.Vector3())
  const lookAtPosition = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!target.current) return

    // Calculate desired camera position behind the car
    const carPosition = target.current.position
    const carRotation = target.current.rotation.y

    // Position camera close behind and low (intimate rear view like NFS)
    targetPosition.current.x = carPosition.x - Math.sin(carRotation) * cameraOffset.current.z
    targetPosition.current.y = carPosition.y + cameraOffset.current.y
    targetPosition.current.z = carPosition.z - Math.cos(carRotation) * cameraOffset.current.z

    // Smooth camera movement (lerp)
    currentPosition.current.lerp(targetPosition.current, 0.1)
    camera.position.copy(currentPosition.current)

    // Look back at the car (camera is in front, looking backward)
    lookAtPosition.current.x = carPosition.x - Math.sin(carRotation) * 20
    lookAtPosition.current.y = carPosition.y + 5
    lookAtPosition.current.z = carPosition.z - Math.cos(carRotation) * 20

    camera.lookAt(lookAtPosition.current)
  })

  return null
}

// Minimap camera - top-down view that rotates with car
function MinimapCamera({ position, rotation }: { position: THREE.Vector3, rotation: number }) {
  const { camera } = useThree()

  useFrame(() => {
    // Position camera directly above the car
    camera.position.set(position.x, position.y + 3000, position.z)
    // Look straight down at the car
    camera.lookAt(position.x, position.y, position.z)

    // Rotate the camera's up vector to match car rotation
    // This makes the map rotate so the car always points "up" on the minimap
    const upX = Math.sin(rotation)
    const upZ = Math.cos(rotation)
    camera.up.set(upX, 0, upZ)
  })

  return null
}

// Static fullmap camera - shows entire map with drag support
function FullMapCamera({ offset }: { offset: { x: number, z: number } }) {
  const { camera } = useThree()

  useFrame(() => {
    // Camera position with drag offset
    camera.position.set(800 + offset.x, 5000, 800 + offset.z)
    camera.lookAt(800 + offset.x, 0, 800 + offset.z)
    camera.up.set(0, 0, 1)
  })

  return null
}

// Blinking arrow indicator for fullscreen map
function BlinkingArrow({ position, rotation }: { position: THREE.Vector3, rotation: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    // Pulsing effect using sine wave
    const pulseScale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3
    const opacity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.5

    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulseScale)
    }
    if (glowRef.current && glowRef.current.material) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = opacity
    }
  })

  return (
    <group position={[position.x, position.y + 200, position.z]} rotation={[0, rotation, 0]}>
      {/* Main purple arrow */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[200, 350, 3]} />
        <meshBasicMaterial color="#bb00ff" />
      </mesh>
      {/* Pulsing purple glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[280, 450, 3]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} />
      </mesh>
      {/* White core for visibility */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <coneGeometry args={[120, 200, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Tire marks component - shows skid marks when braking
interface TireMark {
  leftPosition: THREE.Vector3
  rightPosition: THREE.Vector3
  rotation: number
  timestamp: number
}

function TireMarks({ marks }: { marks: TireMark[] }) {
  const meshRefs = useRef<THREE.Mesh[]>([])

  useFrame(() => {
    // Fade out old tire marks over time
    const currentTime = Date.now()
    meshRefs.current.forEach((mesh, index) => {
      if (mesh && marks[Math.floor(index / 2)]) {
        const age = currentTime - marks[Math.floor(index / 2)].timestamp
        const maxAge = 8000 // Fade over 8 seconds
        const opacity = Math.max(0, 1 - age / maxAge)
        if (mesh.material && mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = opacity
        }
      }
    })
  })

  return (
    <>
      {marks.map((mark, index) => (
        <group key={index}>
          {/* Left tire mark */}
          <mesh
            ref={(ref) => { if (ref) meshRefs.current[index * 2] = ref }}
            position={[mark.leftPosition.x, mark.leftPosition.y + 0.2, mark.leftPosition.z]}
            rotation={[-Math.PI / 2, 0, mark.rotation]}
          >
            <planeGeometry args={[8, 15]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          {/* Right tire mark */}
          <mesh
            ref={(ref) => { if (ref) meshRefs.current[index * 2 + 1] = ref }}
            position={[mark.rightPosition.x, mark.rightPosition.y + 0.2, mark.rightPosition.z]}
            rotation={[-Math.PI / 2, 0, mark.rotation]}
          >
            <planeGeometry args={[8, 15]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function CarController({ position: initialPosition, rotation: initialRotation, scale, onPositionChange, onRotationChange, onTireMarksUpdate, mapRef }: CarControllerProps) {
  const carRef = useRef<THREE.Group>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const tireMarks = useRef<TireMark[]>([])
  const lastMarkTime = useRef<number>(0)

  // Initialize car state with physics
  const carState = useRef<CarState>({
    velocity: new THREE.Vector3(0, 0, 0),
    angularVelocity: 0,
    position: new THREE.Vector3(...initialPosition),
    rotation: initialRotation[1],
    verticalVelocity: 0
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_state, delta) => {
    if (!carRef.current) return

    // Prepare controls for physics update
    const controls = {
      forward: keysPressed.current['w'] || false,
      backward: keysPressed.current['s'] || false,
      left: keysPressed.current['a'] || false,
      right: keysPressed.current['d'] || false,
    }

    // Update physics with delta multiplier for smooth movement
    const deltaMultiplier = delta * 60 // Normalize to 60fps
    carState.current = updateCarPhysics(carState.current, controls, deltaMultiplier)

    // Update car Y position to follow terrain elevation with velocity-based physics
    if (mapRef?.current) {
      const groundHeight = getGroundHeight(
        carState.current.position,
        [mapRef.current]
      )

      if (groundHeight !== null) {
        // Use spring-damper physics for smooth, realistic suspension behavior
        const verticalUpdate = updateVerticalPhysics(
          carState.current.position.y,
          groundHeight,
          carState.current.verticalVelocity,
          deltaMultiplier
        )

        // Apply the smooth vertical physics
        carState.current.position.y = verticalUpdate.y
        carState.current.verticalVelocity = verticalUpdate.verticalVelocity
      }
    }

    // Detect braking and create tire marks
    const currentSpeed = Math.sqrt(
      carState.current.velocity.x * carState.current.velocity.x +
      carState.current.velocity.z * carState.current.velocity.z
    )
    const isBraking = controls.backward && currentSpeed > 5 // Braking while moving forward
    const currentTime = Date.now()

    // Create tire marks every 50ms while braking
    if (isBraking && currentTime - lastMarkTime.current > 50) {
      // Calculate tire positions (left and right wheels)
      const tireWidth = 100 // Distance between left and right tires
      const rightDir = new THREE.Vector3(
        Math.cos(carState.current.rotation),
        0,
        -Math.sin(carState.current.rotation)
      )

      const leftPos = carState.current.position.clone().add(
        rightDir.clone().multiplyScalar(-tireWidth / 2)
      )
      const rightPos = carState.current.position.clone().add(
        rightDir.clone().multiplyScalar(tireWidth / 2)
      )

      // Add new tire mark
      tireMarks.current.push({
        leftPosition: leftPos,
        rightPosition: rightPos,
        rotation: carState.current.rotation,
        timestamp: currentTime,
      })

      // Keep only recent marks (last 200 marks = ~10 seconds at 50ms interval)
      if (tireMarks.current.length > 200) {
        tireMarks.current.shift()
      }

      lastMarkTime.current = currentTime

      // Notify parent to update tire marks
      if (onTireMarksUpdate) {
        onTireMarksUpdate([...tireMarks.current])
      }
    }

    // Apply updated state to car
    carRef.current.position.copy(carState.current.position)
    carRef.current.rotation.y = carState.current.rotation

    // Notify parent of position and rotation changes
    if (onPositionChange) {
      onPositionChange(carState.current.position)
    }
    if (onRotationChange) {
      onRotationChange(carState.current.rotation)
    }
  })

  return (
    <>
      <group ref={carRef}>
        <Car1Model scale={scale} rotation={initialRotation} />
      </group>
      <CameraFollow target={carRef} />
    </>
  )
}

function Career() {
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3>(new THREE.Vector3(31137.9, 10, -10333.3))
  const [currentRotation, setCurrentRotation] = useState<number>(Math.PI / 2)
  const [showFullMap, setShowFullMap] = useState<boolean>(false)
  const [mapOffset, setMapOffset] = useState<{ x: number, z: number }>({ x: 0, z: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const [tireMarks, setTireMarks] = useState<TireMark[]>([])
  const mapRef = useRef<THREE.Group>(null)

  // Handle M key to toggle full map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        setShowFullMap(prev => {
          const newValue = !prev
          // When opening the map, center it on the car's current position
          if (newValue) {
            setMapOffset({
              x: currentPosition.x - 5000,
              z: currentPosition.z - 15000
            })
          }
          return newValue
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPosition])

  // Handle mouse dragging on full map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    // Convert screen space delta to world space (scale factor based on zoom)
    const scaleFactor = 50 // Adjust sensitivity
    setMapOffset(prev => ({
      x: prev.x + deltaX * scaleFactor,
      z: prev.z + deltaY * scaleFactor
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)',
    }}>
      <Canvas
        shadows
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Camera will be controlled by CameraFollow component */}
        <PerspectiveCamera makeDefault position={[31137.9, 55, -10413.3]} fov={75} far={100000} />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[1000, 500, 1000]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={2000}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
        />
        <hemisphereLight args={['#87CEEB', '#68A0B0', 0.5]} />

        <Suspense fallback={<Loader />}>
          {/* Map at position (800, 0, 800) */}
          <group ref={mapRef}>
            <MapModel position={[800, 0, 800]} scale={1} />
          </group>

          {/* White car (Car1 - 1962 Pontiac Catalina) with WASD controls */}
          <CarController
            key="car-31137-10-n10333"
            position={[31137.9, 20, -10333.3]}
            scale={60}
            rotation={[0, Math.PI/2, 0]}
            onPositionChange={setCurrentPosition}
            onRotationChange={setCurrentRotation}
            onTireMarksUpdate={setTireMarks}
            mapRef={mapRef}
          />

          {/* Render tire marks */}
          <TireMarks marks={tireMarks} />
        </Suspense>

        <Environment preset="sunset" />

        {/* Ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
      </Canvas>

      {/* UI Overlay - Top Left Info */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        zIndex: 10,
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '20px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
      }}>

        <p style={{ margin: '5px 0', fontSize: '16px' }}>Starting Position: (31137.9, 10, -10333.3)</p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>Map Position: (800, 0, 800)</p>
        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '15px' }}>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#4fc3f7' }}>CURRENT POSITION:</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            X: {currentPosition.x.toFixed(1)} | Y: {currentPosition.y.toFixed(1)} | Z: {currentPosition.z.toFixed(1)}
          </p>
        </div>

      </div>

      {/* Full Map Overlay */}
      {showFullMap && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div style={{
            width: '90vw',
            height: '90vh',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <Canvas
              orthographic
              camera={{
                position: [800, 5000, 800],
                zoom: 0.02,
                near: 0.1,
                far: 20000
              }}
              style={{ width: '100%', height: '100%' }}
              gl={{ alpha: false, antialias: true }}
            >
              <FullMapCamera offset={mapOffset} />
              <ambientLight intensity={1.2} />
              <directionalLight position={[800, 10000, 800]} intensity={1.8} color="#ffffff" />

              <Suspense fallback={null}>
                <MapModel position={[800, 0, 800]} scale={1} />

                {/* Blinking blue arrow showing current location */}
                <BlinkingArrow position={currentPosition} rotation={currentRotation} />
              </Suspense>
            </Canvas>

            {/* Close instruction */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              padding: '15px 30px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '10px',
              pointerEvents: 'none',
            }}>
              Press M to close map
            </div>
          </div>
        </div>
      )}

      {/* Minimap - Bottom Left (GTA-style) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 10,
        width: '280px',
        height: '200px',
        border: '3px solid rgba(40, 40, 40, 0.9)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0,0,0,0.5)',
      }}>
        <Canvas
          orthographic
          camera={{
            position: [currentPosition.x, 3000, currentPosition.z],
            zoom: 0.06,
            near: 0.1,
            far: 10000
          }}
          style={{ width: '100%', height: '100%' }}
          gl={{ alpha: false, antialias: true }}
        >
          <MinimapCamera position={currentPosition} rotation={currentRotation} />
          <ambientLight intensity={1.0} />
          <directionalLight position={[currentPosition.x, 5000, currentPosition.z]} intensity={1.2} color="#ffffff" />

          <Suspense fallback={null}>
            {/* Map in minimap */}
            <MapModel position={[800, 0, 800]} scale={1} />

            {/* Car indicator - Simple triangle like GTA */}
            <group position={[currentPosition.x, currentPosition.y + 120, currentPosition.z]} rotation={[0, currentRotation, 0]}>
              {/* Main triangle */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[25, 45, 3]} />
                <meshBasicMaterial color="#4dd2ff" />
              </mesh>
              {/* Border/outline */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                <coneGeometry args={[28, 48, 3]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default Career
