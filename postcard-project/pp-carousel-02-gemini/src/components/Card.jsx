import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, orientation, aspectRatio, ...props }) {
  const ref = useRef()
  const backRef = useRef() // <--- NEW: Reference for the back image
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
    // --- POSITION & SCALE ---
    const homePos = new THREE.Vector3(...gridPosition)
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : homePos
    ref.current.position.lerp(targetPos, delta * 10)

    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = active ? activeScale : hovered ? hoverScale : baseScale
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- CARD ROTATION (Mesh) ---
    let targetX = gridRotation[0]
    let targetY = gridRotation[1]
    let targetZ = gridRotation[2] 

    if (active) {
      targetX = 0
      targetY = 0
      targetZ = 0
      if (isFlipped) {
          if (isPortrait) {
              targetY = Math.PI
              targetZ = -Math.PI / 2
          } else {
              targetY = Math.PI
          }
      }
    }

    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, delta * 10)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, delta * 10)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetZ, delta * 10)

    // --- TEXTURE ROTATION (The Dynamic Fix) ---
    // We animate the texture itself to solve the "Upside Down" issue in the Ring
    // while keeping the "Correct" orientation in the Feature.
    
    if (backRef.current && isPortrait) {
        // If Active: Use -90 (User confirmed this is correct for Feature)
        // If Inactive: Use +90 (Flips it 180 degrees to fix the Ring)
        const targetBackZ = active ? -Math.PI / 2 : Math.PI / 2
        
        backRef.current.rotation.z = THREE.MathUtils.lerp(
            backRef.current.rotation.z, 
            targetBackZ, 
            delta * 10
        )
    }
  })

  return (
    <group {...props} ref={ref} onClick={(e) => {
      e.stopPropagation()
      if (active) setIsFlipped(!isFlipped)
      else props.onClick(e)
    }}>
      <Image 
        url={front} 
        transparent 
        side={THREE.DoubleSide}
        position={[0, 0, 0.01]}
        scale={[1, 1]} 
      />
      <Image 
        ref={backRef} // <--- NEW: Attach the ref here
        url={back} 
        transparent 
        side={THREE.DoubleSide}
        position={[0, 0, -0.01]}
        // We set the initial rotation here, but useFrame takes over immediately
        rotation={[0, Math.PI, 0]} 
        scale={[1, 1]}
      />
    </group>
  )
}