import { useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, SSAO, ToneMapping } from '@react-three/postprocessing'
import { Model as Car1Model } from '../models/Car1'
import { Model as Car2Model } from '../models/Car2'
import { Model as Car3Model } from '../models/Car3'
import { Model as Car4Model } from '../models/Car4'
import { Model as Car5Model } from '../models/Car5'
import { Model as Car6Model } from '../models/Car6'

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

const cars = [
  {
    id: 1,
    Model: Car1Model,
    name: '1962 Pontiac Catalina',
    scale: 0.9,
    position: [-5, -1, 0] as [number, number, number],
    rotation: [-0.25, -Math.PI / -0.79, -0.1] as [number, number, number],
    shadowPosition: [-5, -0.9, 0] as [number, number, number],
    lightPosition: [-5, 8, 0] as [number, number, number]
  },
  {
    id: 2,
    Model: Car2Model,
    name: 'McLaren W1',
    scale: 1.3,
    position: [-5.4, -1, 0] as [number, number, number],
    rotation: [-0.11, - Math.PI /0.8, -0.1] as [number, number, number],
    shadowPosition: [-5.4, -1, 0] as [number, number, number],
    lightPosition: [-5.4, 8, 0] as [number, number, number]
  },
  {
    id: 3,
    Model: Car3Model,
    name: 'Car 3',
    scale: 1.1,
    position: [-5.3, -1, 0] as [number, number, number],
    rotation: [-0.11, -Math.PI / 3.8, 0.15] as [number, number, number],
    shadowPosition: [-5.3, -1.1, 0] as [number, number, number],
    lightPosition: [-5.3, 8, 0] as [number, number, number]
  },
  {
    id: 4,
    Model: Car4Model,
    name: 'Car 4',
    scale: 1.1,
    position: [-5, -1.1, 0] as [number, number, number],
    rotation: [-0.15, - Math.PI / 4.5, 0.1] as [number, number, number],
    shadowPosition: [-5, -1, 0] as [number, number, number],
    lightPosition: [-5, 8, 0] as [number, number, number]
  },
  {
    id: 5,
    Model: Car5Model,
    name: 'Car 5',
    scale:1.1,
    position: [-5, -1, 0] as [number, number, number],
    rotation: [-0.15, - Math.PI / 4.5, 0.1] as [number, number, number],
    shadowPosition: [-5, -0.9, 0] as [number, number, number],
    lightPosition: [-5, 8, 0] as [number, number, number]
  },
  {
    id: 6,
    Model: Car6Model,
    name: 'Car 6',
    scale: 1.1,
    position: [-5.5, -1.2, 0] as [number, number, number],
    rotation: [-0.15,  Math.PI / 4.5, 0.1] as [number, number, number],
    shadowPosition: [-3.5, -1.15, 0] as [number, number, number],
    lightPosition: [-5.5, 8, 0] as [number, number, number]
  },
]

function Garage() {
  const [activeTab, setActiveTab] = useState('GARAGE')
  const [currentCarIndex, setCurrentCarIndex] = useState(0)
  const navigate = useNavigate()

  const currentCar = cars[currentCarIndex]
  const CurrentCarModel = currentCar.Model

  const handlePrevious = () => {
    setCurrentCarIndex((prev) => (prev - 1 + cars.length) % cars.length)
  }

  const handleNext = () => {
    setCurrentCarIndex((prev) => (prev + 1) % cars.length)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      backgroundImage: 'url(/garage.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <Canvas
        shadows
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <PerspectiveCamera makeDefault position={[-6, 2, 6]} fov={50} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
          target={[-8, 0, 0]}
        />
          <ambientLight intensity={0.15} />
          <directionalLight
            position={currentCar.lightPosition}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <spotLight
            position={[currentCar.position[0], 6, 2]}
            angle={0.4}
            penumbra={1}
            intensity={0.5}
            castShadow
            target-position={currentCar.position}
          />
        <Suspense fallback={<Loader />}>
          <CurrentCarModel scale={currentCar.scale} position={currentCar.position} rotation={currentCar.rotation} />
        </Suspense>
        {/* Ground plane to receive shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={currentCar.shadowPosition}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.5} color="#000000" transparent={true} />
        </mesh>
        <Environment preset="warehouse" environmentIntensity={0.3} />
        <EffectComposer>
          <SSAO
            samples={16}
            radius={0.5}
            intensity={30}
            luminanceInfluence={0.6}
          />
          <ToneMapping
            adaptive={true}
            resolution={256}
            middleGrey={0.4}
            maxLuminance={8.0}
            averageLuminance={1.0}
            adaptationRate={1.0}
          />
        </EffectComposer>
      </Canvas>
      <nav style={{
        position: 'absolute',
        top: '50px',
        left: '70px',
        display: 'flex',
        gap: '3px',
        zIndex: 10,
        fontFamily: 'Arial, Helvetica, sans-serif',
        pointerEvents: 'none',
      }}>
        <button
          style={{
            backgroundColor: activeTab === 'HOME' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'HOME' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => {
            setActiveTab('HOME')
            navigate('/')
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'HOME' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'HOME' ? '#000000' : '#ffffff'
          }}
        >
          HOME
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'GARAGE' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'GARAGE' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => {
            setActiveTab('GARAGE')
            navigate('/garage')
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'GARAGE' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'GARAGE' ? '#000000' : '#ffffff'
          }}
        >
          GARAGE
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'SHOP' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'SHOP' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => setActiveTab('SHOP')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'SHOP' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'SHOP' ? '#000000' : '#ffffff'
          }}
        >
          SHOP
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'SETTINGS' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'SETTINGS' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => setActiveTab('SETTINGS')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'SETTINGS' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'SETTINGS' ? '#000000' : '#ffffff'
          }}
        >
          SETTINGS
        </button>
      </nav>
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '70px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 19px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, Helvetica, sans-serif',
        pointerEvents: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#f7bf08ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            $
          </div>
          <span style={{
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            fontStyle: 'italic',
          }}>
            12.67K
          </span>
        </div>
        <div style={{
          width: '1px',
          height: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#ca4932ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            5
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              lineHeight: '1.2',
            }}>
              0X67EF6....9EDF
            </span>
            <span style={{
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 400,
              lineHeight: '1.2',
            }}>
              RACER
            </span>
          </div>
        </div>
      </div>

      {/* Car Navigation Arrows */}
      <button
        onClick={handlePrevious}
        style={{
          position: 'absolute',
          left: '100px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          fontSize: '60px',
          fontWeight: 'bold',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        ‹
      </button>

      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '100px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          fontSize: '60px',
          fontWeight: 'bold',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        ›
      </button>

      {/* Car Counter */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        color: '#fff',
        fontSize: '24px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 30px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '30px',
        border: '2px solid #fff',
      }}>
        {currentCarIndex + 1} / {cars.length} - {cars[currentCarIndex].name}
      </div>
    </div>
  )
}

export default Garage
