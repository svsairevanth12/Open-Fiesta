'use client';

import Spline from '@splinetool/react-spline/next';

export default function Landing() {
  return (
    <main className="w-full h-screen bg-white text-black">
      <Spline
        scene="https://prod.spline.design/ivigCqxIz1AwPBPi/scene.splinecode"
        style={{ background: '#ffffff' }}
      />
    </main>
  );
}