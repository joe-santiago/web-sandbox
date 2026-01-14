import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, orientation, ...props }) {
  const ref = useRef()
  const [isFlipped, setIsFlipped] = useState(false)

  // 1. DYNAMIC GEOMETRY
  // If Portrait: 1.618 x 2.5
  // If Landscape: 2.5 x 1.618
  const isPortrait = orientation === 'portrait'
  const width = isPortrait ? 1.618 : 2.5
  const height = isPortrait ? 2.5 : 1.618
  
  useEffect(() => {
    if (!active) setIsFlipped(false)
  }, [active])
  
  useFrame((state, delta) => {
    // --- POSITION ---
    const homePos = new THREE.Vector3(...gridPosition)
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : homePos
    ref.current.position.lerp(targetPos, delta * 10)

    // --- SCALE ---
    // We scale the whole group based on our calculated width/height
    const activeScale = 1.7
    const hoverScale = 1.15
    const baseScale = 1
    
    const currentMultiplier = active ? activeScale : hovered ? hoverScale : baseScale
    
    // Apply the multiplier to our base dimensions
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- ROTATION ---
    let targetX = gridRotation[0]
    let targetY = gridRotation[1]
    let targetZ = gridRotation[2] // This is 90 deg for Portrait cards in the ring

    if (active) {
      targetX = 0
      targetZ = 0 // Stand up straight when active
      targetY = isFlipped ? Math.PI : 0
    }

    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, delta * 10)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, delta * 10)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetZ, delta * 10)
  })

  // 2. SMART BACK ROTATION
  // If this is a Portrait card, the mesh is rotated 90 deg (sideways).
  // To make the Back Text horizontal, we must counter-rotate the texture -90 deg.
  const backRotation = isPortrait ? [0, Math.PI, -Math.PI / 2] : [0, Math.PI, 0]
  
  // We also need to swap the scale of the back texture if we rotate it, 
  // otherwise it squishes.
  // Actually, since <Image> fills the plane, simpler is just to rotate.
  
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
        radius={0.075}
        position={[0, 0, 0.01]}
        // Using scale 1 means "fill the parent group"
        scale={[1, 1]} 
      />

      {/* BACK IMAGE */}
      <Image 
        url={back} 
        transparent 
        side={THREE.DoubleSide}
        radius={0.075} 
        position={[0, 0, -0.01]}
        // Apply our smart rotation correction
        rotation={backRotation}
        // If we rotate the back of a portrait card, we need to correct the aspect ratio mapping
        // or the text will look squished. <Image> handles this well usually.
        scale={[1, 1]}
      />
    </group>
  )
}