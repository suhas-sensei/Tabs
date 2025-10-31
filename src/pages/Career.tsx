import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { Model as MapModel } from '../models/Map'
import { Model as Car1Model } from '../models/Car1'
import * as THREE from 'three'
import type { CarState } from '../carPhysics'
import { updateCarPhysics, getGroundHeight } from '../carPhysics'

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

function CarController({ position: initialPosition, rotation: initialRotation, scale, onPositionChange, mapRef }: CarControllerProps) {
  const carRef = useRef<THREE.Group>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  // Initialize car state with physics
  const carState = useRef<CarState>({
    velocity: new THREE.Vector3(0, 0, 0),
    angularVelocity: 0,
    position: new THREE.Vector3(...initialPosition),
    rotation: initialRotation[1]
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

    // Update car Y position to follow terrain elevation
    if (mapRef?.current) {
      const groundHeight = getGroundHeight(
        carState.current.position,
        [mapRef.current]
      )

      if (groundHeight !== null) {
        carState.current.position.y = groundHeight
      }
    }

    // Apply updated state to car
    carRef.current.position.copy(carState.current.position)
    carRef.current.rotation.y = carState.current.rotation

    // Notify parent of position change
    if (onPositionChange) {
      onPositionChange(carState.current.position)
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
  const mapRef = useRef<THREE.Group>(null)

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
            mapRef={mapRef}
          />
        </Suspense>

        <Environment preset="sunset" />

        {/* Ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
      </Canvas>

      {/* UI Overlay */}
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
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>CAREER MODE</h1>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>Starting Position: (31137.9, 10, -10333.3)</p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>Map Position: (800, 0, 800)</p>
        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '15px' }}>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#4fc3f7' }}>CURRENT POSITION:</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            X: {currentPosition.x.toFixed(1)} | Y: {currentPosition.y.toFixed(1)} | Z: {currentPosition.z.toFixed(1)}
          </p>
        </div>
        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '15px' }}>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#4fc3f7' }}>CONTROLS:</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>W - Move Forward</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>S - Move Backward</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>A - Turn Left</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>D - Turn Right</p>
          <p style={{ margin: '10px 0 5px 0', fontSize: '13px', color: '#4fc3f7', fontWeight: 'bold' }}>Camera follows car automatically</p>
        </div>
      </div>
    </div>
  )
}

export default Career
