import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, orientation, aspectRatio, ...props }) {
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
    // --- POSITION ---
    const homePos = new THREE.Vector3(...gridPosition)
    
    // REFOCUS: SINGLE GOAL -> CENTER THE CARD
    // X=0, Z=0 puts it exactly in the middle of the ring.
    // Y=0.25 gives it a tiny lift so it doesn't look like it's sinking.
    const targetPos = active ? new THREE.Vector3(0, 0.25, 0) : homePos
    
    ref.current.position.lerp(targetPos, delta * 10)

    // --- SCALE ---
    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = active ? activeScale : hovered ? hoverScale : baseScale
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- MESH ROTATION ---
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

    // --- TEXTURE ROTATION ---
    if (backRef.current && isPortrait) {
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
        ref={backRef} 
        url={back} 
        transparent 
        side={THREE.DoubleSide}
        position={[0, 0, -0.01]}
        rotation={[0, Math.PI, 0]} 
        scale={[1, 1]}
      />
    </group>
  )
}