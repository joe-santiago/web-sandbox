import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import Ring from './components/Ring'
import './App.css'
import { useState, useEffect } from 'react'

function Rig({ children }) {
  const { size } = useThree()
  
  useFrame((state, delta) => {
    // 1. RESPONSIVE DISTANCE
    const aspect = size.width / size.height
    const baseZ = 28
    const targetZ = aspect < 1 ? baseZ / aspect : baseZ

    // 2. MOUSE Y (Map -1..1 to 5..15)
    // This ensures the camera is always slightly above the ring
    const minHeight = 5
    const maxHeight = 15
    const targetY = THREE.MathUtils.lerp(minHeight, maxHeight, (state.pointer.y + 1) / 2)
    
    // 3. SMOOTH MOVE
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05)
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05)
    
    // 4. LOOK AT CENTER
    state.camera.lookAt(0, 0, 0)
  })
  
  return <group>{children}</group>
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [hintsVisible, setHintsVisible] = useState(true)
  const [hintsFadingOut, setHintsFadingOut] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)

  // Hints: fade out 3 seconds after first interaction
  useEffect(() => {
    if (!hintsVisible || hintsFadingOut) return

    let timeoutId = null

    const startFadeOut = () => {
      timeoutId = setTimeout(() => {
        setHintsFadingOut(true)
      }, 3000)
    }

    window.addEventListener('scroll', startFadeOut, { once: true, passive: true })
    window.addEventListener('wheel', startFadeOut, { once: true, passive: true })
    window.addEventListener('touchstart', startFadeOut, { once: true, passive: true })
    window.addEventListener('click', startFadeOut, { once: true })

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('scroll', startFadeOut)
      window.removeEventListener('wheel', startFadeOut)
      window.removeEventListener('touchstart', startFadeOut)
      window.removeEventListener('click', startFadeOut)
    }
  }, [hintsVisible, hintsFadingOut])

  return (
    <>
      {/* Canvas - 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 30], fov: 30 }}
        onPointerMissed={() => setActiveId(null)}
      >
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Rig>
          <ScrollControls pages={4} infinite>
            <Ring
              activeId={activeId}
              hoveredId={hoveredId}
              onSelect={setActiveId}
              onHover={setHoveredId}
              onFlip={setIsCardFlipped}
            />
          </ScrollControls>
        </Rig>
      </Canvas>

      {/* Hints overlay - hover to show again after fade */}
      {hintsVisible && (
        <div
          className={`hints-overlay ${hintsFadingOut ? 'fading-out' : ''}`}
          onMouseEnter={() => setHintsFadingOut(false)}
          onTransitionEnd={() => {
            if (hintsFadingOut) setHintsVisible(false)
          }}
        >
          <p>Swipe up to go right • Swipe down to go left • Tap card to select • Tap again to flip</p>
        </div>
      )}

      {/* Hover zone to bring hints back */}
      {!hintsVisible && (
        <div
          className="hints-hover-zone"
          onMouseEnter={() => {
            setHintsVisible(true)
            setHintsFadingOut(false)
          }}
        />
      )}

      {/* Story link - fixed position, shown when card is flipped */}
      {activeId && isCardFlipped && (
        <div className="story-link">
          <a
            href={`http://mediabyjoe.com/postcard-${activeId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Journal →
          </a>
        </div>
      )}
    </>
  )
}