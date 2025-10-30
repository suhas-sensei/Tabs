import { useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { Model } from '../models/Car1'

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function Garage() {
  const [activeTab, setActiveTab] = useState('GARAGE')
  const navigate = useNavigate()

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
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[-5, 8, 0]}
            intensity={1.5}
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
            position={[-5, 6, 2]}
            angle={0.4}
            penumbra={1}
            intensity={1}
            castShadow
            target-position={[-5, -1, 0]}
          />
        <Suspense fallback={<Loader />}>
          <Model scale={0.9} position={[-5, -1, 0]} rotation={[-0.25, - Math.PI /-0.79, -0.1]} />
        </Suspense>
        {/* Ground plane to receive shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-5, -0.8, 0]}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.8} color="#000000" />
        </mesh>
        <Environment preset="warehouse" />
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
    </div>
  )
}

export default Garage
