import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, orientation, aspectRatio, ...props }) {
  const ref = useRef()
  const [isFlipped, setIsFlipped] = useState(false)

  // 1. DYNAMIC MOO GEOMETRY
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
    // --- POSITION ---
    const homePos = new THREE.Vector3(...gridPosition)
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : homePos
    ref.current.position.lerp(targetPos, delta * 10)

    // --- SCALE ---
    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = active ? activeScale : hovered ? hoverScale : baseScale
    
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- ROTATION ---
    let targetX = gridRotation[0]
    let targetY = gridRotation[1]
    let targetZ = gridRotation[2] 

    if (active) {
      targetZ = 0 
      targetY = 0 
      targetX = isFlipped ? Math.PI : 0
    }

    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, delta * 10)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, delta * 10)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetZ, delta * 10)
  })

  // 2. DYNAMIC BACK ROTATION (The Fix)
  // We cannot hardcode this. It depends on state.
  
  // Rule A: If Active (Flipped on X), we rotate 180 on Z to be upright.
  // Rule B: If Inactive (In Ring) AND Portrait, we rotate -90 on Z to be horizontal.
  // Rule C: Otherwise (Landscape in Ring), no rotation needed.
  
  let backRotateZ = 0;
  if (active) {
      backRotateZ = Math.PI; // 180 degrees
  } else if (isPortrait) {
      backRotateZ = -Math.PI / 2; // -90 degrees
  }

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
        // Apply our Dynamic Rotation
        rotation={[0, 0, backRotateZ]} 
        scale={[1, 1]}
      />
    </group>
  )
}