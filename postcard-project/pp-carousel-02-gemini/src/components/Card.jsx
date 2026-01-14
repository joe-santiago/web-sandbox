import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, locked, hovered, gridPosition, gridRotation, orientation, aspectRatio, ...props }) {
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
    const anchorY = 0 
    const centerHeight = anchorY + (height / 2)
    
    let targetPos = homePos.clone() 

    if (locked) {
      targetPos.set(0, centerHeight, 0) 
    } else if (hovered) {
      targetPos.set(homePos.x, homePos.y + 0.5, homePos.z)
    }

    ref.current.position.lerp(targetPos, delta * 10)

    // --- SCALE ---
    const activeScale = 1.3 
    const hoverScale = 1.1
    const baseScale = 1
    const currentMultiplier = locked ? activeScale : hovered ? hoverScale : baseScale
    ref.current.scale.lerp(new THREE.Vector3(width * currentMultiplier, height * currentMultiplier, 1), delta * 10)

    // --- MESH ROTATION (THE ORIENTATION FIX) ---
    let targetX = gridRotation[0]
    let targetY = gridRotation[1]
    let targetZ = gridRotation[2] 

    if (locked) {
      targetX = 0
      targetZ = 0
      
      // FIX: Counter-Rotate against the Ring
      // We subtract the parent (Ring) rotation so the card faces the camera absolute.
      // We assume the parent exists (ref.current.parent)
      if (ref.current.parent) {
        targetY = -ref.current.parent.rotation.y
      } else {
        targetY = 0
      }

      // Handle Flip Logic on top of the counter-rotation
      if (isFlipped) {
          if (isPortrait) {
              // For portrait, we need to flip differently because of the axis
              targetY += Math.PI 
              targetZ = -Math.PI / 2
          } else {
              targetY += Math.PI
          }
      }
    }

    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, delta * 10)
    // We use a special lerp for Y to prevent "spinning the long way round" when crossing 360 degrees
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, delta * 10)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetZ, delta * 10)

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