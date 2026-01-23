import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({
  front, back,
  active, locked, hovered,
  startAngle, radius, getRotation, totalItems, zRotation,
  orientation, aspectRatio,
  onFlip,
  ...props
}) {
  const ref = useRef()
  const backRef = useRef()
  const [isFlipped, setIsFlipped] = useState(false)
  const wasActive = useRef(false)
  const wasFlipped = useRef(false)

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

  // Reset flip state when card is deselected
  useEffect(() => {
    if (wasActive.current && !active) {
      setIsFlipped(false)
      // Only notify parent if card was actually flipped
      if (wasFlipped.current) {
        onFlip?.(false)
        wasFlipped.current = false
      }
    }
    wasActive.current = active
  }, [active]) // onFlip is stable (useState setter), no need to track
  
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
        const newFlipped = !isFlipped
        setIsFlipped(newFlipped)
        wasFlipped.current = newFlipped
        onFlip?.(newFlipped)
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
    </group>
  )
}