import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image, Html } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ 
  front, back, link, 
  active, locked, hovered, 
  startAngle, radius, getRotation, totalItems, zRotation, 
  orientation, aspectRatio, 
  ...props 
}) {
  const ref = useRef()
  const backRef = useRef()
  const [isFlipped, setIsFlipped] = useState(false)

  // 1. GEOMETRY
  const isPortrait = orientation === 'portrait'
  let width, height;
  if (isPortrait) {
      height = 2.5;
      width = 2.5 / aspectRatio; 
  } else {
      width = 2.5;
      height = 2.5 / aspectRatio;
  }

  useEffect(() => {
    if (!active) setIsFlipped(false)
  }, [active])
  
  useFrame((state, delta) => {
    // --- 1. CALCULATE ORBIT POSITION ---
    const ringRotation = getRotation()
    const currentAngle = startAngle + ringRotation
    
    const homeX = Math.sin(currentAngle) * radius
    const homeZ = Math.cos(currentAngle) * radius
    const homeRotY = currentAngle + (Math.PI / 2) - 0.25

    // --- 2. TARGET SETTING ---
    const anchorY = 0 
    const centerHeight = anchorY + (height / 2)
    
    let targetPos = new THREE.Vector3(homeX, 0, homeZ)
    const targetQ = new THREE.Quaternion()
    const euler = new THREE.Euler(0, homeRotY, zRotation, 'XYZ')

    if (locked) {
      targetPos.set(0, centerHeight, 0)
      
      let targetRotX = 0
      let targetRotY = 0 
      let targetRotZ = 0
      
      if (isFlipped) {
          if (isPortrait) {
              // FLIP LOGIC:
              // Rotate 180 (PI) to show back.
              // Rotate 90 (PI/2) to turn the card Landscape.
              targetRotY += Math.PI
              targetRotZ = Math.PI / 2
          } else {
              targetRotY += Math.PI
          }
      }
      
      euler.set(targetRotX, targetRotY, targetRotZ, 'XYZ')

    } else if (hovered) {
      targetPos.set(homeX, 0.5, homeZ)
    }

    targetQ.setFromEuler(euler)

    // --- 3. APPLY PHYSICS ---
    ref.current.position.lerp(targetPos, delta * 10)
    ref.current.quaternion.slerp(targetQ, delta * 10)
    
    // Scale
    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = locked ? activeScale : hovered ? hoverScale : baseScale
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)
  })

  return (
    <group {...props} ref={ref} onClick={(e) => {
      e.stopPropagation()
      if (locked) {
        setIsFlipped(!isFlipped)
      } else {
        props.onClick(e)
      }
    }}>
      <Image 
        url={front} 
        transparent 
        side={THREE.DoubleSide}
        position={[0, 0, 0.01]} 
        scale={[1, 1]} 
      />
      <Image
        ref={backRef}
        url={back}
        transparent
        side={THREE.DoubleSide}
        position={[0, 0, -0.01]}

        // THE FIX: Changed from -Math.PI/2 to +Math.PI/2
        // This rotates the image 90 degrees Clockwise instead of Counter-Clockwise.
        rotation={[0, Math.PI, isPortrait ? Math.PI / 2 : 0]}

        scale={[1, 1]}
      />

      {/* STORY LINK: Appears above card when flipped to back */}
      {/* Position adjusts for orientation - portrait backs rotate 90° */}
      {locked && isFlipped && (
        <Html
          position={isPortrait ? [0.6, 0, 0] : [0, 0.6, 0]}
          center
          style={{
            opacity: isFlipped ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: '#333',
              fontSize: '16px',
              fontFamily: "'Myfont', Georgia, serif",
              textDecoration: 'none',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            Read the Story →
          </a>
        </Html>
      )}
    </group>
  )
}