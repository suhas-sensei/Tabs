import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('HOME')

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      backgroundImage: 'url(/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1,
      }}></div>
      <nav style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '0',
        zIndex: 10,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        <button
          style={{
            backgroundColor: activeTab === 'HOME' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => setActiveTab('HOME')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeTab === 'HOME' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'}
        >
          HOME
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'GARAGE' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => setActiveTab('GARAGE')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeTab === 'GARAGE' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'}
        >
          GARAGE
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'SHOP' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => setActiveTab('SHOP')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeTab === 'SHOP' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'}
        >
          SHOP
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'SETTINGS' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.18)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => setActiveTab('SETTINGS')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeTab === 'SETTINGS' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'}
        >
          SETTINGS
        </button>
      </nav>
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        height: '100%',
      }}>
        {/* Content will go here */}
      </div>
    </div>
  )
}

export default App
