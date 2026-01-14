import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, orientation, aspectRatio, ...props }) {
  const ref = useRef()
  const [isFlipped, setIsFlipped] = useState(false)

  // 1. GEOMETRY (Ratio 1.4)
  const isPortrait = orientation === 'portrait'
  let width, height;
  if (isPortrait) {
      height = 2.5;
      width = 2.5 / aspectRatio; 
  } else {
      width = 2.5;
      height = 2.5 / aspectRatio;
  }

  // Reset flip state when clicking away
  useEffect(() => {
    if (!active) setIsFlipped(false)
  }, [active])
  
  useFrame((state, delta) => {
    // --- POSITION & SCALE (Standard Lerping) ---
    const homePos = new THREE.Vector3(...gridPosition)
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : homePos
    ref.current.position.lerp(targetPos, delta * 10)

    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = active ? activeScale : hovered ? hoverScale : baseScale
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- ROTATION: THE PHYSICAL RULES STATE MACHINE ---
    
    // Start with the Ring's rotation (Inactive State)
    let targetX = gridRotation[0]
    let targetY = gridRotation[1]
    let targetZ = gridRotation[2] 

    // If Active (Featured Center State)
    if (active) {
      // 1. Reset to upright center position
      targetX = 0
      targetY = 0
      targetZ = 0

      // 2. Apply Flip Logic if Flipped
      if (isFlipped) {
          if (isPortrait) {
              // RULE B (Portrait): Flip long edge (Y=180) AND rotate 90 clockwise (Z=-90)
              targetY = Math.PI
              targetZ = -Math.PI / 2
          } else {
              // RULE A (Landscape): Simple book flip (Y=180)
              targetY = Math.PI
          }
      }
    }

    // Apply smooth animation to targets
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, delta * 10)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, delta * 10)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetZ, delta * 10)
  })

  return (
    <group {...props} ref={ref} onClick={(e) => {
      e.stopPropagation()
      if (active) setIsFlipped(!isFlipped)
      else props.onClick(e)
    }}>
      {/* FRONT IMAGE */}
      <Image 
        url={front} 
        transparent 
        side={THREE.DoubleSide}
        position={[0, 0, 0.01]}
        scale={[1, 1]} 
      />

      {/* BACK IMAGE */}
      <Image 
        url={back} 
        transparent 
        side={THREE.DoubleSide}
        position={[0, 0, -0.01]}
        // FIX ISSUE 1: Permanently rotate back image to face outward so it's not mirrored
        rotation={[0, Math.PI, 0]} 
        scale={[1, 1]}
      />
    </group>
  )
}