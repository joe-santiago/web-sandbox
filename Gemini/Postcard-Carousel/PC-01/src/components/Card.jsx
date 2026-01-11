import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'

export default function Card({ url, back, active, hovered, ...props }) {
  const ref = useRef()

  useFrame((state, delta) => {
    // Smoothly animate scale: 1.1 when hovered, 1.0 when not
    const targetScale = hovered ? 1.1 : 1
    easing.damp3(ref.current.scale, [targetScale, targetScale, 1], 0.1, delta)
  })

  return (
    <group ref={ref} {...props}>
      {/* Front Image */}
      {/* Note: side={THREE.BackSide} was requested. 
          If images appear invisible, switch to THREE.FrontSide or remove the side prop. */}
      <Image 
        url={url} 
        side={THREE.BackSide} 
      />

      {/* Back Image (The Sandwich) */}
      <Image
        url={back}
        side={THREE.BackSide}
        // Offset Z slightly to prevent Z-fighting (glitching) between the two planes
        position={[0, 0, -0.01]}
        // Rotate 180 deg on Y to face the opposite direction
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}