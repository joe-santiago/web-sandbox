import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ 
  front, back, link, 
  active, locked, hovered, 
  startAngle, radius, getRotation, totalItems, zRotation, // CHANGED: getRotation instead of scroll
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
    // Use the Odometer value. It never resets, so no more 360 spins.
    const ringRotation = getRotation()
    
    const currentAngle = startAngle + ringRotation
    
    const homeX = Math.sin(currentAngle) * radius
    const homeZ = Math.cos(currentAngle) * radius
    const homeRotY = currentAngle + (Math.PI / 2) - 0.25

    // --- 2. TARGET SETTING ---
    const anchorY = 0 
    const centerHeight = anchorY + (height / 2)
    
    let targetPos = new THREE.Vector3(homeX, 0, homeZ)
    let targetRotY = homeRotY
    let targetRotX = 0
    let targetRotZ = zRotation

    if (locked) {
      targetPos.set(0, centerHeight, 0)
      
      targetRotX = 0
      targetRotY = 0 
      targetRotZ = 0
      
      if (isFlipped) {
          if (isPortrait) {
              targetRotY += Math.PI
              targetRotZ = -Math.PI / 2
          } else {
              targetRotY += Math.PI
          }
      }

    } else if (hovered) {
      targetPos.set(homeX, 0.5, homeZ)
    }

    // --- 3. APPLY PHYSICS ---
    ref.current.position.lerp(targetPos, delta * 10)
    
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRotX, delta * 10)
    
    // ROTATION Y FIX:
    // Because homeRotY grows infinitely (e.g., 1000 radians), and our current rotation 
    // might be small or wrapped, we need to ensure the interpolation is clean.
    // However, since we are now feeding a continuous stream (no 0-360 jumps), 
    // simple lerping actually works fine! The target just keeps growing, 
    // and the current value chases it.
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotY, delta * 10)
    
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetRotZ, delta * 10)

    // --- SCALE ---
    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = locked ? activeScale : hovered ? hoverScale : baseScale
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- TEXTURE ROTATION ---
    if (backRef.current && isPortrait) {
        const targetBackZ = locked ? -Math.PI / 2 : Math.PI / 2
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
        rotation={[0, Math.PI, 0]} 
        scale={[1, 1]}
      />
    </group>
  )
}